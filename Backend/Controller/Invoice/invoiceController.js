import { Invoice, InvoiceItem, SalesOrder, SalesOrderItem, Customer } from "../../Model/index.js";
import Items from "../../Model/Items/Items.js";
import { sequelize } from "../../Database/db.js";

const formatInvoiceNumber = (date, count) => {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `INV-${yyyy}${mm}${dd}-${String(count).padStart(4, "0")}`;
};

const validatePayment = ({ paymentStatus, paymentMode, paymentReference, paymentDate }) => {
  if (paymentStatus === "paid") {
    if (!paymentDate) {
      return "Payment date is required for paid invoices.";
    }
    if (!paymentMode) {
      return "Payment mode is required for paid invoices.";
    }
    if ((paymentMode === "card" || paymentMode === "online") && !paymentReference) {
      return "Payment reference is required for card/online payments.";
    }
  }

  if (paymentStatus === "unpaid") {
    if (paymentDate || paymentReference) {
      return "Payment date/reference should be empty for unpaid invoices.";
    }
  }

  return null;
};

const buildTotals = (items) => {
  let subtotal = 0;
  let totalDiscount = 0;
  let totalTax = 0;

  const lineItems = items.map((item) => {
    const itemSubtotal = item.quantity * item.unitPrice;
    const itemDiscount = (itemSubtotal * (item.discount || 0)) / 100;
    const taxable = itemSubtotal - itemDiscount;
    const itemTax = (taxable * (item.tax || 0)) / 100;
    const lineTotal = taxable + itemTax;

    subtotal += itemSubtotal;
    totalDiscount += itemDiscount;
    totalTax += itemTax;

    return {
      productId: item.productId,
      productName: item.productName,
      productSku: item.productSku,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      discount: item.discount || 0,
      tax: item.tax || 0,
      lineTotal,
    };
  });

  const netPayable = subtotal - totalDiscount + totalTax;
  return { subtotal, totalDiscount, totalTax, netPayable, lineItems };
};

