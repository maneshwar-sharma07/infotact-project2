import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import EmptyState from "../components/commerce/EmptyState";
import { useCart } from "../context/CartContext";
import { useToast } from "../context/ToastContext";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

const money = (value: number) => `₹${value.toLocaleString("en-IN")}`;

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { items, total, clearCart } = useCart();
  const { notify } = useToast();
  const { user } = useAuth();
  const [address, setAddress] = useState("");
  const [payment, setPayment] = useState<"Card" | "Cash on Delivery">("Card");
  const [saving, setSaving] = useState(false);
  if (!items.length) return <main className="mx-auto min-h-screen w-full max-w-[1600px] px-4 py-12 sm:px-6 lg:px-8"><EmptyState title="Nothing to check out yet" text="Your cart is empty. Add a product before you check out." action="Go to cart" to="/cart" /></main>;
  const placeOrder = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user) { notify("Please sign in before placing an order.", "error"); navigate("/login"); return; }
    if (!address.trim()) { notify("Please enter your shipping address.", "error"); return; }
    setSaving(true);
    try {
      const response = await api.post<{ order: { id: string } }>("/orders", { items: items.map((item) => ({ product: item.id, name: item.name, price: item.price, quantity: item.quantity })), totalAmount: total, shippingAddress: address, paymentMethod: payment });
      clearCart(); notify("Order placed successfully."); navigate(`/orders/${response.data.order.id}`);
    } catch { notify("We could not place your order. Please try again.", "error"); }
    finally { setSaving(false); }
  };
  return <main className="mx-auto min-h-screen w-full max-w-[1200px] px-4 py-12 text-white sm:px-6 lg:px-8"><p className="text-sm font-semibold uppercase tracking-[0.16em] text-cyan-400">Secure checkout</p><h1 className="mt-2 text-3xl font-bold sm:text-4xl">Complete your order</h1><form onSubmit={placeOrder} className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]"><section className="rounded-2xl border border-gray-800 bg-[#111118] p-6 sm:p-8"><h2 className="text-xl font-bold">Shipping Address</h2><label className="mt-5 block text-sm font-semibold text-gray-300">Full address<textarea required value={address} onChange={(event) => setAddress(event.target.value)} className="mt-2 min-h-32 w-full rounded-xl border border-gray-700 bg-[#0A0A0F] px-4 py-3 text-white outline-none focus:border-cyan-400" placeholder="House number, street, city, state and postal code" /></label><h2 className="mt-8 text-xl font-bold">Payment Method</h2><div className="mt-4 grid gap-3 sm:grid-cols-2">{(["Card", "Cash on Delivery"] as const).map((method) => <label key={method} className={`cursor-pointer rounded-xl border p-4 transition ${payment === method ? "border-cyan-400 bg-cyan-400/10" : "border-gray-700"}`}><input type="radio" name="payment" value={method} checked={payment === method} onChange={() => setPayment(method)} className="sr-only" /><span className="font-semibold">{method}</span></label>)}</div></section><aside className="h-fit rounded-2xl border border-gray-800 bg-[#111118] p-6 lg:sticky lg:top-28"><h2 className="text-xl font-bold">Order Summary</h2><div className="mt-5 space-y-3 border-b border-gray-800 pb-5">{items.map((item) => <p key={item.id} className="flex justify-between gap-4 text-sm text-gray-400"><span className="truncate">{item.name} × {item.quantity}</span><span>{money(item.price * item.quantity)}</span></p>)}</div><p className="mt-5 flex justify-between text-xl font-bold"><span>Total</span><span className="text-purple-400">{money(total)}</span></p><button disabled={saving} className="mt-6 w-full rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 py-3.5 font-semibold transition hover:brightness-110 disabled:opacity-60">{saving ? "Placing order..." : "Place order"}</button></aside></form></main>;
}
