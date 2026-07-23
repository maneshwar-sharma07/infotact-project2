import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { CartItem, StoreProduct } from "../types/ecommerce";
import { useToast } from "./ToastContext";

type CartContextValue = { items: CartItem[]; itemCount: number; total: number; addItem: (product: StoreProduct, quantity?: number) => void; updateQuantity: (id: string, quantity: number) => void; removeItem: (id: string) => void; clearCart: () => void };
const CartContext = createContext<CartContextValue | undefined>(undefined);
const CART_KEY = "shopsphere-cart";
const getStoredItems = (): CartItem[] => { try { return JSON.parse(localStorage.getItem(CART_KEY) || "[]") as CartItem[]; } catch { return []; } };

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(getStoredItems); const { notify } = useToast();
  useEffect(() => { localStorage.setItem(CART_KEY, JSON.stringify(items)); }, [items]);
  const value = useMemo<CartContextValue>(() => ({
    items, itemCount: items.reduce((sum, item) => sum + item.quantity, 0), total: items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    addItem: (product, quantity = 1) => { if (!product.stock) { notify("This product is currently out of stock.", "error"); return; } setItems((current) => { const existing = current.find((item) => item.id === product.id); return existing ? current.map((item) => item.id === product.id ? { ...item, quantity: Math.min(item.quantity + quantity, product.stock) } : item) : [...current, { ...product, quantity: Math.min(quantity, product.stock) }]; }); notify(`${product.name} added to cart.`); },
    updateQuantity: (id, quantity) => setItems((current) => current.flatMap((item) => item.id !== id ? [item] : quantity <= 0 ? [] : [{ ...item, quantity: Math.min(quantity, item.stock) }])),
    removeItem: (id) => { setItems((current) => current.filter((item) => item.id !== id)); notify("Item removed from cart.", "info"); },
    clearCart: () => setItems([]),
  }), [items, notify]);
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
export function useCart() { const context = useContext(CartContext); if (!context) throw new Error("useCart must be used within CartProvider."); return context; }
