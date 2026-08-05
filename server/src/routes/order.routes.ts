import { Router } from "express";
<<<<<<< HEAD
import type { Request, Response } from "express";
import mongoose from "mongoose";
import Order, { type OrderStatus } from "../models/Order";
import User from "../models/User";
import { requireAdmin, verifyToken } from "../middleware/auth";
=======
import type { Response } from "express";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import { verifyToken } from "../middleware/auth.js";
import { acquireLock, releaseLock } from "../services/redisLock.service.js";
import { invalidateCatalogCache } from "../middleware/cache.js";
import { io } from "../socket/socketServer.js"; // <-- Imported Socket.IO instance
>>>>>>> origin/main

const router = Router();
const statuses: OrderStatus[] = ["Pending", "Confirmed", "Packed", "Shipped", "Delivered", "Cancelled"];
const nextStatus: Partial<Record<OrderStatus, OrderStatus>> = { Pending: "Confirmed", Confirmed: "Packed", Packed: "Shipped", Shipped: "Delivered" };

<<<<<<< HEAD
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
=======
// POST /api/orders - Secure Checkout using Redis Lock & Atomic MongoDB Filter
router.post("/", verifyToken, async (req: any, res: Response) => {
  const { items, totalAmount } = req.body;
  const userId = req.user?.id;

  // 1. Basic request validation
  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({
      error: "Order must contain at least one item.",
      code: "ERR_INVALID_REQUEST"
    });
  }

  const acquiredLocks: string[] = [];
  const decrementedProducts: { productId: string; quantity: number }[] = [];

  try {
    // 2. Step 1: Acquire Redis locks for all products in the order
    for (const item of items) {
      const lockSuccess = await acquireLock(item.product, 5, 5, 100);
      if (!lockSuccess) {
        // Rollback already acquired locks
        for (const lockedId of acquiredLocks) {
          await releaseLock(lockedId);
        }
        return res.status(409).json({
          error: `Server is busy processing item ${item.product}. Please try checking out again.`,
          code: "ERR_LOCK_TIMEOUT",
          details: { productId: item.product }
        });
      }
      acquiredLocks.push(item.product);
    }

    // 3. Step 2: Validate stock and perform Atomic Decrements in MongoDB
    for (const item of items) {
      // Find and decrement only if stock is greater than or equal to quantity requested
      const updatedProduct = await Product.findOneAndUpdate(
        {
          _id: item.product,
          stock: { $gte: item.quantity } // MongoDB Atomic boundary filter
        },
        {
          $inc: { stock: -item.quantity } // Atomic decrement
        },
        { new: true }
      );

      if (!updatedProduct) {
        // Rollback any MongoDB decrements done so far (Simulated Saga Rollback)
        for (const dec of decrementedProducts) {
          await Product.findByIdAndUpdate(dec.productId, {
            $inc: { stock: dec.quantity }
          });
        }
        // Release all locks
        for (const lockedId of acquiredLocks) {
          await releaseLock(lockedId);
        }

        return res.status(400).json({
          error: `Insufficient stock for product id ${item.product} or product does not exist.`,
          code: "ERR_OUT_OF_STOCK",
          details: { productId: item.product }
        });
      }

      // Track successful decrements for potential rollbacks
      decrementedProducts.push({ productId: item.product, quantity: item.quantity });
    }

    // 4. Step 3: Create and Save the Order
    const newOrder = new Order({
      user: userId,
      items,
      totalAmount,
      status: "completed"
    });

    await newOrder.save();

    // 5. Emit real-time stock updates via Socket.IO
    if (io) {
      for (const item of items) {
        try {
          const product = await Product.findById(item.product);
          if (product) {
            console.log(`[Socket.IO] Emitting stock:update for product ${item.product} | Stock: ${product.stock}`);
            // Broadcast to the general storefront catalog listeners
            io.emit("stock:update", {
              productId: item.product,
              stock: product.stock
            });
            // Broadcast to the specific details page channel room
            io.to(`product:${item.product}`).emit("stock:update", {
              productId: item.product,
              stock: product.stock
            });
          }
        } catch (socketErr) {
          console.error(`[Socket.IO] Stock emit error: ${(socketErr as Error).message}`);
        }
      }
    }

    // 6. Invalidate catalog caches since product stock values have updated
    await invalidateCatalogCache();

    // 6. Step 4: Release all Redis locks
    for (const lockedId of acquiredLocks) {
      await releaseLock(lockedId);
    }

    return res.status(201).json({
      message: "Order placed and finalized successfully!",
      order: newOrder
    });

  } catch (error) {
    // Catch block fallback recovery
    console.error(`[Checkout Error] Transaction failed: ${(error as Error).message}`);
    
    // Safety check rollback
    for (const dec of decrementedProducts) {
      await Product.findByIdAndUpdate(dec.productId, {
        $inc: { stock: dec.quantity }
      }).catch(err => console.error(`[Critical Rollback Error] ${err.message}`));
    }

    for (const lockedId of acquiredLocks) {
      await releaseLock(lockedId).catch(err => console.error(`[Critical Unlock Error] ${err.message}`));
    }

    return res.status(500).json({
      error: "Internal checkout transaction failure.",
      code: "ERR_INTERNAL_FAILURE"
    });
  }
});

// GET /api/orders/my-orders - Retrieve order history for the authenticated user
router.get("/my-orders", verifyToken, async (req: any, res: Response) => {
  try {
    const userId = req.user?.id;
    const orders = await Order.find({ user: userId }).sort({ createdAt: -1 });
    return res.json(orders);
  } catch (error) {
    return res.status(500).json({ error: (error as Error).message });
  }
>>>>>>> origin/main
});

export default router;
