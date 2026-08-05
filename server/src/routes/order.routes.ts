import { Router } from "express";
import type { Request, Response } from "express";
import mongoose from "mongoose";
import Order, { type OrderStatus } from "../models/Order";
import User from "../models/User";
import { requireAdmin, verifyToken } from "../middleware/auth";

const router = Router();
const statuses: OrderStatus[] = ["Pending", "Confirmed", "Packed", "Shipped", "Delivered", "Cancelled"];
const nextStatus: Partial<Record<OrderStatus, OrderStatus>> = { Pending: "Confirmed", Confirmed: "Packed", Packed: "Shipped", Shipped: "Delivered" };

function isValidId(id: string) { return mongoose.Types.ObjectId.isValid(id); }

// GET /api/orders — customers receive their own orders; admins receive all orders.
router.get("/", verifyToken, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: "Authentication required." });
    const filter: Record<string, unknown> = req.user?.role === "admin" ? {} : { user: userId };
    const orders = await Order.find(filter).sort({ createdAt: -1 }).limit(200);
    return res.json({ orders });
  } catch (error) { return res.status(500).json({ error: (error as Error).message }); }
});

router.get("/:id", verifyToken, async (req: Request, res: Response) => {
  try {
    const orderId = String(req.params.id);
    if (!isValidId(orderId)) return res.status(400).json({ error: "Invalid order ID." });
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ error: "Order not found." });
    if (req.user?.role !== "admin" && order.user.toString() !== req.user?.id) return res.status(403).json({ error: "You can only access your own orders." });
    return res.json({ order });
  } catch (error) { return res.status(500).json({ error: (error as Error).message }); }
});

router.post("/", verifyToken, async (req: Request, res: Response) => {
  try {
    const { items, totalAmount, shippingAddress, paymentMethod } = req.body as { items?: Array<{ product: string; name: string; price: number; quantity: number }>; totalAmount?: number; shippingAddress?: string; paymentMethod?: string };
    if (!items?.length || totalAmount === undefined || !shippingAddress?.trim() || !["Card", "Cash on Delivery"].includes(paymentMethod || "")) return res.status(400).json({ error: "Items, total, shipping address, and payment method are required." });
    if (items.some((item) => !isValidId(item.product) || !item.name || item.price < 0 || item.quantity < 1)) return res.status(400).json({ error: "One or more order items are invalid." });
    const user = await User.findById(req.user?.id);
    if (!user) return res.status(401).json({ error: "Customer account not found." });
    const order = await Order.create({ orderNumber: `SS-${Date.now().toString().slice(-8)}`, user: user._id, customerName: user.name, customerEmail: user.email, items, totalAmount, shippingAddress: shippingAddress.trim(), paymentMethod: paymentMethod as "Card" | "Cash on Delivery", status: "Pending" });
    return res.status(201).json({ message: "Order created successfully.", order });
  } catch (error) { return res.status(500).json({ error: (error as Error).message }); }
});

router.patch("/:id/status", verifyToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const orderId = String(req.params.id);
    if (!isValidId(orderId)) return res.status(400).json({ error: "Invalid order ID." });
    const status = req.body?.status as OrderStatus;
    if (!statuses.includes(status)) return res.status(400).json({ error: "Invalid order status." });
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ error: "Order not found." });
    if (status !== "Cancelled" && order.status !== status && nextStatus[order.status] !== status) return res.status(400).json({ error: "Status must follow the order workflow." });
    order.status = status;
    await order.save();
    return res.json({ message: "Order status updated.", order });
  } catch (error) { return res.status(500).json({ error: (error as Error).message }); }
});

router.delete("/:id", verifyToken, async (req: Request, res: Response) => {
  try {
    const orderId = String(req.params.id);
    if (!isValidId(orderId)) return res.status(400).json({ error: "Invalid order ID." });
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ error: "Order not found." });
    const isAdmin = req.user?.role === "admin";
    if (!isAdmin && order.user.toString() !== req.user?.id) return res.status(403).json({ error: "You can only cancel your own orders." });
    if (!isAdmin && order.status !== "Pending") return res.status(400).json({ error: "Only pending orders can be cancelled." });
    if (isAdmin) await order.deleteOne();
    else { order.status = "Cancelled"; await order.save(); }
    return res.json({ message: isAdmin ? "Order deleted." : "Order cancelled." });
  } catch (error) { return res.status(500).json({ error: (error as Error).message }); }
});

export default router;
