import { Link } from "react-router-dom";

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
}

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  return (
  <div className="bg-[#111118] rounded-2xl border border-gray-800 overflow-hidden hover:-translate-y-2 hover:border-purple-500 hover:shadow-2xl hover:shadow-purple-500/20 transition-all duration-300">
    <img
      src={
        product.imageUrl ??
        "https://placehold.co/600x400/1F2937/FFFFFF?text=No+Image"
      }
      alt={product.name}
      className="w-full h-60 object-cover"
    />

      <div className="p-4">

        <span className="text-cyan-400 text-sm">
          {product.category}
        </span>

        <h2 className="text-xl font-bold text-white mt-2">
          {product.name}
        </h2>

        <p className="text-gray-400 text-sm mt-2">
          {product.description}
        </p>

        <div className="flex justify-between items-center mt-4">

          <span className="text-purple-400 text-2xl font-bold">
            ₹{product.price}
          </span>

          <span className="text-green-400">
            {product.stock} In Stock
          </span>

        </div>

        <Link
          to={`/product/${product.id}`}
          className="block mt-5 bg-purple-600 hover:bg-purple-700 text-center py-2 rounded-lg text-white font-semibold transition"
        >
          View Details
        </Link>

      </div>

    </div>
  );
}