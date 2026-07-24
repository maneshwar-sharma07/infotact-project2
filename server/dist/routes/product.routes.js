"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Product_1 = __importDefault(require("../models/Product"));
const auth_1 = require("../middleware/auth");
const cache_1 = require("../middleware/cache");
const router = (0, express_1.Router)();
// GET /api/products - Retrieve product list with pagination, sorting, and category filters (Cached)
router.get("/", async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;
        const category = req.query.category;
        const sortBy = req.query.sortBy; // 'price_asc' | 'price_desc' | 'newest'
        // Create a dynamic query key
        const cacheKey = `catalog:page:${page}:limit:${limit}:category:${category || "all"}:sort:${sortBy || "newest"}`;
        const result = await (0, cache_1.getOrSetCache)(cacheKey, async () => {
            const filter = {};
            if (category) {
                filter.category = category;
            }
            let sortOption = { createdAt: -1 };
            if (sortBy === "price_asc") {
                sortOption = { price: 1 };
            }
            else if (sortBy === "price_desc") {
                sortOption = { price: -1 };
            }
            // Execute query in MongoDB
            const products = await Product_1.default.find(filter)
                .sort(sortOption)
                .skip(skip)
                .limit(limit);
            const totalProducts = await Product_1.default.countDocuments(filter);
            return {
                products,
                pagination: {
                    totalProducts,
                    currentPage: page,
                    totalPages: Math.ceil(totalProducts / limit),
                    pageSize: products.length
                }
            };
        }, 600); // 10 minutes base cache TTL
        return res.json(result);
    }
    catch (error) {
        return res.status(500).json({ error: error.message });
    }
});
// GET /api/products/:id - Retrieve specific product details (Cached)
router.get("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const cacheKey = `product:details:${id}`;
        const product = await (0, cache_1.getOrSetCache)(cacheKey, async () => {
            return await Product_1.default.findById(id);
        }, 600); // 10 minutes base cache TTL
        if (!product) {
            return res.status(404).json({ error: "Product not found" });
        }
        return res.json(product);
    }
    catch (error) {
        return res.status(500).json({ error: error.message });
    }
});
// POST /api/products - Create a new product (Admin Only)
router.post("/", auth_1.verifyToken, auth_1.requireAdmin, async (req, res) => {
    try {
        const { name, description, price, stock, category, embedding } = req.body;
        if (!name || !description || price === undefined || stock === undefined || !category) {
            return res.status(400).json({ error: "Missing required product fields" });
        }
        const newProduct = new Product_1.default({
            name,
            description,
            price,
            stock,
            category,
            embedding: embedding || Array(384).fill(0) // Default zero vector if not provided
        });
        await newProduct.save();
        // Evict all stale paginated catalog cache blocks
        await (0, cache_1.invalidateCatalogCache)();
        return res.status(201).json({
            message: "Product created successfully",
            product: newProduct
        });
    }
    catch (error) {
        return res.status(500).json({ error: error.message });
    }
});
// PUT /api/products/:id - Update product details (Admin Only)
router.put("/:id", auth_1.verifyToken, auth_1.requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        const updatedProduct = await Product_1.default.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
        if (!updatedProduct) {
            return res.status(404).json({ error: "Product not found" });
        }
        // Evict all stale paginated catalog cache blocks
        await (0, cache_1.invalidateCatalogCache)();
        return res.json({
            message: "Product updated successfully",
            product: updatedProduct
        });
    }
    catch (error) {
        return res.status(500).json({ error: error.message });
    }
});
// DELETE /api/products/:id - Remove product from catalog (Admin Only)
router.delete("/:id", auth_1.verifyToken, auth_1.requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const deletedProduct = await Product_1.default.findByIdAndDelete(id);
        if (!deletedProduct) {
            return res.status(404).json({ error: "Product not found" });
        }
        // Evict all stale paginated catalog cache blocks
        await (0, cache_1.invalidateCatalogCache)();
        return res.json({
            message: "Product deleted successfully"
        });
    }
    catch (error) {
        return res.status(500).json({ error: error.message });
    }
});
exports.default = router;
//# sourceMappingURL=product.routes.js.map