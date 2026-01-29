// backend/Controller/ItemsGroup/itemsGroupController.js
import ItemsGroup from "../../Model/ItemsGroup/ItemsGroup.js";
import MedicineType from "../../Model/ItemsGroup/MedicineType.js";
import DiseaseCategory from "../../Model/ItemsGroup/DiseaseCategory.js";
import { Op } from "sequelize";

// Get all items groups with related data
export const getItemsGroups = async (req, res) => {
  try {
    const { search, medicineTypeId, diseaseCategoryId } = req.query;

    // Build where clause
    const whereClause = {
      isActive: true,
      userId: req.user.userId // Scope to user
    };

    if (search) {
      whereClause[Op.or] = [
        { groupName: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } },
      ];
    }

    if (medicineTypeId) {
      whereClause.medicineTypeId = medicineTypeId;
    }

    if (diseaseCategoryId) {
      whereClause.diseaseCategoryId = diseaseCategoryId;
    }

    const groups = await ItemsGroup.findAll({
      where: whereClause,
      include: [
        {
          model: MedicineType,
          as: "medicineType",
          attributes: ["id", "name"],
        },
        {
          model: DiseaseCategory,
          as: "diseaseCategory",
          attributes: ["id", "name"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json(groups);
  } catch (error) {
    console.error("Error fetching items groups:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// Get single items group by ID
export const getItemsGroupById = async (req, res) => {
  try {
    const { id } = req.params;

    const group = await ItemsGroup.findOne({
      where: {
        id,
        userId: req.user.userId // Scope to user
      },
      include: [
        {
          model: MedicineType,
          as: "medicineType",
          attributes: ["id", "name"],
        },
        {
          model: DiseaseCategory,
          as: "diseaseCategory",
          attributes: ["id", "name"],
        },
      ],
    });

    if (!group) {
      return res.status(404).json({ message: "Items group not found" });
    }

    res.status(200).json(group);
  } catch (error) {
    console.error("Error fetching items group:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// Add new items group
export const addItemsGroup = async (req, res) => {
  try {
    const { groupName, medicineTypeId, diseaseCategoryId, description } = req.body;

    // Validation
    if (!groupName || !groupName.trim()) {
      return res.status(400).json({ message: "Group name is required" });
    }
    if (!medicineTypeId) {
      return res.status(400).json({ message: "Medicine type is required" });
    }
    if (!diseaseCategoryId) {
      return res.status(400).json({ message: "Disease category is required" });
    }

    // Verify medicine type exists
    const medicineType = await MedicineType.findByPk(medicineTypeId);
    if (!medicineType) {
      return res.status(400).json({ message: "Invalid medicine type" });
    }

    // Verify disease category exists
    const diseaseCategory = await DiseaseCategory.findByPk(diseaseCategoryId);
    if (!diseaseCategory) {
      return res.status(400).json({ message: "Invalid disease category" });
    }

    const newGroup = await ItemsGroup.create({
      userId: req.user.userId,
      groupName: groupName.trim(),
      medicineTypeId,
      diseaseCategoryId,
      description: description?.trim() || null,
    });

    // Fetch with associations
    const createdGroup = await ItemsGroup.findByPk(newGroup.id, {
      include: [
        {
          model: MedicineType,
          as: "medicineType",
          attributes: ["id", "name"],
        },
        {
          model: DiseaseCategory,
          as: "diseaseCategory",
          attributes: ["id", "name"],
        },
      ],
    });

    res.status(201).json(createdGroup);
  } catch (error) {
    console.error("Error adding items group:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// Update items group
export const updateItemsGroup = async (req, res) => {
  try {
    const { id } = req.params;
    const { groupName, medicineTypeId, diseaseCategoryId, description } = req.body;

    const group = await ItemsGroup.findOne({
      where: {
        id,
        userId: req.user.userId
      }
    });
    if (!group) {
      return res.status(404).json({ message: "Items group not found" });
    }

    // Update fields if provided
    if (groupName && groupName.trim()) {
      group.groupName = groupName.trim();
    }

    if (medicineTypeId) {
      const medicineType = await MedicineType.findByPk(medicineTypeId);
      if (!medicineType) {
        return res.status(400).json({ message: "Invalid medicine type" });
      }
      group.medicineTypeId = medicineTypeId;
    }

    if (diseaseCategoryId) {
      const diseaseCategory = await DiseaseCategory.findByPk(diseaseCategoryId);
      if (!diseaseCategory) {
        return res.status(400).json({ message: "Invalid disease category" });
      }
      group.diseaseCategoryId = diseaseCategoryId;
    }

    if (description !== undefined) {
      group.description = description?.trim() || null;
    }

    await group.save();

    // Fetch with associations
    const updatedGroup = await ItemsGroup.findByPk(id, {
      include: [
        {
          model: MedicineType,
          as: "medicineType",
          attributes: ["id", "name"],
        },
        {
          model: DiseaseCategory,
          as: "diseaseCategory",
          attributes: ["id", "name"],
        },
      ],
    });

    res.status(200).json(updatedGroup);
  } catch (error) {
    console.error("Error updating items group:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// Delete items group (soft delete)
export const deleteItemsGroup = async (req, res) => {
  try {
    const { id } = req.params;

    const group = await ItemsGroup.findOne({
      where: {
        id,
        userId: req.user.userId
      }
    });
    if (!group) {
      return res.status(404).json({ message: "Items group not found" });
    }

    // Soft delete
    group.isActive = false;
    await group.save();

    res.status(200).json({ message: "Items group deleted successfully" });
  } catch (error) {
    console.error("Error deleting items group:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// Hard delete items group (permanent)
export const hardDeleteItemsGroup = async (req, res) => {
  try {
    const { id } = req.params;

    const group = await ItemsGroup.findOne({
      where: {
        id,
        userId: req.user.userId
      }
    });
    if (!group) {
      return res.status(404).json({ message: "Items group not found" });
    }

    await group.destroy();
    res.status(200).json({ message: "Items group permanently deleted" });
  } catch (error) {
    console.error("Error deleting items group:", error);
    res.status(500).json({ message: "Server Error" });
  }
};
