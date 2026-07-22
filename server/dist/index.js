"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const db_1 = require("./config/db");
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const product_routes_1 = __importDefault(require("./routes/product.routes"));
// Load environment variables
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
// Enable Middlewares
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Register Routes
app.use("/auth", auth_routes_1.default);
app.use("/api/products", product_routes_1.default);
// Base health endpoint
app.get("/health", (req, res) => {
    res.json({
        status: "ok",
        message: "High-Performance E-Commerce Engine backend active.",
        timestamp: new Date()
    });
});
const startServer = async () => {
    try {
        await (0, db_1.connectDB)();
        app.listen(PORT, () => {
            console.log(`[Server] Running on http://localhost:${PORT}`);
        });
    }
    catch (error) {
        console.error(`[Server] Startup failed: ${error.message}`);
        process.exitCode = 1;
    }
};
void startServer();
//# sourceMappingURL=index.js.map