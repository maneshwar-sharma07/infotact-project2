import express from "express";
import type { Request, Response } from "express"; // <-- Use "import type" for TypeScript interfaces
import cors from "cors";
import dotenv from "dotenv";
import  {connectDB}  from "./config/db.js";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable Middlewares
app.use(cors());
app.use(express.json());

// Base health endpoint
app.get("/health", (req: Request, res: Response) => {
  res.json({
    status: "ok",
    message: "High-Performance E-Commerce Engine backend active.",
    timestamp: new Date()
  });
});

// Start listening
app.listen(PORT, () => {
  console.log(`[Server] Running on http://localhost:${PORT}`);
});