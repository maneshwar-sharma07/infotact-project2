import { Router, Request, Response } from "express";
import Product from "../models/Product.js";
import { getOrSetCache } from "../middleware/cache.js";

const router = Router();

// GET /api/products - Retrieve product list with pagination, sorting, and category filters (Cached)
router.get("/", async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const category = req.query.category as string;
    const sortBy = req.query.sortBy as string; // 'price_asc' | 'price_desc' | 'newest'

    // Create a dynamic query key
    const cacheKey = `catalog:page:${page}:limit:${limit}:category:${category || "all"}:sort:${sortBy || "newest"}`;

    const result = await getOrSetCache(cacheKey, async () => {
      const filter: Record<string, any> = {};
      if (category) {
        filter.category = category;
      }

      let sortOption: Record<string, any> = { createdAt: -1 };
      if (sortBy === "price_asc") {
        sortOption = { price: 1 };
      } else if (sortBy === "price_desc") {
        sortOption = { price: -1 };
      }

      // Execute query in MongoDB
      const products = await Product.find(filter)
        .sort(sortOption)
        .skip(skip)
        .limit(limit);

      const totalProducts = await Product.countDocuments(filter);

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
  } catch (error) {
    return res.status(500).json({ error: (error as Error).message });
  }
});

// GET /api/products/:id - Retrieve specific product details (Cached)
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const cacheKey = `product:details:${id}`;

    const product = await getOrSetCache(cacheKey, async () => {
      return await Product.findById(id);
    }, 600); // 10 minutes base cache TTL

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    return res.json(product);
  } catch (error) {
    return res.status(500).json({ error: (error as Error).message });
  }
});

import { verifyToken, requireAdmin } from "../middleware/auth.js";
import { invalidateCatalogCache } from "../middleware/cache.js";

// POST /api/products - Create a new product (Admin Only)
router.post("/", verifyToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { name, description, price, stock, category, embedding } = req.body;

    if (!name || !description || price === undefined || stock === undefined || !category) {
      return res.status(400).json({ error: "Missing required product fields" });
    }

    const newProduct = new Product({
      name,
      description,
      price,
      stock,
      category,
      embedding: embedding || Array(384).fill(0) // Default zero vector if not provided
    });

    await newProduct.save();

    // Evict all stale paginated catalog cache blocks
    await invalidateCatalogCache();

    return res.status(201).json({
      message: "Product created successfully",
      product: newProduct
    });
  } catch (error) {
    return res.status(500).json({ error: (error as Error).message });
  }
});

// PUT /api/products/:id - Update product details (Admin Only)
router.put("/:id", verifyToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const updatedProduct = await Product.findByIdAndUpdate(id, updates, { new: true, runValidators: true });

    if (!updatedProduct) {
      return res.status(404).json({ error: "Product not found" });
    }

    // Evict all stale paginated catalog cache blocks
    await invalidateCatalogCache();

    return res.json({
      message: "Product updated successfully",
      product: updatedProduct
    });
  } catch (error) {
    return res.status(500).json({ error: (error as Error).message });
  }
});

// DELETE /api/products/:id - Remove product from catalog (Admin Only)
router.delete("/:id", verifyToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deletedProduct = await Product.findByIdAndDelete(id);

    if (!deletedProduct) {
      return res.status(404).json({ error: "Product not found" });
    }

    // Evict all stale paginated catalog cache blocks
    await invalidateCatalogCache();

    return res.json({
      message: "Product deleted successfully"
    });
  } catch (error) {
    return res.status(500).json({ error: (error as Error).message });
  }
});

export default router;
