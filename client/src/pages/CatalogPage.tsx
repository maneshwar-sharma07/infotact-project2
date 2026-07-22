import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import ProductGrid from "../components/catalog/ProductGrid";
import type { Product } from "../components/catalog/ProductCard";

export default function CatalogPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState("newest");

  useEffect(() => {
    const loadProducts = async () => {
      try { const response = await api.get<{ products?: Product[] }>("/products"); setProducts(response.data.products ?? []); }
      catch { setError("We couldn't load the catalog. Please try again shortly."); }
      finally { setLoading(false); }
    };
    void loadProducts();
  }, []);

  const categories = useMemo(() => [...new Set(products.map((product) => product.category))].sort(), [products]);
  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();
    return [...products].filter((product) => category === "all" || product.category === category).filter((product) => !query || `${product.name} ${product.description} ${product.category}`.toLowerCase().includes(query)).sort((first, second) => sort === "price_asc" ? first.price - second.price : sort === "price_desc" ? second.price - first.price : 0);
  }, [category, products, search, sort]);

  return (
    <div className="bg-[#0A0A0F] text-white">
      <section className="border-b border-gray-800 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-purple-900/30 via-[#111118] to-[#0A0A0F]"><div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-center lg:py-24"><div><p className="inline-flex rounded-full border border-purple-400/30 bg-purple-500/10 px-4 py-2 text-sm font-semibold text-purple-300">Curated for every day</p><h1 className="mt-6 text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">Find something <span className="text-cyan-400">exceptional.</span></h1><p className="mt-5 max-w-xl text-lg leading-8 text-gray-400">Discover quality products, thoughtfully selected for your life and delivered with a premium shopping experience.</p><div className="mt-8 flex flex-wrap gap-4"><a href="#catalog" className="rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 px-6 py-3 font-semibold transition hover:brightness-110">Browse products</a><Link to="/admin" className="rounded-xl border border-cyan-400/70 px-6 py-3 font-semibold text-cyan-300 transition hover:bg-cyan-400 hover:text-[#0A0A0F]">Add a product</Link></div></div><div className="rounded-3xl border border-purple-400/20 bg-[#111118]/80 p-8 shadow-2xl shadow-purple-950/30"><p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-400">ShopSphere</p><p className="mt-4 text-4xl font-bold text-white">Premium finds, made simple.</p><div className="mt-8 grid grid-cols-2 gap-4"><div className="rounded-2xl bg-white/5 p-4"><p className="text-2xl font-bold text-purple-300">{products.length}</p><p className="mt-1 text-sm text-gray-400">Products</p></div><div className="rounded-2xl bg-white/5 p-4"><p className="text-2xl font-bold text-cyan-300">{categories.length}</p><p className="mt-1 text-sm text-gray-400">Categories</p></div></div></div></div></section>
      <main id="catalog" className="mx-auto max-w-7xl px-4 py-12 sm:px-6"><div className="mb-8"><p className="text-sm font-semibold uppercase tracking-[0.16em] text-cyan-400">The collection</p><h2 className="mt-2 text-3xl font-bold sm:text-4xl">Featured Products</h2><p className="mt-2 text-gray-400">Explore {filteredProducts.length} product{filteredProducts.length === 1 ? "" : "s"} selected for you.</p></div><div className="mb-10 grid gap-3 rounded-2xl border border-gray-800 bg-[#111118] p-4 md:grid-cols-[1fr_auto_auto]"><input value={search} onChange={(event) => setSearch(event.target.value)} type="search" placeholder="Search products..." className="min-w-0 rounded-xl border border-gray-700 bg-[#0A0A0F] px-4 py-3 text-white placeholder:text-gray-500 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/20" /><select value={category} onChange={(event) => setCategory(event.target.value)} className="rounded-xl border border-gray-700 bg-[#0A0A0F] px-4 py-3 text-white focus:border-cyan-400 focus:outline-none"><option value="all">All categories</option>{categories.map((item) => <option key={item} value={item}>{item}</option>)}</select><select value={sort} onChange={(event) => setSort(event.target.value)} className="rounded-xl border border-gray-700 bg-[#0A0A0F] px-4 py-3 text-white focus:border-cyan-400 focus:outline-none"><option value="newest">Newest</option><option value="price_asc">Price: Low to High</option><option value="price_desc">Price: High to Low</option></select></div>{loading ? <div className="flex min-h-72 items-center justify-center"><div className="h-10 w-10 animate-spin rounded-full border-4 border-purple-500 border-t-cyan-400" aria-label="Loading products" /></div> : error ? <div role="alert" className="rounded-2xl border border-red-500/60 bg-red-500/10 p-5 text-red-200">{error}</div> : <ProductGrid products={filteredProducts} />}</main>
    </div>
  );
}
