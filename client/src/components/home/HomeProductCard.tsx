import { Link } from "react-router-dom";
import { FALLBACK_PRODUCT_IMAGE, type HomeProduct } from "./productData";
import { useCart } from "../../context/CartContext";
import { useWishlist } from "../../context/WishlistContext";

type HomeProductCardProps = { product: HomeProduct; compact?: boolean };

const price = (amount: number) => `₹${amount.toLocaleString("en-IN")}`;

export default function HomeProductCard({ product, compact = false }: HomeProductCardProps) {
  const { addItem } = useCart(); const { hasItem, toggleItem } = useWishlist();
  const card = (
    <>
      <div className={`relative overflow-hidden bg-[#171722] ${compact ? "h-40" : "h-48"}`}>
        <img src={product.imageUrl || FALLBACK_PRODUCT_IMAGE} alt={product.name} className="h-full w-full object-cover transition duration-500 group-hover:scale-110" />
        <span className="absolute left-3 top-3 rounded-full bg-cyan-400 px-2.5 py-1 text-xs font-bold text-[#0A0A0F]">{product.category}</span>
        <span className="absolute right-3 top-3 rounded-full bg-yellow-300 px-2.5 py-1 text-xs font-bold text-[#16120a]">★ {product.rating ?? 4.8}</span><button type="button" onClick={(event) => { event.preventDefault(); toggleItem(product); }} aria-label="Toggle wishlist" className={`absolute bottom-3 right-3 grid h-9 w-9 place-items-center rounded-full border transition ${hasItem(product.id) ? "border-red-300 bg-red-500 text-white" : "border-white/30 bg-[#0A0A0F]/80 text-white hover:border-cyan-300"}`}>♥</button>
      </div>
      <div className="p-4">
        <h3 className="truncate font-bold text-white">{product.name}</h3>
        {!compact && <p className="mt-2 line-clamp-2 min-h-10 text-sm leading-5 text-gray-400">{product.description}</p>}
        <div className="mt-4 flex items-center justify-between gap-2">
          <span className="text-xl font-bold text-purple-400">{price(product.price)}</span>
          <span className={`text-xs font-semibold ${product.stock > 0 ? "text-emerald-300" : "text-red-300"}`}>{product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}</span>
        </div>{!compact && <button type="button" onClick={(event) => { event.preventDefault(); addItem(product); }} disabled={!product.stock} className="mt-4 w-full rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 py-2.5 text-sm font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50">Add to Cart</button>}
      </div>
    </>
  );
  const className = "group block overflow-hidden rounded-2xl border border-gray-800 bg-[#111118] shadow-xl shadow-black/20 transition duration-300 hover:-translate-y-1 hover:border-purple-500/70 hover:shadow-purple-950/40";

  return product.isDemo ? <article className={className}>{card}</article> : <Link to={`/product/${product.id}`} className={className}>{card}</Link>;
}
