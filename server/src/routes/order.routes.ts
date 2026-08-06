import { Router } from "express";
import type { Request, Response } from "express";
import mongoose from "mongoose";
import Order, { type IOrderItem, type OrderStatus } from "../models/Order";
import Product from "../models/Product";
import User from "../models/User";
import { requireAdmin, verifyToken } from "../middleware/auth";
import { invalidateCatalogCache } from "../middleware/cache";
import { acquireLock, releaseLock } from "../services/redisLock.service";
import { emitOrderUpdate, io } from "../socket/socketServer";

const router = Router();
const statuses: OrderStatus[] = ["Pending", "Confirmed", "Packed", "Shipped", "Delivered", "Cancelled"];

const isValidId = (id: string): boolean => mongoose.Types.ObjectId.isValid(id);

router.get("/my-orders", verifyToken, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: "Authentication required." });
    const orders = await Order.find({ user: userId }).sort({ createdAt: -1 }).limit(200);
    return res.json({ orders });
  } catch (error) {
    return res.status(500).json({ error: (error as Error).message });
  }
});

router.get("/", verifyToken, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: "Authentication required." });
    const filter = req.user?.role === "admin" ? {} : { user: userId };
    const orders = await Order.find(filter).sort({ createdAt: -1 }).limit(200);
    return res.json({ orders });
  } catch (error) {
    return res.status(500).json({ error: (error as Error).message });
  }
});

router.get("/:id", verifyToken, async (req: Request, res: Response) => {
  try {
    const orderId = String(req.params.id);
    if (!isValidId(orderId)) return res.status(400).json({ error: "Invalid order ID." });
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ error: "Order not found." });
    if (req.user?.role !== "admin" && order.user.toString() !== req.user?.id) {
      return res.status(403).json({ error: "You can only access your own orders." });
    }
    return res.json({ order });
  } catch (error) {
    return res.status(500).json({ error: (error as Error).message });
  }
});

router.post("/", verifyToken, async (req: Request, res: Response) => {
  const body = req.body as {
    items?: Array<{ product: string; name: string; price: number; quantity: number; imageUrl?: string }>;
    shippingAddress?: string;
    paymentMethod?: string;
  };
  const items = body.items;
  if (!items?.length || !body.shippingAddress?.trim() || !["Card", "Cash on Delivery"].includes(body.paymentMethod ?? "")) {
    return res.status(400).json({ error: "Items, shipping address, and payment method are required.", code: "ERR_INVALID_REQUEST" });
  }
  if (items.some((item) => !isValidId(item.product) || !Number.isInteger(item.quantity) || item.quantity < 1)) {
    return res.status(400).json({ error: "One or more order items are invalid.", code: "ERR_INVALID_REQUEST" });
  }
  const paymentMethod = body.paymentMethod as "Card" | "Cash on Delivery";

  const user = await User.findById(req.user?.id);
  if (!user) return res.status(401).json({ error: "Customer account not found." });

  const productIds = [...new Set(items.map((item) => item.product))];
  const acquiredLocks: string[] = [];
  const decremented: Array<{ productId: string; quantity: number }> = [];
  const orderItems: IOrderItem[] = [];
  try {
    for (const productId of productIds) {
      if (!(await acquireLock(productId, 5, 5, 100))) {
        return res.status(409).json({ error: `Server is busy processing item ${productId}. Please try checkout again.`, code: "ERR_LOCK_TIMEOUT", details: { productId } });
      }
      acquiredLocks.push(productId);
    }

    for (const item of items) {
      const updated = await Product.findOneAndUpdate({ _id: item.product, stock: { $gte: item.quantity } }, { $inc: { stock: -item.quantity } }, { new: true });
      if (!updated) {
        for (const decrementedItem of decremented) await Product.findByIdAndUpdate(decrementedItem.productId, { $inc: { stock: decrementedItem.quantity } });
        return res.status(400).json({ error: `Insufficient stock for product id ${item.product} or product does not exist.`, code: "ERR_OUT_OF_STOCK", details: { productId: item.product } });
      }
      decremented.push({ productId: item.product, quantity: item.quantity });
      orderItems.push({ product: updated._id, name: updated.name, price: updated.price, quantity: item.quantity, ...(updated.imageUrl ? { imageUrl: updated.imageUrl } : {}) });
    }

    const order = await Order.create({
      orderNumber: `SS-${Date.now().toString().slice(-8)}-${Math.floor(Math.random() * 1000).toString().padStart(3, "0")}`,
      user: user._id,
      customerName: user.name,
      customerEmail: user.email,
      items: orderItems,
      totalAmount: orderItems.reduce((total, item) => total + (item.price * item.quantity), 0),
      shippingAddress: body.shippingAddress.trim(),
      paymentMethod,
      status: "Pending"
    });

    for (const productId of productIds) {
      const product = await Product.findById(productId);
      if (product && io) {
        io.emit("stock:update", { productId, stock: product.stock });
        io.to(`product:${productId}`).emit("stock:update", { productId, stock: product.stock });
      }
    }
    await invalidateCatalogCache();
    return res.status(201).json({ message: "Order created successfully.", order });
  } catch (error) {
    for (const item of decremented) await Product.findByIdAndUpdate(item.productId, { $inc: { stock: item.quantity } }).catch(() => undefined);
    return res.status(500).json({ error: (error as Error).message, code: "ERR_INTERNAL_FAILURE" });
  } finally {
    for (const productId of acquiredLocks) await releaseLock(productId);
  }
});

router.patch("/:id/status", verifyToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const orderId = String(req.params.id);
    if (!isValidId(orderId)) return res.status(400).json({ error: "Invalid order ID." });
    const status = req.body?.status as OrderStatus;
    if (!statuses.includes(status)) return res.status(400).json({ error: "Invalid order status." });
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ error: "Order not found." });
    order.status = status;
    await order.save();
    emitOrderUpdate(order);
    return res.json({ message: "Order status updated.", order });
  } catch (error) {
    return res.status(500).json({ error: (error as Error).message });
  }
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
  } catch (error) {
    return res.status(500).json({ error: (error as Error).message });
  }
});

export default router;
