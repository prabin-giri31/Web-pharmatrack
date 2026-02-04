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
    const {
      salutation,
      firstName,
      lastName,
      companyName,
      displayName,
      email,
      phone,
      workPhone,
      mobileNumber,
      billingAddress,
      shippingAddress,
      city,
      stateProvince,
      postalCode,
      country,
      contactPersons,
      registrationId,
      panVatNumber,
      taxRate,
      taxGroup,
      businessType,
      currency,
      paymentTerms,
      bankDetails,
      creditLimit,
      documents,
      customFields,
      region,
      supplierCategory,
      preferredSupplier,
      notes,
      specialInstructions,
      purchaseRemarks,
      status,
    } = req.body;

    const derivedDisplayName =
      displayName ||
      companyName ||
      [salutation, firstName, lastName].filter(Boolean).join(" ").trim();

    if (!derivedDisplayName) {
      return res.status(400).json({ message: "Display name is required" });
    }
    if (!email) {
      return res.status(400).json({ message: "Email address is required" });
    }
    if (!phone) {
      return res.status(400).json({ message: "Phone number is required" });
    }

    const supplier = await Supplier.create({
      userId: req.user.userId,
      name: derivedDisplayName,
      salutation,
      firstName,
      lastName,
      companyName,
      displayName: derivedDisplayName,
      email,
      phone,
      workPhone,
      mobileNumber,
      address: billingAddress || shippingAddress || null,
      billingAddress,
      shippingAddress,
      city,
      stateProvince,
      postalCode,
      country,
      contactPersons,
      registrationId,
      panVatNumber,
      taxRate,
      taxGroup,
      businessType,
      currency,
      paymentTerms,
      bankDetails,
      creditLimit,
      documents,
      customFields,
      region,
      supplierCategory,
      preferredSupplier,
      notes,
      specialInstructions,
      purchaseRemarks,
      status: status || "active",
    });

    res.status(201).json(supplier);
  } catch (error) {
    console.error("Create Supplier Error:", error);
    res.status(500).json({ message: "Failed to create supplier" });
  }
};

export const updateSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.findOne({
      where: { id: req.params.id, userId: req.user.userId },
    });

    if (!supplier) {
      return res.status(404).json({ message: "Supplier not found" });
    }

    const updates = { ...req.body };
    delete updates.id;
    delete updates.userId;
    const derivedDisplayName =
      updates.displayName ||
      updates.companyName ||
      [updates.salutation, updates.firstName, updates.lastName].filter(Boolean).join(" ").trim();

    if (derivedDisplayName) {
      updates.displayName = derivedDisplayName;
      updates.name = derivedDisplayName;
    }

    await supplier.update(updates);
    res.status(200).json(supplier);
  } catch (error) {
    console.error("Update Supplier Error:", error);
    res.status(500).json({ message: "Failed to update supplier" });
  }
};

export const deleteSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.findOne({
      where: { id: req.params.id, userId: req.user.userId },
    });

    if (!supplier) {
      return res.status(404).json({ message: "Supplier not found" });
    }

    await supplier.destroy();
    res.status(200).json({ message: "Supplier deleted successfully" });
  } catch (error) {
    console.error("Delete Supplier Error:", error);
    res.status(500).json({ message: "Failed to delete supplier" });
  }
};
