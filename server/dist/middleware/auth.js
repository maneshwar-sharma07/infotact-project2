"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAdmin = exports.verifyToken = exports.getJwtSecret = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const getJwtSecret = () => process.env.JWT_SECRET || "your_super_secret_key_min_32_chars";
exports.getJwtSecret = getJwtSecret;
// Middleware to verify JWT tokens
const verifyToken = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ error: "Access denied. No token provided." });
        }
        const token = authHeader.split(" ")[1];
        if (!token) {
            return res.status(401).json({ error: "Access denied. Invalid token format." });
        }
        // Verify token
        const decoded = jsonwebtoken_1.default.verify(token, (0, exports.getJwtSecret)());
        if (typeof decoded !== "object" || decoded === null || typeof decoded.id !== "string" || typeof decoded.email !== "string" || (decoded.role !== "admin" && decoded.role !== "customer")) {
            return res.status(401).json({ error: "Invalid or expired token." });
        }
        req.user = { id: decoded.id, email: decoded.email, role: decoded.role };
        next();
    }
    catch (error) {
        return res.status(401).json({ error: "Invalid or expired token." });
    }
};
exports.verifyToken = verifyToken;
// Middleware to restrict access to Admin users only
const requireAdmin = (req, res, next) => {
    if (!req.user || req.user.role !== "admin") {
        return res.status(403).json({ error: "Forbidden. Admin access required." });
    }
    next();
};
exports.requireAdmin = requireAdmin;
//# sourceMappingURL=auth.js.map