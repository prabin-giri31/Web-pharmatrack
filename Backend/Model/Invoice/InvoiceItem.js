import { DataTypes } from "sequelize";
import { sequelize } from "../../Database/db.js";

const InvoiceItem = sequelize.define("InvoiceItem", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  invoiceId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: "invoices",
      key: "id",
    },
    onDelete: "CASCADE",
  },
  productId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: "items",
      key: "id",
    },
  },
  productName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  productSku: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: { args: [1], msg: "Quantity must be at least 1" },
    },
  },
  unitPrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  discount: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 0,
    allowNull: false,
  },
  tax: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 0,
    allowNull: false,
  },
  lineTotal: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  expiryDate: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
}, {
  tableName: "invoice_items",
  timestamps: true,
  indexes: [
    { fields: ["invoiceId"] },
    { fields: ["productId"] },
  ],
});

export default InvoiceItem;
