import mongoose, { Document, Schema } from "mongoose";

export type OrderStatus = "Pending" | "Confirmed" | "Packed" | "Shipped" | "Delivered" | "Cancelled";

export interface IOrderItem {
  product: mongoose.Types.ObjectId;
  name: string;
  price: number;
  quantity: number;
}

export interface IOrder extends Document {
  orderNumber: string;
  user: mongoose.Types.ObjectId;
  customerName: string;
  customerEmail: string;
  items: IOrderItem[];
  totalAmount: number;
  shippingAddress: string;
  paymentMethod: "Card" | "Cash on Delivery";
  status: OrderStatus;
  createdAt: Date;
  updatedAt: Date;
}

const OrderItemSchema = new Schema<IOrderItem>({
  product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
  name: { type: String, required: true, trim: true },
  price: { type: Number, required: true, min: 0 },
  quantity: { type: Number, required: true, min: 1 }
}, { _id: false });

const OrderSchema = new Schema<IOrder>(
  {
    orderNumber: { type: String, required: true, unique: true, index: true },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    customerName: { type: String, required: true, trim: true },
    customerEmail: { type: String, required: true, lowercase: true, trim: true },
    items: { type: [OrderItemSchema], required: true, validate: (items: IOrderItem[]) => items.length > 0 },
    totalAmount: { type: Number, required: true, min: 0 },
    shippingAddress: { type: String, required: true, trim: true },
    paymentMethod: { type: String, enum: ["Card", "Cash on Delivery"], required: true },
    status: { type: String, enum: ["Pending", "Confirmed", "Packed", "Shipped", "Delivered", "Cancelled"], default: "Pending" }
  },
  { timestamps: true }
);

OrderSchema.set("toJSON", {
  transform: (_: unknown, ret: any) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

export default mongoose.model<IOrder>("Order", OrderSchema);
