"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const mongoose_1 = __importDefault(require("mongoose"));
const Order_1 = __importDefault(require("../models/Order"));
const User_1 = __importDefault(require("../models/User"));
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
const statuses = ["Pending", "Confirmed", "Packed", "Shipped", "Delivered", "Cancelled"];
const nextStatus = { Pending: "Confirmed", Confirmed: "Packed", Packed: "Shipped", Shipped: "Delivered" };
function isValidId(id) { return mongoose_1.default.Types.ObjectId.isValid(id); }
// GET /api/orders — customers receive their own orders; admins receive all orders.
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
        if (req.user?.role !== "admin" && order.user.toString() !== req.user?.id)
            return res.status(403).json({ error: "You can only access your own orders." });
        return res.json({ order });
    }
    catch (error) {
        return res.status(500).json({ error: error.message });
    }
});
router.post("/", auth_1.verifyToken, async (req, res) => {
    try {
        const { items, totalAmount, shippingAddress, paymentMethod } = req.body;
        if (!items?.length || totalAmount === undefined || !shippingAddress?.trim() || !["Card", "Cash on Delivery"].includes(paymentMethod || ""))
            return res.status(400).json({ error: "Items, total, shipping address, and payment method are required." });
        if (items.some((item) => !isValidId(item.product) || !item.name || item.price < 0 || item.quantity < 1))
            return res.status(400).json({ error: "One or more order items are invalid." });
        const user = await User_1.default.findById(req.user?.id);
        if (!user)
            return res.status(401).json({ error: "Customer account not found." });
        const order = await Order_1.default.create({ orderNumber: `SS-${Date.now().toString().slice(-8)}`, user: user._id, customerName: user.name, customerEmail: user.email, items, totalAmount, shippingAddress: shippingAddress.trim(), paymentMethod: paymentMethod, status: "Pending" });
        return res.status(201).json({ message: "Order created successfully.", order });
    }
    catch (error) {
        return res.status(500).json({ error: error.message });
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
        if (status !== "Cancelled" && order.status !== status && nextStatus[order.status] !== status)
            return res.status(400).json({ error: "Status must follow the order workflow." });
        order.status = status;
        await order.save();
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