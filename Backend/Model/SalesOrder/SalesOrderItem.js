import { DataTypes } from "sequelize";
import { sequelize } from "../../Database/db.js";

const SalesOrderItem = sequelize.define("SalesOrderItem", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    salesOrderId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'sales_orders',
            key: 'id',
        },
        onDelete: 'CASCADE',
    },
    productId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'items',
            key: 'id',
        },
    },
    productName: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    productSku: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: { args: [1], msg: "Quantity must be at least 1" },
        },
    },
    unitPrice: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
            min: { args: [0], msg: "Unit price cannot be negative" },
        },
    },
    discount: {
        type: DataTypes.DECIMAL(5, 2),
        defaultValue: 0,
        allowNull: false,
        validate: {
            min: { args: [0], msg: "Discount cannot be negative" },
            max: { args: [100], msg: "Discount cannot exceed 100%" },
        },
    },
    tax: {
        type: DataTypes.DECIMAL(5, 2),
        defaultValue: 0,
        allowNull: false,
    },
    lineTotal: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
}, {
    tableName: "sales_order_items",
    timestamps: true,
    indexes: [
        { fields: ["salesOrderId"] },
        { fields: ["productId"] },
    ],
});

export default SalesOrderItem;
