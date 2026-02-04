import { DataTypes } from "sequelize";
import { sequelize } from "../../Database/db.js";

const BillItem = sequelize.define("BillItem", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    billId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'bills',
            key: 'id',
        },
    },
    itemId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'items',
            key: 'id',
        },
    },
    description: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
    },
    unitPrice: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
    },
    discount: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0,
    },
    discountType: {
        type: DataTypes.ENUM("percentage", "fixed"),
        defaultValue: "percentage",
    },
    tax: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0,
    },
    total: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0,
    },
}, {
    tableName: "bill_items",
    timestamps: true,
});

export default BillItem;
