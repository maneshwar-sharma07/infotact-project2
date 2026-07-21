import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import HomeProductCard from "../components/home/HomeProductCard";
import HomepageSidebar, { type Availability, type PriceRange } from "../components/home/HomepageSidebar";
import { DEMO_PRODUCTS, TRENDING_CATEGORIES, type HomeProduct } from "../components/home/productData";
import api from "../services/api";

const TESTIMONIALS = [
  { name: "Ananya Sharma", initials: "AS", review: "The product quality and delivery experience felt genuinely premium. ShopSphere is now my first stop.", color: "from-purple-500 to-indigo-500" },
  { name: "Rahul Mehta", initials: "RM", review: "Everything was easy to compare, and my order arrived exactly as expected. Beautifully curated selection.", color: "from-cyan-500 to-blue-500" },
  { name: "Priya Nair", initials: "PN", review: "I love the thoughtful range of products. It has the ease of a marketplace with a much better feel.", color: "from-emerald-500 to-teal-500" },
] as const;

const BRAND_NAMES = ["Apple", "Samsung", "Dell", "HP", "Logitech", "Asus"] as const;

export default function HomePage() {
  const [backendProducts, setBackendProducts] = useState<HomeProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [priceRange, setPriceRange] = useState<PriceRange>("all");
  const [minimumRating, setMinimumRating] = useState(0);
  const [availability, setAvailability] = useState<Availability>("all");
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterMessage, setNewsletterMessage] = useState("");

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const response = await api.get<{ products?: HomeProduct[] }>("/products");
        setBackendProducts(response.data.products ?? []);
      } catch {
        setError("We couldn't load the live collection. Showing our curated picks instead.");
      } finally {
        setLoading(false);
      }
    };
    void loadProducts();
  }, []);

  const products = useMemo(() => backendProducts.length < 8 ? [...backendProducts, ...DEMO_PRODUCTS] : backendProducts, [backendProducts]);
  const categories = useMemo(() => Array.from(new Set(["Electronics", "Accessories", "Fashion", "Books", ...products.map((product) => product.category)])).sort(), [products]);
  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();
    return products.filter((product) =>
      (category === "all" || product.category === category)
      && (!query || `${product.name} ${product.description} ${product.category}`.toLowerCase().includes(query))
      && (priceRange === "all" || (priceRange === "under-1000" && product.price < 1000) || (priceRange === "1000-5000" && product.price >= 1000 && product.price <= 5000) || (priceRange === "over-5000" && product.price > 5000))
      && (minimumRating === 0 || (product.rating ?? 4.8) >= minimumRating)
      && (availability === "all" || (availability === "in-stock" && product.stock > 0) || (availability === "out-of-stock" && product.stock === 0)),
    );
  }, [availability, category, minimumRating, priceRange, products, search]);
  const bestSellers = useMemo(() => [...products].sort((first, second) => (second.rating ?? 4.8) - (first.rating ?? 4.8)).slice(0, 4), [products]);
  const newArrivals = useMemo(() => [...products].reverse().slice(0, 4), [products]);
  const resetFilters = useCallback(() => { setSearch(""); setCategory("all"); setPriceRange("all"); setMinimumRating(0); setAvailability("all"); }, []);
  const subscribe = (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); setNewsletterMessage(newsletterEmail.trim() ? "You're on the list — welcome to ShopSphere." : "Please enter your email address."); };

  return <div className="overflow-hidden bg-[#0A0A0F] text-white">
    <Hero productCount={products.length} categoryCount={categories.length} />
    <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16">
      <section id="products" className="grid items-start gap-8 lg:grid-cols-[248px_minmax(0,1fr)]">
        <HomepageSidebar search={search} category={category} categories={categories} priceRange={priceRange} minimumRating={minimumRating} availability={availability} onSearchChange={setSearch} onCategoryChange={setCategory} onPriceRangeChange={setPriceRange} onMinimumRatingChange={setMinimumRating} onAvailabilityChange={setAvailability} onReset={resetFilters} />
        <section><div className="mb-7"><p className="text-sm font-semibold uppercase tracking-[0.16em] text-cyan-400">The collection</p><h2 className="mt-2 text-3xl font-bold sm:text-4xl">Featured Products</h2><p className="mt-2 text-gray-400">{filteredProducts.length} curated product{filteredProducts.length === 1 ? "" : "s"} waiting for you</p></div>{error && <p role="status" className="mb-5 rounded-xl border border-yellow-400/30 bg-yellow-400/10 px-4 py-3 text-sm text-yellow-100">{error}</p>}{loading ? <Loading /> : <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">{filteredProducts.map((product) => <HomeProductCard key={product.id} product={product} />)}</div>}</section>
      </section>

      <SectionHeader eyebrow="Explore more" title="Trending Categories" subtitle="The collections everyone is looking at right now." />
      <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{TRENDING_CATEGORIES.map((item) => <a href="#products" key={item.title} onClick={() => setCategory(item.title)} className="group relative min-h-52 overflow-hidden rounded-2xl border border-gray-800 bg-[#111118] transition hover:-translate-y-1 hover:border-purple-500/70"><img src={item.image} alt="" className="absolute inset-0 h-full w-full object-cover opacity-55 transition duration-500 group-hover:scale-110 group-hover:opacity-70" /><div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0F] via-[#0A0A0F]/20 to-transparent" /><div className="absolute inset-x-0 bottom-0 p-5"><h3 className="text-xl font-bold">{item.title}</h3><p className="mt-1 text-sm text-gray-300">{item.count}</p></div></a>)}</section>

      <ProductRail eyebrow="Customer favourites" title="Best Sellers" subtitle="High-rated picks chosen for quality and value." products={bestSellers} />
      <ProductRail eyebrow="Just landed" title="New Arrivals" subtitle="Fresh discoveries for your desk, home, and everyday." products={newArrivals} />
      <WhyShopSphere />
      <Testimonials />
      <Brands />
      <Newsletter email={newsletterEmail} message={newsletterMessage} onEmailChange={setNewsletterEmail} onSubmit={subscribe} />
    </main>
  </div>;
}

function Hero({ productCount, categoryCount }: { productCount: number; categoryCount: number }) { return <section className="relative border-b border-gray-800 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-purple-900/40 via-[#111118] to-[#0A0A0F]"><div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-center lg:py-20"><div><p className="inline-flex rounded-full border border-purple-400/30 bg-purple-500/10 px-4 py-2 text-sm font-semibold text-purple-200">A better way to discover</p><h1 className="mt-5 text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">Find Something <span className="text-cyan-400">Exceptional.</span></h1><p className="mt-5 max-w-xl text-lg leading-8 text-gray-400">Shop carefully chosen technology, lifestyle, and everyday essentials in one beautiful destination.</p><div className="mt-8 flex flex-wrap gap-4"><a href="#products" className="rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 px-6 py-3 font-semibold transition duration-200 hover:-translate-y-0.5 hover:brightness-110">Browse Products</a><Link to="/admin" className="rounded-xl border border-cyan-400/70 px-6 py-3 font-semibold text-cyan-300 transition duration-200 hover:bg-cyan-400 hover:text-[#0A0A0F]">Add Product</Link></div></div><div className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-2xl shadow-purple-950/40 backdrop-blur sm:p-7"><div className="rounded-2xl border border-purple-400/20 bg-[#111118]/80 p-6"><p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-400">ShopSphere at a glance</p><p className="mt-3 text-3xl font-bold">Premium shopping, simplified.</p><div className="mt-7 grid grid-cols-2 gap-3"><Stat value={productCount} label="Products" accent="text-purple-300" /><Stat value={categoryCount} label="Categories" accent="text-cyan-300" /><Stat value="24/7" label="Support" accent="text-emerald-300" /><Stat value="10k+" label="Customers" accent="text-yellow-200" /></div></div></div></div></section>; }
function Stat({ value, label, accent }: { value: string | number; label: string; accent: string }) { return <div className="rounded-xl bg-white/5 p-4"><p className={`text-2xl font-bold ${accent}`}>{value}</p><p className="mt-1 text-sm text-gray-400">{label}</p></div>; }
function Loading() { return <div className="flex min-h-96 items-center justify-center"><div className="h-10 w-10 animate-spin rounded-full border-4 border-purple-500 border-t-cyan-400" aria-label="Loading products" /></div>; }
function SectionHeader({ eyebrow, title, subtitle }: { eyebrow: string; title: string; subtitle: string }) { return <div className="mb-6 mt-16"><p className="text-sm font-semibold uppercase tracking-[0.16em] text-cyan-400">{eyebrow}</p><h2 className="mt-2 text-3xl font-bold sm:text-4xl">{title}</h2><p className="mt-2 text-gray-400">{subtitle}</p></div>; }
function ProductRail({ eyebrow, title, subtitle, products }: { eyebrow: string; title: string; subtitle: string; products: HomeProduct[] }) { return <section><SectionHeader eyebrow={eyebrow} title={title} subtitle={subtitle} /><div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{products.map((product) => <HomeProductCard key={`${title}-${product.id}`} product={product} compact />)}</div></section>; }
function WhyShopSphere() { const features = [["🚚", "Free Shipping", "On qualifying orders, always."], ["🔒", "Secure Payment", "Your checkout is protected."], ["⭐", "Premium Quality", "Selected with care and intent."], ["↩", "Easy Returns", "Simple returns when you need them."]] as const; return <section><SectionHeader eyebrow="The ShopSphere promise" title="Why ShopSphere" subtitle="A shopping experience made to feel effortless from browse to delivery." /><div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{features.map(([icon, title, text]) => <article key={title} className="group rounded-2xl border border-gray-800 bg-[#111118] p-6 transition duration-300 hover:-translate-y-1 hover:border-cyan-400/60"><div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/15 text-2xl transition duration-300 group-hover:scale-110 group-hover:bg-cyan-400/15">{icon}</div><h3 className="mt-5 text-lg font-bold">{title}</h3><p className="mt-2 text-sm leading-6 text-gray-400">{text}</p></article>)}</div></section>; }
function Testimonials() { return <section><SectionHeader eyebrow="Loved by shoppers" title="Customer Reviews" subtitle="Real words from people who made ShopSphere part of their day." /><div className="grid gap-5 lg:grid-cols-3">{TESTIMONIALS.map((testimonial) => <article key={testimonial.name} className="rounded-2xl border border-gray-800 bg-[#111118] p-6 transition duration-300 hover:-translate-y-1 hover:border-purple-500/60"><div className="flex items-center gap-4"><div className={`flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br ${testimonial.color} font-bold text-white`}>{testimonial.initials}</div><div><h3 className="font-semibold">{testimonial.name}</h3><p className="mt-1 text-sm tracking-widest text-yellow-300">★★★★★</p></div></div><p className="mt-5 leading-7 text-gray-400">“{testimonial.review}”</p></article>)}</div></section>; }
function Brands() { return <section><SectionHeader eyebrow="Brands we love" title="Popular Brands" subtitle="Trusted names, thoughtfully curated." /><div className="grid grid-cols-2 overflow-hidden rounded-2xl border border-gray-800 bg-[#111118] sm:grid-cols-3 lg:grid-cols-6">{BRAND_NAMES.map((brand) => <div key={brand} className="flex min-h-24 items-center justify-center border-b border-r border-gray-800 px-4 text-xl font-bold tracking-tight text-gray-500 transition hover:bg-white/5 hover:text-white lg:border-b-0">{brand}</div>)}</div></section>; }
function Newsletter({ email, message, onEmailChange, onSubmit }: { email: string; message: string; onEmailChange: (value: string) => void; onSubmit: (event: FormEvent<HTMLFormElement>) => void }) { return <section className="mt-16 overflow-hidden rounded-3xl border border-purple-400/20 bg-gradient-to-r from-purple-950 via-[#1b1730] to-cyan-950 px-6 py-10 sm:px-10 sm:py-12"><div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center"><div><p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-300">Stay in the loop</p><h2 className="mt-3 text-3xl font-bold sm:text-4xl">Get the latest offers first.</h2><p className="mt-3 max-w-xl leading-7 text-gray-300">Subscribe for product drops, member-only offers, and recommendations worth opening.</p></div><form onSubmit={onSubmit} className="w-full max-w-md"><div className="flex flex-col gap-3 sm:flex-row"><input type="email" value={email} onChange={(event) => onEmailChange(event.target.value)} placeholder="you@example.com" className="min-w-0 flex-1 rounded-xl border border-gray-600 bg-[#0A0A0F]/90 px-4 py-3 text-white placeholder:text-gray-500 outline-none transition focus:border-cyan-400" /><button className="rounded-xl bg-cyan-400 px-5 py-3 font-semibold text-[#0A0A0F] transition hover:bg-cyan-300">Subscribe</button></div>{message && <p role="status" className="mt-3 text-sm text-cyan-200">{message}</p>}</form></div></section>; }
