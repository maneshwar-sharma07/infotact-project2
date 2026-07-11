import type { Request, Response, NextFunction } from "express";

// Middleware to validate user registration inputs
export const validateRegister = (req: Request, res: Response, next: NextFunction) => {
  const { name, email, password } = req.body;
  const errors: string[] = [];

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

// Middleware to validate user login inputs
export const validateLogin = (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body;
  const errors: string[] = [];

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
