import { User } from "../Model/user/userModel.js";
import { UserActivity, SystemSettings } from "../Model/index.js";
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Helper to log user activity
const logActivity = async (userId, action, description, req, metadata = {}, isSuspicious = false) => {
  try {
    await UserActivity.create({
      userId,
      action,
      description,
      ipAddress: req.ip || req.connection?.remoteAddress,
      userAgent: req.headers["user-agent"],
      metadata,
      isSuspicious
    });
  } catch (error) {
    console.error("Failed to log activity:", error);
  }
};

// POST /api/auth/register
export const register = async (req, res) => {
  try {
    const {
      pharmacyName,
      ownerName,
      email,
      phone,
      registrationNumber,
      address,
      password,
    } = req.body;
    const username = req.body.username || (email ? email.split("@")[0] : undefined);

    // Validation
    if (!pharmacyName || !ownerName || !email || !phone || !registrationNumber || !address || !password) {
      return res.status(400).json({ message: 'All fields are required.' });
    }
    if (!/^\+977\d{10}$/.test(phone)) {
      return res.status(400).json({ message: 'Phone must be +977 followed by 10 digits.' });
    }
    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(password)) {
      return res.status(400).json({ message: 'Password must be 8+ chars, 1 uppercase, 1 lowercase, 1 number.' });
    }
    // Check if email exists
    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return res.status(409).json({ message: 'Email already exists.' });
    }

    // Check if auto-approve is enabled
    let autoApprove = false;
    try {
      const setting = await SystemSettings.findOne({ where: { key: "auto_approve_users" } });
      autoApprove = setting?.value === "true";
    } catch (e) {
      // Settings table might not exist yet
    }

    // Create user
    const user = await User.create({
      username,
      pharmacyName,
      ownerName,
      email,
      phone,
      registrationNumber,
      address,
      password,
      status: autoApprove ? "active" : "pending",
      isApproved: autoApprove,
    });

    return res.status(201).json({ 
      message: autoApprove 
        ? 'Registration successful. You can now log in.' 
        : 'Registration successful. Please wait for admin approval.'
    });
  } catch (err) {
    console.error("Registration Error:", err);
    return res.status(500).json({ message: `Server error: ${err.message}` });
  }
};

// POST /api/auth/login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    // Check if account is locked
    if (user.status === "locked") {
      if (user.lockedUntil && new Date() > user.lockedUntil) {
        // Lock has expired, unlock the account
        await user.update({ status: "active", lockedUntil: null, loginAttempts: 0 });
      } else {
        await logActivity(user.id, "LOGIN_FAILED", "Login attempt on locked account", req, {}, true);
        return res.status(403).json({ message: 'Your account is locked. Please contact administrator.' });
      }
    }

    // Check if account is inactive
    if (user.status === "inactive") {
      return res.status(403).json({ message: 'Your account is inactive. Please contact administrator.' });
    }

    // Check if account is pending approval
    if (user.status === "pending" || !user.isApproved) {
      return res.status(403).json({ message: 'Your account is pending approval. Please wait for admin approval.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      // Increment login attempts
      const newAttempts = (user.loginAttempts || 0) + 1;
      let maxAttempts = 5;
      
      try {
        const setting = await SystemSettings.findOne({ where: { key: "max_login_attempts" } });
        maxAttempts = setting ? parseInt(setting.value) : 5;
      } catch (e) {}
      
      if (newAttempts >= maxAttempts) {
        // Lock the account
        let lockDuration = 30;
        try {
          const setting = await SystemSettings.findOne({ where: { key: "lock_duration_minutes" } });
          lockDuration = setting ? parseInt(setting.value) : 30;
        } catch (e) {}
        
        await user.update({ 
          loginAttempts: newAttempts, 
          status: "locked",
          lockedUntil: new Date(Date.now() + lockDuration * 60000)
        });
        
        await logActivity(user.id, "ACCOUNT_LOCKED", `Account locked after ${newAttempts} failed login attempts`, req, {}, true);
        return res.status(403).json({ message: `Account locked due to too many failed attempts. Try again in ${lockDuration} minutes.` });
      } else {
        await user.update({ loginAttempts: newAttempts });
        await logActivity(user.id, "LOGIN_FAILED", `Failed login attempt (${newAttempts}/${maxAttempts})`, req, {}, newAttempts >= 3);
      }
      
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    // Reset login attempts and force logout flag on successful login
    const clientIp = req.ip || req.connection?.remoteAddress;
    await user.update({ 
      lastLoginAt: new Date(),
      lastLoginIp: clientIp,
      loginAttempts: 0,
      forceLogout: false
    });

    // Log successful login
    await logActivity(user.id, "LOGIN", "User logged in successfully", req);

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'your-secret-key-change-in-production',
      { expiresIn: '1d' }
    );

    return res.status(200).json({
      message: 'Login successful.',
      data: {
        id: user.id,
        username: user.username,
        pharmacyName: user.pharmacyName,
        email: user.email,
        ownerName: user.ownerName,
        role: user.role,
        status: user.status,
        isApproved: user.isApproved,
        profilePhoto: user.profilePhoto,
        lastLoginAt: user.lastLoginAt,
        createdAt: user.createdAt,
      },
      token
    });
  } catch (err) {
    console.error("Login Error:", err);
    return res.status(500).json({ message: `Server error: ${err.message}` });
  }
};

