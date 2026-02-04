import { Payment, PaymentItem, Bill, Supplier } from "../../Model/index.js";
import { Op } from "sequelize";
import { sequelize } from "../../Database/db.js";

// Get all payments
export const getAllPayments = async (req, res) => {
    try {
        const { page = 1, limit = 10, search, paymentMode, supplierId, startDate, endDate } = req.query;
        const offset = (page - 1) * limit;

        const whereClause = { userId: req.user.userId };

        if (search) {
            whereClause[Op.or] = [
                { paymentNumber: { [Op.like]: `%${search}%` } },
                { referenceNumber: { [Op.like]: `%${search}%` } },
                { '$supplier.companyName$': { [Op.like]: `%${search}%` } }
            ];
        }

        if (paymentMode) {
            whereClause.paymentMode = paymentMode;
        }

        if (supplierId) {
            whereClause.supplierId = supplierId;
        }

        if (startDate && endDate) {
            whereClause.paymentDate = {
                [Op.between]: [startDate, endDate]
            };
        }

        const { count, rows } = await Payment.findAndCountAll({
            where: whereClause,
            include: [
                {
                    model: Supplier,
                    as: 'supplier',
                    attributes: ['id', 'companyName', 'contactPerson', 'email', 'phone']
                },
                {
                    model: PaymentItem,
                    as: 'paymentItems',
                    include: [
                        {
                            model: Bill,
                            as: 'bill',
                            attributes: ['id', 'billNumber', 'grandTotal', 'balanceDue']
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
        console.error("Error fetching payments:", error);
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};

// Get payment by ID
export const getPaymentById = async (req, res) => {
    try {
        const payment = await Payment.findOne({
            where: { id: req.params.id, userId: req.user.userId },
            include: [
                {
                    model: Supplier,
                    as: 'supplier',
                    attributes: ['id', 'companyName', 'contactPerson', 'email', 'phone', 'address']
                },
                {
                    model: PaymentItem,
                    as: 'paymentItems',
                    include: [
                        {
                            model: Bill,
                            as: 'bill',
                            attributes: ['id', 'billNumber', 'billDate', 'dueDate', 'grandTotal', 'amountPaid', 'balanceDue']
                        }
                    ]
                }
            ]
        });

        if (!payment) {
            return res.status(404).json({ success: false, message: "Payment not found" });
        }

        res.json({ success: true, data: payment });
    } catch (error) {
        console.error("Error fetching payment:", error);
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};

// Create payment
export const createPayment = async (req, res) => {
    const transaction = await sequelize.transaction();

    try {
        const {
            supplierId,
            paymentDate,
            amount,
            paymentMode,
            referenceNumber,
            bankName,
            chequeNumber,
            chequeDate,
            notes,
            billPayments = [] // Array of { billId, amountApplied }
        } = req.body;

        // Generate payment number
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const lastPayment = await Payment.findOne({
            order: [['id', 'DESC']],
            transaction
        });
        const sequence = lastPayment ? lastPayment.id + 1 : 1;
        const paymentNumber = `PAY${year}${month}${String(sequence).padStart(4, '0')}`;

        // Create payment
        const payment = await Payment.create({
            paymentNumber,
            userId: req.user.userId,
            supplierId,
            paymentDate,
            amount,
            paymentMode,
            referenceNumber,
            bankName,
            chequeNumber,
            chequeDate,
            status: 'completed',
            notes
        }, { transaction });

        // Apply payments to bills
        if (billPayments.length > 0) {
            for (const billPayment of billPayments) {
                // Create payment item
                await PaymentItem.create({
                    paymentId: payment.id,
                    billId: billPayment.billId,
                    amountApplied: billPayment.amountApplied
                }, { transaction });

                // Update bill
                const bill = await Bill.findByPk(billPayment.billId, { transaction });
                if (bill) {
                    const newAmountPaid = parseFloat(bill.amountPaid) + parseFloat(billPayment.amountApplied);
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
                }
            }
        }

        await transaction.commit();

        // Fetch the created payment with associations
        const createdPayment = await Payment.findByPk(payment.id, {
            include: [
                { model: Supplier, as: 'supplier' },
                { model: PaymentItem, as: 'paymentItems', include: [{ model: Bill, as: 'bill' }] }
            ]
        });

        res.status(201).json({ success: true, data: createdPayment, message: "Payment recorded successfully" });
    } catch (error) {
        await transaction.rollback();
        console.error("Error creating payment:", error);
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};

// Delete payment (reverse the payment)
export const deletePayment = async (req, res) => {
    const transaction = await sequelize.transaction();

    try {
        const payment = await Payment.findOne({
            where: { id: req.params.id, userId: req.user.userId },
            include: [{ model: PaymentItem, as: 'paymentItems' }],
            transaction
        });

        if (!payment) {
            await transaction.rollback();
            return res.status(404).json({ success: false, message: "Payment not found" });
        }

        // Reverse bill payments
        for (const item of payment.paymentItems) {
            const bill = await Bill.findByPk(item.billId, { transaction });
            if (bill) {
                const newAmountPaid = parseFloat(bill.amountPaid) - parseFloat(item.amountApplied);
                const newBalanceDue = parseFloat(bill.grandTotal) - newAmountPaid;
                
                let newStatus = 'open';
                if (newAmountPaid > 0 && newBalanceDue > 0) {
                    newStatus = 'partially_paid';
                }

                await bill.update({
                    amountPaid: Math.max(0, newAmountPaid),
                    balanceDue: newBalanceDue,
                    status: newStatus
                }, { transaction });
            }
        }

        await PaymentItem.destroy({ where: { paymentId: payment.id }, transaction });
        await payment.destroy({ transaction });

        await transaction.commit();
        res.json({ success: true, message: "Payment deleted and reversed successfully" });
    } catch (error) {
        await transaction.rollback();
        console.error("Error deleting payment:", error);
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};

// Get payment stats
export const getPaymentStats = async (req, res) => {
    try {
        const userId = req.user.userId;
        const today = new Date();
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const startOfYear = new Date(today.getFullYear(), 0, 1);

        const [totalPayments, totalAmount, thisMonthPayments, thisMonthAmount, thisYearAmount] = await Promise.all([
            Payment.count({ where: { userId, status: 'completed' } }),
            Payment.sum('amount', { where: { userId, status: 'completed' } }),
            Payment.count({ 
                where: { 
                    userId, 
                    status: 'completed',
                    paymentDate: { [Op.gte]: startOfMonth }
                } 
            }),
            Payment.sum('amount', { 
                where: { 
                    userId, 
                    status: 'completed',
                    paymentDate: { [Op.gte]: startOfMonth }
                } 
            }),
            Payment.sum('amount', { 
                where: { 
                    userId, 
                    status: 'completed',
                    paymentDate: { [Op.gte]: startOfYear }
                } 
            })
        ]);

        // Get payment mode breakdown
        const paymentModeStats = await Payment.findAll({
            where: { userId, status: 'completed' },
            attributes: [
                'paymentMode',
                [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
                [sequelize.fn('SUM', sequelize.col('amount')), 'total']
            ],
            group: ['paymentMode']
        });

        res.json({
            success: true,
            data: {
                totalPayments: totalPayments || 0,
                totalAmount: totalAmount || 0,
                thisMonthPayments: thisMonthPayments || 0,
                thisMonthAmount: thisMonthAmount || 0,
                thisYearAmount: thisYearAmount || 0,
                paymentModeStats
            }
        });
    } catch (error) {
        console.error("Error fetching payment stats:", error);
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};
