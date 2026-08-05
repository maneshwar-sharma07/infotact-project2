import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const getJwtSecret = (): string => process.env.JWT_SECRET || "your_super_secret_key_min_32_chars";

// Extend Express Request namespace globally to include our user object
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: "admin" | "customer";
      };
    }
  }
}

// Middleware to verify JWT tokens
export const verifyToken = (req: Request, res: Response, next: NextFunction) => {
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
    const decoded = jwt.verify(token, getJwtSecret());
    if (typeof decoded !== "object" || decoded === null || typeof decoded.id !== "string" || typeof decoded.email !== "string" || (decoded.role !== "admin" && decoded.role !== "customer")) {
      return res.status(401).json({ error: "Invalid or expired token." });
    }
    req.user = { id: decoded.id, email: decoded.email, role: decoded.role };
    next();
  } catch (error) {
    return res.status(401).json({ error: "Invalid or expired token." });
  }
};

// Middleware to restrict access to Admin users only
export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ error: "Forbidden. Admin access required." });
  }
  next();
};
