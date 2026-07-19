import express from "express";
import type { Request, Response } from "express"; // <-- Use "import type" for TypeScript interfaces
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./config/db";
import authRoutes from "./routes/auth.routes";
import productRoutes from "./routes/product.routes";
// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable Middlewares
app.use(cors());
app.use(express.json());

// Register Routes
app.use("/auth", authRoutes);
app.use("/api/products", productRoutes);

// Base health endpoint
app.get("/health", (req: Request, res: Response) => {
  res.json({
    status: "ok",
    message: "High-Performance E-Commerce Engine backend active.",
    timestamp: new Date()
  });
});

const startServer = async (): Promise<void> => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`[Server] Running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error(`[Server] Startup failed: ${(error as Error).message}`);
    process.exitCode = 1;
  }
};

void startServer();
