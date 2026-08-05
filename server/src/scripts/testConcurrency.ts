import dotenv from "dotenv";
import { connectDB } from "../config/db";
import { redisClient } from "../config/redis";
import Product from "../models/Product";
import Order from "../models/Order";
import { acquireLock, releaseLock } from "../services/redisLock.service";

import mongoose from "mongoose";

dotenv.config();

const runConcurrencyTest = async () => {
  try {
    console.log("==========================================");
    console.log("[Test Runner] Starting Checkout Concurrency Tests");
    console.log("==========================================");

    // Establish DB connection
    await connectDB();

    // 1. Setup a test product with limited stock (stock = 3)
    const testProduct = new Product({
      name: "Concurrency Test Jacket",
      description: "A jacket with limited stock for testing race conditions.",
      price: 99.99,
      stock: 3,
      category: "Clothing",
      embedding: Array(384).fill(0)
    });
    await testProduct.save();
    const productId = testProduct._id.toString();

    // Clear old test orders
    await Order.deleteMany({ "items.product": testProduct._id });

    // Release any lingering Redis lock key
    await redisClient.del(`lock:product:${productId}`);

    console.log(`[Setup] Created product: ${testProduct.name} | Stock: ${testProduct.stock}`);

    const mockUserId = new mongoose.Types.ObjectId().toString();

    // 2. Simulation checkout function (simulates controller execution flow)
    const checkoutSim = async (buyerName: string) => {
      const quantity = 1;
      let lockAcquired = false;

      try {
        // Try to acquire the Redis distributed lock
        lockAcquired = await acquireLock(productId, 5, 3, 50);
        if (!lockAcquired) {
          return { success: false, buyer: buyerName, reason: "Lock timeout conflict" };
        }

        // Perform Mongoose Atomic Filter check and decrement
        const updated = await Product.findOneAndUpdate(
          { _id: productId, stock: { $gte: quantity } },
          { $inc: { stock: -quantity } },
          { new: true }
        );

        if (!updated) {
          return { success: false, buyer: buyerName, reason: "Insufficient stock" };
        }

        // Save order document
        const order = new Order({
          orderNumber: `TEST-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          user: mockUserId,
          customerName: buyerName,
          customerEmail: `${buyerName.toLowerCase().replace(/\s+/g, ".")}@example.test`,
          items: [{ product: testProduct._id, name: testProduct.name, price: testProduct.price, quantity }],
          totalAmount: testProduct.price * quantity,
          shippingAddress: "Concurrency test address",
          paymentMethod: "Card",
          status: "Pending"
        });
        await order.save();

        return { success: true, buyer: buyerName, orderId: order._id };
      } catch (err) {
        return { success: false, buyer: buyerName, reason: (err as Error).message };
      } finally {
        if (lockAcquired) {
          await releaseLock(productId);
        }
      }
    };

    console.log("\n[Simulating] Spawning 5 concurrent checkouts for stock = 3...");

    // Spawn all 5 checkout requests concurrently using Promise.all
    const results = await Promise.all([
      checkoutSim("Buyer A"),
      checkoutSim("Buyer B"),
      checkoutSim("Buyer C"),
      checkoutSim("Buyer D"),
      checkoutSim("Buyer E")
    ]);

    console.log("\n--- CONCURRENCY RESULTS ---");
    let successCount = 0;
    let failureCount = 0;

    results.forEach((res) => {
      if (res.success) {
        successCount++;
        console.log(`✅ Success: ${res.buyer} placed order: ${res.orderId}`);
      } else {
        failureCount++;
        console.log(`❌ Failed: ${res.buyer} - Reason: ${res.reason}`);
      }
    });

    console.log("\n--- VERIFICATION ASSERTIONS ---");
    const finalProduct = await Product.findById(productId);
    const finalStock = finalProduct?.stock;
    console.log(`[Assertion] Final Stock in Database: ${finalStock} (Expected: 0)`);
    console.log(`[Assertion] Total Success Checkouts: ${successCount} (Expected: 3)`);
    console.log(`[Assertion] Total Failed Checkouts: ${failureCount} (Expected: 2)`);

    if (finalStock === 0 && successCount === 3 && failureCount === 2) {
      console.log("\n🎉 [BENCHMARK PASSED] Concurrency locks and atomic decrements successfully prevented overselling!");
    } else {
      console.error("\n⚠️ [BENCHMARK FAILED] Concurrency race condition detected or assertions failed.");
    }

    // Cleanup test product and orders
    await Product.findByIdAndDelete(productId);
    await Order.deleteMany({ "items.product": testProduct._id });

    console.log("==========================================");
    process.exit(0);
  } catch (error) {
    console.error(`[FAIL] Concurrency test runner crash: ${(error as Error).message}`);
    process.exit(1);
  }
};

runConcurrencyTest();
