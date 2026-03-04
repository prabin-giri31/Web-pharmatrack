import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";

/**
 * A route guard component that blocks super_admin users from accessing regular user routes.
 * Super Admin users are redirected to their dedicated dashboard.
 * Regular users can access these routes normally.
 */
const RegularUserRoute = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  useEffect(() => {
    const checkUserRole = () => {
      try {
        const userData = localStorage.getItem("user");
        if (userData) {
          const user = JSON.parse(userData);
          // Check if user has super_admin role
          setIsSuperAdmin(user.role === "super_admin");
        }
      } catch (error) {
        console.error("Error checking user role:", error);
        setIsSuperAdmin(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkUserRole();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Super Admin should be redirected to their dedicated panel
  if (isSuperAdmin) {
    return <Navigate to="/super-admin" replace />;
  }

  return children;
};

export default RegularUserRoute;
