import { PurchaseOrder, PurchaseOrderItem } from "../../Model/PurchaseOrder/index.js";
import Supplier from "../../Model/Supplier/Supplier.js";
import Items from "../../Model/Items/Items.js";
import asyncHandler from "../../utils/asyncHandler.js";
import { sequelize } from "../../Database/db.js";
import { Op } from "sequelize";

// Generate unique order number
const generateOrderNumber = async () => {
    const today = new Date();
    const prefix = `PO${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}${String(today.getDate()).padStart(2, '0')}`;
    const timestampSegment = String(Date.now()).slice(-5);
    return `${prefix}-${timestampSegment}`;
};

// Get all purchase orders
export const getAllPurchaseOrders = asyncHandler(async (req, res) => {
    const { status, supplierId, startDate, endDate, page = 1, limit = 20 } = req.query;
    const where = { userId: req.user.userId };
    
    if (status) where.status = status;
    if (supplierId) where.supplierId = supplierId;
    if (startDate && endDate) {
        where.orderDate = {
            [Op.between]: [startDate, endDate]
        };
    }

    const offset = (page - 1) * limit;
    
    const { count, rows } = await PurchaseOrder.findAndCountAll({
        where,
        include: [
            {
                model: Supplier,
                as: 'supplier',
                attributes: ['id', 'displayName', 'companyName', 'email', 'phone']
            },
            {
                model: PurchaseOrderItem,
                as: 'items',
                include: [{
                    model: Items,
                    as: 'item',
                    attributes: ['id', 'name', 'sku', 'unit']
                }]
            }
        ],
        order: [['createdAt', 'DESC']],
        limit: parseInt(limit),
        offset: parseInt(offset),
    });

    res.json({
        purchaseOrders: rows,
        pagination: {
            total: count,
            page: parseInt(page),
            pages: Math.ceil(count / limit),
            limit: parseInt(limit)
        }
    });
});

// Get single purchase order
export const getPurchaseOrderById = asyncHandler(async (req, res) => {
    const purchaseOrder = await PurchaseOrder.findOne({
        where: { id: req.params.id, userId: req.user.userId },
        include: [
            {
                model: Supplier,
                as: 'supplier',
                attributes: ['id', 'displayName', 'companyName', 'email', 'phone', 'billingAddress']
            },
            {
                model: PurchaseOrderItem,
                as: 'items',
                include: [{
                    model: Items,
                    as: 'item',
                    attributes: ['id', 'name', 'sku', 'unit', 'stockOnHand', 'costPrice']
                }]
            }
        ],
    });

    if (!purchaseOrder) {
        return res.status(404).json({ message: "Purchase order not found" });
    }

    res.json(purchaseOrder);
});

// Create purchase order
const toDateOnly = (value) => {
    if (!value) return null;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return null;
    return date.toISOString().split('T')[0];
};

