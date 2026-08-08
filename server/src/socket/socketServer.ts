import { Server as SocketIOServer } from "socket.io";
import type { Server as HTTPServer } from "http";
import jwt from "jsonwebtoken";
import type { IOrder } from "../models/Order";
import { getJwtSecret } from "../middleware/auth";

export let io: SocketIOServer | null = null;

export const emitOrderUpdate = (order: IOrder): void => {
  if (!io) return;
  const payload = order.toJSON();
  io.to(`user:${order.user.toString()}`).emit("order:update", payload);
  io.to("role:admin").emit("order:update", payload);
};

/**
 * Initializes the Socket.IO server adapter bound to the shared HTTP server.
 * @param httpServer Node.js HTTP server instance
 * @returns The initialized Socket.IO server
 */
export const initSocketServer = (httpServer: HTTPServer): SocketIOServer => {
  io = new SocketIOServer(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:5173",
      methods: ["GET", "POST"],
      credentials: true
    }
  });

  console.log("[Socket.IO] Server adapter initialized successfully.");

  // General connection event monitoring
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (typeof token !== "string") return next(new Error("Authentication required."));
    try {
      const decoded = jwt.verify(token, getJwtSecret());
      if (typeof decoded !== "object" || decoded === null || typeof decoded.id !== "string" || (decoded.role !== "admin" && decoded.role !== "customer")) return next(new Error("Invalid token."));
      socket.data.user = { id: decoded.id, role: decoded.role };
      return next();
    } catch { return next(new Error("Invalid token.")); }
  });

  io.on("connection", (socket) => {
    const user = socket.data.user as { id: string; role: "admin" | "customer" };
    socket.join(`user:${user.id}`);
    if (user.role === "admin") socket.join("role:admin");
    console.log(`[Socket.IO] Client connected: ${socket.id}`);

    // Room-based subscription logic for target product stock viewport changes
    socket.on("join:product", (productId: string) => {
      socket.join(`product:${productId}`);
      console.log(`[Socket.IO] Client ${socket.id} joined room product:${productId}`);
    });

    socket.on("leave:product", (productId: string) => {
      socket.leave(`product:${productId}`);
      console.log(`[Socket.IO] Client ${socket.id} left room product:${productId}`);
    });

    socket.on("disconnect", () => {
      console.log(`[Socket.IO] Client disconnected: ${socket.id}`);
    });
  });

  return io;
};
