// backend/Controller/ItemsGroup/diseaseCategoryController.js
import DiseaseCategory from "../../Model/ItemsGroup/DiseaseCategory.js";

// Get all disease categories
export const getDiseaseCategories = async (req, res) => {
  try {
    const categories = await DiseaseCategory.findAll({
      where: { isActive: true },
      order: [["name", "ASC"]],
    });
    res.status(200).json(categories);
  } catch (error) {
    console.error("Error fetching disease categories:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// Add new disease category
export const addDiseaseCategory = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Disease category name is required" });
    }

    // Check if category already exists
    const existingCategory = await DiseaseCategory.findOne({ where: { name: name.trim() } });
    if (existingCategory) {
      return res.status(400).json({ message: "Disease category already exists" });
    }

    const newCategory = await DiseaseCategory.create({
      name: name.trim(),
      description: description?.trim() || null,
    });

    res.status(201).json(newCategory);
  } catch (error) {
    console.error("Error adding disease category:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// Update disease category
export const updateDiseaseCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    const category = await DiseaseCategory.findByPk(id);
    if (!category) {
      return res.status(404).json({ message: "Disease category not found" });
    }

    if (name && name.trim()) {
      // Check if new name already exists (excluding current record)
      const existingCategory = await DiseaseCategory.findOne({
        where: { name: name.trim() },
      });
      if (existingCategory && existingCategory.id !== parseInt(id)) {
        return res.status(400).json({ message: "Disease category name already exists" });
      }
      category.name = name.trim();
    }

    if (description !== undefined) {
      category.description = description?.trim() || null;
    }

    await category.save();
    res.status(200).json(category);
  } catch (error) {
    console.error("Error updating disease category:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// Delete disease category (soft delete)
export const deleteDiseaseCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await DiseaseCategory.findByPk(id);
    if (!category) {
      return res.status(404).json({ message: "Disease category not found" });
    }

    // Soft delete - just set isActive to false
    category.isActive = false;
    await category.save();

    res.status(200).json({ message: "Disease category deleted successfully" });
  } catch (error) {
    console.error("Error deleting disease category:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// Hard delete disease category (permanent)
export const hardDeleteDiseaseCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await DiseaseCategory.findByPk(id);
    if (!category) {
      return res.status(404).json({ message: "Disease category not found" });
    }

    await category.destroy();
    res.status(200).json({ message: "Disease category permanently deleted" });
  } catch (error) {
    console.error("Error deleting disease category:", error);
    res.status(500).json({ message: "Server Error" });
  }
};
