import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import ProductGrid from "../components/catalog/ProductGrid";
import { Product } from "../components/catalog/ProductCard";

export default function CatalogPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const response = await api.get("/products");
      setProducts(response.data.products || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center text-white text-2xl">
        Loading Products...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white">

      {/* Header */}
    <header className="border-b border-gray-800 bg-gradient-to-r from-[#0A0A0F] via-[#111118] to-[#0A0A0F]">

      <div className="max-w-7xl mx-auto px-8 py-16 flex flex-col lg:flex-row items-center justify-between gap-12">

        <div className="max-w-2xl">

          <span className="rounded-full bg-purple-600/20 px-4 py-2 text-sm text-purple-400">
            🚀 MERN E-Commerce Platform
          </span>

          <h1 className="mt-6 text-6xl font-extrabold leading-tight">

            Discover

            <span className="block text-cyan-400">
              Premium Products
            </span>

          </h1>

          <p className="mt-6 text-lg text-gray-400 leading-8">

            Explore our modern product catalog built using
            React, TypeScript, Express and MongoDB.

          </p>

          <div className="mt-10 flex gap-5">

            <Link
              to="/admin"
              className="rounded-xl bg-purple-600 px-8 py-4 font-semibold hover:bg-purple-700 transition"
            >
              + Add Product
            </Link>

            <button
              className="rounded-xl border border-cyan-500 px-8 py-4 text-cyan-400 hover:bg-cyan-500 hover:text-black transition"
            >
              Browse Products
            </button>

          </div>

        </div>

        <div className="flex h-96 w-96 items-center justify-center rounded-3xl border border-gray-800 bg-[#111118] shadow-2xl">

          <div className="text-center">

            <div className="text-8xl">
              🛍️
            </div>

            <h2 className="mt-6 text-3xl font-bold">
              ShopSphere
            </h2>

            <p className="mt-2 text-gray-500">
              Premium Shopping Experience
            </p>

          </div>

        </div>

      </div>

    </header>

      {/* Toolbar */}
      <div className="max-w-7xl mx-auto px-8 py-6">

        <div className="flex flex-col md:flex-row gap-4 justify-between">

          <input
            type="text"
            placeholder="🔍 Search products..."
            className="bg-[#111118] border border-gray-700 rounded-lg px-5 py-3 w-full md:w-96 focus:outline-none focus:border-purple-500"
          />

          <div className="flex gap-3">

            <select className="bg-[#111118] border border-gray-700 rounded-lg px-4 py-3">
              <option>All Categories</option>
              <option>Electronics</option>
              <option>Books</option>
              <option>Fashion</option>
            </select>

            <select className="bg-[#111118] border border-gray-700 rounded-lg px-4 py-3">
              <option>Newest</option>
              <option>Price Low → High</option>
              <option>Price High → Low</option>
            </select>

          </div>

        </div>

      </div>

      {/* Products */}
      <main className="max-w-7xl mx-auto px-8 pb-10">

        {products.length === 0 ? (
          <div className="text-center text-gray-500 mt-20 text-xl">
            No Products Available
          </div>
        ) : (
          <ProductGrid products={products} />
        )}

      </main>

    </div>
  );
}