export const createPurchaseOrder = asyncHandler(async (req, res) => {
    const transaction = await sequelize.transaction();
    
    try {
        const { 
            supplierId, 
            orderDate, 
            expectedDeliveryDate, 
            items, 
            notes, 
            referenceNumber, 
            shippingMethod, 
            shippingAddress,
            shippingCharges,
            termsAndConditions 
        } = req.body;

        if (!supplierId) {
            await transaction.rollback();
            return res.status(400).json({ message: "Supplier is required" });
        }

        if (!items || items.length === 0) {
            await transaction.rollback();
            return res.status(400).json({ message: "At least one item is required" });
        }

        const sanitizedOrderDate = toDateOnly(orderDate);
        const sanitizedExpectedDate = toDateOnly(expectedDeliveryDate);
        const orderNumber = await generateOrderNumber();

        // Calculate totals
        let subtotal = 0;
        let totalDiscount = 0;
        let totalTax = 0;

        for (const item of items) {
            const itemSubtotal = item.quantity * item.unitPrice;
            let discount = 0;
            
            if (item.discountType === 'percentage') {
                discount = itemSubtotal * (item.discount / 100);
            } else {
                discount = item.discount || 0;
            }
            
            const afterDiscount = itemSubtotal - discount;
            const tax = afterDiscount * (item.tax / 100);
            
            subtotal += itemSubtotal;
            totalDiscount += discount;
            totalTax += tax;
        }

        const grandTotal = subtotal - totalDiscount + totalTax + (parseFloat(shippingCharges) || 0);

        const maxAttempts = 5;
        let purchaseOrder;
        let attempts = 0;

        while (!purchaseOrder && attempts < maxAttempts) {
            attempts += 1;
            const orderNumberAttempt = await generateOrderNumber();
            try {
                purchaseOrder = await PurchaseOrder.create({
                    orderNumber: orderNumberAttempt,
                    userId: req.user.userId,
                    supplierId,
                    orderDate: sanitizedOrderDate || new Date(),
                    expectedDeliveryDate: sanitizedExpectedDate,
                    status: 'draft',
                    referenceNumber,
                    shippingMethod,
                    shippingAddress,
                    shippingCharges: shippingCharges || 0,
                    subtotal,
                    totalDiscount,
                    totalTax,
                    grandTotal,
                    notes,
                    termsAndConditions,
                }, { transaction });
            } catch (error) {
                console.error(`PurchaseOrder.create failed attempt ${attempts}`, error.name, error.message);
                if (attempts >= maxAttempts || error.name !== 'SequelizeUniqueConstraintError') {
                    throw error;
                }
            }
        }

        if (!purchaseOrder) {
            // Should never happen, but fail fast if we cannot generate a unique order number
            throw new Error('Unable to generate a unique purchase order number. Please try again.');
        }

        // Create order items
        const orderItemsData = items.map(item => {
            const itemSubtotal = item.quantity * item.unitPrice;
            let discount = 0;
            
            if (item.discountType === 'percentage') {
                discount = itemSubtotal * (item.discount / 100);
            } else {
                discount = item.discount || 0;
            }
            
            const afterDiscount = itemSubtotal - discount;
            const tax = afterDiscount * (item.tax / 100);
            const total = afterDiscount + tax;

            return {
                purchaseOrderId: purchaseOrder.id,
                itemId: item.itemId,
                quantity: item.quantity,
                receivedQuantity: 0,
                unitPrice: item.unitPrice,
                discount: item.discount || 0,
                discountType: item.discountType || 'percentage',
                tax: item.tax || 0,
                total,
                notes: item.notes,
            };
        });

        await PurchaseOrderItem.bulkCreate(orderItemsData, { transaction });

        await transaction.commit();

        // Fetch the created order with associations
        const createdOrder = await PurchaseOrder.findByPk(purchaseOrder.id, {
            include: [
                { model: Supplier, as: 'supplier' },
                { 
                    model: PurchaseOrderItem, 
                    as: 'items',
                    include: [{ model: Items, as: 'item' }]
                }
            ]
        });

        res.status(201).json(createdOrder);
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
});

// Update purchase order
export const updatePurchaseOrder = asyncHandler(async (req, res) => {
    const transaction = await sequelize.transaction();
    
    try {
        const { id } = req.params;
        const { 
            supplierId, 
            orderDate, 
            expectedDeliveryDate, 
            items, 
            notes, 
            referenceNumber, 
            shippingMethod, 
            shippingAddress,
            shippingCharges,
            termsAndConditions,
            status 
        } = req.body;

        const purchaseOrder = await PurchaseOrder.findOne({
            where: { id, userId: req.user.userId }
        });

        if (!purchaseOrder) {
            await transaction.rollback();
            return res.status(404).json({ message: "Purchase order not found" });
        }

        // Only allow editing draft or sent orders
        if (!['draft', 'sent'].includes(purchaseOrder.status)) {
            await transaction.rollback();
            return res.status(400).json({ message: "Cannot edit order with status: " + purchaseOrder.status });
        }

        // Calculate totals if items are provided
        let subtotal = purchaseOrder.subtotal;
        let totalDiscount = purchaseOrder.totalDiscount;
        let totalTax = purchaseOrder.totalTax;
        let grandTotal = purchaseOrder.grandTotal;

        if (items && items.length > 0) {
            subtotal = 0;
            totalDiscount = 0;
            totalTax = 0;

            for (const item of items) {
                const itemSubtotal = item.quantity * item.unitPrice;
                let discount = 0;
                
                if (item.discountType === 'percentage') {
                    discount = itemSubtotal * (item.discount / 100);
                } else {
                    discount = item.discount || 0;
                }
                
                const afterDiscount = itemSubtotal - discount;
                const tax = afterDiscount * (item.tax / 100);
                
                subtotal += itemSubtotal;
                totalDiscount += discount;
                totalTax += tax;
            }

            grandTotal = subtotal - totalDiscount + totalTax + (parseFloat(shippingCharges) || purchaseOrder.shippingCharges || 0);

            // Delete old items and create new ones
            await PurchaseOrderItem.destroy({
                where: { purchaseOrderId: id },
                transaction
            });

            const orderItemsData = items.map(item => {
                const itemSubtotal = item.quantity * item.unitPrice;
                let discount = 0;
                
                if (item.discountType === 'percentage') {
                    discount = itemSubtotal * (item.discount / 100);
                } else {
                    discount = item.discount || 0;
                }
                
                const afterDiscount = itemSubtotal - discount;
                const tax = afterDiscount * (item.tax / 100);
                const total = afterDiscount + tax;

                return {
                    purchaseOrderId: id,
                    itemId: item.itemId,
                    quantity: item.quantity,
                    receivedQuantity: item.receivedQuantity || 0,
                    unitPrice: item.unitPrice,
                    discount: item.discount || 0,
                    discountType: item.discountType || 'percentage',
                    tax: item.tax || 0,
                    total,
                    notes: item.notes,
                };
            });

            await PurchaseOrderItem.bulkCreate(orderItemsData, { transaction });
        }

        // Update order
        await purchaseOrder.update({
            supplierId: supplierId || purchaseOrder.supplierId,
            orderDate: orderDate || purchaseOrder.orderDate,
            expectedDeliveryDate: expectedDeliveryDate !== undefined ? expectedDeliveryDate : purchaseOrder.expectedDeliveryDate,
            status: status || purchaseOrder.status,
            referenceNumber: referenceNumber !== undefined ? referenceNumber : purchaseOrder.referenceNumber,
            shippingMethod: shippingMethod !== undefined ? shippingMethod : purchaseOrder.shippingMethod,
            shippingAddress: shippingAddress !== undefined ? shippingAddress : purchaseOrder.shippingAddress,
            shippingCharges: shippingCharges !== undefined ? shippingCharges : purchaseOrder.shippingCharges,
            subtotal,
            totalDiscount,
            totalTax,
            grandTotal,
            notes: notes !== undefined ? notes : purchaseOrder.notes,
            termsAndConditions: termsAndConditions !== undefined ? termsAndConditions : purchaseOrder.termsAndConditions,
        }, { transaction });

        await transaction.commit();

        // Fetch updated order
        const updatedOrder = await PurchaseOrder.findByPk(id, {
            include: [
                { model: Supplier, as: 'supplier' },
                { 
                    model: PurchaseOrderItem, 
                    as: 'items',
                    include: [{ model: Items, as: 'item' }]
                }
            ]
        });

        res.json(updatedOrder);
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
});

// Update purchase order status
export const updatePurchaseOrderStatus = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['draft', 'sent', 'confirmed', 'partially_received', 'received', 'cancelled'];
    if (!validStatuses.includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
    }

    const purchaseOrder = await PurchaseOrder.findOne({
        where: { id, userId: req.user.userId }
    });

    if (!purchaseOrder) {
        return res.status(404).json({ message: "Purchase order not found" });
    }

    await purchaseOrder.update({ status });

    res.json({ message: "Status updated successfully", purchaseOrder });
});

// Delete purchase order
export const deletePurchaseOrder = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const purchaseOrder = await PurchaseOrder.findOne({
        where: { id, userId: req.user.userId }
    });

    if (!purchaseOrder) {
        return res.status(404).json({ message: "Purchase order not found" });
    }

    // Only allow deleting draft orders
    if (purchaseOrder.status !== 'draft') {
        return res.status(400).json({ message: "Can only delete draft orders" });
    }

    await PurchaseOrderItem.destroy({ where: { purchaseOrderId: id } });
    await purchaseOrder.destroy();

    res.json({ message: "Purchase order deleted successfully" });
});

// Get next order number (for preview)
export const getNextOrderNumber = asyncHandler(async (req, res) => {
    const orderNumber = await generateOrderNumber();
    res.json({ orderNumber });
});
