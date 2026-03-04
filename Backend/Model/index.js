import { User } from "./user/userModel.js";
import Item from "./Items/Items.js";
import InventoryAdjustment from "./Inventory/InventoryAdjustment.js";
import { ItemsGroup, MedicineType, DiseaseCategory } from "./ItemsGroup/index.js";
import Customer from "./Customer/Customer.js";
import { SalesOrder, SalesOrderItem } from "./SalesOrder/index.js";
import { Invoice, InvoiceItem } from "./Invoice/index.js";
import Notification from "./Notification/Notification.js";
import Supplier from "./Supplier/Supplier.js";
import { PurchaseOrder, PurchaseOrderItem } from "./PurchaseOrder/index.js";
import { PurchaseReceive, PurchaseReceiveItem } from "./PurchaseReceive/index.js";
import { Bill, BillItem } from "./Bill/index.js";
import { Payment, PaymentItem } from "./Payment/index.js";
import { VendorCredit, VendorCreditItem } from "./VendorCredit/index.js";
import { UserActivity, SystemSettings } from "./SuperAdmin/index.js";

// Define relationships

// InventoryAdjustment belongs to Item
InventoryAdjustment.belongsTo(Item, {
    foreignKey: "itemId",
    as: "item",
});

Item.hasMany(InventoryAdjustment, {
    foreignKey: "itemId",
    as: "adjustments",
});

// InventoryAdjustment belongs to User
InventoryAdjustment.belongsTo(User, {
    foreignKey: "userId",
    as: "user",
});

User.hasMany(InventoryAdjustment, {
    foreignKey: "userId",
    as: "adjustments",
});

// SalesOrder belongs to Customer
SalesOrder.belongsTo(Customer, {
    foreignKey: "customerId",
    as: "customer",
});

Customer.hasMany(SalesOrder, {
    foreignKey: "customerId",
    as: "salesOrders",
});

// SalesOrder belongs to User
SalesOrder.belongsTo(User, {
    foreignKey: "userId",
    as: "user",
});

User.hasMany(SalesOrder, {
    foreignKey: "userId",
    as: "salesOrders",
});

// Customer relationships
Customer.belongsTo(User, {
    foreignKey: "userId",
    as: "user",
});

User.hasMany(Customer, {
    foreignKey: "userId",
    as: "customers",
});

// Invoice relationships
Invoice.belongsTo(Customer, {
    foreignKey: "customerId",
    as: "customer",
});

Customer.hasMany(Invoice, {
    foreignKey: "customerId",
    as: "invoices",
});

Invoice.belongsTo(User, {
    foreignKey: "userId",
    as: "user",
});

User.hasMany(Invoice, {
    foreignKey: "userId",
    as: "invoices",
});

Invoice.belongsTo(SalesOrder, {
    foreignKey: "salesOrderId",
    as: "salesOrder",
});

SalesOrder.hasOne(Invoice, {
    foreignKey: "salesOrderId",
    as: "invoice",
});

Invoice.hasMany(InvoiceItem, {
    foreignKey: "invoiceId",
    as: "items",
});

InvoiceItem.belongsTo(Invoice, {
    foreignKey: "invoiceId",
    as: "invoice",
});

InvoiceItem.belongsTo(Item, {
    foreignKey: "productId",
    as: "product",
});

Item.hasMany(InvoiceItem, {
    foreignKey: "productId",
    as: "invoiceItems",
});

Notification.belongsTo(User, {
    foreignKey: "userId",
    as: "user",
});

User.hasMany(Notification, {
    foreignKey: "userId",
    as: "notifications",
});

Supplier.belongsTo(User, {
    foreignKey: "userId",
    as: "user",
});

User.hasMany(Supplier, {
    foreignKey: "userId",
    as: "suppliers",
});

// PurchaseOrder relationships
PurchaseOrder.belongsTo(Supplier, {
    foreignKey: "supplierId",
    as: "supplier",
});

Supplier.hasMany(PurchaseOrder, {
    foreignKey: "supplierId",
    as: "purchaseOrders",
});

PurchaseOrder.belongsTo(User, {
    foreignKey: "userId",
    as: "user",
});

User.hasMany(PurchaseOrder, {
    foreignKey: "userId",
    as: "purchaseOrders",
});

