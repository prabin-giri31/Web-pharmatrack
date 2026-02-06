// backend/Model/Inventory/InventoryAdjustment.js
import { DataTypes } from "sequelize";
import { sequelize } from "../../Database/db.js";

const InventoryAdjustment = sequelize.define("InventoryAdjustment", {
  userId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id',
    }
  },
  itemId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'items',
      key: 'id',
    }
  },
  itemName: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  previousStock: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  newStock: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  reason: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM("Pending", "Completed", "Cancelled"),
    defaultValue: "Pending",
  },
  reference: {
    type: DataTypes.STRING,
    allowNull: false,
    // unique: true, // Removed for multi-tenancy
  },
  type: {
    type: DataTypes.ENUM("Increase", "Decrease"),
    allowNull: false,
  },
  createdBy: {
    type: DataTypes.STRING,
    allowNull: false,
  },
}, {
  tableName: "inventory_adjustments",
  timestamps: true,
});

export default InventoryAdjustment;
