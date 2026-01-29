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
        </Route>
      </Routes>
    </Router>
  );
};

export default App;
