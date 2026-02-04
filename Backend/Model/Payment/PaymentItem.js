import { DataTypes } from "sequelize";
import { sequelize } from "../../Database/db.js";

const PaymentItem = sequelize.define("PaymentItem", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    paymentId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'payments',
            key: 'id',
        },
    },
    billId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'bills',
            key: 'id',
        },
    },
    amountApplied: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0,
    },
}, {
    tableName: "payment_items",
    timestamps: true,
});

export default PaymentItem;
