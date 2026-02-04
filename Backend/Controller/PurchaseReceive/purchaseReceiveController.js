import { PurchaseReceive, PurchaseReceiveItem } from "../../Model/PurchaseReceive/index.js";
import Supplier from "../../Model/Supplier/Supplier.js";
import Items from "../../Model/Items/Items.js";
import asyncHandler from "../../utils/asyncHandler.js";
import { sequelize } from "../../Database/db.js";
import { Op } from "sequelize";

// Generate unique receive number
const generateReceiveNumber = async () => {
    const today = new Date();
    const prefix = `PR${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}`;
    
    const lastReceive = await PurchaseReceive.findOne({
        where: { receiveNumber: { [Op.like]: `${prefix}%` } },
        order: [['receiveNumber', 'DESC']],
    });
    
    let nextNumber = 1;
    if (lastReceive) {
        const lastNumber = parseInt(lastReceive.receiveNumber.slice(-4));
        nextNumber = lastNumber + 1;
    }
    
    return `${prefix}${String(nextNumber).padStart(4, '0')}`;
};

// Get all purchase receives
export const getAllPurchaseReceives = asyncHandler(async (req, res) => {
    const { status, supplierId, startDate, endDate, page = 1, limit = 20 } = req.query;
    const where = { userId: req.user.userId };
    
    if (status) where.status = status;
    if (supplierId) where.supplierId = supplierId;
    if (startDate && endDate) {
        where.receiveDate = {
            [Op.between]: [startDate, endDate]
        };
    }

    const offset = (page - 1) * limit;
    
    const { count, rows } = await PurchaseReceive.findAndCountAll({
        where,
        include: [
            {
                model: Supplier,
                as: 'supplier',
                attributes: ['id', 'displayName', 'companyName', 'email', 'phone']
            },
            {
                model: PurchaseReceiveItem,
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
        purchaseReceives: rows,
        pagination: {
            total: count,
            page: parseInt(page),
            pages: Math.ceil(count / limit),
            limit: parseInt(limit)
        }
    });
});

// Get single purchase receive
export const getPurchaseReceiveById = asyncHandler(async (req, res) => {
    const purchaseReceive = await PurchaseReceive.findOne({
        where: { id: req.params.id, userId: req.user.userId },
        include: [
            {
                model: Supplier,
                as: 'supplier',
                attributes: ['id', 'displayName', 'companyName', 'email', 'phone', 'billingAddress']
            },
            {
                model: PurchaseReceiveItem,
                as: 'items',
                include: [{
                    model: Items,
                    as: 'item',
                    attributes: ['id', 'name', 'sku', 'unit', 'stockOnHand']
                }]
            }
        ],
    });

    if (!purchaseReceive) {
        return res.status(404).json({ message: "Purchase receive not found" });
    }

    res.json(purchaseReceive);
});

// Create purchase receive
export const createPurchaseReceive = asyncHandler(async (req, res) => {
    const transaction = await sequelize.transaction();
    
    try {
        const { supplierId, receiveDate, items, notes, referenceNumber, deliveryMethod, trackingNumber, receivedBy, warehouseLocation } = req.body;

        if (!supplierId) {
            await transaction.rollback();
            return res.status(400).json({ message: "Supplier is required" });
        }

        if (!items || items.length === 0) {
            await transaction.rollback();
            return res.status(400).json({ message: "At least one item is required" });
        }

        const receiveNumber = await generateReceiveNumber();

        // Calculate totals
        let subtotal = 0;
        let totalDiscount = 0;
        let totalTax = 0;

        for (const item of items) {
            const itemSubtotal = item.receivedQuantity * item.unitPrice;
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

        const grandTotal = subtotal - totalDiscount + totalTax;

        const purchaseReceive = await PurchaseReceive.create({
            receiveNumber,
            userId: req.user.userId,
            supplierId,
            receiveDate: receiveDate || new Date(),
            status: 'received',
            referenceNumber,
            deliveryMethod,
            trackingNumber,
            subtotal,
            totalDiscount,
            totalTax,
            grandTotal,
            notes,
            receivedBy,
            warehouseLocation,
        }, { transaction });

        // Create items and update inventory
        for (const item of items) {
            const itemSubtotal = item.receivedQuantity * item.unitPrice;
            let discount = 0;
            
            if (item.discountType === 'percentage') {
                discount = itemSubtotal * (item.discount / 100);
            } else {
                discount = item.discount || 0;
            }
            
            const afterDiscount = itemSubtotal - discount;
            const tax = afterDiscount * (item.tax / 100);
            const total = afterDiscount + tax;

            await PurchaseReceiveItem.create({
                purchaseReceiveId: purchaseReceive.id,
                itemId: item.itemId,
                orderedQuantity: item.orderedQuantity || item.receivedQuantity,
                receivedQuantity: item.receivedQuantity,
                unitPrice: item.unitPrice,
                discount: item.discount || 0,
                discountType: item.discountType || 'percentage',
                tax: item.tax || 0,
                total,
                batchNumber: item.batchNumber,
                expiryDate: item.expiryDate,
                manufacturingDate: item.manufacturingDate,
                notes: item.notes,
            }, { transaction });

            // Update item stock
            await Items.increment('stockOnHand', {
                by: item.receivedQuantity,
                where: { id: item.itemId },
                transaction
            });
        }

        await transaction.commit();

        const createdReceive = await PurchaseReceive.findByPk(purchaseReceive.id, {
            include: [
                { model: Supplier, as: 'supplier' },
                { model: PurchaseReceiveItem, as: 'items', include: [{ model: Items, as: 'item' }] }
            ]
        });

        res.status(201).json(createdReceive);
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
});

// Update purchase receive
export const updatePurchaseReceive = asyncHandler(async (req, res) => {
    const purchaseReceive = await PurchaseReceive.findOne({
        where: { id: req.params.id, userId: req.user.userId }
    });

    if (!purchaseReceive) {
        return res.status(404).json({ message: "Purchase receive not found" });
    }

    if (purchaseReceive.status === 'received') {
        return res.status(400).json({ message: "Cannot update a received purchase" });
    }

    const { notes, status, referenceNumber } = req.body;
    
    await purchaseReceive.update({ notes, status, referenceNumber });

    res.json(purchaseReceive);
});

// Delete purchase receive
export const deletePurchaseReceive = asyncHandler(async (req, res) => {
    const transaction = await sequelize.transaction();
    
    try {
        const purchaseReceive = await PurchaseReceive.findOne({
            where: { id: req.params.id, userId: req.user.userId },
            include: [{ model: PurchaseReceiveItem, as: 'items' }]
        });

        if (!purchaseReceive) {
            await transaction.rollback();
            return res.status(404).json({ message: "Purchase receive not found" });
        }

        // Reverse inventory changes if status was received
        if (purchaseReceive.status === 'received') {
            for (const item of purchaseReceive.items) {
                await Items.decrement('stockOnHand', {
                    by: item.receivedQuantity,
                    where: { id: item.itemId },
                    transaction
                });
            }
        }

        await purchaseReceive.destroy({ transaction });
        await transaction.commit();

        res.json({ message: "Purchase receive deleted successfully" });
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
});

// Get purchase receive stats
export const getPurchaseReceiveStats = asyncHandler(async (req, res) => {
    const userId = req.user.userId;
    
    const totalReceives = await PurchaseReceive.count({ where: { userId } });
    const receivedCount = await PurchaseReceive.count({ where: { userId, status: 'received' } });
    const draftCount = await PurchaseReceive.count({ where: { userId, status: 'draft' } });
    
    const totalValue = await PurchaseReceive.sum('grandTotal', { where: { userId } }) || 0;

    res.json({
        totalReceives,
        receivedCount,
        draftCount,
        totalValue: parseFloat(totalValue).toFixed(2)
    });
});
