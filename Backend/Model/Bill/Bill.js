import { DataTypes } from "sequelize";
import { sequelize } from "../../Database/db.js";

const Bill = sequelize.define("Bill", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    billNumber: {
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
    purchaseReceiveId: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    billDate: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        defaultValue: DataTypes.NOW,
    },
    dueDate: {
        type: DataTypes.DATEONLY,
        allowNull: true,
    },
    referenceNumber: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    status: {
        type: DataTypes.ENUM("draft", "open", "partially_paid", "paid", "overdue", "cancelled"),
        defaultValue: "open",
        allowNull: false,
    },
    subtotal: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0,
    },
    totalDiscount: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0,
    },
    totalTax: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0,
    },
    grandTotal: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0,
    },
    amountPaid: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0,
    },
    balanceDue: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0,
    },
    notes: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    terms: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
}, {
    tableName: "bills",
    timestamps: true,
});

export default Bill;
