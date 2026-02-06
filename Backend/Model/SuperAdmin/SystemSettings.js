import { DataTypes } from "sequelize";
import { sequelize } from "../../Database/db.js";

const SystemSettings = sequelize.define("SystemSettings", {
  key: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  value: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  type: {
    type: DataTypes.ENUM("string", "number", "boolean", "json"),
    allowNull: false,
    defaultValue: "string",
  },
  category: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: "general",
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  isEditable: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  },
  updatedBy: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: "users",
      key: "id",
    },
  },
}, {
  tableName: "system_settings",
  timestamps: true,
  indexes: [
    { fields: ["key"] },
    { fields: ["category"] },
  ],
});

// Default system settings
SystemSettings.DEFAULT_SETTINGS = [
  { key: "tax_rate", value: "13", type: "number", category: "invoice", description: "Default tax rate percentage" },
  { key: "invoice_prefix", value: "INV", type: "string", category: "invoice", description: "Invoice number prefix" },
  { key: "sales_order_prefix", value: "SO", type: "string", category: "sales", description: "Sales order number prefix" },
  { key: "currency", value: "NPR", type: "string", category: "general", description: "Default currency" },
  { key: "currency_symbol", value: "Rs.", type: "string", category: "general", description: "Currency symbol" },
  { key: "timezone", value: "Asia/Kathmandu", type: "string", category: "general", description: "System timezone" },
  { key: "date_format", value: "YYYY-MM-DD", type: "string", category: "general", description: "Date display format" },
  { key: "low_stock_threshold", value: "10", type: "number", category: "inventory", description: "Default low stock alert threshold" },
  { key: "expiry_warning_days", value: "30", type: "number", category: "inventory", description: "Days before expiry to show warning" },
  { key: "allow_negative_stock", value: "false", type: "boolean", category: "inventory", description: "Allow sales when stock is zero" },
  { key: "auto_approve_users", value: "false", type: "boolean", category: "security", description: "Automatically approve new user registrations" },
  { key: "max_login_attempts", value: "5", type: "number", category: "security", description: "Maximum login attempts before account lock" },
  { key: "lock_duration_minutes", value: "30", type: "number", category: "security", description: "Account lock duration in minutes" },
  { key: "session_timeout_hours", value: "24", type: "number", category: "security", description: "Session timeout in hours" },
  { key: "backup_enabled", value: "true", type: "boolean", category: "data", description: "Enable automatic backups" },
  { key: "backup_frequency_days", value: "7", type: "number", category: "data", description: "Backup frequency in days" },
];

export default SystemSettings;
