import PurchaseOrder from "./PurchaseOrder.js";
import PurchaseOrderItem from "./PurchaseOrderItem.js";

// Define relationships
PurchaseOrder.hasMany(PurchaseOrderItem, {
    foreignKey: "purchaseOrderId",
    as: "items",
    onDelete: "CASCADE",
});

PurchaseOrderItem.belongsTo(PurchaseOrder, {
    foreignKey: "purchaseOrderId",
    as: "purchaseOrder",
});

export { PurchaseOrder, PurchaseOrderItem };
