// backend/Controller/Inventory/inventoryController.js
import InventoryAdjustment from "../../Model/Inventory/InventoryAdjustment.js";
import Item from "../../Model/Items/Items.js";
import { sequelize } from "../../Database/db.js";

// Get all inventory adjustments
export const getInventoryAdjustments = async (req, res) => {
  try {
    const { type, period } = req.query;

    let whereClause = {
      userId: req.user.userId // Scope to user
    };

    // Filter by type
    if (type && type !== "All") {
      whereClause.type = type;
    }

    // Filter by period
    if (period && period !== "All") {
      const now = new Date();
      let startDate;

      switch (period) {
        case "Last 7 Days":
          startDate = new Date(now.setDate(now.getDate() - 7));
          break;
        case "Last 30 Days":
          startDate = new Date(now.setDate(now.getDate() - 30));
          break;
        case "This Month":
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        default:
          startDate = null;
      }

      if (startDate) {
        const { Op } = await import("sequelize");
        whereClause.date = {
          [Op.gte]: startDate,
        };
      }
    }

    const adjustments = await InventoryAdjustment.findAll({
      where: whereClause,
      include: [{
        model: Item,
        as: "item",
        attributes: ["id", "name", "sku", "stockOnHand", "unit"],
      }],
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json(adjustments);
  } catch (error) {
    console.error("Error fetching inventory adjustments:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// Add new inventory adjustment
export const addInventoryAdjustment = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { itemId, itemName, date, reason, description, status, type, createdBy, quantity } = req.body;

    // Basic validation
    if (!reason || !type || !createdBy) {
      await transaction.rollback();
      return res.status(400).json({ message: "Please fill all required fields" });
    }

    if (!itemId) {
      await transaction.rollback();
      return res.status(400).json({ message: "Item is required" });
    }

    if (!quantity || quantity <= 0) {
      await transaction.rollback();
      return res.status(400).json({ message: "Quantity must be a positive number" });
    }

    // Find the item
    const item = await Item.findOne({
      where: { id: itemId, userId: req.user.userId },
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (!item) {
      await transaction.rollback();
      return res.status(404).json({ message: "Item not found" });
    }

    const previousStock = item.stockOnHand || 0;
    let newStock;

    // Calculate new stock based on adjustment type
    if (type === "Increase") {
      newStock = previousStock + parseInt(quantity);
    } else if (type === "Decrease") {
      if (previousStock < parseInt(quantity)) {
        await transaction.rollback();
        return res.status(400).json({ 
          message: `Insufficient stock. Available: ${previousStock}, Requested decrease: ${quantity}` 
        });
      }
      newStock = previousStock - parseInt(quantity);
    } else {
      await transaction.rollback();
      return res.status(400).json({ message: "Invalid adjustment type" });
    }

    // Generate unique reference number for this user
    const count = await InventoryAdjustment.count({
      where: { userId: req.user.userId }
    });
    const reference = `INV${String(count + 1).padStart(3, "0")}`;

    // Create the adjustment record
    const newAdjustment = await InventoryAdjustment.create({
      userId: req.user.userId,
      itemId: parseInt(itemId),
      itemName: itemName || item.name,
      quantity: parseInt(quantity),
      previousStock,
      newStock,
      date: date || new Date(),
      reason,
      description,
      status: status || "Completed",
      reference,
      type,
      createdBy,
    }, { transaction });

    // Update the item's stock
    await item.update({ stockOnHand: newStock }, { transaction });

    await transaction.commit();

    // Fetch the adjustment with item details
    const adjustmentWithItem = await InventoryAdjustment.findByPk(newAdjustment.id, {
      include: [{
        model: Item,
        as: "item",
        attributes: ["id", "name", "sku", "stockOnHand", "unit"],
      }],
    });

    res.status(201).json(adjustmentWithItem);
  } catch (error) {
    await transaction.rollback();
    console.error("Error adding inventory adjustment:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Update inventory adjustment
export const updateInventoryAdjustment = async (req, res) => {
  try {
    const { id } = req.params;
    const { date, reason, description, status, type } = req.body;

    const adjustment = await InventoryAdjustment.findOne({
      where: {
        id,
        userId: req.user.userId
      }
    });

    if (!adjustment) {
      return res.status(404).json({ message: "Adjustment not found" });
    }

    // Only allow updating non-completed adjustments (or just metadata for completed ones)
    if (adjustment.status === "Completed" && status !== adjustment.status) {
      return res.status(400).json({ message: "Cannot modify a completed adjustment" });
    }

    await adjustment.update({
      date: date || adjustment.date,
      reason: reason || adjustment.reason,
      description: description || adjustment.description,
      status: status || adjustment.status,
      type: type || adjustment.type,
    });

    res.status(200).json(adjustment);
  } catch (error) {
    console.error("Error updating inventory adjustment:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// Delete inventory adjustment
export const deleteInventoryAdjustment = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { id } = req.params;

    const adjustment = await InventoryAdjustment.findOne({
      where: {
        id,
        userId: req.user.userId
      },
      transaction
    });

    if (!adjustment) {
      await transaction.rollback();
      return res.status(404).json({ message: "Adjustment not found" });
    }

    // If the adjustment was completed, reverse the stock change
    if (adjustment.status === "Completed" && adjustment.itemId) {
      const item = await Item.findOne({
        where: { id: adjustment.itemId, userId: req.user.userId },
        transaction,
        lock: transaction.LOCK.UPDATE,
      });

      if (item) {
        let revertedStock;
        if (adjustment.type === "Increase") {
          revertedStock = (item.stockOnHand || 0) - adjustment.quantity;
        } else {
          revertedStock = (item.stockOnHand || 0) + adjustment.quantity;
        }
        
        // Ensure stock doesn't go negative
        revertedStock = Math.max(0, revertedStock);
        
        await item.update({ stockOnHand: revertedStock }, { transaction });
      }
    }

    await adjustment.destroy({ transaction });
    await transaction.commit();

    res.status(200).json({ message: "Adjustment deleted successfully" });
  } catch (error) {
    await transaction.rollback();
    console.error("Error deleting inventory adjustment:", error);
    res.status(500).json({ message: "Server Error" });
  }
};
