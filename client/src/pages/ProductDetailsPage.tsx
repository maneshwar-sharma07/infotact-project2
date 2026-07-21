import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import api from "../services/api";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  imageUrl?: string;
}

export default function ProductDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  const handleDelete = async () => {
  const confirmDelete = window.confirm(
    "Are you sure you want to delete this product?"
  );

  if (!confirmDelete) return;

  try {
    await api.delete(`/products/${id}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

    alert("Product deleted successfully.");
    navigate("/");
  } catch (err) {
    console.error(err);
    alert("Failed to delete product.");
  }
};

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await api.get(`/products/${id}`);
        setProduct(response.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center text-white text-2xl">
        Loading...
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center text-red-500 text-2xl">
        Product Not Found
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white p-10">
      <div className="max-w-5xl mx-auto bg-[#111118] rounded-xl shadow-lg overflow-hidden">

        <div className="grid md:grid-cols-2">

      <div className="relative overflow-hidden bg-[#0F172A]">

        <img
          src={
            product.imageUrl ??
            "https://placehold.co/800x700/111827/FFFFFF?text=Product"
          }
          alt={product.name}
          className="h-full w-full object-cover transition duration-500 hover:scale-105"
        />

        <span className="absolute left-6 top-6 rounded-full bg-cyan-500 px-4 py-2 text-sm font-semibold text-black">
          {product.category}
        </span>

        <span
          className={`absolute right-6 top-6 rounded-full px-4 py-2 text-sm font-semibold ${
            product.stock > 0
              ? "bg-green-500 text-black"
              : "bg-red-500 text-white"
          }`}
        >
          {product.stock > 0 ? "In Stock" : "Out of Stock"}
        </span>

      </div>

      <div className="p-10">

        <div className="flex items-center gap-3">

          <span className="rounded-full bg-yellow-400 px-3 py-1 text-sm font-bold text-black">
            ⭐ 4.8
          </span>

          <span className="text-gray-400">
            Premium Quality
          </span>

        </div>

        <h1 className="mt-5 text-5xl font-extrabold">
          {product.name}
        </h1>

        <p className="mt-6 leading-8 text-gray-400">
          {product.description}
        </p>

        <h2 className="mt-8 text-5xl font-bold text-purple-400">
          ₹{product.price}
        </h2>

        <div className="mt-8 grid grid-cols-2 gap-5">

          <div className="rounded-xl bg-[#1A1A25] p-5">
            <p className="text-sm text-gray-500">
              Availability
            </p>

            <h3 className="mt-2 text-xl font-bold">
              {product.stock} Units
            </h3>
          </div>

          <div className="rounded-xl bg-[#1A1A25] p-5">
            <p className="text-sm text-gray-500">
              Delivery
            </p>

            <h3 className="mt-2 text-xl font-bold text-green-400">
              Free Shipping
            </h3>
          </div>

        </div>

        <div className="mt-10 flex flex-wrap gap-4">

          <Link
            to={`/admin?id=${product.id}`}
            className="rounded-xl bg-blue-600 px-8 py-3 font-semibold transition hover:bg-blue-700"
          >
            ✏ Edit
          </Link>

          <button
            onClick={handleDelete}
            className="rounded-xl bg-red-600 px-8 py-3 font-semibold transition hover:bg-red-700"
          >
            🗑 Delete
          </button>

          <Link
            to="/"
            className="rounded-xl border border-purple-500 px-8 py-3 font-semibold text-purple-400 transition hover:bg-purple-600 hover:text-white"
          >
            ← Back
          </Link>

        </div>

      </div>

        </div>

      </div>
    </div>
  );
}