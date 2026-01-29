// backend/Model/ItemsGroup/ItemsGroup.js
import { DataTypes } from "sequelize";
import { sequelize } from "../../Database/db.js";
import MedicineType from "./MedicineType.js";
import DiseaseCategory from "./DiseaseCategory.js";

const ItemsGroup = sequelize.define("ItemsGroup", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id',
    }
  },
  groupName: {
    type: DataTypes.STRING(150),
    allowNull: false,
  },
  medicineTypeId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: MedicineType,
      key: "id",
    },
  },
  diseaseCategoryId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: DiseaseCategory,
      key: "id",
    },
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
  tableName: "items_groups",
  timestamps: true,
});

// Define associations
ItemsGroup.belongsTo(MedicineType, { foreignKey: "medicineTypeId", as: "medicineType" });
ItemsGroup.belongsTo(DiseaseCategory, { foreignKey: "diseaseCategoryId", as: "diseaseCategory" });

MedicineType.hasMany(ItemsGroup, { foreignKey: "medicineTypeId", as: "itemsGroups" });
DiseaseCategory.hasMany(ItemsGroup, { foreignKey: "diseaseCategoryId", as: "itemsGroups" });

export default ItemsGroup;
