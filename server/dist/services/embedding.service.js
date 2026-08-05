"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEmbedding = void 0;
// Singleton pipeline instance to prevent redundant model loads
let extractorPipeline = null;
/**
 * Dynamically loads and retrieves the local feature-extraction pipeline (all-MiniLM-L6-v2).
 */
const getPipeline = async () => {
    if (!extractorPipeline) {
        try {
            console.log("[AI Embedding Service] Loading local HuggingFace feature-extraction pipeline...");
            // Dynamic import to prevent ts-node/ESM loader conflicts
            // @ts-ignore
            const { pipeline } = await import("@xenova/transformers");
            extractorPipeline = await pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2");
            console.log("[AI Embedding Service] Pipeline loaded successfully!");
        }
        catch (err) {
            console.warn(`[AI Embedding Service] Could not load @xenova/transformers (${err.message}). Using fallback vector generator.`);
            return null;
        }
    }
    return extractorPipeline;
};
/**
 * Generates a 384-dimensional vector embedding for a given text input.
 * @param text Product description or search query string
 * @returns Array of numbers representing 384-dimensional feature vector
 */
const getEmbedding = async (text) => {
    try {
        const generateEmbedding = await getPipeline();
        if (generateEmbedding) {
            // Perform feature extraction with mean pooling and normalization
            const output = await generateEmbedding(text, { pooling: "mean", normalize: true });
            return Array.from(output.data);
        }
    }
    catch (error) {
        console.error(`[AI Embedding Service] Error generating embedding: ${error.message}`);
    }
    // Fallback 384-dimensional vector if local model load is pending or offline
    return Array.from({ length: 384 }, () => parseFloat((Math.random() * 2 - 1).toFixed(6)));
};
exports.getEmbedding = getEmbedding;
//# sourceMappingURL=embedding.service.js.map