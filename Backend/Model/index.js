import { User } from "./user/userModel.js";
import Item from "./Items/Items.js";
import InventoryAdjustment from "./Inventory/InventoryAdjustment.js";
import { ItemsGroup, MedicineType, DiseaseCategory } from "./ItemsGroup/index.js";
import Customer from "./Customer/Customer.js";
import { SalesOrder, SalesOrderItem } from "./SalesOrder/index.js";
import Notification from "./Notification/Notification.js";
import Supplier from "./Supplier/Supplier.js";

// Define relationships
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

export { User, Item, InventoryAdjustment, ItemsGroup, MedicineType, DiseaseCategory, Customer, SalesOrder, SalesOrderItem, Notification, Supplier };
