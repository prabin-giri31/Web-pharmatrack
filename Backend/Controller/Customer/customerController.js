import Customer from "../../Model/Customer/Customer.js";
import { Op } from "sequelize";

// Get all customers with optional filtering
export const getCustomers = async (req, res) => {
  try {
    const { status, search } = req.query;

    // Build where clause
    const whereClause = {};

    // Filter by status
    if (status && status !== "all") {
      whereClause.status = status;
    }

    // Always filter by user
    console.log("getCustomers - User from req:", req.user);
    whereClause.userId = req.user.userId;
    console.log("getCustomers - Final whereClause:", whereClause);

    // Search by name, company, email, or phone
    if (search) {
      whereClause[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { company: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } },
        { phone: { [Op.iLike]: `%${search}%` } },
      ];
    }

    const customers = await Customer.findAll({
      where: whereClause,
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json(customers);
  } catch (error) {
    console.error("Error fetching customers:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Get single customer by ID
export const getCustomerById = async (req, res) => {
  try {
    const { id } = req.params;

    const customer = await Customer.findOne({
      where: {
        id,
        userId: req.user.userId
      }
    });

    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    res.status(200).json(customer);
  } catch (error) {
    console.error("Error fetching customer:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Create new customer
export const createCustomer = async (req, res) => {
  try {
    const { name, company, email, phone, status, address, notes } = req.body;

    // Validation
    if (!name || !email) {
      return res.status(400).json({ message: "Name and email are required" });
    }

    // Check if email already exists for this user
    const existingCustomer = await Customer.findOne({
      where: {
        email: email.toLowerCase(),
        userId: req.user.userId
      }
    });
    if (existingCustomer) {
      return res.status(400).json({ message: "A customer with this email already exists" });
    }

    console.log("createCustomer - User from req:", req.user);
    const newCustomer = await Customer.create({
      userId: req.user.userId,
      name: name.trim(),
      company: company?.trim() || null,
      email: email.toLowerCase().trim(),
      phone: phone?.trim() || null,
      status: status || "active",
      address: address?.trim() || null,
      notes: notes?.trim() || null,
    });

    res.status(201).json(newCustomer);
  } catch (error) {
    console.error("Error creating customer:", error);

    // Handle Sequelize validation errors
    if (error.name === "SequelizeValidationError") {
      const messages = error.errors.map((e) => e.message);
      return res.status(400).json({ message: messages.join(", ") });
    }

    // Handle unique constraint error
    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(400).json({ message: "A customer with this email already exists" });
    }

    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Update customer
export const updateCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, company, email, phone, status, address, notes } = req.body;

    const customer = await Customer.findOne({
      where: {
        id,
        userId: req.user.userId
      }
    });

    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    // If email is being changed, check for duplicates in user scope
    if (email && email.toLowerCase() !== customer.email) {
      const existingCustomer = await Customer.findOne({
        where: {
          email: email.toLowerCase(),
          userId: req.user.userId,
          id: { [Op.ne]: id }
        }
      });
      if (existingCustomer) {
        return res.status(400).json({ message: "A customer with this email already exists" });
      }
    }

    // Update fields
    await customer.update({
      name: name?.trim() || customer.name,
      company: company !== undefined ? (company?.trim() || null) : customer.company,
      email: email?.toLowerCase().trim() || customer.email,
      phone: phone !== undefined ? (phone?.trim() || null) : customer.phone,
      status: status || customer.status,
      address: address !== undefined ? (address?.trim() || null) : customer.address,
      notes: notes !== undefined ? (notes?.trim() || null) : customer.notes,
    });

    res.status(200).json(customer);
  } catch (error) {
    console.error("Error updating customer:", error);

    if (error.name === "SequelizeValidationError") {
      const messages = error.errors.map((e) => e.message);
      return res.status(400).json({ message: messages.join(", ") });
    }

    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(400).json({ message: "A customer with this email already exists" });
    }

    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Delete customer
export const deleteCustomer = async (req, res) => {
  try {
    const { id } = req.params;

    const customer = await Customer.findOne({
      where: {
        id,
        userId: req.user.userId
      }
    });

    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    await customer.destroy();

    res.status(200).json({ message: "Customer deleted successfully" });
  } catch (error) {
    console.error("Error deleting customer:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Get customer statistics/counts
export const getCustomerStats = async (req, res) => {
  try {
    const [total, active, inactive, overdue, unpaid] = await Promise.all([
      Customer.count({ where: { userId: req.user.userId } }),
      Customer.count({ where: { status: "active", userId: req.user.userId } }),
      Customer.count({ where: { status: "inactive", userId: req.user.userId } }),
      Customer.count({ where: { status: "overdue", userId: req.user.userId } }),
      Customer.count({ where: { status: "unpaid", userId: req.user.userId } }),
    ]);

    res.status(200).json({
      total,
      active,
      inactive,
      overdue,
      unpaid,
    });
  } catch (error) {
    console.error("Error fetching customer stats:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};
