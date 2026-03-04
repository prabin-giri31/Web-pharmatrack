import { z } from "zod";

// ============== Auth Schemas ==============
export const registerSchema = z.object({
  pharmacyName: z.string().min(2, "Pharmacy name must be at least 2 characters").max(100),
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  phone: z.string().optional(),
  address: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(6, "New password must be at least 6 characters"),
});

// ============== Item Schemas ==============
export const itemSchema = z.object({
  name: z.string().min(1, "Item name is required").max(200),
  sku: z.string().optional(),
  unit: z.string().min(1, "Unit is required"),
  category: z.string().optional(),
  returnable: z.boolean().optional().default(true),
  sellingPrice: z.number().positive("Selling price must be positive").or(z.string().transform(v => parseFloat(v) || 0)),
  costPrice: z.number().positive("Cost price must be positive").or(z.string().transform(v => parseFloat(v) || 0)),
  stockOnHand: z.number().int().min(0).optional().default(0).or(z.string().transform(v => parseInt(v) || 0)),
  reorderLevel: z.number().int().min(0).optional().default(0).or(z.string().transform(v => parseInt(v) || 0)),
  description: z.string().optional(),
  expiryDate: z.string().optional().nullable(),
});

export const itemUpdateSchema = itemSchema.partial();

// ============== Customer Schemas ==============
export const customerSchema = z.object({
  name: z.string().min(1, "Customer name is required").min(2, "Name must be at least 2 characters"),
  company: z.string().optional().nullable(),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  status: z.enum(["active", "inactive", "overdue", "unpaid"]).default("active"),
  notes: z.string().optional().nullable(),
});

// ============== Supplier Schemas ==============
export const supplierSchema = z.object({
  salutation: z.string().optional(),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().optional(),
  companyName: z.string().optional(),
  displayName: z.string().min(1, "Display name is required"),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  mobile: z.string().optional(),
  website: z.string().url().optional().or(z.literal("")),
  panNumber: z.string().optional(),
  currency: z.string().optional().default("NPR"),
  paymentTerms: z.string().optional(),
  billingAddress: z.string().optional(),
  shippingAddress: z.string().optional(),
  notes: z.string().optional(),
});

// ============== Sales Order Schemas ==============
const parseNumber = (value) => {
  if (typeof value === "string" && value.trim() !== "") {
    return Number(value);
  }
  return value;
};

export const salesOrderItemSchema = z.object({
  productId: z.preprocess(
    parseNumber,
    z.number().int().positive("Product is required")
  ),
  quantity: z.preprocess(
    parseNumber,
    z.number().int().positive("Quantity must be positive")
  ),
  unitPrice: z.preprocess(
    parseNumber,
    z.number().positive("Unit price must be positive")
  ),
  discount: z.preprocess(
    (value) => (value === undefined || value === null ? 0 : parseNumber(value)),
    z.number().min(0).optional().default(0)
  ),
  discountType: z.enum(["percentage", "fixed"]).optional().default("percentage"),
  tax: z.preprocess(
    (value) => (value === undefined || value === null ? 0 : parseNumber(value)),
    z.number().min(0).optional().default(0)
  ),
});

export const salesOrderSchema = z.object({
  customerId: z.preprocess(
    parseNumber,
    z.number().int().positive("Customer is required")
  ),
  orderDate: z.string().optional(),
  expectedDeliveryDate: z.string().optional(),
  status: z.string().optional(),
  paymentStatus: z.string().optional(),
  paymentMethod: z.string().optional(),
  paymentTerms: z.string().optional(),
  deliveryMethod: z.string().optional(),
  salesPerson: z.string().optional(),
  notes: z.string().optional(),
  termsAndConditions: z.string().optional(),
  advancePayment: z.preprocess(
    (value) => (value === undefined || value === null ? 0 : parseNumber(value)),
    z.number().min(0).optional().default(0)
  ),
  items: z.array(salesOrderItemSchema).min(1, "At least one item is required"),
});

// ============== Invoice Schemas ==============
export const invoiceItemSchema = z.object({
  productId: z.preprocess(
    parseNumber,
    z.number().int().positive("Product is required")
  ),
  quantity: z.preprocess(
    parseNumber,
    z.number().int().positive("Quantity must be positive")
  ),
  unitPrice: z.preprocess(
    parseNumber,
    z.number().positive("Unit price must be positive")
  ),
  discount: z.preprocess(
    (value) => (value === undefined || value === null ? 0 : parseNumber(value)),
    z.number().min(0).optional().default(0)
  ),
  discountType: z.enum(["percentage", "fixed"]).optional().default("percentage"),
  tax: z.preprocess(
    (value) => (value === undefined || value === null ? 0 : parseNumber(value)),
    z.number().min(0).optional().default(0)
  ),
});

