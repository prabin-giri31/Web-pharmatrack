import { DataTypes } from "sequelize";
import { sequelize } from "../../Database/db.js";

const UserActivity = sequelize.define("UserActivity", {
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: "users",
      key: "id",
    },
  },
  action: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  resourceType: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  resourceId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  ipAddress: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  userAgent: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  metadata: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: {},
  },
  isSuspicious: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
}, {
  tableName: "user_activities",
  timestamps: true,
  indexes: [
    { fields: ["userId"] },
    { fields: ["action"] },
    { fields: ["createdAt"] },
    { fields: ["isSuspicious"] },
  ],
});

export default UserActivity;
