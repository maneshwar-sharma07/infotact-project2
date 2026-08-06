import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import EmptyState from "../components/commerce/EmptyState";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import api from "../services/api";
import { subscribeToOrderUpdates } from "../services/orderSocket";
import type { ApiOrder, OrderStatus } from "../types/ecommerce";

const money = (value: number) => `₹${value.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
const statusStyles: Record<OrderStatus, string> = { Pending: "bg-amber-400/10 text-amber-200", Confirmed: "bg-blue-400/10 text-blue-300", Packed: "bg-orange-400/10 text-orange-300", Shipped: "bg-purple-400/10 text-purple-300", Delivered: "bg-emerald-400/10 text-emerald-300", Cancelled: "bg-red-400/10 text-red-300" };

export default function OrdersPage() {
  const { user } = useAuth(); const { notify } = useToast();
  const [orders, setOrders] = useState<ApiOrder[]>([]); const [loading, setLoading] = useState(true); const [error, setError] = useState("");
  useEffect(() => {
    if (!user) { setLoading(false); return; }
    let mounted = true;
    const load = async () => { setLoading(true); try { const response = await api.get<{ orders: ApiOrder[] }>("/orders"); if (mounted) setOrders(response.data.orders); } catch { if (mounted) setError("Unable to load your orders. Please try again."); } finally { if (mounted) setLoading(false); } };
    void load();
    const unsubscribe = subscribeToOrderUpdates((updated) => { if (!mounted) return; setOrders((current) => current.map((order) => order.id === updated.id ? updated : order)); notify(`Order ${updated.orderNumber} is now ${updated.status}.`); });
    return () => { mounted = false; unsubscribe(); };
  }, [user, notify]);
  const cancel = async (order: ApiOrder) => { if (!window.confirm("Cancel this pending order?")) return; try { await api.delete(`/orders/${order.id}`); setOrders((current) => current.map((item) => item.id === order.id ? { ...item, status: "Cancelled" } : item)); notify("Order cancelled successfully."); } catch { notify("Only pending orders can be cancelled.", "error"); } };
  if (!user) return <main className="mx-auto min-h-screen max-w-4xl px-4 py-16"><EmptyState title="Sign in to view your orders" text="Your order history is securely linked to your account." action="Sign in" to="/login" /></main>;
  if (loading) return <main className="mx-auto min-h-screen max-w-6xl px-4 py-12"><div className="h-9 w-52 animate-pulse rounded bg-white/10" /><div className="mt-8 grid gap-4 md:grid-cols-2">{[1, 2, 3, 4].map((item) => <div key={item} className="h-52 animate-pulse rounded-2xl bg-white/5" />)}</div></main>;
  if (error) return <main className="mx-auto min-h-screen max-w-5xl px-4 py-16 text-center text-red-200">{error}</main>;
  if (!orders.length) return <main className="mx-auto min-h-screen max-w-5xl px-4 py-12"><EmptyState title="No orders yet" text="When you place an order, the details and delivery tracking will appear here." action="Start shopping" to="/catalog" /></main>;
  return <main className="mx-auto min-h-screen max-w-6xl px-4 py-12 text-white sm:px-6"><p className="text-sm font-semibold uppercase tracking-[0.16em] text-cyan-400">Account</p><h1 className="mt-2 text-3xl font-bold sm:text-4xl">My Orders</h1><p className="mt-2 text-sm text-slate-400">Track every purchase as it moves from confirmation to delivery.</p><section className="mt-8 grid gap-4 md:grid-cols-2">{orders.map((order) => <article key={order.id} className="rounded-2xl border border-white/[0.09] bg-[#111118] p-5 shadow-xl shadow-black/20 transition hover:border-purple-400/40"><div className="flex items-start justify-between gap-4"><div><p className="font-bold text-white">{order.orderNumber}</p><p className="mt-1 text-sm text-slate-500">{new Date(order.createdAt).toLocaleDateString("en-IN", { dateStyle: "medium" })}</p></div><span className={`rounded-full px-3 py-1 text-xs font-bold ${statusStyles[order.status]}`}>{order.status}</span></div><div className="mt-5 grid grid-cols-2 gap-3 border-y border-white/[0.07] py-4 text-sm"><div><p className="text-slate-500">Payment</p><p className="mt-1 font-medium text-slate-200">{order.paymentMethod}</p></div><div className="text-right"><p className="text-slate-500">Total amount</p><p className="mt-1 font-bold text-purple-300">{money(order.totalAmount)}</p></div></div><div className="mt-4 flex items-center justify-between gap-3"><p className="min-w-0 truncate text-sm text-slate-400">{order.items.length} {order.items.length === 1 ? "item" : "items"}</p><div className="flex shrink-0 gap-4"><Link to={`/orders/${order.id}`} className="text-sm font-semibold text-cyan-300 hover:text-cyan-200">Track order</Link>{order.status === "Pending" && <button type="button" onClick={() => void cancel(order)} className="text-sm font-semibold text-red-300 hover:text-red-200">Cancel</button>}</div></div></article>)}</section></main>;
}