export const invoiceSchema = z.object({
  customerId: z.preprocess(
    parseNumber,
    z.number().int().positive("Customer is required")
  ),
  salesOrderId: z.preprocess(
    (value) => (value === undefined || value === null ? null : parseNumber(value)),
    z.number().int().positive().optional().nullable()
  ),
  invoiceDate: z.string().optional(),
  dueDate: z.string().optional(),
  paymentTerms: z.string().optional(),
  paymentMode: z.string().optional(),
  paymentStatus: z.enum(["paid", "unpaid", "partial"]).optional(),
  paymentReference: z.string().optional().nullable(),
  paymentDate: z.string().optional().nullable(),
  status: z.string().optional(),
  discountPercent: z.preprocess(
    (value) => (value === undefined || value === null ? 0 : parseNumber(value)),
    z.number().min(0).optional().default(0)
  ),
  shippingCharges: z.preprocess(
    (value) => (value === undefined || value === null ? 0 : parseNumber(value)),
    z.number().min(0).optional().default(0)
  ),
  adjustment: z.preprocess(
    (value) => (value === undefined || value === null ? 0 : parseNumber(value)),
    z.number().optional().default(0)
  ),
  advancePayment: z.preprocess(
    (value) => (value === undefined || value === null ? 0 : parseNumber(value)),
    z.number().min(0).optional().default(0)
  ),
  notes: z.string().optional().nullable(),
  termsAndConditions: z.string().optional().nullable(),
  items: z.array(invoiceItemSchema).min(1, "At least one item is required"),
});

// ============== Purchase Order Schemas ==============
export const purchaseOrderItemSchema = z.object({
  itemId: z.preprocess(
    parseNumber,
    z.number().int().positive("Item is required")
  ),
  quantity: z.preprocess(
    parseNumber,
    z.number().int().positive("Quantity must be positive")
  ),
  unitPrice: z.preprocess(
    parseNumber,
    z.number().positive("Unit price must be positive")
  ),
  discount: z.preprocess(
    (value) => (value === undefined || value === null ? 0 : parseNumber(value)),
    z.number().min(0).optional().default(0)
  ),
  discountType: z.enum(["percentage", "fixed"]).optional().default("percentage"),
  tax: z.preprocess(
    (value) => (value === undefined || value === null ? 0 : parseNumber(value)),
    z.number().min(0).optional().default(0)
  ),
  notes: z.string().optional().nullable(),
});

export const purchaseOrderSchema = z.object({
  supplierId: z.preprocess(
    parseNumber,
    z.number().int().positive("Supplier is required")
  ),
  orderDate: z.string().optional(),
  expectedDeliveryDate: z.string().optional().nullable(),
  referenceNumber: z.string().optional().nullable(),
  shippingMethod: z.string().optional().nullable(),
  shippingAddress: z.string().optional().nullable(),
  shippingCharges: z.preprocess(
    (value) => (value === undefined || value === null ? 0 : parseNumber(value)),
    z.number().min(0).optional().default(0)
  ),
  notes: z.string().optional().nullable(),
  termsAndConditions: z.string().optional().nullable(),
  items: z.array(purchaseOrderItemSchema).min(1, "At least one item is required"),
});

// ============== Purchase Receive Schemas ==============
export const purchaseReceiveItemSchema = z.object({
  itemId: z.number().int().positive(),
  orderedQuantity: z.number().int().min(0).optional().default(0),
  receivedQuantity: z.number().int().min(0, "Received quantity cannot be negative"),
  unitPrice: z.number().min(0),
  discount: z.number().min(0).optional().default(0),
  discountType: z.enum(["percentage", "fixed"]).optional().default("percentage"),
  tax: z.number().min(0).optional().default(0),
  batchNumber: z.string().optional(),
  expiryDate: z.string().optional().nullable(),
  manufacturingDate: z.string().optional().nullable(),
  notes: z.string().optional(),
});

