import { DataTypes } from "sequelize";
import { sequelize } from "../../Database/db.js";

const Supplier = sequelize.define("Supplier", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: "users",
      key: "id",
    },
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  salutation: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  firstName: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  lastName: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  companyName: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  displayName: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      isEmail: true,
    },
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  workPhone: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  mobileNumber: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  address: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  billingAddress: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  shippingAddress: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  city: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  stateProvince: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  postalCode: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  country: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  contactPersons: {
    type: DataTypes.JSONB,
    allowNull: true,
  },
  registrationId: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  panVatNumber: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  taxRate: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
  },
  taxGroup: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  businessType: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  currency: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  paymentTerms: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  bankDetails: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  creditLimit: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: true,
  },
  documents: {
    type: DataTypes.JSONB,
    allowNull: true,
  },
  customFields: {
    type: DataTypes.JSONB,
    allowNull: true,
  },
  region: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  supplierCategory: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  preferredSupplier: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  specialInstructions: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  purchaseRemarks: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM("active", "inactive"),
    defaultValue: "active",
  },
}, {
  tableName: "suppliers",
  timestamps: true,
  indexes: [
    { fields: ["userId"] },
    { fields: ["name"] },
  ],
});

export default Supplier;
