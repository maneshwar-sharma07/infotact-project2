"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateLogin = exports.validateRegister = void 0;
// Middleware to validate user registration inputs
const validateRegister = (req, res, next) => {
    const { name, email, password } = req.body;
    const errors = [];
    if (!name || typeof name !== "string" || name.trim() === "") {
        errors.push("Name is required and cannot be empty.");
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || typeof email !== "string" || !emailRegex.test(email)) {
        errors.push("A valid email address is required.");
    }
    if (!password || typeof password !== "string" || password.length < 6) {
        errors.push("Password must be at least 6 characters long.");
    }
    if (errors.length > 0) {
        return res.status(400).json({ errors });
    }
    next();
};
exports.validateRegister = validateRegister;
// Middleware to validate user login inputs
const validateLogin = (req, res, next) => {
    const { email, password } = req.body;
    const errors = [];
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || typeof email !== "string" || !emailRegex.test(email)) {
        errors.push("A valid email address is required.");
    }
    if (!password || typeof password !== "string" || password.trim() === "") {
        errors.push("Password is required.");
    }
    if (errors.length > 0) {
        return res.status(400).json({ errors });
    }
    next();
};
exports.validateLogin = validateLogin;
//# sourceMappingURL=validate.js.map