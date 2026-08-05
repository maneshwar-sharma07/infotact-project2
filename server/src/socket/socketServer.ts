import { Server as SocketIOServer } from "socket.io";
import type { Server as HTTPServer } from "http";

export let io: SocketIOServer | null = null;

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
  io.on("connection", (socket) => {
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
