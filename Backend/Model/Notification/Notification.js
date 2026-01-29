import { DataTypes } from "sequelize";
import { sequelize } from "../../Database/db.js";

const Notification = sequelize.define("Notification", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: "users",
      key: "id",
    },
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  type: {
    type: DataTypes.ENUM("low_stock", "sales_order", "system"),
    allowNull: false,
  },
  link: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  isRead: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
}, {
  tableName: "notifications",
  timestamps: true,
  indexes: [
    { fields: ["userId"] },
    { fields: ["isRead"] },
    { fields: ["type"] },
  ],
});

export default Notification;
