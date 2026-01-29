// backend/Controller/ItemsGroup/medicineTypeController.js
import MedicineType from "../../Model/ItemsGroup/MedicineType.js";

// Get all medicine types
export const getMedicineTypes = async (req, res) => {
  try {
    const types = await MedicineType.findAll({
      where: { isActive: true },
      order: [["name", "ASC"]],
    });
    res.status(200).json(types);
  } catch (error) {
    console.error("Error fetching medicine types:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// Add new medicine type
export const addMedicineType = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Medicine type name is required" });
    }

    // Check if type already exists
    const existingType = await MedicineType.findOne({ where: { name: name.trim() } });
    if (existingType) {
      return res.status(400).json({ message: "Medicine type already exists" });
    }

    const newType = await MedicineType.create({
      name: name.trim(),
      description: description?.trim() || null,
    });

    res.status(201).json(newType);
  } catch (error) {
    console.error("Error adding medicine type:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// Update medicine type
export const updateMedicineType = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    const type = await MedicineType.findByPk(id);
    if (!type) {
      return res.status(404).json({ message: "Medicine type not found" });
    }

    if (name && name.trim()) {
      // Check if new name already exists (excluding current record)
      const existingType = await MedicineType.findOne({
        where: { name: name.trim() },
      });
      if (existingType && existingType.id !== parseInt(id)) {
        return res.status(400).json({ message: "Medicine type name already exists" });
      }
      type.name = name.trim();
    }

    if (description !== undefined) {
      type.description = description?.trim() || null;
    }

    await type.save();
    res.status(200).json(type);
  } catch (error) {
    console.error("Error updating medicine type:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// Delete medicine type (soft delete)
export const deleteMedicineType = async (req, res) => {
  try {
    const { id } = req.params;

    const type = await MedicineType.findByPk(id);
    if (!type) {
      return res.status(404).json({ message: "Medicine type not found" });
    }

    // Soft delete - just set isActive to false
    type.isActive = false;
    await type.save();

    res.status(200).json({ message: "Medicine type deleted successfully" });
  } catch (error) {
    console.error("Error deleting medicine type:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// Hard delete medicine type (permanent)
export const hardDeleteMedicineType = async (req, res) => {
  try {
    const { id } = req.params;

    const type = await MedicineType.findByPk(id);
    if (!type) {
      return res.status(404).json({ message: "Medicine type not found" });
    }

    await type.destroy();
    res.status(200).json({ message: "Medicine type permanently deleted" });
  } catch (error) {
    console.error("Error deleting medicine type:", error);
    res.status(500).json({ message: "Server Error" });
  }
};