export const purchaseReceiveSchema = z.object({
  supplierId: z.number().int().positive("Supplier is required"),
  purchaseOrderId: z.number().int().optional().nullable(),
  receiveDate: z.string().optional(),
  referenceNumber: z.string().optional(),
  deliveryMethod: z.string().optional(),
  trackingNumber: z.string().optional(),
  receivedBy: z.string().optional(),
  warehouseLocation: z.string().optional(),
  notes: z.string().optional(),
  items: z.array(purchaseReceiveItemSchema).min(1, "At least one item is required"),
});

// ============== Bill Schemas ==============
export const billItemSchema = z.object({
  itemId: z.number().int().positive(),
  quantity: z.number().int().positive(),
  rate: z.number().positive(),
  discount: z.number().min(0).optional().default(0),
  discountType: z.enum(["percentage", "fixed"]).optional().default("percentage"),
  tax: z.number().min(0).optional().default(0),
});

export const billSchema = z.object({
  supplierId: z.number().int().positive("Supplier is required"),
  purchaseReceiveId: z.number().int().optional().nullable(),
  billDate: z.string().optional(),
  dueDate: z.string().optional(),
  billNumber: z.string().optional(),
  orderNumber: z.string().optional(),
  notes: z.string().optional(),
  items: z.array(billItemSchema).min(1, "At least one item is required"),
});

// ============== Payment Schemas ==============
export const paymentSchema = z.object({
  supplierId: z.preprocess(
    (val) => (typeof val === 'string' ? parseInt(val) : val),
    z.number().int().positive("Supplier is required")
  ),
  paymentDate: z.string().optional(),
  amount: z.preprocess(
    (val) => (typeof val === 'string' ? parseFloat(val) : val),
    z.number().positive("Amount must be positive")
  ),
  paymentMode: z.string().min(1, "Payment mode is required"),
  referenceNumber: z.string().optional().nullable(),
  bankName: z.string().optional().nullable(),
  chequeNumber: z.string().optional().nullable(),
  chequeDate: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  billPayments: z.array(z.object({
    billId: z.preprocess(
      (val) => (typeof val === 'string' ? parseInt(val) : val),
      z.number().int().positive()
    ),
    amountApplied: z.preprocess(
      (val) => (typeof val === 'string' ? parseFloat(val) : val),
      z.number().positive()
    ),
  })).optional().default([]),
});

// ============== Vendor Credit Schemas ==============
export const vendorCreditItemSchema = z.object({
  itemId: z.preprocess(
    (val) => (typeof val === 'string' ? parseInt(val) : val),
    z.number().int().positive()
  ),
  quantity: z.preprocess(
    (val) => (typeof val === 'string' ? parseInt(val) : val),
    z.number().int().positive()
  ),
  rate: z.preprocess(
    (val) => (typeof val === 'string' ? parseFloat(val) : val),
    z.number().positive()
  ),
  discount: z.preprocess(
    (val) => (typeof val === 'string' ? parseFloat(val) : val),
    z.number().min(0)
  ).optional().default(0),
  discountType: z.enum(["percentage", "fixed"]).optional().default("fixed"),
  tax: z.preprocess(
    (val) => (typeof val === 'string' ? parseFloat(val) : val),
    z.number().min(0)
  ).optional().default(0),
});

export const vendorCreditSchema = z.object({
  supplierId: z.preprocess(
    (val) => (typeof val === 'string' ? parseInt(val) : val),
    z.number().int().positive("Supplier is required")
  ),
  billId: z.preprocess(
    (val) => (val === '' || val === null) ? null : (typeof val === 'string' ? parseInt(val) : val),
    z.number().int().nullable()
  ).optional(),
  creditDate: z.string().optional(),
  reason: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  items: z.array(vendorCreditItemSchema).min(1, "At least one item is required"),
});

// ============== Inventory Adjustment Schemas ==============
export const inventoryAdjustmentSchema = z.object({
  itemId: z.preprocess(
    (val) => (typeof val === "string" ? parseInt(val, 10) : val),
    z.number().int().positive("Item is required")
  ),
  type: z.enum(["Increase", "Decrease", "increase", "decrease"], { required_error: "Type is required" }),
  quantity: z.preprocess(
    (val) => (typeof val === "string" ? parseInt(val, 10) : val),
    z.number().int().positive("Quantity must be positive")
  ),
  reason: z.string().min(1, "Reason is required"),
  date: z.string().optional(),
  reference: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  itemName: z.string().optional().nullable(),
  createdBy: z.string().optional().nullable(),
  status: z.string().optional().nullable(),
});
