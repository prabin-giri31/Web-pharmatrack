import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { isAuthenticated } from "../../utils/auth";

/**
 * A component that redirects users to the appropriate dashboard based on their role.
 * Super Admin users are redirected to /super-admin
 * Regular users are redirected to /dashboard
 * Unauthenticated users are redirected to /login
 */
const RoleBasedRedirect = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [targetPath, setTargetPath] = useState("/login");

  useEffect(() => {
    const determineRedirect = () => {
      try {
        if (!isAuthenticated()) {
          setTargetPath("/login");
        } else {
          const userData = localStorage.getItem("user");
          if (userData) {
            const user = JSON.parse(userData);
            if (user.role === "super_admin") {
              setTargetPath("/super-admin");
            } else {
              setTargetPath("/dashboard");
            }
          } else {
            setTargetPath("/login");
          }
        }
      } catch (error) {
        console.error("Error determining redirect:", error);
        setTargetPath("/login");
      } finally {
        setIsLoading(false);
      }
    };

    determineRedirect();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return <Navigate to={targetPath} replace />;
};

export default RoleBasedRedirect;
