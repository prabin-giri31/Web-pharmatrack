import { DataTypes } from "sequelize";
import { sequelize } from "../../Database/db.js";

const PurchaseOrder = sequelize.define("PurchaseOrder", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    orderNumber: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            notEmpty: { msg: "Order number is required" },
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
    orderDate: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        defaultValue: DataTypes.NOW,
    },
    expectedDeliveryDate: {
        type: DataTypes.DATEONLY,
        allowNull: true,
    },
    status: {
        type: DataTypes.ENUM("draft", "sent", "confirmed", "partially_received", "received", "cancelled"),
        defaultValue: "draft",
        allowNull: false,
    },
    referenceNumber: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    shippingMethod: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    shippingAddress: {
        type: DataTypes.TEXT,
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
    shippingCharges: {
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
    termsAndConditions: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
}, {
    tableName: "purchase_orders",
    timestamps: true,
    indexes: [
        { fields: ["orderNumber"] },
        { fields: ["userId"] },
        { fields: ["supplierId"] },
        { fields: ["status"] },
        { fields: ["orderDate"] },
    ],
});

export default PurchaseOrder;
