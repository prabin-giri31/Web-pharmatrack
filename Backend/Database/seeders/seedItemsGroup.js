// backend/Database/seeders/seedItemsGroup.js
import MedicineType from "../../Model/ItemsGroup/MedicineType.js";
import DiseaseCategory from "../../Model/ItemsGroup/DiseaseCategory.js";

const defaultMedicineTypes = [
  { name: "Tablet", description: "Solid oral dosage form" },
  { name: "Capsule", description: "Gelatin shell containing medicine" },
  { name: "Syrup", description: "Liquid oral medication" },
  { name: "Injection", description: "Injectable medication" },
  { name: "Cream", description: "Topical skin application" },
  { name: "Drops", description: "Liquid drops for eyes, ears, or nose" },
  { name: "Inhaler", description: "Respiratory medication delivery" },
];

const defaultDiseaseCategories = [
  { name: "Fever & Pain", description: "Antipyretics and analgesics" },
  { name: "Cold & Cough", description: "Respiratory and cold medicines" },
  { name: "Diabetes", description: "Blood sugar management" },
  { name: "Blood Pressure", description: "Cardiovascular medications" },
  { name: "Allergy", description: "Antihistamines and allergy relief" },
  { name: "Skin Care", description: "Dermatological treatments" },
  { name: "Infection", description: "Antibiotics and anti-infectives" },
  { name: "Digestive", description: "Gastrointestinal medications" },
  { name: "Vitamins & Supplements", description: "Nutritional supplements" },
];

export const seedMedicineTypes = async () => {
  try {
    for (const type of defaultMedicineTypes) {
      await MedicineType.findOrCreate({
        where: { name: type.name },
        defaults: type,
      });
    }
    console.log("Medicine types seeded successfully");
  } catch (error) {
    console.error("Error seeding medicine types:", error);
  }
};

export const seedDiseaseCategories = async () => {
  try {
    for (const category of defaultDiseaseCategories) {
      await DiseaseCategory.findOrCreate({
        where: { name: category.name },
        defaults: category,
      });
    }
    console.log("Disease categories seeded successfully");
  } catch (error) {
    console.error("Error seeding disease categories:", error);
  }
};

export const seedAll = async () => {
  await seedMedicineTypes();
  await seedDiseaseCategories();
};

export default seedAll;
