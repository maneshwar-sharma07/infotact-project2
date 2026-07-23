export type StoreProduct = { id: string; name: string; description: string; price: number; category: string; stock: number; imageUrl?: string; rating?: number };
export type CartItem = StoreProduct & { quantity: number };
export type StoredOrder = { id: string; placedAt: string; status: "Confirmed" | "Processing" | "Delivered"; total: number; items: CartItem[]; address: string; paymentMethod: string };
export type Profile = { phone: string; address: string };
