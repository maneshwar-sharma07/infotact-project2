import { Router, Request, Response } from "express";
import Product from "../models/Product.js";

const router = Router();

// GET /api/products - Retrieve product list with pagination, sorting, and category filters
router.get("/", async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const category = req.query.category as string;
    const sortBy = req.query.sortBy as string; // 'price_asc' | 'price_desc' | 'newest'

    const filter: Record<string, any> = {};
    if (category) {
      filter.category = category;
    }

    let sortOption: Record<string, any> = { createdAt: -1 }; // Default: newest
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

    return res.json({
      products,
      pagination: {
        totalProducts,
        currentPage: page,
        totalPages: Math.ceil(totalProducts / limit),
        pageSize: products.length
      }
    });
  } catch (error) {
    return res.status(500).json({ error: (error as Error).message });
  }
});

// GET /api/products/:id - Retrieve specific product details
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    return res.json(product);
  } catch (error) {
    return res.status(500).json({ error: (error as Error).message });
  }
});

export default router;
