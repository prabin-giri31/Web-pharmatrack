import { User } from "../../Model/user/userModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// JWT Secret - In production, use environment variable
const JWT_SECRET = process.env.JWT_SECRET || "your-super-secret-key-change-in-production";
const TOKEN_EXPIRY = "10d"; // Token valid for 10 days

const registerUser = async (req, res) => {
  try {
    const { company, email, phone, password } = req.body;
    
    if (!company || !email || !password) {
      return res.status(400).json({ error: "Company, email and password are required" });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: "Email already registered" });
    }

    const newUser = await User.create({ company, email, phone, password });
    
    // Return user data without password
    const { password: _, ...userWithoutPassword } = newUser.toJSON();

    res.status(201).json({ data: userWithoutPassword, message: "User registered successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to register user" });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).json({ error: "User not found" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: "Invalid credentials" });

    // Return user data without password
    const { password: _, ...userWithoutPassword } = user.toJSON();

    // Generate JWT token valid for 10 days
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: TOKEN_EXPIRY }
    );

    res.status(200).json({ 
      data: userWithoutPassword, 
      token,
      message: "Login successful" 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Login failed" });
  }
};

// Verify token endpoint
const verifyToken = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ valid: false, error: "No token provided" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Optionally fetch user to ensure they still exist
    const user = await User.findByPk(decoded.userId);
    if (!user) {
      return res.status(401).json({ valid: false, error: "User not found" });
    }

    res.status(200).json({ valid: true, userId: decoded.userId });
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ valid: false, error: "Token expired" });
    }
    return res.status(401).json({ valid: false, error: "Invalid token" });
  }
};

export { registerUser, loginUser, verifyToken };
