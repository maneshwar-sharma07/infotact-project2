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
      <header className="border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-8 py-5 flex justify-between items-center">

          <div>
            <h1 className="text-4xl font-bold">
              🛍️ Infotact Store
            </h1>
            <p className="text-gray-400 mt-1">
              Modern MERN E-Commerce Dashboard
            </p>
          </div>

          <Link
            to="/admin"
            className="bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-lg font-semibold"
          >
            + Add Product
          </Link>

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