export const verifyTokenController = (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ valid: false, message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      return res.status(401).json({ valid: false, message: "No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key-change-in-production');
    return res.json({ valid: true, user: decoded });
  } catch (err) {
    return res.status(401).json({ valid: false, message: "Invalid token" });
  }
};

// GET /api/auth/users
export const listUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ["id", "ownerName", "pharmacyName", "email"],
      order: [["id", "ASC"]],
    });
    return res.status(200).json(users);
  } catch (err) {
    console.error("List Users Error:", err);
    return res.status(500).json({ message: "Failed to fetch users" });
  }
};

// GET /api/auth/me
export const getProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.userId, {
      attributes: [
        "id",
        "username",
        "pharmacyName",
        "ownerName",
        "email",
        "phone",
        "registrationNumber",
        "address",
        "role",
        "status",
        "profilePhoto",
        "lastLoginAt",
        "createdAt",
      ],
    });
    if (!user) return res.status(404).json({ message: "User not found" });
    return res.status(200).json(user);
  } catch (err) {
    console.error("Get Profile Error:", err);
    return res.status(500).json({ message: "Failed to load profile" });
  }
};

// PATCH /api/auth/me
export const updateProfile = async (req, res) => {
  try {
    const { pharmacyName, ownerName, email, phone, registrationNumber, address, username, profilePhoto } = req.body;
    const user = await User.findByPk(req.user.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (email && email !== user.email) {
      const existing = await User.findOne({ where: { email } });
      if (existing) {
        return res.status(409).json({ message: "Email already exists" });
      }
    }

    await user.update({
      pharmacyName: pharmacyName ?? user.pharmacyName,
      ownerName: ownerName ?? user.ownerName,
      email: email ?? user.email,
      phone: phone ?? user.phone,
      registrationNumber: registrationNumber ?? user.registrationNumber,
      address: address ?? user.address,
      username: username ?? user.username,
      profilePhoto: profilePhoto ?? user.profilePhoto,
    });

    return res.status(200).json({
      id: user.id,
      username: user.username,
      pharmacyName: user.pharmacyName,
      ownerName: user.ownerName,
      email: user.email,
      phone: user.phone,
      registrationNumber: user.registrationNumber,
      address: user.address,
      role: user.role,
      status: user.status,
      profilePhoto: user.profilePhoto,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
    });
  } catch (err) {
    console.error("Update Profile Error:", err);
    return res.status(500).json({ message: "Failed to update profile" });
  }
};

// PATCH /api/auth/change-password
export const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) {
      return res.status(400).json({ message: "Old and new password are required" });
    }

    const user = await User.findByPk(req.user.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Old password is incorrect" });
    }

    user.password = newPassword;
    await user.save();

    return res.status(200).json({ message: "Password updated successfully" });
  } catch (err) {
    console.error("Change Password Error:", err);
    return res.status(500).json({ message: "Failed to change password" });
  }
};
