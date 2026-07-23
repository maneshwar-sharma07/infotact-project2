import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { StoreProduct } from "../types/ecommerce";
import { useToast } from "./ToastContext";
type WishlistContextValue = { items: StoreProduct[]; hasItem: (id: string) => boolean; toggleItem: (product: StoreProduct) => void };
const WishlistContext = createContext<WishlistContextValue | undefined>(undefined); const WISHLIST_KEY = "shopsphere-wishlist";
const getStoredItems = (): StoreProduct[] => { try { return JSON.parse(localStorage.getItem(WISHLIST_KEY) || "[]") as StoreProduct[]; } catch { return []; } };
export function WishlistProvider({ children }: { children: ReactNode }) { const [items, setItems] = useState<StoreProduct[]>(getStoredItems); const { notify } = useToast(); useEffect(() => { localStorage.setItem(WISHLIST_KEY, JSON.stringify(items)); }, [items]); const value = useMemo<WishlistContextValue>(() => ({ items, hasItem: (id) => items.some((item) => item.id === id), toggleItem: (product) => { const exists = items.some((item) => item.id === product.id); setItems((current) => exists ? current.filter((item) => item.id !== product.id) : [...current, product]); notify(exists ? "Removed from wishlist." : "Added to wishlist.", "info"); } }), [items, notify]); return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>; }
export function useWishlist() { const context = useContext(WishlistContext); if (!context) throw new Error("useWishlist must be used within WishlistProvider."); return context; }
