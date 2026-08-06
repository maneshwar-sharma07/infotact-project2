"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const mongoose_1 = __importDefault(require("mongoose"));
const Order_1 = __importDefault(require("../models/Order"));
const Product_1 = __importDefault(require("../models/Product"));
const User_1 = __importDefault(require("../models/User"));
const auth_1 = require("../middleware/auth");
const cache_1 = require("../middleware/cache");
const redisLock_service_1 = require("../services/redisLock.service");
const socketServer_1 = require("../socket/socketServer");
const router = (0, express_1.Router)();
const statuses = ["Pending", "Confirmed", "Packed", "Shipped", "Delivered", "Cancelled"];
const isValidId = (id) => mongoose_1.default.Types.ObjectId.isValid(id);
router.get("/my-orders", auth_1.verifyToken, async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId)
            return res.status(401).json({ error: "Authentication required." });
        const orders = await Order_1.default.find({ user: userId }).sort({ createdAt: -1 }).limit(200);
        return res.json({ orders });
    }
    catch (error) {
        return res.status(500).json({ error: error.message });
    }
});
router.get("/", auth_1.verifyToken, async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId)
            return res.status(401).json({ error: "Authentication required." });
        const filter = req.user?.role === "admin" ? {} : { user: userId };
        const orders = await Order_1.default.find(filter).sort({ createdAt: -1 }).limit(200);
        return res.json({ orders });
    }
    catch (error) {
        return res.status(500).json({ error: error.message });
    }
});
router.get("/:id", auth_1.verifyToken, async (req, res) => {
    try {
        const orderId = String(req.params.id);
        if (!isValidId(orderId))
            return res.status(400).json({ error: "Invalid order ID." });
        const order = await Order_1.default.findById(orderId);
        if (!order)
            return res.status(404).json({ error: "Order not found." });
        if (req.user?.role !== "admin" && order.user.toString() !== req.user?.id) {
            return res.status(403).json({ error: "You can only access your own orders." });
        }
        return res.json({ order });
    }
    catch (error) {
        return res.status(500).json({ error: error.message });
    }
});
router.post("/", auth_1.verifyToken, async (req, res) => {
    const body = req.body;
    const items = body.items;
    if (!items?.length || !body.shippingAddress?.trim() || !["Card", "Cash on Delivery"].includes(body.paymentMethod ?? "")) {
        return res.status(400).json({ error: "Items, shipping address, and payment method are required.", code: "ERR_INVALID_REQUEST" });
    }
    if (items.some((item) => !isValidId(item.product) || !Number.isInteger(item.quantity) || item.quantity < 1)) {
        return res.status(400).json({ error: "One or more order items are invalid.", code: "ERR_INVALID_REQUEST" });
    }
    const paymentMethod = body.paymentMethod;
    const user = await User_1.default.findById(req.user?.id);
    if (!user)
        return res.status(401).json({ error: "Customer account not found." });
    const productIds = [...new Set(items.map((item) => item.product))];
    const acquiredLocks = [];
    const decremented = [];
    const orderItems = [];
    try {
        for (const productId of productIds) {
            if (!(await (0, redisLock_service_1.acquireLock)(productId, 5, 5, 100))) {
                return res.status(409).json({ error: `Server is busy processing item ${productId}. Please try checkout again.`, code: "ERR_LOCK_TIMEOUT", details: { productId } });
            }
            acquiredLocks.push(productId);
        }
        for (const item of items) {
            const updated = await Product_1.default.findOneAndUpdate({ _id: item.product, stock: { $gte: item.quantity } }, { $inc: { stock: -item.quantity } }, { new: true });
            if (!updated) {
                for (const decrementedItem of decremented)
                    await Product_1.default.findByIdAndUpdate(decrementedItem.productId, { $inc: { stock: decrementedItem.quantity } });
                return res.status(400).json({ error: `Insufficient stock for product id ${item.product} or product does not exist.`, code: "ERR_OUT_OF_STOCK", details: { productId: item.product } });
            }
            decremented.push({ productId: item.product, quantity: item.quantity });
            orderItems.push({ product: updated._id, name: updated.name, price: updated.price, quantity: item.quantity, ...(updated.imageUrl ? { imageUrl: updated.imageUrl } : {}) });
        }
        const order = await Order_1.default.create({
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
            const product = await Product_1.default.findById(productId);
            if (product && socketServer_1.io) {
                socketServer_1.io.emit("stock:update", { productId, stock: product.stock });
                socketServer_1.io.to(`product:${productId}`).emit("stock:update", { productId, stock: product.stock });
            }
        }
        await (0, cache_1.invalidateCatalogCache)();
        return res.status(201).json({ message: "Order created successfully.", order });
    }
    catch (error) {
        for (const item of decremented)
            await Product_1.default.findByIdAndUpdate(item.productId, { $inc: { stock: item.quantity } }).catch(() => undefined);
        return res.status(500).json({ error: error.message, code: "ERR_INTERNAL_FAILURE" });
    }
    finally {
        for (const productId of acquiredLocks)
            await (0, redisLock_service_1.releaseLock)(productId);
    }
});
router.patch("/:id/status", auth_1.verifyToken, auth_1.requireAdmin, async (req, res) => {
    try {
        const orderId = String(req.params.id);
        if (!isValidId(orderId))
            return res.status(400).json({ error: "Invalid order ID." });
        const status = req.body?.status;
        if (!statuses.includes(status))
            return res.status(400).json({ error: "Invalid order status." });
        const order = await Order_1.default.findById(orderId);
        if (!order)
            return res.status(404).json({ error: "Order not found." });
        order.status = status;
        await order.save();
        (0, socketServer_1.emitOrderUpdate)(order);
        return res.json({ message: "Order status updated.", order });
    }
    catch (error) {
        return res.status(500).json({ error: error.message });
    }
});
router.delete("/:id", auth_1.verifyToken, async (req, res) => {
    try {
        const orderId = String(req.params.id);
        if (!isValidId(orderId))
            return res.status(400).json({ error: "Invalid order ID." });
        const order = await Order_1.default.findById(orderId);
        if (!order)
            return res.status(404).json({ error: "Order not found." });
        const isAdmin = req.user?.role === "admin";
        if (!isAdmin && order.user.toString() !== req.user?.id)
            return res.status(403).json({ error: "You can only cancel your own orders." });
        if (!isAdmin && order.status !== "Pending")
            return res.status(400).json({ error: "Only pending orders can be cancelled." });
        if (isAdmin)
            await order.deleteOne();
        else {
            order.status = "Cancelled";
            await order.save();
        }
        return res.json({ message: isAdmin ? "Order deleted." : "Order cancelled." });
    }
    catch (error) {
        return res.status(500).json({ error: error.message });
    }
});
exports.default = router;
//# sourceMappingURL=order.routes.js.map