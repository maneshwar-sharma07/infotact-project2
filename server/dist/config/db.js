"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDB = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/infotact_project2";
const connectDB = async () => {
    try {
        const conn = await mongoose_1.default.connect(MONGO_URI);
        console.log(`[Database] Connected successfully to MongoDB host: ${conn.connection.host}`);
    }
    catch (error) {
        console.error(`[Database] Error connecting to MongoDB: ${error.message}`);
        throw error;
    }
};
exports.connectDB = connectDB;
//# sourceMappingURL=db.js.map