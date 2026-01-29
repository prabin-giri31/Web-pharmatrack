import { DataTypes } from "sequelize";
import { sequelize } from "../../Database/db.js";

const Supplier = sequelize.define("Supplier", {
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
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      isEmail: true,
    },
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  address: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM("active", "inactive"),
    defaultValue: "active",
  },
}, {
  tableName: "suppliers",
  timestamps: true,
  indexes: [
    { fields: ["userId"] },
    { fields: ["name"] },
  ],
});

export default Supplier;
