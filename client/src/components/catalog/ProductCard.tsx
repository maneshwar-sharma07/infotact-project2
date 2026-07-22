import { Link } from "react-router-dom";

export interface Product { id: string; name: string; description: string; price: number; category: string; stock: number; imageUrl?: string; }
interface ProductCardProps { product: Product; }

export default function ProductCard({ product }: ProductCardProps) {
  const isInStock = product.stock > 0;
  return (
    <article className="group overflow-hidden rounded-2xl border border-gray-800 bg-[#111118] shadow-xl shadow-black/20 transition duration-300 hover:-translate-y-1 hover:border-purple-500/70 hover:shadow-2xl hover:shadow-purple-950/40">
      <div className="relative overflow-hidden bg-[#171722]"><img src={product.imageUrl ?? "https://placehold.co/600x400/1F2937/FFFFFF?text=No+Image"} alt={product.name} className="h-56 w-full object-cover transition duration-500 group-hover:scale-110" /><span className="absolute left-3 top-3 rounded-full bg-cyan-400 px-3 py-1 text-xs font-bold text-[#0A0A0F]">{product.category}</span><span className="absolute right-3 top-3 rounded-full bg-yellow-300 px-3 py-1 text-xs font-bold text-[#16120a]">★ 4.8</span></div>
      <div className="p-5"><h2 className="truncate text-xl font-bold text-white">{product.name}</h2><p className="mt-2 min-h-10 text-sm leading-5 text-gray-400">{product.description}</p><div className="mt-5 flex items-center justify-between gap-3"><span className="text-2xl font-bold text-purple-400">₹{product.price.toLocaleString("en-IN")}</span><span className={`rounded-full px-3 py-1 text-xs font-semibold ${isInStock ? "bg-emerald-400/10 text-emerald-300" : "bg-red-400/10 text-red-300"}`}>{isInStock ? `${product.stock} in stock` : "Out of stock"}</span></div><Link to={`/product/${product.id}`} className="mt-5 block rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 py-3 text-center text-sm font-semibold text-white transition hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-cyan-400">View Details</Link></div>
    </article>
  );
}
