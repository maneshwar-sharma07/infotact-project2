"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = __importDefault(require("../models/User"));
const validate_1 = require("../middleware/validate");
const router = (0, express_1.Router)();
const getJwtSecret = () => process.env.JWT_SECRET || "your_super_secret_key_min_32_chars";
const JWT_EXPIRES_IN = (process.env.JWT_EXPIRES_IN || "7d");
// POST /auth/register - Register a new user
router.post("/register", validate_1.validateRegister, async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({ error: "Name, email, and password are required" });
        }
        // Check if user already exists
        const existingUser = await User_1.default.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: "User with this email already exists" });
        }
        // Hash the password manually
        const salt = await bcrypt_1.default.genSalt(10);
        const passwordHash = await bcrypt_1.default.hash(password, salt);
        // Create new user instance
        const newUser = new User_1.default({
            name,
            email,
            passwordHash,
            role: "customer"
        });
        await newUser.save();
        // Generate JWT token
        const token = jsonwebtoken_1.default.sign({ id: newUser._id.toString(), email: newUser.email, role: newUser.role }, getJwtSecret(), { expiresIn: JWT_EXPIRES_IN });
        return res.status(201).json({
            message: "Registration successful",
            token,
            user: newUser.toJSON()
        });
    }
    catch (error) {
        return res.status(500).json({ error: error.message });
    }
});
// POST /auth/login - User Authentication
router.post("/login", validate_1.validateLogin, async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: "Email and password are required" });
        }
        // Find the user by email
        const user = await User_1.default.findOne({ email });
        if (!user) {
            return res.status(401).json({ error: "Invalid email or password" });
        }
        // Check if password matches
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            return res.status(401).json({ error: "Invalid email or password" });
        }
        // Generate JWT token
        const token = jsonwebtoken_1.default.sign({ id: user._id.toString(), email: user.email, role: user.role }, getJwtSecret(), { expiresIn: JWT_EXPIRES_IN });
        return res.json({
            message: "Login successful",
            token,
            user: user.toJSON()
        });
    }
    catch (error) {
        return res.status(500).json({ error: error.message });
    }
});
exports.default = router;
//# sourceMappingURL=auth.routes.js.map