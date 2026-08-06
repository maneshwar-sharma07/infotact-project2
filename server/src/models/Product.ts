import mongoose, { Schema, Document } from "mongoose";

export interface IProduct extends Document {
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  imageUrl?: string;
  embedding: number[]; // Vector representation array (e.g., 384 or 1536 elements)
}

const ProductSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    stock: { type: Number, required: true, min: 0 },
    category: { type: String, required: true },
    imageUrl: { type: String, trim: true },
    embedding: { type: [Number], required: true }
  },
  {
    timestamps: true
  }
);

// Serialization safety: rename _id -> id, delete __v, hide raw embedding vector from standard client responses
ProductSchema.set("toJSON", {
  transform: (_doc, ret: Record<string, any>) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    delete ret.embedding; // Hidden to keep API payload small
    return ret;
  }
});

export default mongoose.model<IProduct>("Product", ProductSchema);
