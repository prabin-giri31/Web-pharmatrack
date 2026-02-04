import { VendorCredit, VendorCreditItem, Bill, Supplier, Item } from "../../Model/index.js";
import { Op } from "sequelize";
import { sequelize } from "../../Database/db.js";

// Get all vendor credits
export const getAllVendorCredits = async (req, res) => {
    try {
        const { page = 1, limit = 10, search, status, supplierId, startDate, endDate } = req.query;
        const offset = (page - 1) * limit;

        const whereClause = { userId: req.user.userId };

        if (search) {
            whereClause[Op.or] = [
                { creditNumber: { [Op.like]: `%${search}%` } },
                { referenceNumber: { [Op.like]: `%${search}%` } },
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
            whereClause.creditDate = {
                [Op.between]: [startDate, endDate]
            };
        }

        const { count, rows } = await VendorCredit.findAndCountAll({
            where: whereClause,
            include: [
                {
                    model: Supplier,
                    as: 'supplier',
                    attributes: ['id', 'companyName', 'contactPerson', 'email', 'phone']
                },
                {
                    model: Bill,
                    as: 'bill',
                    attributes: ['id', 'billNumber', 'grandTotal']
                },
                {
                    model: VendorCreditItem,
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
        console.error("Error fetching vendor credits:", error);
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};

// Get vendor credit by ID
export const getVendorCreditById = async (req, res) => {
    try {
        const vendorCredit = await VendorCredit.findOne({
            where: { id: req.params.id, userId: req.user.userId },
            include: [
                {
                    model: Supplier,
                    as: 'supplier',
                    attributes: ['id', 'companyName', 'contactPerson', 'email', 'phone', 'address']
                },
                {
                    model: Bill,
                    as: 'bill',
                    attributes: ['id', 'billNumber', 'billDate', 'grandTotal', 'balanceDue']
                },
                {
                    model: VendorCreditItem,
                    as: 'items',
                    include: [
                        {
                            model: Item,
                            as: 'item',
                            attributes: ['id', 'itemName', 'sku', 'purchasePrice']
                        }
                    ]
                }
            ]
        });

        if (!vendorCredit) {
            return res.status(404).json({ success: false, message: "Vendor credit not found" });
        }

        res.json({ success: true, data: vendorCredit });
    } catch (error) {
        console.error("Error fetching vendor credit:", error);
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};

// Create vendor credit
export const createVendorCredit = async (req, res) => {
    const transaction = await sequelize.transaction();

    try {
        const {
            supplierId,
            billId,
            creditDate,
            reason,
            items,
            referenceNumber,
            notes,
            status = 'open'
        } = req.body;

        // Generate credit number
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const lastCredit = await VendorCredit.findOne({
            order: [['id', 'DESC']],
            transaction
        });
        const sequence = lastCredit ? lastCredit.id + 1 : 1;
        const creditNumber = `VCR${year}${month}${String(sequence).padStart(4, '0')}`;

        // Calculate totals
        let subtotal = 0;
        let totalTax = 0;

        items.forEach(item => {
            const itemTotal = item.quantity * item.unitPrice;
            const taxAmount = itemTotal * (item.tax / 100);
            
            subtotal += itemTotal;
            totalTax += taxAmount;
        });

        const totalAmount = subtotal + totalTax;

        // Create vendor credit
        const vendorCredit = await VendorCredit.create({
            creditNumber,
            userId: req.user.userId,
            supplierId,
            billId,
            creditDate,
            reason,
            status,
            subtotal,
            totalTax,
            totalAmount,
            appliedAmount: 0,
            balanceAmount: totalAmount,
            referenceNumber,
            notes
        }, { transaction });

        // Create credit items
        const creditItems = items.map(item => {
            const itemTotal = item.quantity * item.unitPrice;
            const taxAmount = itemTotal * (item.tax / 100);
            const total = itemTotal + taxAmount;

            return {
                vendorCreditId: vendorCredit.id,
                itemId: item.itemId,
                description: item.description,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                tax: item.tax,
                total
            };
        });

        await VendorCreditItem.bulkCreate(creditItems, { transaction });

        await transaction.commit();

        // Fetch the created vendor credit with associations
        const createdCredit = await VendorCredit.findByPk(vendorCredit.id, {
            include: [
                { model: Supplier, as: 'supplier' },
                { model: Bill, as: 'bill' },
                { model: VendorCreditItem, as: 'items', include: [{ model: Item, as: 'item' }] }
            ]
        });

        res.status(201).json({ success: true, data: createdCredit, message: "Vendor credit created successfully" });
    } catch (error) {
        await transaction.rollback();
        console.error("Error creating vendor credit:", error);
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};

// Update vendor credit
export const updateVendorCredit = async (req, res) => {
    const transaction = await sequelize.transaction();

    try {
        const vendorCredit = await VendorCredit.findOne({
            where: { id: req.params.id, userId: req.user.userId },
            transaction
        });

        if (!vendorCredit) {
            await transaction.rollback();
            return res.status(404).json({ success: false, message: "Vendor credit not found" });
        }

        if (vendorCredit.appliedAmount > 0) {
            await transaction.rollback();
            return res.status(400).json({ success: false, message: "Cannot edit a vendor credit that has been applied" });
        }

        const {
            supplierId,
            billId,
            creditDate,
            reason,
            items,
            referenceNumber,
            notes,
            status
        } = req.body;

        // Calculate totals
        let subtotal = 0;
        let totalTax = 0;

        items.forEach(item => {
            const itemTotal = item.quantity * item.unitPrice;
            const taxAmount = itemTotal * (item.tax / 100);
            
            subtotal += itemTotal;
            totalTax += taxAmount;
        });

        const totalAmount = subtotal + totalTax;

        // Update vendor credit
        await vendorCredit.update({
            supplierId,
            billId,
            creditDate,
            reason,
            status,
            subtotal,
            totalTax,
            totalAmount,
            balanceAmount: totalAmount - vendorCredit.appliedAmount,
            referenceNumber,
            notes
        }, { transaction });

        // Delete existing items and create new ones
        await VendorCreditItem.destroy({ where: { vendorCreditId: vendorCredit.id }, transaction });

        const creditItems = items.map(item => {
            const itemTotal = item.quantity * item.unitPrice;
            const taxAmount = itemTotal * (item.tax / 100);
            const total = itemTotal + taxAmount;

            return {
                vendorCreditId: vendorCredit.id,
                itemId: item.itemId,
                description: item.description,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                tax: item.tax,
                total
            };
        });

        await VendorCreditItem.bulkCreate(creditItems, { transaction });

        await transaction.commit();

        const updatedCredit = await VendorCredit.findByPk(vendorCredit.id, {
            include: [
                { model: Supplier, as: 'supplier' },
                { model: Bill, as: 'bill' },
                { model: VendorCreditItem, as: 'items', include: [{ model: Item, as: 'item' }] }
            ]
        });

        res.json({ success: true, data: updatedCredit, message: "Vendor credit updated successfully" });
    } catch (error) {
        await transaction.rollback();
        console.error("Error updating vendor credit:", error);
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};

// Delete vendor credit
export const deleteVendorCredit = async (req, res) => {
    const transaction = await sequelize.transaction();

    try {
        const vendorCredit = await VendorCredit.findOne({
            where: { id: req.params.id, userId: req.user.userId },
            transaction
        });

        if (!vendorCredit) {
            await transaction.rollback();
            return res.status(404).json({ success: false, message: "Vendor credit not found" });
        }

        if (vendorCredit.appliedAmount > 0) {
            await transaction.rollback();
            return res.status(400).json({ success: false, message: "Cannot delete a vendor credit that has been applied" });
        }

        await VendorCreditItem.destroy({ where: { vendorCreditId: vendorCredit.id }, transaction });
        await vendorCredit.destroy({ transaction });

        await transaction.commit();
        res.json({ success: true, message: "Vendor credit deleted successfully" });
    } catch (error) {
        await transaction.rollback();
        console.error("Error deleting vendor credit:", error);
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};

// Apply vendor credit to bill
export const applyVendorCredit = async (req, res) => {
    const transaction = await sequelize.transaction();

    try {
        const { billId, amount } = req.body;
        const creditId = req.params.id;

        const vendorCredit = await VendorCredit.findOne({
            where: { id: creditId, userId: req.user.userId },
            transaction
        });

        if (!vendorCredit) {
            await transaction.rollback();
            return res.status(404).json({ success: false, message: "Vendor credit not found" });
        }

        if (vendorCredit.balanceAmount < amount) {
            await transaction.rollback();
            return res.status(400).json({ success: false, message: "Insufficient credit balance" });
        }

        const bill = await Bill.findOne({
            where: { id: billId, userId: req.user.userId },
            transaction
        });

        if (!bill) {
            await transaction.rollback();
            return res.status(404).json({ success: false, message: "Bill not found" });
        }

        // Update vendor credit
        const newAppliedAmount = parseFloat(vendorCredit.appliedAmount) + parseFloat(amount);
        const newBalanceAmount = parseFloat(vendorCredit.totalAmount) - newAppliedAmount;
        
        await vendorCredit.update({
            appliedAmount: newAppliedAmount,
            balanceAmount: newBalanceAmount,
            status: newBalanceAmount <= 0 ? 'applied' : vendorCredit.status
        }, { transaction });

        // Update bill
        const newAmountPaid = parseFloat(bill.amountPaid) + parseFloat(amount);
        const newBalanceDue = parseFloat(bill.grandTotal) - newAmountPaid;
        
        let newStatus = bill.status;
        if (newBalanceDue <= 0) {
            newStatus = 'paid';
        } else if (newAmountPaid > 0) {
            newStatus = 'partially_paid';
        }

        await bill.update({
            amountPaid: newAmountPaid,
            balanceDue: Math.max(0, newBalanceDue),
            status: newStatus
        }, { transaction });

        await transaction.commit();

        res.json({ success: true, message: "Vendor credit applied successfully" });
    } catch (error) {
        await transaction.rollback();
        console.error("Error applying vendor credit:", error);
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};

// Get vendor credit stats
export const getVendorCreditStats = async (req, res) => {
    try {
        const userId = req.user.userId;

        const [totalCredits, openCredits, appliedCredits, totalAmount, appliedAmount] = await Promise.all([
            VendorCredit.count({ where: { userId } }),
            VendorCredit.count({ where: { userId, status: 'open' } }),
            VendorCredit.count({ where: { userId, status: 'applied' } }),
            VendorCredit.sum('totalAmount', { where: { userId } }),
            VendorCredit.sum('appliedAmount', { where: { userId } })
        ]);

        // Get reason breakdown
        const reasonStats = await VendorCredit.findAll({
            where: { userId },
            attributes: [
                'reason',
                [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
                [sequelize.fn('SUM', sequelize.col('totalAmount')), 'total']
            ],
            group: ['reason']
        });

        res.json({
            success: true,
            data: {
                totalCredits: totalCredits || 0,
                openCredits: openCredits || 0,
                appliedCredits: appliedCredits || 0,
                totalAmount: totalAmount || 0,
                appliedAmount: appliedAmount || 0,
                balanceAmount: (totalAmount || 0) - (appliedAmount || 0),
                reasonStats
            }
        });
    } catch (error) {
        console.error("Error fetching vendor credit stats:", error);
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};

// Get available credits for a supplier
export const getAvailableCreditsBySupplier = async (req, res) => {
    try {
        const { supplierId } = req.params;

        const credits = await VendorCredit.findAll({
            where: {
                userId: req.user.userId,
                supplierId,
                status: { [Op.in]: ['open'] },
                balanceAmount: { [Op.gt]: 0 }
            },
            attributes: ['id', 'creditNumber', 'creditDate', 'reason', 'totalAmount', 'appliedAmount', 'balanceAmount'],
            order: [['creditDate', 'ASC']]
        });

        res.json({ success: true, data: credits });
    } catch (error) {
        console.error("Error fetching available credits:", error);
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};
