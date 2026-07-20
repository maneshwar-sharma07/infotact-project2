import { Link } from "react-router-dom";

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  imageUrl?: string;
}

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <div className="group overflow-hidden rounded-2xl border border-gray-800 bg-[#111118] transition-all duration-300 hover:-translate-y-2 hover:border-purple-500 hover:shadow-2xl hover:shadow-purple-500/20">

      {/* Image */}

      <div className="relative overflow-hidden">

        <img
          src={
            product.imageUrl ??
            "https://placehold.co/600x400/1F2937/FFFFFF?text=No+Image"
          }
          alt={product.name}
          className="h-64 w-full object-cover transition duration-500 group-hover:scale-110"
        />

        <span className="absolute left-4 top-4 rounded-full bg-cyan-500 px-3 py-1 text-xs font-semibold text-black">
          {product.category}
        </span>

        <span className="absolute right-4 top-4 rounded-full bg-yellow-400 px-3 py-1 text-xs font-bold text-black">
          ⭐ 4.8
        </span>

      </div>

      {/* Content */}

      <div className="p-6">

        <h2 className="text-2xl font-bold text-white">
          {product.name}
        </h2>

        <p className="mt-3 line-clamp-2 text-gray-400">
          {product.description}
        </p>

        <div className="mt-6 flex items-center justify-between">

          <span className="text-3xl font-bold text-purple-400">
            ₹{product.price}
          </span>

          <span
            className={`rounded-full px-3 py-1 text-sm font-semibold ${
              product.stock > 0
                ? "bg-green-500/20 text-green-400"
                : "bg-red-500/20 text-red-400"
            }`}
          >
            {product.stock > 0 ? "In Stock" : "Out of Stock"}
          </span>

        </div>

        <Link
          to={`/product/${product.id}`}
          className="mt-6 block rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 py-3 text-center font-semibold text-white transition hover:opacity-90"
        >
          View Details →
        </Link>

      </div>

    </div>
  );
}