import { Bill, BillItem, Supplier, Item } from "../../Model/index.js";
import { Op } from "sequelize";
import { sequelize } from "../../Database/db.js";

// Get all bills
export const getAllBills = async (req, res) => {
    try {
        const { page = 1, limit = 10, search, status, supplierId, startDate, endDate } = req.query;
        const offset = (page - 1) * limit;

        const whereClause = { userId: req.user.userId };

        if (search) {
            whereClause[Op.or] = [
                { billNumber: { [Op.like]: `%${search}%` } },
                { '$supplier.companyName$': { [Op.like]: `%${search}%` } }
            ];
        }

        if (status) {
            whereClause.status = status;
        }

        if (supplierId) {
            whereClause.supplierId = supplierId;
        }

        if (startDate && endDate) {
            whereClause.billDate = {
                [Op.between]: [startDate, endDate]
            };
        }

        const { count, rows } = await Bill.findAndCountAll({
            where: whereClause,
            include: [
                {
                    model: Supplier,
                    as: 'supplier',
                    attributes: ['id', 'companyName', 'contactPerson', 'email', 'phone']
                },
                {
                    model: BillItem,
                    as: 'items',
                    include: [
                        {
                            model: Item,
                            as: 'item',
                            attributes: ['id', 'itemName', 'sku']
                        }
                    ]
                }
            ],
            order: [['createdAt', 'DESC']],
            limit: parseInt(limit),
            offset: parseInt(offset)
        });

        res.json({
            success: true,
            data: rows,
            pagination: {
                total: count,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(count / limit)
            }
        });
    } catch (error) {
        console.error("Error fetching bills:", error);
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};

// Get bill by ID
export const getBillById = async (req, res) => {
    try {
        const bill = await Bill.findOne({
            where: { id: req.params.id, userId: req.user.userId },
            include: [
                {
                    model: Supplier,
                    as: 'supplier',
                    attributes: ['id', 'companyName', 'contactPerson', 'email', 'phone', 'address']
                },
                {
                    model: BillItem,
                    as: 'items',
                    include: [
                        {
                            model: Item,
                            as: 'item',
                            attributes: ['id', 'itemName', 'sku', 'sellingPrice', 'purchasePrice']
                        }
                    ]
                }
            ]
        });

        if (!bill) {
            return res.status(404).json({ success: false, message: "Bill not found" });
        }

        res.json({ success: true, data: bill });
    } catch (error) {
        console.error("Error fetching bill:", error);
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};

// Create bill
export const createBill = async (req, res) => {
    const transaction = await sequelize.transaction();

    try {
        const {
            supplierId,
            billDate,
            dueDate,
            items,
            notes,
            terms,
            status = 'draft'
        } = req.body;

        // Generate bill number
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const lastBill = await Bill.findOne({
            order: [['id', 'DESC']],
            transaction
        });
        const sequence = lastBill ? lastBill.id + 1 : 1;
        const billNumber = `BILL${year}${month}${String(sequence).padStart(4, '0')}`;

        // Calculate totals
        let subtotal = 0;
        let totalDiscount = 0;
        let totalTax = 0;

        items.forEach(item => {
            const itemTotal = item.quantity * item.unitPrice;
            const discount = item.discountType === 'percentage' 
                ? (itemTotal * item.discount / 100) 
                : item.discount;
            const taxAmount = (itemTotal - discount) * (item.tax / 100);
            
            subtotal += itemTotal;
            totalDiscount += discount;
            totalTax += taxAmount;
        });

        const grandTotal = subtotal - totalDiscount + totalTax;

        // Create bill
        const bill = await Bill.create({
            billNumber,
            userId: req.user.userId,
            supplierId,
            billDate,
            dueDate,
            status,
            subtotal,
            totalDiscount,
            totalTax,
            grandTotal,
            amountPaid: 0,
            balanceDue: grandTotal,
            notes,
            terms
        }, { transaction });

        // Create bill items
        const billItems = items.map(item => {
            const itemTotal = item.quantity * item.unitPrice;
            const discount = item.discountType === 'percentage' 
                ? (itemTotal * item.discount / 100) 
                : item.discount;
            const taxAmount = (itemTotal - discount) * (item.tax / 100);
            const total = itemTotal - discount + taxAmount;

            return {
                billId: bill.id,
                itemId: item.itemId,
                description: item.description,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                discount: item.discount,
                discountType: item.discountType || 'amount',
                tax: item.tax,
                total
            };
        });

        await BillItem.bulkCreate(billItems, { transaction });

        await transaction.commit();

        // Fetch the created bill with associations
        const createdBill = await Bill.findByPk(bill.id, {
            include: [
                { model: Supplier, as: 'supplier' },
                { model: BillItem, as: 'items', include: [{ model: Item, as: 'item' }] }
            ]
        });

        res.status(201).json({ success: true, data: createdBill, message: "Bill created successfully" });
    } catch (error) {
        await transaction.rollback();
        console.error("Error creating bill:", error);
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};

// Update bill
export const updateBill = async (req, res) => {
    const transaction = await sequelize.transaction();

    try {
        const bill = await Bill.findOne({
            where: { id: req.params.id, userId: req.user.userId },
            transaction
        });

        if (!bill) {
            await transaction.rollback();
            return res.status(404).json({ success: false, message: "Bill not found" });
        }

        if (bill.status === 'paid') {
            await transaction.rollback();
            return res.status(400).json({ success: false, message: "Cannot edit a paid bill" });
        }

        const {
            supplierId,
            billDate,
            dueDate,
            items,
            notes,
            terms,
            status
        } = req.body;

        // Calculate totals
        let subtotal = 0;
        let totalDiscount = 0;
        let totalTax = 0;

        items.forEach(item => {
            const itemTotal = item.quantity * item.unitPrice;
            const discount = item.discountType === 'percentage' 
                ? (itemTotal * item.discount / 100) 
                : item.discount;
            const taxAmount = (itemTotal - discount) * (item.tax / 100);
            
            subtotal += itemTotal;
            totalDiscount += discount;
            totalTax += taxAmount;
        });

        const grandTotal = subtotal - totalDiscount + totalTax;
        const balanceDue = grandTotal - bill.amountPaid;

        // Update bill
        await bill.update({
            supplierId,
            billDate,
            dueDate,
            status,
            subtotal,
            totalDiscount,
            totalTax,
            grandTotal,
            balanceDue,
            notes,
            terms
        }, { transaction });

        // Delete existing items and create new ones
        await BillItem.destroy({ where: { billId: bill.id }, transaction });

        const billItems = items.map(item => {
            const itemTotal = item.quantity * item.unitPrice;
            const discount = item.discountType === 'percentage' 
                ? (itemTotal * item.discount / 100) 
                : item.discount;
            const taxAmount = (itemTotal - discount) * (item.tax / 100);
            const total = itemTotal - discount + taxAmount;

            return {
                billId: bill.id,
                itemId: item.itemId,
                description: item.description,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                discount: item.discount,
                discountType: item.discountType || 'amount',
                tax: item.tax,
                total
            };
        });

        await BillItem.bulkCreate(billItems, { transaction });

        await transaction.commit();

        const updatedBill = await Bill.findByPk(bill.id, {
            include: [
                { model: Supplier, as: 'supplier' },
                { model: BillItem, as: 'items', include: [{ model: Item, as: 'item' }] }
            ]
        });

        res.json({ success: true, data: updatedBill, message: "Bill updated successfully" });
    } catch (error) {
        await transaction.rollback();
        console.error("Error updating bill:", error);
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};

// Delete bill
export const deleteBill = async (req, res) => {
    const transaction = await sequelize.transaction();

    try {
        const bill = await Bill.findOne({
            where: { id: req.params.id, userId: req.user.userId },
            transaction
        });

        if (!bill) {
            await transaction.rollback();
            return res.status(404).json({ success: false, message: "Bill not found" });
        }

        if (bill.amountPaid > 0) {
            await transaction.rollback();
            return res.status(400).json({ success: false, message: "Cannot delete a bill with payments" });
        }

        await BillItem.destroy({ where: { billId: bill.id }, transaction });
        await bill.destroy({ transaction });

        await transaction.commit();
        res.json({ success: true, message: "Bill deleted successfully" });
    } catch (error) {
        await transaction.rollback();
        console.error("Error deleting bill:", error);
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};

// Get bill stats
export const getBillStats = async (req, res) => {
    try {
        const userId = req.user.userId;

        const [totalBills, openBills, paidBills, overdueBills, totalAmount, amountPaid] = await Promise.all([
            Bill.count({ where: { userId } }),
            Bill.count({ where: { userId, status: 'open' } }),
            Bill.count({ where: { userId, status: 'paid' } }),
            Bill.count({ 
                where: { 
                    userId, 
                    status: { [Op.in]: ['open', 'partially_paid'] },
                    dueDate: { [Op.lt]: new Date() }
                } 
            }),
            Bill.sum('grandTotal', { where: { userId } }),
            Bill.sum('amountPaid', { where: { userId } })
        ]);

        res.json({
            success: true,
            data: {
                totalBills: totalBills || 0,
                openBills: openBills || 0,
                paidBills: paidBills || 0,
                overdueBills: overdueBills || 0,
                totalAmount: totalAmount || 0,
                amountPaid: amountPaid || 0,
                balanceDue: (totalAmount || 0) - (amountPaid || 0)
            }
        });
    } catch (error) {
        console.error("Error fetching bill stats:", error);
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};

// Get open bills for a supplier (for payments)
export const getOpenBillsBySupplier = async (req, res) => {
    try {
        const { supplierId } = req.params;

        const bills = await Bill.findAll({
            where: {
                userId: req.user.userId,
                supplierId,
                status: { [Op.in]: ['open', 'partially_paid'] },
                balanceDue: { [Op.gt]: 0 }
            },
            attributes: ['id', 'billNumber', 'billDate', 'dueDate', 'grandTotal', 'amountPaid', 'balanceDue'],
            order: [['dueDate', 'ASC']]
        });

        res.json({ success: true, data: bills });
    } catch (error) {
        console.error("Error fetching open bills:", error);
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};