export const getInvoices = async (req, res) => {
  try {
    const invoices = await Invoice.findAll({
      where: { userId: req.user.userId },
      include: [
        { model: InvoiceItem, as: "items" },
        { model: Customer, as: "customer", attributes: ["id", "name", "company", "email", "phone"] },
      ],
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json(invoices);
  } catch (error) {
    console.error("Error fetching invoices:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

export const getInvoiceById = async (req, res) => {
  try {
    const { id } = req.params;

    const invoice = await Invoice.findOne({
      where: { id, userId: req.user.userId },
      include: [
        { model: InvoiceItem, as: "items" },
        { model: Customer, as: "customer", attributes: ["id", "name", "company", "email", "phone"] },
        { model: SalesOrder, as: "salesOrder" },
      ],
    });

    if (!invoice) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    res.status(200).json(invoice);
  } catch (error) {
    console.error("Error fetching invoice:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

export const createInvoice = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const {
      salesOrderId,
      customerId,
      items,
      invoiceDate,
      paymentMode,
      paymentStatus,
      paymentReference,
      paymentDate,
      status,
      notes,
      advancePayment: advancePaymentPayload,
    } = req.body;

    const paymentError = validatePayment({ paymentStatus, paymentMode, paymentReference, paymentDate });
    if (paymentError) {
      await transaction.rollback();
      return res.status(400).json({ message: paymentError });
    }

    const invoiceDateValue = invoiceDate || new Date().toISOString().split("T")[0];
    const invoiceDateObj = new Date(invoiceDateValue);
    const count = await Invoice.count({ where: { userId: req.user.userId } });
    const invoiceNumber = formatInvoiceNumber(invoiceDateObj, count + 1);
    const invoiceStatus = status || "finalized";

    let finalCustomerId = customerId;
    let itemsToInvoice = items || [];
    let salesOrder = null;

    // If creating from sales order
    if (salesOrderId) {
      salesOrder = await SalesOrder.findOne({
        where: { id: salesOrderId, userId: req.user.userId },
        include: [
          { model: SalesOrderItem, as: "items" },
          { model: Customer, as: "customer" },
        ],
      });

      if (!salesOrder) {
        await transaction.rollback();
        return res.status(404).json({ message: "Sales order not found" });
      }

      if (salesOrder.status !== "delivered" && salesOrder.status !== "confirmed") {
        await transaction.rollback();
        return res.status(400).json({ message: "Only delivered or confirmed orders can be invoiced" });
      }

      if (salesOrder.status === "invoiced") {
        await transaction.rollback();
        return res.status(400).json({ message: "Sales order is already invoiced" });
      }

      finalCustomerId = salesOrder.customerId;
      itemsToInvoice = salesOrder.items;
    } else {
      // Direct invoice creation - validate required fields
      if (!customerId) {
        await transaction.rollback();
        return res.status(400).json({ message: "Customer is required for direct invoice" });
      }

      if (!items || items.length === 0) {
        await transaction.rollback();
        return res.status(400).json({ message: "At least one item is required" });
      }

      // Verify customer exists
      const customer = await Customer.findOne({
        where: { id: customerId, userId: req.user.userId },
      });

      if (!customer) {
        await transaction.rollback();
        return res.status(404).json({ message: "Customer not found" });
      }
    }

    // Validate items and check stock
    const expiryByProductId = {};
    for (const item of itemsToInvoice) {
      const product = await Items.findOne({
        where: { id: item.productId, userId: req.user.userId },
        transaction,
        lock: transaction.LOCK.UPDATE,
      });

      if (!product) {
        await transaction.rollback();
        return res.status(404).json({ message: `Product with ID ${item.productId} not found` });
      }

      if (product.expiryDate && new Date(product.expiryDate) <= invoiceDateObj) {
        await transaction.rollback();
        return res.status(400).json({ message: `Product ${product.name} is expired and cannot be invoiced` });
      }

      if (product.stockOnHand < item.quantity) {
        await transaction.rollback();
        return res.status(400).json({
          message: `Insufficient stock for ${product.name}. Available: ${product.stockOnHand}, Required: ${item.quantity}`,
        });
      }

      expiryByProductId[item.productId] = product.expiryDate || null;

      // For direct invoice, enrich item data if needed
      if (!salesOrderId) {
        item.productName = item.productName || product.name;
        item.productSku = item.productSku || product.sku;
        item.unitPrice = item.unitPrice !== undefined ? item.unitPrice : product.salePrice || product.price;
      }
    }

    const { subtotal, totalDiscount, totalTax, netPayable, lineItems } = buildTotals(itemsToInvoice);
    const advancePaymentValue = salesOrder
      ? parseFloat(salesOrder.advancePayment) || 0
      : parseFloat(advancePaymentPayload) || 0;
    const balanceDue = Math.max(0, netPayable - advancePaymentValue);

    const newInvoice = await Invoice.create({
      userId: req.user.userId,
      salesOrderId: salesOrderId || null,
      customerId: finalCustomerId,
      invoiceNumber,
      invoiceDate: invoiceDateValue,
      status: invoiceStatus,
      subtotalAmount: subtotal,
      discountAmount: totalDiscount,
      taxAmount: totalTax,
      netPayable,
      advancePayment: advancePaymentValue,
      balanceDue,
      paymentMode: paymentMode || null,
      paymentStatus: paymentStatus || "unpaid",
      paymentReference: paymentReference || null,
      paymentDate: paymentDate || null,
      notes,
    }, { transaction });

    await InvoiceItem.bulkCreate(
      lineItems.map((item) => ({
        ...item,
        invoiceId: newInvoice.id,
        expiryDate: expiryByProductId[item.productId] || null,
      })),
      { transaction }
    );

    // Deduct stock and update sales order if finalized
    if (invoiceStatus === "finalized") {
      for (const item of itemsToInvoice) {
        await Items.update(
          { stockOnHand: sequelize.literal(`"stockOnHand" - ${item.quantity}`) },
          { where: { id: item.productId, userId: req.user.userId }, transaction }
        );
      }

      if (salesOrder) {
        await salesOrder.update({ status: "invoiced" }, { transaction });
      }
    }

    await transaction.commit();

    const completeInvoice = await Invoice.findByPk(newInvoice.id, {
      include: [
        { model: InvoiceItem, as: "items" },
        { model: Customer, as: "customer" },
        { model: SalesOrder, as: "salesOrder" },
      ],
    });

    res.status(201).json(completeInvoice);
  } catch (error) {
    await transaction.rollback();
    console.error("Error creating invoice:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

export const updateInvoice = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { id } = req.params;
    const {
      paymentMode,
      paymentStatus,
      paymentReference,
      paymentDate,
      status,
      notes,
    } = req.body;

    const invoice = await Invoice.findOne({
      where: { id, userId: req.user.userId },
      include: [{ model: InvoiceItem, as: "items" }],
    });

    if (!invoice) {
      await transaction.rollback();
      return res.status(404).json({ message: "Invoice not found" });
    }

    if (invoice.status === "finalized") {
      await transaction.rollback();
      return res.status(400).json({ message: "Finalized invoices cannot be edited" });
    }

    const paymentError = validatePayment({ paymentStatus, paymentMode, paymentReference, paymentDate });
    if (paymentError) {
      await transaction.rollback();
      return res.status(400).json({ message: paymentError });
    }

    const nextStatus = status || invoice.status;

    await invoice.update({
      paymentMode: paymentMode !== undefined ? paymentMode : invoice.paymentMode,
      paymentStatus: paymentStatus !== undefined ? paymentStatus : invoice.paymentStatus,
      paymentReference: paymentReference !== undefined ? paymentReference : invoice.paymentReference,
      paymentDate: paymentDate !== undefined ? paymentDate : invoice.paymentDate,
      status: nextStatus,
      notes: notes !== undefined ? notes : invoice.notes,
    }, { transaction });

    if (nextStatus === "finalized") {
      const salesOrder = await SalesOrder.findOne({
        where: { id: invoice.salesOrderId, userId: req.user.userId },
      });

      for (const item of invoice.items) {
        const product = await Items.findOne({
          where: { id: item.productId, userId: req.user.userId },
          transaction,
          lock: transaction.LOCK.UPDATE,
        });

        if (!product) {
          await transaction.rollback();
          return res.status(404).json({ message: `Product with ID ${item.productId} not found` });
        }

        if (product.expiryDate && new Date(product.expiryDate) <= new Date(invoice.invoiceDate)) {
          await transaction.rollback();
          return res.status(400).json({ message: `Product ${product.name} is expired and cannot be invoiced` });
        }

        if (product.stockOnHand < item.quantity) {
          await transaction.rollback();
          return res.status(400).json({
            message: `Insufficient stock for ${product.name}. Available: ${product.stockOnHand}, Required: ${item.quantity}`,
          });
        }

        await Items.update(
          { stockOnHand: sequelize.literal(`"stockOnHand" - ${item.quantity}`) },
          { where: { id: item.productId, userId: req.user.userId }, transaction }
        );
      }

      if (salesOrder && salesOrder.status !== "invoiced") {
        await salesOrder.update({ status: "invoiced" }, { transaction });
      }
    }

    await transaction.commit();

    const updatedInvoice = await Invoice.findByPk(invoice.id, {
      include: [
        { model: InvoiceItem, as: "items" },
        { model: Customer, as: "customer" },
      ],
    });

    res.status(200).json(updatedInvoice);
  } catch (error) {
    await transaction.rollback();
    console.error("Error updating invoice:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};