PurchaseOrderItem.belongsTo(Item, {
    foreignKey: "itemId",
    as: "item",
});

Item.hasMany(PurchaseOrderItem, {
    foreignKey: "itemId",
    as: "purchaseOrderItems",
});

// PurchaseReceive relationships
PurchaseReceive.belongsTo(Supplier, {
    foreignKey: "supplierId",
    as: "supplier",
});

Supplier.hasMany(PurchaseReceive, {
    foreignKey: "supplierId",
    as: "purchaseReceives",
});

PurchaseReceive.belongsTo(User, {
    foreignKey: "userId",
    as: "user",
});

User.hasMany(PurchaseReceive, {
    foreignKey: "userId",
    as: "purchaseReceives",
});

PurchaseReceiveItem.belongsTo(Item, {
    foreignKey: "itemId",
    as: "item",
});

Item.hasMany(PurchaseReceiveItem, {
    foreignKey: "itemId",
    as: "purchaseReceiveItems",
});

// PurchaseReceive belongs to PurchaseOrder
PurchaseReceive.belongsTo(PurchaseOrder, {
    foreignKey: "purchaseOrderId",
    as: "purchaseOrder",
});

PurchaseOrder.hasMany(PurchaseReceive, {
    foreignKey: "purchaseOrderId",
    as: "purchaseReceives",
});

// Bill relationships
Bill.belongsTo(Supplier, {
    foreignKey: "supplierId",
    as: "supplier",
});

Supplier.hasMany(Bill, {
    foreignKey: "supplierId",
    as: "bills",
});

Bill.belongsTo(User, {
    foreignKey: "userId",
    as: "user",
});

User.hasMany(Bill, {
    foreignKey: "userId",
    as: "bills",
});

BillItem.belongsTo(Item, {
    foreignKey: "itemId",
    as: "item",
});

Item.hasMany(BillItem, {
    foreignKey: "itemId",
    as: "billItems",
});

// Payment relationships
Payment.belongsTo(Supplier, {
    foreignKey: "supplierId",
    as: "supplier",
});

Supplier.hasMany(Payment, {
    foreignKey: "supplierId",
    as: "payments",
});

Payment.belongsTo(User, {
    foreignKey: "userId",
    as: "user",
});

User.hasMany(Payment, {
    foreignKey: "userId",
    as: "payments",
});

PaymentItem.belongsTo(Bill, {
    foreignKey: "billId",
    as: "bill",
});

Bill.hasMany(PaymentItem, {
    foreignKey: "billId",
    as: "paymentItems",
});

// VendorCredit relationships
VendorCredit.belongsTo(Supplier, {
    foreignKey: "supplierId",
    as: "supplier",
});

Supplier.hasMany(VendorCredit, {
    foreignKey: "supplierId",
    as: "vendorCredits",
});

VendorCredit.belongsTo(User, {
    foreignKey: "userId",
    as: "user",
});

User.hasMany(VendorCredit, {
    foreignKey: "userId",
    as: "vendorCredits",
});

VendorCredit.belongsTo(Bill, {
    foreignKey: "billId",
    as: "bill",
});

Bill.hasMany(VendorCredit, {
    foreignKey: "billId",
    as: "vendorCredits",
});

VendorCreditItem.belongsTo(Item, {
    foreignKey: "itemId",
    as: "item",
});

Item.hasMany(VendorCreditItem, {
    foreignKey: "itemId",
    as: "vendorCreditItems",
});

// UserActivity relationships
UserActivity.belongsTo(User, {
    foreignKey: "userId",
    as: "user",
});

User.hasMany(UserActivity, {
    foreignKey: "userId",
    as: "activities",
});

// SystemSettings relationship for updatedBy
SystemSettings.belongsTo(User, {
    foreignKey: "updatedBy",
    as: "updater",
});

export { User, Item, InventoryAdjustment, ItemsGroup, MedicineType, DiseaseCategory, Customer, SalesOrder, SalesOrderItem, Invoice, InvoiceItem, Notification, Supplier, PurchaseOrder, PurchaseOrderItem, PurchaseReceive, PurchaseReceiveItem, Bill, BillItem, Payment, PaymentItem, VendorCredit, VendorCreditItem, UserActivity, SystemSettings };
