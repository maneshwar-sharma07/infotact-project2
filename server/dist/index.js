"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const http_1 = require("http"); // <-- Imported HTTP server creator
const db_1 = require("./config/db");
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const product_routes_1 = __importDefault(require("./routes/product.routes"));
const order_routes_1 = __importDefault(require("./routes/order.routes"));
const socketServer_1 = require("./socket/socketServer");
// Load environment variables
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
// Create HTTP server wrapping the Express app
const httpServer = (0, http_1.createServer)(app);
// Enable Middlewares
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Register Routes
app.use("/api/auth", auth_routes_1.default);
app.use("/auth", auth_routes_1.default);
app.use("/api/products", product_routes_1.default);
app.use("/api/orders", order_routes_1.default);
// Initialize Socket.IO server adapter
(0, socketServer_1.initSocketServer)(httpServer);
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
        // Start listening on the HTTP server
        httpServer.listen(PORT, () => {
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