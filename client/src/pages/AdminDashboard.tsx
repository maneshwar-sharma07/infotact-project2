import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../services/api";

export default function AdminDashboard() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const productId = searchParams.get("id");

  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    category: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!productId) return;

    const fetchProduct = async () => {
      try {
        const response = await api.get(`/products/${productId}`);

        setForm({
          name: response.data.name,
          description: response.data.description,
          price: String(response.data.price),
          stock: String(response.data.stock),
          category: response.data.category,
        });
      } catch (err) {
        console.error(err);
      }
    };

    fetchProduct();
  }, [productId]);
      const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
      ) => {
        setForm({
          ...form,
          [e.target.name]: e.target.value,
        });
      };

      const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        setLoading(true);
        setMessage("");
    const config = {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    };

    try {
      if (productId) {
        await api.put(
          `/products/${productId}`,
          {
            name: form.name,
            description: form.description,
            price: Number(form.price),
            stock: Number(form.stock),
            category: form.category,
          },
          config
        );

        setMessage("✅ Product Updated Successfully!");
      } else {
        await api.post(
          "/products",
          {
            name: form.name,
            description: form.description,
            price: Number(form.price),
            stock: Number(form.stock),
            category: form.category,
            embedding: [0],
          },
          config
        );
        setMessage("✅ Product Added Successfully!");
      }

      setTimeout(() => {
        navigate("/");
      }, 1000);
    } catch (err) {
      console.error(err);
      setMessage("❌ Operation Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white p-10">
      <div className="max-w-xl mx-auto bg-[#111118] rounded-xl p-8 shadow-lg">

        <h1 className="text-3xl font-bold mb-6 text-center">
          {productId ? "Edit Product" : "Add Product"}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">

          <input
            className="w-full p-3 rounded bg-gray-800"
            placeholder="Product Name"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
          />

          <textarea
            className="w-full p-3 rounded bg-gray-800"
            placeholder="Description"
            name="description"
            value={form.description}
            onChange={handleChange}
            required
          />

          <input
            className="w-full p-3 rounded bg-gray-800"
            placeholder="Price"
            type="number"
            name="price"
            value={form.price}
            onChange={handleChange}
            required
          />

          <input
            className="w-full p-3 rounded bg-gray-800"
            placeholder="Stock"
            type="number"
            name="stock"
            value={form.stock}
            onChange={handleChange}
            required
          />

          <input
            className="w-full p-3 rounded bg-gray-800"
            placeholder="Category"
            name="category"
            value={form.category}
            onChange={handleChange}
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-purple-600 hover:bg-purple-700 p-3 rounded font-semibold"
          >
            {loading
              ? "Saving..."
              : productId
              ? "Update Product"
              : "Add Product"}
          </button>

        </form>

        {message && (
          <p className="mt-5 text-center text-green-400">
            {message}
          </p>
        )}

      </div>
    </div>
  );
}