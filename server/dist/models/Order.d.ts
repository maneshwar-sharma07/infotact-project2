import mongoose, { Document } from "mongoose";
export type OrderStatus = "Pending" | "Confirmed" | "Packed" | "Shipped" | "Delivered" | "Cancelled";
export interface IOrderItem {
    product: mongoose.Types.ObjectId;
    name: string;
    price: number;
    quantity: number;
    imageUrl?: string;
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
declare const _default: mongoose.Model<IOrder, {}, {}, {}, mongoose.Document<unknown, {}, IOrder, {}, mongoose.DefaultSchemaOptions> & IOrder & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IOrder>;
export default _default;
//# sourceMappingURL=Order.d.ts.map