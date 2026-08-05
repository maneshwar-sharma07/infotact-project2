"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const Product_1 = __importDefault(require("../models/Product"));
const db_1 = require("../config/db");
const embedding_service_1 = require("../services/embedding.service");
dotenv_1.default.config();
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
const generateMockEmbedding = (dimensions = 384) => {
    return Array.from({ length: dimensions }, () => parseFloat((Math.random() * 2 - 1).toFixed(6)));
};
const seedDatabase = async () => {
    try {
        // 1. Connect to Database
        await (0, db_1.connectDB)();
        console.log("[Seeder] Clearing existing products from database...");
        await Product_1.default.deleteMany({});
        console.log("[Seeder] Pre-computing category AI embeddings...");
        const baseEmbeddingMap = {};
        for (const cat of categories) {
            try {
                console.log(`[Seeder] Computing base vector for category: ${cat}`);
                baseEmbeddingMap[cat] = await (0, embedding_service_1.getEmbedding)(`High performance ${cat} product for everyday usage`);
            }
            catch (err) {
                baseEmbeddingMap[cat] = generateMockEmbedding(384);
            }
        }
        console.log("[Seeder] Generating 1000 catalog products...");
        const mockProducts = [];
        for (let i = 1; i <= 1000; i++) {
            const category = categories[Math.floor(Math.random() * categories.length)];
            const adjective = adjectives[Math.floor(Math.random() * adjectives.length)] ?? "Premium";
            const item = nouns[category][Math.floor(Math.random() * nouns[category].length)] ?? "Product";
            const name = `${adjective} ${item} - Model v${i}`;
            const description = `This is a ${adjective.toLowerCase()} ${item.toLowerCase()} designed for premium performance. Built with quality materials to ensure durability and style. Ideal for everyday use under various conditions.`;
            const price = parseFloat((Math.random() * 490 + 10).toFixed(2));
            const stock = Math.floor(Math.random() * 100) + 5;
            const baseVector = baseEmbeddingMap[category] || generateMockEmbedding(384);
            const embedding = baseVector.map(val => parseFloat((val + (Math.random() * 0.08 - 0.04)).toFixed(6)));
            mockProducts.push({
                name,
                description,
                price,
                stock,
                category,
                embedding
            });
        }
        console.log("[Seeder] Inserting 1000 products into MongoDB...");
        await Product_1.default.insertMany(mockProducts);
        console.log("==========================================");
        console.log("✅ [SUCCESS] Database successfully seeded with 1,000 products!");
        console.log("==========================================");
        process.exit(0);
    }
    catch (error) {
        console.error(`❌ [Seeder Error] ${error.message}`);
        process.exit(1);
    }
};
seedDatabase();
//# sourceMappingURL=seed.js.map