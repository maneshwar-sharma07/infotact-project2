import { Link } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { useWishlist } from "../../context/WishlistContext";

import type { StoreProduct } from "../../types/ecommerce";

export interface Product extends StoreProduct {}

interface ProductCardProps {
  product: Product;
}

const fallbackImages = [
  "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=900&q=85",
  "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=900&q=85",
  "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=85",
  "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=900&q=85",
];

const imageForProduct = (product: Product) =>
  product.imageUrl || fallbackImages[product.name.length % fallbackImages.length];

export default function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();
  const { toggleItem, hasItem } = useWishlist();

  const isInStock = product.stock > 0;
  const isWishlisted = hasItem(product.id);

  return (
    <article className="group overflow-hidden rounded-2xl border border-gray-800 bg-[#111118] shadow-xl shadow-black/20 transition duration-300 hover:-translate-y-1 hover:border-purple-500/70 hover:shadow-2xl hover:shadow-purple-950/40">
      <div className="relative overflow-hidden bg-[#171722]">
        <img
          src={imageForProduct(product)}
          alt={product.name}
          className="h-56 w-full object-cover transition duration-500 group-hover:scale-110"
        />

        <span className="absolute left-3 top-3 rounded-full bg-cyan-400 px-3 py-1 text-xs font-bold text-[#0A0A0F]">
          {product.category}
        </span>

        <span className="absolute right-3 top-3 rounded-full bg-yellow-300 px-3 py-1 text-xs font-bold text-[#16120a]">
          ★ {product.rating ?? 4.8}
        </span>
      </div>

      <div className="p-5">
        <h2 className="truncate text-xl font-bold text-white">
          {product.name}
        </h2>

        <p className="mt-2 min-h-10 text-sm leading-5 text-gray-400">
          {product.description}
        </p>

        <div className="mt-5 flex items-center justify-between">
          <span className="text-2xl font-bold text-purple-400">
            ₹{product.price.toLocaleString("en-IN")}
          </span>

          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ${
              isInStock
                ? "bg-emerald-400/10 text-emerald-300"
                : "bg-red-400/10 text-red-300"
            }`}
          >
            {isInStock ? `${product.stock} in stock` : "Out of stock"}
          </span>
        </div>

        <Link
          to={`/product/${product.id}`}
          className="mt-5 block rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 py-3 text-center text-sm font-semibold text-white transition hover:brightness-110"
        >
          View Details
        </Link>

        <div className="mt-3 flex gap-3">
          <button
            type="button"
            disabled={!isInStock}
            onClick={() => addItem(product)}
            className="flex-1 rounded-xl bg-cyan-500 py-3 font-semibold text-[#0A0A0F] transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            🛒 Add to Cart
          </button>

          <button
            type="button"
            onClick={() => toggleItem(product)}
            className={`rounded-xl px-4 py-3 font-semibold transition ${
              isWishlisted
                ? "bg-pink-600 text-white"
                : "bg-[#1d1d27] text-gray-300 hover:bg-pink-600 hover:text-white"
            }`}
          >
            {isWishlisted ? "❤" : "♡"}
          </button>
        </div>
      </div>
    </article>
  );
}