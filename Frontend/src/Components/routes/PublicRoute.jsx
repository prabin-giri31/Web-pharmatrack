import { Navigate } from "react-router-dom";

const PublicRoute = ({ children, authChecked, isValid }) => {
  if (!authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <span className="text-gray-500">Loading...</span>
      </div>
    );
  }
  return isValid ? <Navigate to="/items" replace /> : children;
};

export default PublicRoute;
