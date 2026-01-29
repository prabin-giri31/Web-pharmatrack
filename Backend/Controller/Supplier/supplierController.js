import Supplier from "../../Model/Supplier/Supplier.js";

export const getSuppliers = async (req, res) => {
  try {
    const suppliers = await Supplier.findAll({
      where: { userId: req.user.userId },
      order: [["createdAt", "DESC"]],
    });
    res.status(200).json(suppliers);
  } catch (error) {
    console.error("Get Suppliers Error:", error);
    res.status(500).json({ message: "Failed to fetch suppliers" });
  }
};

export const createSupplier = async (req, res) => {
  try {
    const { name, email, phone, address, status } = req.body;
    if (!name) {
      return res.status(400).json({ message: "Supplier name is required" });
    }

    const supplier = await Supplier.create({
      userId: req.user.userId,
      name,
      email,
      phone,
      address,
      status: status || "active",
    });

    res.status(201).json(supplier);
  } catch (error) {
    console.error("Create Supplier Error:", error);
    res.status(500).json({ message: "Failed to create supplier" });
  }
};
