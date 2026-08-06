import { Router } from "express";
import type { Request, Response } from "express";


import Product from "../models/Product";
import { verifyToken, requireAdmin } from "../middleware/auth";
import { getOrSetCache, invalidateCatalogCache } from "../middleware/cache";
import { getEmbedding } from "../services/embedding.service";
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

// GET /api/products/search/keyword - Fallback regex-based keyword search (Cached)
router.get("/search/keyword", async (req: Request, res: Response) => {
  try {
    const query = req.query.query as string;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    if (!query || query.trim() === "") {
      return res.status(400).json({ error: "Search query is required" });
    }

    const cleanQuery = query.trim();
    // Cache search results for 5 minutes with query-specific keys
    const cacheKey = `search:keyword:query:${cleanQuery.toLowerCase()}:page:${page}:limit:${limit}`;

    const result = await getOrSetCache(cacheKey, async () => {
      // Search in name or description using case-insensitive regex
      const searchFilter = {
        $or: [
          { name: { $regex: cleanQuery, $options: "i" } },
          { description: { $regex: cleanQuery, $options: "i" } }
        ]
      };

      const products = await Product.find(searchFilter)
        .skip(skip)
        .limit(limit);

      const totalProducts = await Product.countDocuments(searchFilter);

      return {
        products,
        pagination: {
          totalProducts,
          currentPage: page,
          totalPages: Math.ceil(totalProducts / limit),
          pageSize: products.length
        }
      };
    }, 300); // 5 minutes cache TTL

    return res.json(result);
  } catch (error) {
    return res.status(500).json({ error: (error as Error).message });
  }
});

// GET /api/products/semantic-search - AI Vector Semantic Search (Cached)
router.get("/semantic-search", async (req: Request, res: Response) => {
  try {
    const query = req.query.query as string;
    const limit = parseInt(req.query.limit as string) || 10;

    if (!query || query.trim() === "") {
      return res.status(400).json({ error: "Search query string is required" });
    }

    const cleanQuery = query.trim();
    const cacheKey = `search:semantic:query:${cleanQuery.toLowerCase()}:limit:${limit}`;

    const result = await getOrSetCache(cacheKey, async () => {
      // 1. Generate 384-dimensional query vector using local HuggingFace AI pipeline
      const queryVector = await getEmbedding(cleanQuery);

      // 2. Perform Cosine Similarity Vector Search in MongoDB
      let products;
      try {
        products = await Product.aggregate([
          {
            $vectorSearch: {
              index: "vector_index",
              path: "embedding",
              queryVector: queryVector,
              numCandidates: 100,
              limit: limit
            }
          },
          {
            $project: {
              name: 1,
              description: 1,
              price: 1,
              stock: 1,
              category: 1,
              score: { $meta: "vectorSearchScore" }
            }
          }
        ]);
      } catch (aggregationErr) {
        // Fallback for local MongoDB standalone instances where Atlas Vector Index is not pre-configured
        products = await Product.find({
          $or: [
            { name: { $regex: cleanQuery, $options: "i" } },
            { description: { $regex: cleanQuery, $options: "i" } }
          ]
        }).limit(limit);
      }

      return {
        products,
        count: products.length,
        query: cleanQuery
      };
    }, 300); // 5 minutes cache TTL

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
// POST /api/products - Create a new product (Admin Only)
router.post("/", verifyToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { name, description, price, stock, category, imageUrl, embedding } = req.body;

    if (!name || !description || price === undefined || stock === undefined || !category) {
      return res.status(400).json({ error: "Missing required product fields" });
    }

    const newProduct = new Product({
      name,
      description,
      price,
      stock,
      category,
      imageUrl,
      embedding: Array.isArray(embedding) && embedding.length === 384 ? embedding : Array(384).fill(0)
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
