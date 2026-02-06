import { SalesOrder, SalesOrderItem } from "../../Model/SalesOrder/index.js";
import Customer from "../../Model/Customer/Customer.js";
import Items from "../../Model/Items/Items.js";
import { Op } from "sequelize";
import { sequelize } from "../../Database/db.js";

// Get all sales orders with optional filtering
export const getSalesOrders = async (req, res) => {
    try {
        const { status, paymentStatus, customerId, startDate, endDate, search } = req.query;

        // Build where clause
        const whereClause = {
            userId: req.user.userId, // Multi-tenancy
        };

        // Filter by status
        if (status && status !== "all") {
            whereClause.status = status;
        }

        // Filter by payment status
        if (paymentStatus && paymentStatus !== "all") {
            whereClause.paymentStatus = paymentStatus;
        }

        // Filter by customer
        if (customerId && customerId !== "all") {
            whereClause.customerId = parseInt(customerId);
        }

        // Filter by date range
        if (startDate) {
            whereClause.orderDate = { [Op.gte]: startDate };
        }
        if (endDate) {
            whereClause.orderDate = {
                ...whereClause.orderDate,
                [Op.lte]: endDate,
            };
        }

        // Search by order number or customer name
        if (search) {
            whereClause[Op.or] = [
                { orderNumber: { [Op.iLike]: `%${search}%` } },
            ];
        }

        const salesOrders = await SalesOrder.findAll({
            where: whereClause,
            include: [
                {
                    model: SalesOrderItem,
                    as: "items",
                },
                {
                    model: Customer,
                    as: "customer",
                    attributes: ["id", "name", "company", "email", "phone"],
                },
            ],
            order: [["createdAt", "DESC"]],
        });

        res.status(200).json(salesOrders);
    } catch (error) {
        console.error("Error fetching sales orders:", error);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// Get single sales order by ID
export const getSalesOrderById = async (req, res) => {
    try {
        const { id } = req.params;

        const salesOrder = await SalesOrder.findOne({
            where: {
                id,
                userId: req.user.userId,
            },
            include: [
                {
                    model: SalesOrderItem,
                    as: "items",
                },
                {
                    model: Customer,
                    as: "customer",
                    attributes: ["id", "name", "company", "email", "phone"],
                },
            ],
        });

        if (!salesOrder) {
            return res.status(404).json({ message: "Sales order not found" });
        }

        res.status(200).json(salesOrder);
    } catch (error) {
        console.error("Error fetching sales order:", error);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// Create new sales order
export const createSalesOrder = async (req, res) => {
    const transaction = await sequelize.transaction();

    try {
        const {
            customerId,
            orderDate,
            expectedDeliveryDate,
            status,
            paymentStatus,
            paymentMethod,
            dueDate,
            advancePayment,
            items,
            notes,
        } = req.body;

        // Validation
        if (!customerId || !items || items.length === 0) {
            await transaction.rollback();
            return res.status(400).json({ message: "Customer and items are required" });
        }

        // Verify customer belongs to user
        const customer = await Customer.findOne({
            where: {
                id: customerId,
                userId: req.user.userId,
            },
        });

        if (!customer) {
            await transaction.rollback();
            return res.status(404).json({ message: "Customer not found" });
        }

        // Generate order number
        const year = new Date().getFullYear();
        const count = await SalesOrder.count({
            where: { userId: req.user.userId },
        });
        const orderNumber = `SO-${year}-${String(count + 1).padStart(4, "0")}`;

        // Calculate totals
        let subtotal = 0;
        let totalDiscount = 0;
        let totalTax = 0;

        const orderItems = [];

        for (const item of items) {
            const product = await Items.findOne({
                where: {
                    id: item.productId,
                    userId: req.user.userId,
                },
            });

            if (!product) {
                await transaction.rollback();
                return res.status(404).json({ message: `Product with ID ${item.productId} not found` });
            }

            // Check stock availability
            if (product.stockOnHand < item.quantity) {
                await transaction.rollback();
                return res.status(400).json({
                    message: `Insufficient stock for ${product.name}. Available: ${product.stockOnHand}, Required: ${item.quantity}`,
                });
            }

            const itemSubtotal = item.quantity * item.unitPrice;
            const itemDiscount = (itemSubtotal * (item.discount || 0)) / 100;
            const itemTaxableAmount = itemSubtotal - itemDiscount;
            const itemTax = (itemTaxableAmount * (item.tax || 0)) / 100;
            const lineTotal = itemTaxableAmount + itemTax;

            subtotal += itemSubtotal;
            totalDiscount += itemDiscount;
            totalTax += itemTax;

            orderItems.push({
                productId: product.id,
                productName: product.name,
                productSku: product.sku,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                discount: item.discount || 0,
                tax: item.tax || 0,
                lineTotal: lineTotal,
            });
        }

        const grandTotal = subtotal - totalDiscount + totalTax;

        // Create sales order
        const newSalesOrder = await SalesOrder.create(
            {
                userId: req.user.userId,
                customerId,
                orderNumber,
                orderDate: orderDate || new Date(),
                expectedDeliveryDate,
                status: status || "draft",
                paymentStatus: paymentStatus || "unpaid",
                paymentMethod,
                dueDate,
                advancePayment: advancePayment || 0,
                subtotal,
                totalDiscount,
                totalTax,
                grandTotal,
                notes,
            },
            { transaction }
        );

        // Create order items
        const createdItems = await SalesOrderItem.bulkCreate(
            orderItems.map((item) => ({
                ...item,
                salesOrderId: newSalesOrder.id,
            })),
            { transaction }
        );

        await transaction.commit();

        // Fetch the complete order with items
        const completeOrder = await SalesOrder.findByPk(newSalesOrder.id, {
            include: [
                {
                    model: SalesOrderItem,
                    as: "items",
                },
                {
                    model: Customer,
                    as: "customer",
                },
            ],
        });

        res.status(201).json(completeOrder);
    } catch (error) {
        await transaction.rollback();
        console.error("Error creating sales order:", error);

        if (error.name === "SequelizeValidationError") {
            const messages = error.errors.map((e) => e.message);
            return res.status(400).json({ message: messages.join(", ") });
        }

        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// Update sales order
export const updateSalesOrder = async (req, res) => {
    const transaction = await sequelize.transaction();

    try {
        const { id } = req.params;
        const {
            customerId,
            orderDate,
            expectedDeliveryDate,
            status,
            paymentStatus,
            paymentMethod,
            dueDate,
            advancePayment,
            items,
            notes,
        } = req.body;

        const salesOrder = await SalesOrder.findOne({
            where: {
                id,
                userId: req.user.userId,
            },
        });

        if (!salesOrder) {
            await transaction.rollback();
            return res.status(404).json({ message: "Sales order not found" });
        }

        // Only draft orders can be fully edited
        if (salesOrder.status !== "draft" && items) {
            await transaction.rollback();
            return res.status(400).json({ message: "Only draft orders can have items modified" });
        }

        // If items are being updated, recalculate totals
        if (items && items.length > 0) {
            let subtotal = 0;
            let totalDiscount = 0;
            let totalTax = 0;

            const orderItems = [];

            for (const item of items) {
                const product = await Items.findOne({
                    where: {
                        id: item.productId,
                        userId: req.user.userId,
                    },
                });

                if (!product) {
                    await transaction.rollback();
                    return res.status(404).json({ message: `Product with ID ${item.productId} not found` });
                }

                const itemSubtotal = item.quantity * item.unitPrice;
                const itemDiscount = (itemSubtotal * (item.discount || 0)) / 100;
                const itemTaxableAmount = itemSubtotal - itemDiscount;
                const itemTax = (itemTaxableAmount * (item.tax || 0)) / 100;
                const lineTotal = itemTaxableAmount + itemTax;

                subtotal += itemSubtotal;
                totalDiscount += itemDiscount;
                totalTax += itemTax;

                orderItems.push({
                    productId: product.id,
                    productName: product.name,
                    productSku: product.sku,
                    quantity: item.quantity,
                    unitPrice: item.unitPrice,
                    discount: item.discount || 0,
                    tax: item.tax || 0,
                    lineTotal: lineTotal,
                });
            }

            const grandTotal = subtotal - totalDiscount + totalTax;

            // Delete old items
            await SalesOrderItem.destroy({
                where: { salesOrderId: id },
                transaction,
            });

            // Create new items
            await SalesOrderItem.bulkCreate(
                orderItems.map((item) => ({
                    ...item,
                    salesOrderId: id,
                })),
                { transaction }
            );

            // Update order with new totals
            await salesOrder.update(
                {
                    customerId: customerId || salesOrder.customerId,
                    orderDate: orderDate || salesOrder.orderDate,
                    expectedDeliveryDate: expectedDeliveryDate !== undefined ? expectedDeliveryDate : salesOrder.expectedDeliveryDate,
                    status: status || salesOrder.status,
                    paymentStatus: paymentStatus || salesOrder.paymentStatus,
                    paymentMethod: paymentMethod !== undefined ? paymentMethod : salesOrder.paymentMethod,
                    dueDate: dueDate !== undefined ? dueDate : salesOrder.dueDate,
                    advancePayment: advancePayment !== undefined ? advancePayment : salesOrder.advancePayment,
                    subtotal,
                    totalDiscount,
                    totalTax,
                    grandTotal,
                    notes: notes !== undefined ? notes : salesOrder.notes,
                },
                { transaction }
            );
        } else {
            // Update only order-level fields
            await salesOrder.update(
                {
                    customerId: customerId || salesOrder.customerId,
                    orderDate: orderDate || salesOrder.orderDate,
                    expectedDeliveryDate: expectedDeliveryDate !== undefined ? expectedDeliveryDate : salesOrder.expectedDeliveryDate,
                    status: status || salesOrder.status,
                    paymentStatus: paymentStatus || salesOrder.paymentStatus,
                    paymentMethod: paymentMethod !== undefined ? paymentMethod : salesOrder.paymentMethod,
                    dueDate: dueDate !== undefined ? dueDate : salesOrder.dueDate,
                    advancePayment: advancePayment !== undefined ? advancePayment : salesOrder.advancePayment,
                    notes: notes !== undefined ? notes : salesOrder.notes,
                },
                { transaction }
            );
        }

        await transaction.commit();

        // Fetch updated order
        const updatedOrder = await SalesOrder.findByPk(id, {
            include: [
                {
                    model: SalesOrderItem,
                    as: "items",
                },
                {
                    model: Customer,
                    as: "customer",
                },
            ],
        });

        res.status(200).json(updatedOrder);
    } catch (error) {
        await transaction.rollback();
        console.error("Error updating sales order:", error);

        if (error.name === "SequelizeValidationError") {
            const messages = error.errors.map((e) => e.message);
            return res.status(400).json({ message: messages.join(", ") });
        }

        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// Delete sales order
export const deleteSalesOrder = async (req, res) => {
    try {
        const { id } = req.params;

        const salesOrder = await SalesOrder.findOne({
            where: {
                id,
                userId: req.user.userId,
            },
        });

        if (!salesOrder) {
            return res.status(404).json({ message: "Sales order not found" });
        }

        // Only draft orders can be deleted
        if (salesOrder.status !== "draft") {
            return res.status(400).json({ message: "Only draft orders can be deleted" });
        }

        await salesOrder.destroy();

        res.status(200).json({ message: "Sales order deleted successfully" });
    } catch (error) {
        console.error("Error deleting sales order:", error);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// Get sales order statistics
export const getSalesOrderStats = async (req, res) => {
    try {
        const [total, draft, confirmed, delivered, invoiced, cancelled] = await Promise.all([
            SalesOrder.count({ where: { userId: req.user.userId } }),
            SalesOrder.count({ where: { status: "draft", userId: req.user.userId } }),
            SalesOrder.count({ where: { status: "confirmed", userId: req.user.userId } }),
            SalesOrder.count({ where: { status: "delivered", userId: req.user.userId } }),
            SalesOrder.count({ where: { status: "invoiced", userId: req.user.userId } }),
            SalesOrder.count({ where: { status: "cancelled", userId: req.user.userId } }),
        ]);

        // Calculate total revenue (invoiced orders)
        const revenueResult = await SalesOrder.sum("grandTotal", {
            where: {
                userId: req.user.userId,
                status: "invoiced",
            },
        });

        res.status(200).json({
            total,
            draft,
            confirmed,
            delivered,
            invoiced,
            cancelled,
            totalRevenue: revenueResult || 0,
        });
    } catch (error) {
        console.error("Error fetching sales order stats:", error);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// Update order status
export const updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const salesOrder = await SalesOrder.findOne({
            where: {
                id,
                userId: req.user.userId,
            },
        });

        if (!salesOrder) {
            return res.status(404).json({ message: "Sales order not found" });
        }

        // Validate status transitions
        const validTransitions = {
            draft: ["confirmed", "cancelled"],
            confirmed: ["delivered", "cancelled"],
            delivered: ["invoiced"],
            invoiced: [],
            cancelled: [],
        };

        if (!validTransitions[salesOrder.status].includes(status)) {
            return res.status(400).json({
                message: `Cannot change status from ${salesOrder.status} to ${status}`,
            });
        }

        await salesOrder.update({ status });

        res.status(200).json(salesOrder);
    } catch (error) {
        console.error("Error updating order status:", error);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};
