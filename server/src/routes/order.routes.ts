import { Router, Response } from "express";
import Order from "../models/Order.js";
import { verifyToken } from "../middleware/auth.js";

const router = Router();

// POST /api/orders - Stub purchase checkout endpoint
router.post("/", verifyToken, async (req: any, res: Response) => {
  try {
    const { items, totalAmount } = req.body;
    const userId = req.user?.id;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "Order must contain at least one item." });
    }

    if (totalAmount === undefined || totalAmount < 0) {
      return res.status(400).json({ error: "Valid total order amount is required." });
    }

    // Create stub order document
    const newOrder = new Order({
      user: userId,
      items,
      totalAmount,
      status: "pending"
    });

    await newOrder.save();

    return res.status(201).json({
      message: "Order checkout initialized successfully (stub)",
      order: newOrder
    });
  } catch (error) {
    return res.status(500).json({ error: (error as Error).message });
  }
});

export default router;
