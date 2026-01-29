// backend/Model/ItemsGroup/DiseaseCategory.js
import { DataTypes } from "sequelize";
import { sequelize } from "../../Database/db.js";

const DiseaseCategory = sequelize.define("DiseaseCategory", {
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
  tableName: "disease_categories",
  timestamps: true,
});

export default DiseaseCategory;
