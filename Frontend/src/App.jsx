import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

// Components
import { PrivateRoute, PublicRoute } from "./Components/routes";
import PrivateLayout from "./Components/layout/PrivateLayout";
import Login from "./Components/public/Login";
import Register from "./Components/public/Register";
import ForgotPassword from "./Components/public/ForgotPassword";

// Pages
import ItemsPage from "./pages/Items/ItemsPage";
import ItemsGroupPage from "./pages/Items/ItemsGroupPage";
import AddNewItem from "./Components/private/items/AddNewItem";
import InventoryAdjustmentPage from "./pages/Inventory/InventoryAdjustmentPage";
import CustomerPage from "./pages/Sales/CustomerPage";
import SalesOrderPage from "./pages/Sales/SalesOrderPage";
import CreateSalesOrder from "./pages/Sales/CreateSalesOrder";
import InvoiceListPage from "./Components/private/invoice/InvoiceListPage";
import InvoiceDetailsPage from "./Components/private/invoice/InvoiceDetailsPage";
import NewInvoicePage from "./Components/private/invoice/NewInvoicePage";
import SuppliersPage from "./pages/Purchases/SuppliersPage";
import NewVendorPage from "./pages/Purchases/NewVendorPage";
import PurchaseReceivesPage from "./pages/Purchases/PurchaseReceivesPage";
import NewPurchaseReceivePage from "./pages/Purchases/NewPurchaseReceivePage";
import BillsPage from "./pages/Purchases/BillsPage";
import NewBillPage from "./pages/Purchases/NewBillPage";
import PaymentsPage from "./pages/Purchases/PaymentsPage";
import NewPaymentPage from "./pages/Purchases/NewPaymentPage";
import VendorCreditsPage from "./pages/Purchases/VendorCreditsPage";
import NewVendorCreditPage from "./pages/Purchases/NewVendorCreditPage";
import ProfilePage from "./pages/Profile/ProfilePage";
import ChangePasswordPage from "./pages/Profile/ChangePasswordPage";

// Utils
import { verifyToken } from "./utils/auth";

const App = () => {
  const [authChecked, setAuthChecked] = useState(false);
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const valid = await verifyToken();
      setIsValid(valid);
      setAuthChecked(true);
    };
    checkAuth();
  }, []);

  return (
    <Router>
      <Routes>
        {/* PUBLIC ROUTES */}
        <Route path="/login" element={
          <PublicRoute authChecked={authChecked} isValid={isValid}>
            <Login />
          </PublicRoute>
        } />
        <Route path="/register" element={
          <PublicRoute authChecked={authChecked} isValid={isValid}>
            <Register />
          </PublicRoute>
        } />
        <Route path="/forgot-password" element={
          <PublicRoute authChecked={authChecked} isValid={isValid}>
            <ForgotPassword />
          </PublicRoute>
        } />

        {/* DEFAULT ROUTE */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        
        {/* CATCH ALL - redirect unknown routes to login */}
        <Route path="*" element={<Navigate to="/login" replace />} />

        {/* PRIVATE ROUTES */}
        <Route element={
          <PrivateRoute authChecked={authChecked} isValid={isValid}>
            <PrivateLayout />
          </PrivateRoute>
        }>
          <Route path="/items" element={<ItemsPage />} />
          <Route path="/items/new" element={<AddNewItem />} />
          <Route path="/items/groups" element={<ItemsGroupPage />} />
          <Route path="/inventory/adjustment" element={<InventoryAdjustmentPage />} />
          <Route path="/sales/customers" element={<CustomerPage />} />
          <Route path="/sales/orders" element={<SalesOrderPage />} />
          <Route path="/sales/orders/new" element={<CreateSalesOrder />} />
          <Route path="/sales/invoices" element={<InvoiceListPage />} />
          <Route path="/sales/invoices/new" element={<NewInvoicePage />} />
          <Route path="/sales/invoices/:id" element={<InvoiceDetailsPage />} />
          <Route path="/purchases/suppliers" element={<SuppliersPage />} />
          <Route path="/purchases/suppliers/new" element={<NewVendorPage />} />
          <Route path="/purchases/receives" element={<PurchaseReceivesPage />} />
          <Route path="/purchases/receives/new" element={<NewPurchaseReceivePage />} />
          <Route path="/purchases/bills" element={<BillsPage />} />
          <Route path="/purchases/bills/new" element={<NewBillPage />} />
          <Route path="/purchases/payments" element={<PaymentsPage />} />
          <Route path="/purchases/payments/new" element={<NewPaymentPage />} />
          <Route path="/purchases/vendor-credits" element={<VendorCreditsPage />} />
          <Route path="/purchases/vendor-credits/new" element={<NewVendorCreditPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/change-password" element={<ChangePasswordPage />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default App;
