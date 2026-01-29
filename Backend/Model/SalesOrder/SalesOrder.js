import { DataTypes } from "sequelize";
import { sequelize } from "../../Database/db.js";

const SalesOrder = sequelize.define("SalesOrder", {
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
    customerId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'customers',
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
        type: DataTypes.ENUM("draft", "confirmed", "delivered", "invoiced", "cancelled"),
        defaultValue: "draft",
        allowNull: false,
    },
    paymentStatus: {
        type: DataTypes.ENUM("unpaid", "partially_paid", "paid", "overdue"),
        defaultValue: "unpaid",
        allowNull: false,
    },
    paymentMethod: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    dueDate: {
        type: DataTypes.DATEONLY,
        allowNull: true,
    },
    advancePayment: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0,
        allowNull: false,
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
}, {
    tableName: "sales_orders",
    timestamps: true,
    indexes: [
        { fields: ["orderNumber"] },
        { fields: ["userId"] },
        { fields: ["customerId"] },
        { fields: ["status"] },
        { fields: ["paymentStatus"] },
        { fields: ["orderDate"] },
    ],
});

export default SalesOrder;
