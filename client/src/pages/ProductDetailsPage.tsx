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

          <div className="flex items-center justify-center bg-gray-900 h-96">
            <h1 className="text-6xl font-bold text-gray-500">
              Product
            </h1>
          </div>

          <div className="p-8">

            <span className="text-cyan-400">
              {product.category}
            </span>

            <h1 className="text-4xl font-bold mt-3">
              {product.name}
            </h1>

            <p className="text-gray-400 mt-5">
              {product.description}
            </p>

            <h2 className="text-purple-400 text-3xl font-bold mt-6">
              ₹{product.price}
            </h2>

            <p className="mt-4 text-green-400">
              {product.stock} In Stock
            </p>

            {/* Action Buttons */}
            <div className="flex gap-4 mt-8">

          <Link
            to={`/admin?id=${product.id}`}
            className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg font-semibold"
          >
            Edit
          </Link>

          <button
            onClick={handleDelete}
            className="bg-red-600 hover:bg-red-700 px-6 py-3 rounded-lg font-semibold"
          >
            Delete
          </button>

            </div>

            <Link
              to="/"
              className="inline-block mt-8 bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-lg"
            >
              ← Back to Catalog
            </Link>

          </div>

        </div>

      </div>
    </div>
  );
}