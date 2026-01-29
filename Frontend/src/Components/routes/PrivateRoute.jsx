import { Navigate } from "react-router-dom";

const PrivateRoute = ({ children, authChecked, isValid }) => {
  if (!authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <span className="text-gray-500">Checking authentication...</span>
      </div>
    );
  }
  return isValid ? children : <Navigate to="/login" replace />;
};

export default PrivateRoute;
