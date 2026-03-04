import { DataTypes } from "sequelize";
import { sequelize } from "../../Database/db.js";

const Invoice = sequelize.define("Invoice", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  invoiceNumber: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: { msg: "Invoice number is required" },
    },
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: "users",
      key: "id",
    },
  },
  salesOrderId: {
    type: DataTypes.INTEGER,
    allowNull: true, // Allow null for direct invoices (without sales order)
    references: {
      model: "sales_orders",
      key: "id",
    },
  },
  customerId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: "customers",
      key: "id",
    },
  },
  invoiceDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  status: {
    type: DataTypes.ENUM("draft", "finalized"),
    defaultValue: "draft",
    allowNull: false,
  },
  subtotalAmount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
    allowNull: false,
  },
  discountAmount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
    allowNull: false,
  },
  taxAmount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
    allowNull: false,
  },
  netPayable: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
    allowNull: false,
  },
  advancePayment: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
    allowNull: false,
  },
  balanceDue: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
    allowNull: false,
  },
  paymentMode: {
    type: DataTypes.ENUM("cash", "card", "online"),
    allowNull: true,
  },
  paymentStatus: {
    type: DataTypes.ENUM("unpaid", "paid"),
    defaultValue: "unpaid",
    allowNull: false,
  },
  paymentReference: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  paymentDate: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  tableName: "invoices",
  timestamps: true,
  indexes: [
    { fields: ["invoiceNumber"] },
    { fields: ["userId"] },
    { fields: ["salesOrderId"] },
    { fields: ["customerId"] },
    { fields: ["invoiceDate"] },
    { fields: ["paymentStatus"] },
    { fields: ["status"] },
  ],
});

export default Invoice;
