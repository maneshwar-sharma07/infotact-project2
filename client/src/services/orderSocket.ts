import { io, type Socket } from "socket.io-client";
import type { ApiOrder } from "../types/ecommerce";

const socketUrl = "http://localhost:5000";

export function subscribeToOrderUpdates(onUpdate: (order: ApiOrder) => void): () => void {
  const token = localStorage.getItem("token");
  if (!token) return () => undefined;

  const socket: Socket = io(socketUrl, { auth: { token }, transports: ["websocket", "polling"] });
  socket.on("order:update", onUpdate);
  return () => socket.disconnect();
}
