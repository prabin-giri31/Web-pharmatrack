import { DataTypes } from "sequelize";
import { sequelize } from "../../Database/db.js";

const VendorCredit = sequelize.define("VendorCredit", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    creditNumber: {
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
    creditDate: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        defaultValue: DataTypes.NOW,
    },
    reason: {
        type: DataTypes.ENUM("return", "discount", "damaged", "price_adjustment", "other"),
        defaultValue: "return",
    },
    status: {
        type: DataTypes.ENUM("draft", "open", "applied", "closed", "cancelled"),
        defaultValue: "open",
    },
    subtotal: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0,
    },
    totalTax: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0,
    },
    totalAmount: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0,
    },
    appliedAmount: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0,
    },
    balanceAmount: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0,
    },
    referenceNumber: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    notes: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
}, {
    tableName: "vendor_credits",
    timestamps: true,
});

export default VendorCredit;
