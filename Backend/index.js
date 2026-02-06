import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import { sequelize } from "./Database/db.js";
import { authRoutes, itemRoutes, inventoryRoutes, customerRoutes, salesOrderRoutes, medicineTypeRoutes, diseaseCategoryRoutes, itemsGroupRoutes, searchRoutes, notificationRoutes, supplierRoutes, dashboardRoutes, invoiceRoutes, purchaseReceiveRoutes, billRoutes, paymentRoutes, vendorCreditRoutes, superAdminRoutes } from "./Routes/index.js";
import { User } from "./Model/index.js"; // Import models and associations
import seedAll from "./Database/seeders/seedItemsGroup.js";

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/items", itemRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/sales-orders", salesOrderRoutes);
app.use("/api/invoices", invoiceRoutes);
app.use("/api/medicine-types", medicineTypeRoutes);
app.use("/api/disease-categories", diseaseCategoryRoutes);
app.use("/api/items-groups", itemsGroupRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/suppliers", supplierRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/purchase-receives", purchaseReceiveRoutes);
app.use("/api/bills", billRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/vendor-credits", vendorCreditRoutes);
app.use("/api/super-admin", superAdminRoutes);

// Health check
app.get("/", (req, res) => {
  res.send("Backend is running 🚀");
});

// 404 handler for undefined routes
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Global error handler - catches all unhandled errors
app.use((err, req, res, next) => {
  console.error("Unhandled Error:", err.stack);
  res.status(500).json({
    message: "Internal Server Error",
    error: process.env.NODE_ENV === "development" ? err.message : undefined
  });
});

// Handle uncaught exceptions
process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
  // Don't exit, keep server running
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
  // Don't exit, keep server running
});

// Server start with retry logic
const PORT = process.env.PORT || 5000;

const normalizeTableNames = (tables) =>
  tables.map((table) => (typeof table === "string" ? table : table.tableName));

const ensureCustomerUserIds = async () => {
  const queryInterface = sequelize.getQueryInterface();
  const tables = normalizeTableNames(await queryInterface.showAllTables());

  if (!tables.includes("customers") || !tables.includes("users")) {
    return;
  }

  const customerColumns = await queryInterface.describeTable("customers");
  if (!customerColumns.userId) {
    return;
  }

  const [missingRows] = await sequelize.query(
    "SELECT COUNT(*)::int AS count FROM customers WHERE \"userId\" IS NULL"
  );
  const missingCount = missingRows?.[0]?.count || 0;
  if (!missingCount) {
    return;
  }

  let user = await User.findOne({ order: [["id", "ASC"]] });
  if (!user) {
    user = await User.create({
      pharmacyName: "Default Pharmacy",
      ownerName: "System Admin",
      email: "system@pharmatrack.local",
      phone: "+9770000000000",
      registrationNumber: "DEFAULT-000",
      address: "System Seed",
      password: "ChangeMe123",
    });
  }

  await sequelize.query(
    "UPDATE customers SET \"userId\" = :userId WHERE \"userId\" IS NULL",
    { replacements: { userId: user.id } }
  );
  console.log(`Backfilled ${missingCount} customer rows with userId ${user.id}.`);
};

// Ensure a Super Admin exists
const ensureSuperAdmin = async () => {
  const existingSuperAdmin = await User.findOne({ where: { email: "superadmin31@gmail.com" } });
  if (!existingSuperAdmin) {
    await User.create({
      pharmacyName: "PharmaTrack HQ",
      ownerName: "Super Admin",
      email: "superadmin31@gmail.com",
      phone: "+9771234567890",
      registrationNumber: "SUPERADMIN-001",
      address: "PharmaTrack Headquarters",
      password: "Super@dmin31",
      role: "super_admin",
      status: "active",
      isApproved: true,
    });
    console.log("Super Admin created: superadmin31@gmail.com");
  }
};

const startServer = async () => {
  let retries = 5;

  while (retries > 0) {
    try {
      await sequelize.authenticate();
      console.log("Database connection established successfully.");

      await ensureCustomerUserIds();
      await sequelize.sync({ alter: true });
      console.log("Database synced successfully.");

      // Seed default data
      await seedAll();
      
      // Ensure Super Admin exists
      await ensureSuperAdmin();

      const server = app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
      });

      // Graceful shutdown
      process.on("SIGTERM", () => {
        console.log("SIGTERM received. Shutting down gracefully...");
        server.close(() => {
          sequelize.close();
          process.exit(0);
        });
      });

      process.on("SIGINT", () => {
        console.log("SIGINT received. Shutting down gracefully...");
        server.close(() => {
          sequelize.close();
          process.exit(0);
        });
      });

      break; // Success, exit retry loop
    } catch (error) {
      retries -= 1;
      console.error(`Database connection failed. Retries left: ${retries}`, error.message);

      if (retries === 0) {
        console.error("Max retries reached. Exiting...");
        process.exit(1);
      }

      // Wait 5 seconds before retrying
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }
  }
};

startServer();
