import SalesOrder from "./SalesOrder.js";
import SalesOrderItem from "./SalesOrderItem.js";

// Define relationships
SalesOrder.hasMany(SalesOrderItem, {
    foreignKey: "salesOrderId",
    as: "items",
    onDelete: "CASCADE",
});

SalesOrderItem.belongsTo(SalesOrder, {
    foreignKey: "salesOrderId",
    as: "salesOrder",
});

export { SalesOrder, SalesOrderItem };
