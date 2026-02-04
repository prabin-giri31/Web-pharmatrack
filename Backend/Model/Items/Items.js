// backend/Model/Items/Items.js
import { DataTypes } from "sequelize";
import { sequelize } from "../../Database/db.js";

const Item = sequelize.define("Item", {
  userId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id',
    }
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  sku: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  unit: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  category: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  returnable: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  sellingPrice: {
    type: DataTypes.DECIMAL,
    allowNull: false,
  },
  costPrice: {
    type: DataTypes.DECIMAL,
    allowNull: false,
  },
  stockOnHand: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  reorderLevel: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  status: {
    type: DataTypes.ENUM("active", "inactive"),
    defaultValue: "active",
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  expiryDate: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
}, {
  tableName: "items",   // optional, default is 'Items'
  timestamps: true,     // adds createdAt and updatedAt
});

export default Item;
