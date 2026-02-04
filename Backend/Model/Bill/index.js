import Bill from "./Bill.js";
import BillItem from "./BillItem.js";

Bill.hasMany(BillItem, {
    foreignKey: "billId",
    as: "items",
    onDelete: "CASCADE",
});

BillItem.belongsTo(Bill, {
    foreignKey: "billId",
    as: "bill",
});

export { Bill, BillItem };
