import { useEffect, useMemo, useState, type ChangeEvent, type FormEvent, type ReactNode } from "react";
import axios from "axios";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import api from "../services/api";
import { subscribeToOrderUpdates } from "../services/orderSocket";
import type { ApiOrder, OrderStatus } from "../types/ecommerce";

type Product = { id: string; name: string; description: string; price: number; stock: number; category: string; createdAt?: string };
type ProductForm = { name: string; description: string; price: string; stock: string; category: string };
type Tone = "purple" | "cyan" | "green" | "amber" | "red";

import { useAuth } from "../hooks/useAuth";

const emptyForm: ProductForm = { name: "", description: "", price: "", stock: "", category: "" };
const money = (value: number) => `₹${value.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

function getErrorMessage(error: unknown) {
  if (!axios.isAxiosError(error)) return "Operation failed. Please try again.";
  const data = error.response?.data as { error?: unknown; message?: unknown } | undefined;
  const message = data?.error ?? data?.message;
  return typeof message === "string" ? message : "Operation failed. Please try again.";
}

function formatDate(value?: string) {
  if (!value) return "Recently added";
  return new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric" }).format(new Date(value));
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const productId = searchParams.get("id");
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<ApiOrder[]>([]);
  const [form, setForm] = useState<ProductForm>(emptyForm);
  const [loading, setLoading] = useState(false);
  const [loadingDashboard, setLoadingDashboard] = useState(true);
  const [loadingProduct, setLoadingProduct] = useState(Boolean(productId));
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user || user.role !== "admin") {
      navigate("/");
    }
  }, [user, navigate]);

  const loadProducts = async () => {
    try {
      const response = await api.get<{ products?: Product[] }>("/products", { params: { limit: 100 } });
      setProducts(response.data.products ?? []);
      const orderResponse = await api.get<{ orders: ApiOrder[] }>("/orders");
      setOrders(orderResponse.data.orders ?? []);
    } catch (requestError: unknown) { setError(getErrorMessage(requestError)); }
    finally { setLoadingDashboard(false); }
  };

  useEffect(() => { void loadProducts(); }, []);
  useEffect(() => subscribeToOrderUpdates((updated) => setOrders((current) => current.map((order) => order.id === updated.id ? updated : order))), []);
  useEffect(() => {
    if (!productId) return;
    const loadProduct = async () => {
      try {
        const response = await api.get<Product>(`/products/${productId}`);
        const product = response.data;
        setForm({ name: product.name, description: product.description, price: String(product.price), stock: String(product.stock), category: product.category });
      } catch (requestError: unknown) { setError(getErrorMessage(requestError)); }
      finally { setLoadingProduct(false); }
    };
    void loadProduct();
  }, [productId]);

  const lowStockProducts = useMemo(() => products.filter((product) => product.stock <= 5).sort((a, b) => a.stock - b.stock).slice(0, 5), [products]);
  const latestProducts = useMemo(() => [...products].sort((a, b) => new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime()).slice(0, 5), [products]);
  const revenue = orders.reduce((total, order) => total + Number(order.totalAmount || 0), 0);
  const customerCount = new Set(orders.map((order) => order.customerEmail)).size;
  const todayOrders = orders.filter((order) => new Date(order.createdAt).toDateString() === new Date().toDateString()).length;
  const pendingOrders = orders.filter((order) => order.status === "Pending").length;
  const outOfStockCount = products.filter((product) => product.stock === 0).length;
  const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setLoading(true); setError(""); setSuccess("");
    const payload = { ...form, price: Number(form.price), stock: Number(form.stock) };
    try {
      if (productId) await api.put(`/products/${productId}`, payload);
      else await api.post("/products", { ...payload, embedding: [0] });
      setSuccess(productId ? "Product updated successfully." : "Product added successfully.");
      await loadProducts(); window.setTimeout(() => navigate("/admin"), 900);
    } catch (requestError: unknown) { setError(getErrorMessage(requestError)); }
    finally { setLoading(false); }
  };

  const inputClassName = "mt-2 w-full rounded-xl border border-white/10 bg-[#0b0b12] px-4 py-3 text-white placeholder:text-slate-600 transition focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/20 disabled:opacity-60";

  return <main className="min-h-screen bg-[#09090f] px-4 py-8 text-white sm:px-6 lg:px-8 lg:py-10">
    <div className="mx-auto max-w-[1440px]">
      <header className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div><div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-cyan-400"><span className="h-2 w-2 rounded-full bg-cyan-400 shadow-[0_0_12px_#22d3ee]" /> ShopSphere insights</div><h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">Good morning, Admin</h1><p className="mt-2 text-sm text-slate-400">Here&apos;s what&apos;s happening with your store today.</p></div>
        <button type="button" onClick={() => { setLoadingDashboard(true); void loadProducts(); }} disabled={loadingDashboard} className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm font-semibold text-slate-200 transition hover:border-cyan-400/60 hover:bg-cyan-400/10 disabled:cursor-not-allowed disabled:opacity-60"><RefreshIcon />{loadingDashboard ? "Refreshing" : "Refresh data"}</button>
      </header>
      {error && <div role="alert" className="mb-6 rounded-xl border border-red-400/30 bg-red-400/10 p-4 text-sm text-red-200">{error}</div>}
      {success && <div role="status" className="mb-6 rounded-xl border border-emerald-400/30 bg-emerald-400/10 p-4 text-sm text-emerald-200">{success}</div>}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <MetricCard label="Total Products" value={loadingDashboard ? "—" : products.length.toLocaleString("en-IN")} hint="In your catalog" tone="purple" icon={<BoxIcon />} />
        <MetricCard label="Total Orders" value={orders.length.toLocaleString("en-IN")} hint={`${todayOrders} placed today`} tone="cyan" icon={<CartIcon />} />
        <MetricCard label="Total Revenue" value={money(revenue)} hint="From completed checkouts" tone="green" icon={<RevenueIcon />} />
        <MetricCard label="Total Customers" value={customerCount.toLocaleString("en-IN")} hint="Unique delivery addresses" tone="amber" icon={<UsersIcon />} />
        <MetricCard label="Pending Orders" value={pendingOrders.toLocaleString("en-IN")} hint="Awaiting confirmation" tone="red" icon={<AlertIcon />} />
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-[1.35fr_1fr]">
        <DashboardPanel title="Recent Orders" subtitle="Your latest customer purchases" action={orders.length ? `${orders.length} total` : undefined}>
          {orders.length ? <div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left text-sm"><thead className="border-b border-white/10 text-[11px] uppercase tracking-wider text-slate-500"><tr><th className="px-2 py-3 font-semibold">Order ID</th><th className="px-2 py-3 font-semibold">Customer</th><th className="px-2 py-3 font-semibold">Email</th><th className="px-2 py-3 text-right font-semibold">Total</th><th className="px-2 py-3 font-semibold">Payment</th><th className="px-2 py-3 font-semibold">Status</th><th className="px-2 py-3 font-semibold">Date</th><th className="px-2 py-3 text-right font-semibold">Actions</th></tr></thead><tbody className="divide-y divide-white/[0.06]">{orders.slice(0, 20).map((order) => <AdminOrderRow key={order.id} order={order} onUpdated={(updated) => setOrders((current) => current.map((item) => item.id === updated.id ? updated : item))} />)}</tbody></table></div> : <EmptyPanel icon={<CartIcon />} message="Orders will appear here after the first checkout." />}
        </DashboardPanel>
        <DashboardPanel title="Low Stock Products" subtitle="Products with 5 or fewer units remaining" action={lowStockProducts.length ? "View inventory" : undefined}><ProductList products={lowStockProducts} emptyMessage="No low-stock products. Your inventory looks healthy." showStock /></DashboardPanel>
        <DashboardPanel title="Latest Added Products" subtitle="Most recently added catalog items"><ProductList products={latestProducts} emptyMessage="No products have been added yet." /></DashboardPanel>
        <DashboardPanel title={productId ? "Update Product" : "Add Product"} subtitle={productId ? "Edit your selected catalog item." : "Create a new catalog item."}>
          {loadingProduct ? <div className="flex min-h-64 items-center justify-center"><Spinner /></div> : <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2"><label className="text-sm font-medium text-slate-300">Product name<input name="name" value={form.name} onChange={handleChange} required disabled={loading} className={inputClassName} placeholder="Product name" /></label><label className="text-sm font-medium text-slate-300">Category<input name="category" value={form.category} onChange={handleChange} required disabled={loading} className={inputClassName} placeholder="e.g. Electronics" /></label><label className="text-sm font-medium text-slate-300 sm:col-span-2">Description<textarea name="description" value={form.description} onChange={handleChange} required disabled={loading} className={`${inputClassName} min-h-24 resize-y`} placeholder="Describe the product" /></label><label className="text-sm font-medium text-slate-300">Price<input name="price" type="number" min="0" step="0.01" value={form.price} onChange={handleChange} required disabled={loading} className={inputClassName} placeholder="0.00" /></label><label className="text-sm font-medium text-slate-300">Stock<input name="stock" type="number" min="0" step="1" value={form.stock} onChange={handleChange} required disabled={loading} className={inputClassName} placeholder="0" /></label><button type="submit" disabled={loading} className="sm:col-span-2 mt-2 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 px-5 py-3 font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60">{loading && <Spinner small />}{loading ? "Saving..." : productId ? "Update Product" : "Add Product"}</button></form>}
        </DashboardPanel>
      </div>
    </div>
  </main>;
}

function MetricCard({ label, value, hint, tone, icon }: { label: string; value: string; hint: string; tone: Tone; icon: ReactNode }) {
  const styles: Record<Tone, string> = { purple: "border-purple-400/20 bg-purple-400/[0.08] text-purple-300", cyan: "border-cyan-400/20 bg-cyan-400/[0.08] text-cyan-300", green: "border-emerald-400/20 bg-emerald-400/[0.08] text-emerald-300", amber: "border-amber-400/20 bg-amber-400/[0.08] text-amber-200", red: "border-red-400/20 bg-red-400/[0.08] text-red-300" };
  return <article className={`rounded-2xl border p-5 shadow-xl shadow-black/10 ${styles[tone]}`}><div className="flex items-start justify-between"><p className="text-sm font-medium text-slate-300">{label}</p><span className="rounded-lg bg-black/20 p-2">{icon}</span></div><p className="mt-4 text-3xl font-bold tracking-tight text-white">{value}</p><p className="mt-2 text-xs text-slate-400">{hint}</p></article>;
}

function DashboardPanel({ title, subtitle, action, children }: { title: string; subtitle: string; action?: string; children: ReactNode }) { return <section className="rounded-2xl border border-white/[0.08] bg-[#111118] p-5 shadow-2xl shadow-black/20 sm:p-6"><div className="mb-5 flex items-start justify-between gap-3"><div><h2 className="text-lg font-bold text-white">{title}</h2><p className="mt-1 text-sm text-slate-500">{subtitle}</p></div>{action && <span className="hidden rounded-full bg-white/[0.05] px-3 py-1 text-xs font-medium text-slate-400 sm:block">{action}</span>}</div>{children}</section>; }
function ProductList({ products, emptyMessage, showStock = false }: { products: Product[]; emptyMessage: string; showStock?: boolean }) { if (!products.length) return <EmptyPanel message={emptyMessage} />; return <ul className="divide-y divide-white/[0.06]">{products.map((product) => <li key={product.id} className="flex items-center justify-between gap-4 py-3.5 first:pt-0 last:pb-0"><div className="flex min-w-0 items-center gap-3"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500/20 to-cyan-500/20 text-xs font-bold text-cyan-300">{product.name.slice(0, 2).toUpperCase()}</span><div className="min-w-0"><p className="truncate font-semibold text-slate-200">{product.name}</p><p className="mt-1 truncate text-xs text-slate-500">{product.category} · {formatDate(product.createdAt)}</p></div></div><div className="shrink-0 text-right"><p className="font-semibold text-slate-100">{money(product.price)}</p>{showStock && <p className={`mt-1 text-xs font-semibold ${product.stock === 0 ? "text-red-300" : "text-amber-200"}`}>{product.stock === 0 ? "Out of stock" : `${product.stock} left`}</p>}</div></li>)}</ul>; }
function EmptyPanel({ message, icon }: { message: string; icon?: ReactNode }) { return <div className="flex min-h-40 flex-col items-center justify-center rounded-xl border border-dashed border-white/10 px-4 text-center"><span className="mb-3 text-slate-600">{icon ?? <BoxIcon />}</span><p className="text-sm text-slate-500">{message}</p></div>; }
function StatusBadge({ status }: { status: string }) { const colors: Record<string, string> = { Pending: "bg-yellow-400/10 text-yellow-200", Confirmed: "bg-blue-400/10 text-blue-300", Packed: "bg-orange-400/10 text-orange-300", Shipped: "bg-purple-400/10 text-purple-300", Delivered: "bg-emerald-400/10 text-emerald-300", Cancelled: "bg-red-400/10 text-red-300" }; return <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${colors[status] ?? "bg-white/10 text-slate-300"}`}>{status}</span>; }
function AdminOrderRow({ order, onUpdated }: { order: ApiOrder; onUpdated: (order: ApiOrder) => void }) {
  const [updating, setUpdating] = useState(false);
  const updateStatus = async (status: OrderStatus) => { if (status === order.status) return; setUpdating(true); try { const response = await api.patch<{ order: ApiOrder }>(`/orders/${order.id}/status`, { status }); onUpdated(response.data.order); } finally { setUpdating(false); } };
  return <tr className="transition hover:bg-white/[0.02]"><td className="px-2 py-4 font-semibold text-slate-200">{order.orderNumber}</td><td className="px-2 py-4 text-slate-300">{order.customerName}</td><td className="px-2 py-4 text-slate-500">{order.customerEmail}</td><td className="px-2 py-4 text-right font-semibold text-white">{money(order.totalAmount)}</td><td className="px-2 py-4 text-slate-400">{order.paymentMethod}</td><td className="px-2 py-4"><StatusBadge status={order.status} /></td><td className="px-2 py-4 text-slate-400">{formatDate(order.createdAt)}</td><td className="px-2 py-4 text-right"><div className="flex items-center justify-end gap-3"><Link to={`/orders/${order.id}`} className="text-xs font-semibold text-slate-300 hover:text-white">View</Link><select aria-label={`Update status for ${order.orderNumber}`} value={order.status} disabled={updating} onChange={(event) => void updateStatus(event.target.value as OrderStatus)} className="rounded-lg border border-cyan-400/30 bg-[#0b0b12] px-2 py-1.5 text-xs font-semibold text-cyan-200 outline-none focus:border-cyan-300 disabled:opacity-50">{(["Pending", "Confirmed", "Packed", "Shipped", "Delivered", "Cancelled"] as OrderStatus[]).map((status) => <option key={status} value={status}>{status}</option>)}</select></div></td></tr>;
}
function Spinner({ small = false }: { small?: boolean }) { return <span className={`${small ? "h-4 w-4 border-2" : "h-9 w-9 border-4"} animate-spin rounded-full border-white border-t-transparent`} aria-label="Loading" />; }
function RefreshIcon() { return <svg aria-hidden="true" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 11a8.1 8.1 0 0 0-14.9-4L3 10m0 0V4m0 6h6M4 13a8.1 8.1 0 0 0 14.9 4L21 14m0 0v6m0-6h-6" /></svg>; }
function BoxIcon() { return <svg aria-hidden="true" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="m12 3 8 4.5v9L12 21l-8-4.5v-9L12 3Z" /><path d="m4.5 7.8 7.5 4.2 7.5-4.2M12 12v9" /></svg>; }
function CartIcon() { return <svg aria-hidden="true" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 4h2l2.1 10.1a2 2 0 0 0 2 1.6h7.8a2 2 0 0 0 1.9-1.4L20 8H6" /><circle cx="9" cy="19" r="1" /><circle cx="17" cy="19" r="1" /></svg>; }
function RevenueIcon() { return <svg aria-hidden="true" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 3v18M16.5 7.5c0-1.7-1.8-3-4.5-3S7.5 5.7 7.5 7.5s1.5 2.6 4.5 3 4.5 1.3 4.5 3-1.8 3-4.5 3-4.5-1.3-4.5-3" /></svg>; }
function UsersIcon() { return <svg aria-hidden="true" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="9" cy="8" r="3" /><path d="M3 20v-1a6 6 0 0 1 12 0v1M16 5.5a3 3 0 0 1 0 5.8M18 14a4 4 0 0 1 3 3.9V20" /></svg>; }
function AlertIcon() { return <svg aria-hidden="true" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="m12 3 9 17H3L12 3Z" /><path d="M12 9v4m0 3h.01" /></svg>; }
