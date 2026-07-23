import { Router } from "express";
import type { Response } from "express";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import { verifyToken } from "../middleware/auth.js";
import { acquireLock, releaseLock } from "../services/redisLock.service.js";
import { invalidateCatalogCache } from "../middleware/cache.js";

const router = Router();

// POST /api/orders - Secure Checkout using Redis Lock & Atomic MongoDB Filter
router.post("/", verifyToken, async (req: any, res: Response) => {
  const { items, totalAmount } = req.body;
  const userId = req.user?.id;

  // 1. Basic request validation
  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: "Order must contain at least one item." });
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
          error: `Server is busy processing item ${item.product}. Please try checking out again.`
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
          error: `Insufficient stock for product id ${item.product} or product does not exist.`
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

    // 5. Invalidate catalog caches since product stock values have updated
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

    return res.status(500).json({ error: "Internal checkout transaction failure." });
  }
});

export default router;
