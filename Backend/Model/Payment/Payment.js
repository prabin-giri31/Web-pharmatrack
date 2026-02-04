import { DataTypes } from "sequelize";
import { sequelize } from "../../Database/db.js";

const Payment = sequelize.define("Payment", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    paymentNumber: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id',
        },
    },
    supplierId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'suppliers',
            key: 'id',
        },
    },
    billId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'bills',
            key: 'id',
        },
    },
    paymentDate: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        defaultValue: DataTypes.NOW,
    },
    amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
    },
    paymentMode: {
        type: DataTypes.ENUM("cash", "bank_transfer", "cheque", "card", "upi", "other"),
        defaultValue: "cash",
    },
    referenceNumber: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    bankName: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    chequeNumber: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    chequeDate: {
        type: DataTypes.DATEONLY,
        allowNull: true,
    },
    status: {
        type: DataTypes.ENUM("pending", "completed", "failed", "cancelled"),
        defaultValue: "completed",
    },
    notes: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
}, {
    tableName: "payments",
    timestamps: true,
});

export default Payment;
