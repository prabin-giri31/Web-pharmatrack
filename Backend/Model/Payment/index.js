import Payment from "./Payment.js";
import PaymentItem from "./PaymentItem.js";

// Associations
Payment.hasMany(PaymentItem, { foreignKey: 'paymentId', as: 'paymentItems' });
PaymentItem.belongsTo(Payment, { foreignKey: 'paymentId' });

export { Payment, PaymentItem };
