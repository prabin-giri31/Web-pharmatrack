import VendorCredit from "./VendorCredit.js";
import VendorCreditItem from "./VendorCreditItem.js";

// Associations
VendorCredit.hasMany(VendorCreditItem, { foreignKey: 'vendorCreditId', as: 'items' });
VendorCreditItem.belongsTo(VendorCredit, { foreignKey: 'vendorCreditId' });

export { VendorCredit, VendorCreditItem };
