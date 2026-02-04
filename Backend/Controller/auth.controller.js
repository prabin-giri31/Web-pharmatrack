import { User } from "../Model/user/userModel.js";
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

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
    // Create user
    const user = new User({
      username,
      pharmacyName,
      ownerName,
      email,
      phone,
      registrationNumber,
      address,
      password,
    });
    await user.save();
    return res.status(201).json({ message: 'Registration successful.' });
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

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    await user.update({ lastLoginAt: new Date() });

    const token = jwt.sign(
      { userId: user.id, email: user.email },
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
