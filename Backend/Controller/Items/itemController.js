// backend/Controller/Items/itemController.js
import Item from "../../Model/Items/Items.js";

// Add new item
export const addItem = async (req, res) => {
  try {
    const { name, sku, unit, category, returnable, sellingPrice, costPrice, stockOnHand, reorderLevel, description, expiryDate } = req.body;

    // Basic validation
    if (!name || !unit || !sellingPrice || !costPrice) {
      return res.status(400).json({ message: "Please fill all required fields" });
    }

    const newItem = await Item.create({
      userId: req.user.userId,
      name,
      sku,
      unit,
      category,
      returnable,
      sellingPrice,
      costPrice,
      stockOnHand: stockOnHand || 0,
      reorderLevel: reorderLevel || 0,
      description,
      expiryDate: expiryDate || null,
    });

    res.status(201).json(newItem);
  } catch (error) {
    console.error("Error adding item:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// Get all items
export const getItems = async (req, res) => {
  try {
    const items = await Item.findAll({
      where: { userId: req.user.userId },
      order: [["createdAt", "DESC"]],
    });
    res.status(200).json(items);
  } catch (error) {
    console.error("Error fetching items:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// Update item (PATCH for partial updates)
export const updateItem = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const item = await Item.findOne({
      where: {
        id,
        userId: req.user.userId
      }
    });

    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    await item.update(updates);
    res.status(200).json(item);
  } catch (error) {
    console.error("Error updating item:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// Delete item
export const deleteItem = async (req, res) => {
  try {
    const { id } = req.params;

    const item = await Item.findOne({
      where: {
        id,
        userId: req.user.userId
      }
    });

    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    await item.destroy();
    res.status(200).json({ message: "Item deleted successfully" });
  } catch (error) {
    console.error("Error deleting item:", error);
    res.status(500).json({ message: "Server Error" });
  }
};
