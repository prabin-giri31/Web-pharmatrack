import { DataTypes } from "sequelize";
import { sequelize } from "../../Database/db.js";

const PurchaseReceiveItem = sequelize.define("PurchaseReceiveItem", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    purchaseReceiveId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'purchase_receives',
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
    orderedQuantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
    },
    receivedQuantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        validate: {
            min: { args: [0], msg: "Received quantity cannot be negative" },
        },
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
    batchNumber: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    expiryDate: {
        type: DataTypes.DATEONLY,
        allowNull: true,
    },
    manufacturingDate: {
        type: DataTypes.DATEONLY,
        allowNull: true,
    },
    notes: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
}, {
    tableName: "purchase_receive_items",
    timestamps: true,
});

export default PurchaseReceiveItem;
