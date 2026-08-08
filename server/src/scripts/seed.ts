import dotenv from "dotenv";
import Product from "../models/Product";
import { connectDB } from "../config/db";
import { getEmbedding } from "../services/embedding.service";

dotenv.config();

const categories = ["Electronics", "Clothing", "Home & Kitchen", "Books", "Sports & Outdoors", "Beauty & Care"];
const adjectives = ["Premium", "Ultra-light", "Eco-friendly", "Durable", "Classic", "Modern", "Portable", "Ergonomic", "Smart", "Compact"];
const nouns = {
  Electronics: ["Wireless Earbuds", "Smart Watch", "Bluetooth Speaker", "Charging Dock", "Phone Case", "LED Monitor", "Mechanical Keyboard"],
  Clothing: ["Winter Hooded Jacket", "Cotton T-Shirt", "Running Shoes", "Athletic Socks", "Leather Belt", "Denim Jeans", "Woolen Beanie"],
  "Home & Kitchen": ["Coffee Maker", "Air Fryer", "Vacuum Cleaner", "Non-stick Skillet", "Food Blender", "Water Purifier", "Silicone Spatula Set"],
  Books: ["Mystery Novel", "Sci-Fi Trilogy", "Self-Help Journal", "Cooking Masterclass", "Coding Handbook", "History Encyclopedia"],
  "Sports & Outdoors": ["Camping Tent", "Waterproof Backpack", "Yoga Mat", "Dumbbell Set", "Sleeping Bag", "Bicycle Helmet", "Hiking Poles"],
  "Beauty & Care": ["Face Moisturizer", "Sunscreen Lotion", "Hair Dryer", "Organic Shampoo", "Electric Toothbrush", "Beard Oil"]
};

// Generates a fallback vector embedding (384 dimensions)
const generateMockEmbedding = (dimensions = 384): number[] => {
  return Array.from({ length: dimensions }, () => parseFloat((Math.random() * 2 - 1).toFixed(6)));
};

const seedDatabase = async () => {
  try {
    // 1. Connect to Database
    await connectDB();

    console.log("[Seeder] Clearing existing products from database...");
    await Product.deleteMany({});

    console.log("[Seeder] Generating 120 catalog products with real AI vector embeddings...");
    const mockProducts = [];

    for (let i = 1; i <= 120; i++) {
      const category = categories[Math.floor(Math.random() * categories.length)] as keyof typeof nouns;
      const adjective = adjectives[Math.floor(Math.random() * adjectives.length)] ?? "Premium";
      const item = nouns[category][Math.floor(Math.random() * nouns[category].length)] ?? "Product";

      const name = `${adjective} ${item} - Model v${i}`;
      const description = `This is a ${adjective.toLowerCase()} ${item.toLowerCase()} designed for premium performance. Built with quality materials to ensure durability and style. Ideal for everyday use under various conditions.`;
      const price = parseFloat((Math.random() * 4900 + 100).toFixed(2));
      const stock = Math.floor(Math.random() * 80) + 5;

      console.log(`[Seeder] Computing vector embedding ${i}/120: ${name}`);
      let embedding: number[];
      try {
        embedding = await getEmbedding(`${name} ${description}`);
      } catch (err) {
        console.warn(`[Seeder] Failed to compute embedding, using mock fallback: ${(err as Error).message}`);
        embedding = generateMockEmbedding(384);
      }

      mockProducts.push({
        name,
        description,
        price,
        stock,
        category,
        embedding
      });
    }

    console.log("[Seeder] Inserting 120 products into MongoDB...");
    await Product.insertMany(mockProducts);

    console.log("==========================================");
    console.log("✅ [SUCCESS] Database successfully seeded with 120 high-fidelity products!");
    console.log("==========================================");

    process.exit(0);
  } catch (error) {
    console.error(`❌ [Seeder Error] ${(error as Error).message}`);
    process.exit(1);
  }
};

seedDatabase();
