import dotenv from "dotenv";
import Product from "../models/Product";
import { connectDB } from "../config/db";

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

// Generates a mock vector embedding (384 dimensions) with values between -1 and 1
const generateMockEmbedding = (dimensions = 384): number[] => {
  return Array.from({ length: dimensions }, () => parseFloat((Math.random() * 2 - 1).toFixed(6)));
};

const seedDatabase = async () => {
  try {
    // Establish connection to database
    await connectDB();

    console.log("[Seeder] Clearing existing products...");
    await Product.deleteMany({});

    console.log("[Seeder] Generating 1000 mock products with vector embeddings...");
    const mockProducts = [];

    for (let i = 1; i <= 1000; i++) {
      const category = categories[Math.floor(Math.random() * categories.length)] as keyof typeof nouns;
      const adjective = adjectives[Math.floor(Math.random() * adjectives.length)]!;
      const item = nouns[category][Math.floor(Math.random() * nouns[category].length)]!;
      
      const name = `${adjective} ${item} - Model v${i}`;
      const description = `This is a ${adjective.toLowerCase()} ${item.toLowerCase()} designed for premium performance. Built with quality materials to ensure durability and style. Ideal for everyday use under various conditions.`;
      const price = parseFloat((Math.random() * 490 + 10).toFixed(2)); // $10 - $500
      const stock = Math.floor(Math.random() * 100) + 5; // 5 - 104
      const embedding = generateMockEmbedding(384);

      mockProducts.push({
        name,
        description,
        price,
        stock,
        category,
        embedding
      });
    }

    console.log("[Seeder] Inserting mock products into MongoDB...");
    await Product.insertMany(mockProducts);

    console.log("[Seeder] Successfully seeded 1000 products!");
    process.exit(0);
  } catch (error) {
    console.error(`[Seeder] Error during database seeding: ${(error as Error).message}`);
    process.exit(1);
  }
};

seedDatabase();
