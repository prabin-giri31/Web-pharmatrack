// backend/Model/ItemsGroup/MedicineType.js
import { DataTypes } from "sequelize";
import { sequelize } from "../../Database/db.js";

const MedicineType = sequelize.define("MedicineType", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
}, {
  tableName: "medicine_types",
  timestamps: true,
});

export default MedicineType;
