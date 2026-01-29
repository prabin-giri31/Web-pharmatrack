// backend/Controller/Inventory/inventoryController.js
import InventoryAdjustment from "../../Model/Inventory/InventoryAdjustment.js";

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
  try {
    const { date, reason, description, status, type, createdBy } = req.body;

    // Basic validation
    if (!reason || !type || !createdBy) {
      return res.status(400).json({ message: "Please fill all required fields" });
    }

    // Generate unique reference number for this user
    const count = await InventoryAdjustment.count({
      where: { userId: req.user.userId }
    });
    const reference = `INV${String(count + 1).padStart(3, "0")}`;

    const newAdjustment = await InventoryAdjustment.create({
      userId: req.user.userId,
      date: date || new Date(),
      reason,
      description,
      status: status || "Pending",
      reference,
      type,
      createdBy,
    });

    res.status(201).json(newAdjustment);
  } catch (error) {
    console.error("Error adding inventory adjustment:", error);
    res.status(500).json({ message: "Server Error" });
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
  try {
    const { id } = req.params;

    const adjustment = await InventoryAdjustment.findOne({
      where: {
        id,
        userId: req.user.userId
      }
    });

    if (!adjustment) {
      return res.status(404).json({ message: "Adjustment not found" });
    }

    await adjustment.destroy();

    res.status(200).json({ message: "Adjustment deleted successfully" });
  } catch (error) {
    console.error("Error deleting inventory adjustment:", error);
    res.status(500).json({ message: "Server Error" });
  }
};
