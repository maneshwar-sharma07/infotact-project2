import express from "express";
import type { Request, Response } from "express"; // <-- Use "import type" for TypeScript interfaces
import cors from "cors";
import dotenv from "dotenv";
import { createServer } from "http"; // <-- Imported HTTP server creator
import { connectDB } from "./config/db.js";
import authRoutes from "./routes/auth.routes.js";
import productRoutes from "./routes/product.routes.js";
import orderRoutes from "./routes/order.routes.js";
import { initSocketServer } from "./socket/socketServer.js"; // <-- Imported Socket.IO initialization hook

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Create HTTP server wrapping the Express app
const httpServer = createServer(app);

// Enable Middlewares
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  credentials: true
}));
app.use(express.json());

// Register Routes
app.use("/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);

// Initialize Socket.IO server adapter
initSocketServer(httpServer);

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

    // Start listening on the HTTP server
    httpServer.listen(PORT, () => {
      console.log(`[Server] Running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error(`[Server] Startup failed: ${(error as Error).message}`);
    process.exitCode = 1;
  }
};

void startServer();
