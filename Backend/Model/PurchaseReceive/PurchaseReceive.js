import { DataTypes } from "sequelize";
import { sequelize } from "../../Database/db.js";

const PurchaseReceive = sequelize.define("PurchaseReceive", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    receiveNumber: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            notEmpty: { msg: "Receive number is required" },
        },
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
    purchaseOrderId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        // Reference to purchase_orders table - will be added when PurchaseOrder model is created
    },
    receiveDate: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        defaultValue: DataTypes.NOW,
    },
    status: {
        type: DataTypes.ENUM("draft", "received", "partially_received", "cancelled"),
        defaultValue: "draft",
        allowNull: false,
    },
    referenceNumber: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    deliveryMethod: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    trackingNumber: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    subtotal: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0,
        allowNull: false,
    },
    totalDiscount: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0,
        allowNull: false,
    },
    totalTax: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0,
        allowNull: false,
    },
    grandTotal: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0,
        allowNull: false,
    },
    notes: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    receivedBy: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    warehouseLocation: {
        type: DataTypes.STRING,
        allowNull: true,
    },
}, {
    tableName: "purchase_receives",
    timestamps: true,
    indexes: [
        { fields: ["receiveNumber"] },
        { fields: ["userId"] },
        { fields: ["supplierId"] },
        { fields: ["status"] },
        { fields: ["receiveDate"] },
    ],
});

export default PurchaseReceive;
