import { DataTypes } from "sequelize";
import { sequelize } from "../../Database/db.js";

const Customer = sequelize.define("Customer", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: { msg: "Customer name is required" },
    },
  },
  company: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false, // REQUIRED for multi-tenancy
    references: {
      model: 'users',
      key: 'id',
    }
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    // unique: true, // Removed for multi-tenancy (same customer email can exist for different users)
    validate: {
      isEmail: { msg: "Please enter a valid email address" },
      notEmpty: { msg: "Email is required" },
    },
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM("active", "inactive", "overdue", "unpaid"),
    defaultValue: "active",
    allowNull: false,
  },
  address: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  tableName: "customers",
  timestamps: true,
  indexes: [
    { fields: ["email"] },
    { fields: ["status"] },
    { fields: ["name"] },
  ],
});

export default Customer;
