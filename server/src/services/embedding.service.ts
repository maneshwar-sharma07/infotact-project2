import { pipeline } from "@xenova/transformers";

// Singleton pipeline instance to prevent redundant model loads
let extractorPipeline: any = null;

/**
 * Initializes and retrieves the local feature-extraction pipeline (all-MiniLM-L6-v2).
 */
const getPipeline = async () => {
  if (!extractorPipeline) {
    console.log("[AI Embedding Service] Initializing local HuggingFace feature-extraction pipeline (all-MiniLM-L6-v2)...");
    extractorPipeline = await pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2");
    console.log("[AI Embedding Service] Pipeline initialized successfully!");
  }
  return extractorPipeline;
};

/**
 * Generates a real 384-dimensional normalized vector embedding for a given text input.
 * @param text Product description or search query string
 * @returns Array of numbers representing 384-dimensional feature vector
 */
export const getEmbedding = async (text: string): Promise<number[]> => {
  try {
    const generateEmbedding = await getPipeline();

    // Perform feature extraction with mean pooling and normalization
    const output = await generateEmbedding(text, { pooling: "mean", normalize: true });

    // Convert Float32Array output to standard JavaScript Array
    const vector = Array.from(output.data as Float32Array);
    return vector;
  } catch (error) {
    console.error(`[AI Embedding Service] Error generating embedding: ${(error as Error).message}. Falling back to zero vector.`);
    // Fallback 384-dimensional vector if local model load fails
    return new Array(384).fill(0);
  }
};
