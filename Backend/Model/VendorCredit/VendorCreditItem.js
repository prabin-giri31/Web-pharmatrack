import { DataTypes } from "sequelize";
import { sequelize } from "../../Database/db.js";

const VendorCreditItem = sequelize.define("VendorCreditItem", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    vendorCreditId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'vendor_credits',
            key: 'id',
        },
    },
    itemId: {
        type: DataTypes.INTEGER,
        allowNull: true,
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
        defaultValue: 1,
    },
    unitPrice: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0,
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
    tableName: "vendor_credit_items",
    timestamps: true,
});

export default VendorCreditItem;
