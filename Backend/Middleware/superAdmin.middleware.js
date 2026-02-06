import jwt from "jsonwebtoken";
import { User } from "../Model/user/userModel.js";

// Middleware to check if user is a Super Admin
export const isSuperAdmin = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const token = authHeader.split(" ")[1];

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key-change-in-production');
      req.user = decoded;
      
      // Fetch the user to verify their role
      const user = await User.findByPk(decoded.userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      if (user.role !== "super_admin") {
        return res.status(403).json({ message: "Access denied. Super Admin privileges required." });
      }
      
      if (user.status !== "active") {
        return res.status(403).json({ message: "Account is not active" });
      }
      
      req.superAdmin = user;
      next();
    } catch (error) {
      return res.status(403).json({ message: "Invalid or expired token" });
    }
  } catch (error) {
    console.error("Super Admin Auth Error:", error);
    return res.status(500).json({ message: "Authentication failed" });
  }
};

// Middleware to check if user is Admin or Super Admin
export const isAdmin = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const token = authHeader.split(" ")[1];

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key-change-in-production');
      req.user = decoded;
      
      const user = await User.findByPk(decoded.userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      if (!["super_admin", "admin"].includes(user.role)) {
        return res.status(403).json({ message: "Access denied. Admin privileges required." });
      }
      
      if (user.status !== "active") {
        return res.status(403).json({ message: "Account is not active" });
      }
      
      req.adminUser = user;
      next();
    } catch (error) {
      return res.status(403).json({ message: "Invalid or expired token" });
    }
  } catch (error) {
    console.error("Admin Auth Error:", error);
    return res.status(500).json({ message: "Authentication failed" });
  }
};

// Middleware to check if the logged in user's account is not locked or force logged out
export const checkAccountStatus = async (req, res, next) => {
  try {
    if (!req.user || !req.user.userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const user = await User.findByPk(req.user.userId);
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Check if account is locked
    if (user.status === "locked") {
      return res.status(403).json({ message: "Your account is locked. Please contact administrator." });
    }
    
    // Check if user is force logged out
    if (user.forceLogout) {
      return res.status(403).json({ 
        message: "Your session has been terminated by an administrator.",
        forceLogout: true 
      });
    }
    
    // Check if account is inactive
    if (user.status === "inactive") {
      return res.status(403).json({ message: "Your account is inactive. Please contact administrator." });
    }
    
    // Check if account is pending approval
    if (user.status === "pending" || !user.isApproved) {
      return res.status(403).json({ message: "Your account is pending approval." });
    }
    
    next();
  } catch (error) {
    console.error("Account Status Check Error:", error);
    return res.status(500).json({ message: "Failed to verify account status" });
  }
};
