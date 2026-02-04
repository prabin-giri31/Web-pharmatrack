import PurchaseReceive from "./PurchaseReceive.js";
import PurchaseReceiveItem from "./PurchaseReceiveItem.js";

// Define associations
PurchaseReceive.hasMany(PurchaseReceiveItem, {
    foreignKey: "purchaseReceiveId",
    as: "items",
    onDelete: "CASCADE",
});

PurchaseReceiveItem.belongsTo(PurchaseReceive, {
    foreignKey: "purchaseReceiveId",
    as: "purchaseReceive",
});

export { PurchaseReceive, PurchaseReceiveItem };
