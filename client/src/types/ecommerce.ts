export type StoreProduct = { id: string; name: string; description: string; price: number; category: string; stock: number; imageUrl?: string; rating?: number };
export type CartItem = StoreProduct & { quantity: number };
export type StoredOrder = { id: string; placedAt: string; status: "Confirmed" | "Processing" | "Delivered"; total: number; items: CartItem[]; address: string; paymentMethod: string };
export type OrderStatus = "Pending" | "Confirmed" | "Packed" | "Shipped" | "Delivered" | "Cancelled";
export type ApiOrder = { id: string; _id?: string; orderNumber: string; user: string; customerName: string; customerEmail: string; items: Array<{ product: string; name: string; price: number; quantity: number }>; totalAmount: number; shippingAddress: string; paymentMethod: "Card" | "Cash on Delivery"; status: OrderStatus; createdAt: string };
export type Profile = { phone: string; address: string };
