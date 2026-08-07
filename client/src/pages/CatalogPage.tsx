import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import ProductGrid from "../components/catalog/ProductGrid";
import type { Product } from "../components/catalog/ProductCard";

type PriceRange = "all" | "under-500" | "500-1000" | "over-1000";
type Availability = "all" | "in-stock" | "out-of-stock";

function getSahiProductImage(productName: string, category: string): string {
  // Clean product name to extract search term (e.g. "Vintage Jacket - Model v12" -> "vintage jacket")
  let cleanName = productName.split("-")[0] || productName;
  cleanName = cleanName.trim().toLowerCase();

  // Replace spaces with commas for Unsplash search redirect parameters
  const keywords = cleanName.replace(/\s+/g, ",");
  return `https://images.unsplash.com/featured/?${encodeURIComponent(keywords)},${encodeURIComponent(category.toLowerCase())}`;
}

function withPlaceholderImages(products: Product[]): Product[] {
  return products.map((product) => ({
    ...product,
    imageUrl: product.imageUrl || getSahiProductImage(product.name, product.category),
  }));
}

export default function CatalogPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [priceRange, setPriceRange] = useState<PriceRange>("all");
  const [availability, setAvailability] = useState<Availability>("all");
  const [minimumRating, setMinimumRating] = useState(0);
  const [sort, setSort] = useState("newest");
  const [isAiSearch, setIsAiSearch] = useState(false);
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterMessage, setNewsletterMessage] = useState("");

  useEffect(() => {
    const fetchSearchedProducts = async () => {
      setLoading(true);
      setError("");
      try {
        const query = search.trim();
        if (!query) {
          const response = await api.get<{ products?: Product[] }>("/products");
          setProducts(withPlaceholderImages(response.data.products ?? []));
        } else if (isAiSearch) {
          const response = await api.get<{ products?: Product[] }>(`/products/semantic-search?query=${encodeURIComponent(query)}`);
          setProducts(withPlaceholderImages(response.data.products ?? []));
        } else {
          const response = await api.get<{ products?: Product[] }>(`/products/search/keyword?query=${encodeURIComponent(query)}`);
          setProducts(withPlaceholderImages(response.data.products ?? []));
        }
      } catch (err) {
        setError("We couldn't load search results. Please verify the backend is online.");
      } finally {
        setLoading(false);
      }
    };

    const delayDebounce = setTimeout(() => {
      void fetchSearchedProducts();
    }, 450);

    return () => clearTimeout(delayDebounce);
  }, [search, isAiSearch]);

  const categories = useMemo(
    () => Array.from(new Set(["Electronics", "Fashion", "Books", "Accessories", ...products.map((product) => product.category)])).sort(),
    [products],
  );

  const filteredProducts = useMemo(() => {
    return [...products]
      .filter((product) => category === "all" || product.category === category)
      .filter((product) => priceRange === "all" || (priceRange === "under-500" && product.price < 500) || (priceRange === "500-1000" && product.price >= 500 && product.price <= 1000) || (priceRange === "over-1000" && product.price > 1000))
      .filter((product) => availability === "all" || (availability === "in-stock" && product.stock > 0) || (availability === "out-of-stock" && product.stock === 0))
      .filter(() => minimumRating === 0 || 4.8 >= minimumRating)
      .sort((first, second) => sort === "price_asc" ? first.price - second.price : sort === "price_desc" ? second.price - first.price : 0);
  }, [availability, category, minimumRating, priceRange, products, sort]);

  const bestSellers = products.slice(0, 4);
  const newArrivals = [...products].slice(-4).reverse();
  const resetFilters = () => { setSearch(""); setCategory("all"); setPriceRange("all"); setAvailability("all"); setMinimumRating(0); setSort("newest"); };
  const subscribe = (event: React.FormEvent<HTMLFormElement>) => { event.preventDefault(); setNewsletterMessage(newsletterEmail.trim() ? "Thanks! You are on the ShopSphere list." : "Enter your email address to subscribe."); };

  return (
    <div className="bg-[#0A0A0F] text-white">
      <section className="overflow-hidden border-b border-gray-800 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-purple-900/40 via-[#111118] to-[#0A0A0F]">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-center lg:py-24">
          <div><p className="inline-flex rounded-full border border-purple-400/30 bg-purple-500/10 px-4 py-2 text-sm font-semibold text-purple-200">A better way to discover</p><h1 className="mt-6 text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">Find Something <span className="text-cyan-400">Exceptional.</span></h1><p className="mt-5 max-w-xl text-lg leading-8 text-gray-400">Shop carefully chosen technology, lifestyle, and everyday essentials in one beautiful destination.</p><div className="mt-8 flex flex-wrap gap-4"><a href="#catalog" className="rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 px-6 py-3 font-semibold transition duration-200 hover:-translate-y-0.5 hover:brightness-110">Browse Products</a><Link to="/admin" className="rounded-xl border border-cyan-400/70 px-6 py-3 font-semibold text-cyan-300 transition duration-200 hover:bg-cyan-400 hover:text-[#0A0A0F]">Add Product</Link></div></div>
          <div className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-2xl shadow-purple-950/40 backdrop-blur sm:p-7"><div className="rounded-2xl border border-purple-400/20 bg-[#111118]/80 p-6"><p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-400">ShopSphere at a glance</p><p className="mt-3 text-3xl font-bold">Premium shopping, simplified.</p><div className="mt-7 grid grid-cols-2 gap-3"><StatCard value={products.length} label="Products" accent="text-purple-300" /><StatCard value={categories.length} label="Categories" accent="text-cyan-300" /><StatCard value="24/7" label="Orders" accent="text-emerald-300" /><StatCard value="10k+" label="Customers" accent="text-yellow-200" /></div></div></div>
        </div>
      </section>

      <main id="catalog" className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="grid gap-8 lg:grid-cols-[260px_minmax(0,1fr)]">
          <aside className="h-fit rounded-2xl border border-gray-800 bg-[#111118] p-5 lg:sticky lg:top-24">
            <div className="flex items-center justify-between"><h2 className="text-lg font-bold">Filters</h2><button onClick={resetFilters} type="button" className="text-sm font-semibold text-cyan-400 transition hover:text-cyan-300">Reset</button></div>
            <label className="mt-5 block text-sm font-medium text-gray-300">Search<input value={search} onChange={(event) => setSearch(event.target.value)} type="search" placeholder="Search products" className="mt-2 w-full rounded-xl border border-gray-700 bg-[#0A0A0F] px-3 py-2.5 text-sm text-white placeholder:text-gray-500 focus:border-cyan-400 focus:outline-none" /></label>
            
            {/* AI Search Mode Toggle */}
            <div className="mt-4 flex items-center justify-between rounded-xl border border-purple-500/20 bg-purple-500/5 p-3">
              <span className="text-xs font-semibold text-purple-200">✨ AI Semantic Search</span>
              <button
                type="button"
                onClick={() => setIsAiSearch(!isAiSearch)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition duration-300 focus:outline-none ${isAiSearch ? "bg-gradient-to-r from-purple-600 to-cyan-500" : "bg-gray-700"}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition duration-300 ${isAiSearch ? "translate-x-6" : "translate-x-1"}`} />
              </button>
            </div>
            <FilterGroup title="Categories">{categories.map((item) => <FilterButton key={item} active={category === item} onClick={() => setCategory(category === item ? "all" : item)}>{item}</FilterButton>)}</FilterGroup>
            <FilterGroup title="Price Range"><FilterButton active={priceRange === "under-500"} onClick={() => setPriceRange("under-500")}>₹0 – ₹500</FilterButton><FilterButton active={priceRange === "500-1000"} onClick={() => setPriceRange("500-1000")}>₹500 – ₹1000</FilterButton><FilterButton active={priceRange === "over-1000"} onClick={() => setPriceRange("over-1000")}>₹1000+</FilterButton></FilterGroup>
            <FilterGroup title="Rating"><FilterButton active={minimumRating === 5} onClick={() => setMinimumRating(5)}>★★★★★</FilterButton><FilterButton active={minimumRating === 4} onClick={() => setMinimumRating(4)}>★★★★☆ & up</FilterButton><FilterButton active={minimumRating === 3} onClick={() => setMinimumRating(3)}>★★★☆☆ & up</FilterButton></FilterGroup>
            <FilterGroup title="Availability"><FilterButton active={availability === "in-stock"} onClick={() => setAvailability("in-stock")}>In Stock</FilterButton><FilterButton active={availability === "out-of-stock"} onClick={() => setAvailability("out-of-stock")}>Out of Stock</FilterButton></FilterGroup>
            <button onClick={resetFilters} type="button" className="mt-6 w-full rounded-xl border border-purple-400/60 px-4 py-2.5 text-sm font-semibold text-purple-300 transition hover:bg-purple-500 hover:text-white">Reset Filters</button>
          </aside>
          <section><div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-sm font-semibold uppercase tracking-[0.16em] text-cyan-400">The collection</p><h2 className="mt-2 text-3xl font-bold sm:text-4xl">Featured Products</h2><p className="mt-2 text-gray-400">{filteredProducts.length} product{filteredProducts.length === 1 ? "" : "s"} found</p></div><label className="text-sm text-gray-400">Sort by<select value={sort} onChange={(event) => setSort(event.target.value)} className="mt-2 block rounded-xl border border-gray-700 bg-[#111118] px-4 py-2.5 text-white focus:border-cyan-400 focus:outline-none"><option value="newest">Newest</option><option value="price_asc">Price: Low to High</option><option value="price_desc">Price: High to Low</option></select></label></div>{loading ? <LoadingSpinner /> : error ? <div role="alert" className="rounded-2xl border border-red-500/60 bg-red-500/10 p-5 text-red-200">{error}</div> : <ProductGrid products={filteredProducts} />}</section>
        </div>

        {!loading && !error && <><ProductRail title="Best Sellers" subtitle="Customer favorites chosen for quality and value." products={bestSellers} /><ProductRail title="New Arrivals" subtitle="Fresh picks just added to the ShopSphere collection." products={newArrivals} /></>}
        <section className="mt-16 rounded-3xl border border-purple-400/20 bg-gradient-to-r from-purple-950/70 via-[#171722] to-cyan-950/40 px-6 py-10 sm:px-10"><div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center"><div><p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-300">Stay in the loop</p><h2 className="mt-3 text-3xl font-bold sm:text-4xl">Get the latest offers first.</h2><p className="mt-3 max-w-xl text-gray-300">Subscribe for product drops, exclusive promotions, and curated recommendations.</p></div><form onSubmit={subscribe} className="w-full max-w-md"><div className="flex flex-col gap-3 sm:flex-row"><input type="email" value={newsletterEmail} onChange={(event) => setNewsletterEmail(event.target.value)} placeholder="you@example.com" className="min-w-0 flex-1 rounded-xl border border-gray-600 bg-[#0A0A0F] px-4 py-3 text-white placeholder:text-gray-500 focus:border-cyan-400 focus:outline-none" /><button className="rounded-xl bg-cyan-400 px-5 py-3 font-semibold text-[#0A0A0F] transition hover:bg-cyan-300">Subscribe</button></div>{newsletterMessage && <p role="status" className="mt-3 text-sm text-cyan-200">{newsletterMessage}</p>}</form></div></section>
      </main>
    </div>
  );
}

function StatCard({ value, label, accent }: { value: string | number; label: string; accent: string }) { return <div className="rounded-xl bg-white/5 p-4"><p className={`text-2xl font-bold ${accent}`}>{value}</p><p className="mt-1 text-sm text-gray-400">{label}</p></div>; }
function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) { return <div className="mt-6 border-t border-gray-800 pt-5"><h3 className="text-sm font-semibold text-white">{title}</h3><div className="mt-3 space-y-1">{children}</div></div>; }
function FilterButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) { return <button type="button" onClick={onClick} className={`block w-full rounded-lg px-3 py-2 text-left text-sm transition ${active ? "bg-purple-500/20 text-purple-200" : "text-gray-400 hover:bg-white/5 hover:text-cyan-300"}`}>{children}</button>; }
function LoadingSpinner() { return <div className="flex min-h-80 items-center justify-center"><div className="h-10 w-10 animate-spin rounded-full border-4 border-purple-500 border-t-cyan-400" aria-label="Loading products" /></div>; }
function ProductRail({ title, subtitle, products }: { title: string; subtitle: string; products: Product[] }) { if (!products.length) return null; return <section className="mt-16"><div className="mb-6"><p className="text-sm font-semibold uppercase tracking-[0.16em] text-cyan-400">ShopSphere picks</p><h2 className="mt-2 text-3xl font-bold">{title}</h2><p className="mt-2 text-gray-400">{subtitle}</p></div><div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{products.map((product) => <Link key={product.id} to={`/product/${product.id}`} className="group overflow-hidden rounded-2xl border border-gray-800 bg-[#111118] shadow-xl shadow-black/20 transition duration-300 hover:-translate-y-1 hover:border-purple-500/70"><img src={product.imageUrl} alt={product.name} className="h-44 w-full object-cover transition duration-500 group-hover:scale-105" /><div className="p-4"><div className="flex items-center justify-between gap-2"><h3 className="truncate font-bold text-white">{product.name}</h3><span className="text-sm text-yellow-300">★ 4.8</span></div><p className="mt-3 text-xl font-bold text-purple-400">₹{product.price.toLocaleString("en-IN")}</p></div></Link>)}</div></section>; }
