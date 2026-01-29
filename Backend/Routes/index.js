import authRoutes from "./auth.routes.js";
import itemRoutes from "./Items/itemRoute.js";
import inventoryRoutes from "./Inventory/inventoryRoutes.js";
import customerRoutes from "./Customer/customerRoutes.js";
import salesOrderRoutes from "./SalesOrder/salesOrderRoutes.js";
import { medicineTypeRoutes, diseaseCategoryRoutes, itemsGroupRoutes } from "./ItemsGroup/index.js";
import searchRoutes from "./Search/searchRoutes.js";
import notificationRoutes from "./Notification/notificationRoutes.js";
import supplierRoutes from "./Supplier/supplierRoutes.js";
import dashboardRoutes from "./Dashboard/dashboardRoutes.js";

export { authRoutes, itemRoutes, inventoryRoutes, customerRoutes, salesOrderRoutes, medicineTypeRoutes, diseaseCategoryRoutes, itemsGroupRoutes, searchRoutes, notificationRoutes, supplierRoutes, dashboardRoutes };
