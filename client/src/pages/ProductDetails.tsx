import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import ProductInfo from "../components/product/ProductInfo";
import RelatedProducts from "../components/product/RelatedProducts";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import api from "../services/api";
import type { StoreProduct } from "../types/ecommerce";

const fallbackImage = "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=1200&q=85";

export default function ProductDetails() {
  const { id } = useParams<{ id: string }>();
  const { addItem } = useCart();
  const { hasItem, toggleItem } = useWishlist();
  const [product, setProduct] = useState<StoreProduct | null>(null);
  const [catalog, setCatalog] = useState<StoreProduct[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) { setError("Invalid product id."); setLoading(false); return; }
    let active = true;
    const loadProduct = async () => {
      setLoading(true); setError(""); setQuantity(1);
      try {
        const [productResponse, catalogResponse] = await Promise.all([api.get<StoreProduct>(`/products/${id}`), api.get<{ products?: StoreProduct[] }>("/products")]);
        if (!active) return;
        setProduct(productResponse.data);
        setCatalog(catalogResponse.data.products ?? []);
      } catch {
        if (active) { setProduct(null); setError("We couldn't find this product. It may have been removed or is temporarily unavailable."); }
      } finally { if (active) setLoading(false); }
    };
    void loadProduct();
    return () => { active = false; };
  }, [id]);

  const relatedProducts = useMemo(() => catalog.filter((item) => item.id !== product?.id && item.category === product?.category).slice(0, 4), [catalog, product]);
  if (loading) return <main className="mx-auto min-h-[70vh] max-w-7xl px-4 py-10 sm:px-6"><div className="grid animate-pulse gap-8 overflow-hidden rounded-3xl border border-gray-800 bg-[#111118] lg:grid-cols-2"><div className="min-h-96 bg-[#171722]" /><div className="space-y-6 p-8"><div className="h-6 w-28 rounded bg-white/10" /><div className="h-12 w-3/4 rounded bg-white/10" /><div className="h-28 rounded bg-white/10" /></div></div></main>;
  if (!product) return <main className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center"><h1 className="text-3xl font-bold text-white">Product unavailable</h1><p className="mt-3 max-w-md text-gray-400">{error}</p><Link to="/catalog" className="mt-7 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 px-5 py-3 font-semibold text-white transition hover:brightness-110">Continue Shopping</Link></main>;
  return <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:py-12"><Link to="/catalog" className="inline-flex items-center rounded-lg px-3 py-2 text-sm font-semibold text-cyan-300 transition hover:bg-white/5 hover:text-cyan-200">&larr; Continue Shopping</Link><section className="mt-5 overflow-hidden rounded-3xl border border-gray-800 bg-[#111118] shadow-2xl shadow-black/30 lg:grid lg:grid-cols-2"><div className="relative min-h-80 overflow-hidden bg-[#171722]"><img src={product.imageUrl || fallbackImage} alt={product.name} className="h-full min-h-80 w-full object-cover" /><div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-[#0A0A0F]/50 to-transparent" /></div><ProductInfo product={product} quantity={quantity} isWishlisted={hasItem(product.id)} onQuantityChange={setQuantity} onAddToCart={() => addItem(product, quantity)} onToggleWishlist={() => toggleItem(product)} /></section><RelatedProducts products={relatedProducts} /></main>;
}
