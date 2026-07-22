import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const navLinkClass = "rounded-xl px-4 py-2.5 text-base font-medium text-gray-300 transition duration-200 hover:bg-white/5 hover:text-cyan-300";
const secondaryButtonClass = "rounded-xl border border-cyan-400/70 px-4 py-2.5 text-base font-semibold text-cyan-300 transition duration-200 hover:-translate-y-0.5 hover:bg-cyan-400 hover:text-[#0A0A0F]";

export default function Navbar() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const handleLogout = () => { logout(); navigate("/"); };

  return <header className="sticky top-0 z-50 border-b border-gray-800/90 bg-[#0A0A0F]/95 shadow-lg shadow-black/10 backdrop-blur-xl transition-shadow duration-300">
    <div className="mx-auto flex min-h-20 max-w-[1600px] flex-wrap items-center justify-between gap-3 px-4 py-3 sm:min-h-[88px] sm:px-6 lg:px-8">
      <Link to="/" className="shrink-0 text-2xl font-extrabold tracking-tight text-purple-400 transition hover:text-purple-300 sm:text-3xl">ShopSphere</Link>
      <nav aria-label="Primary navigation" className="order-3 flex w-full items-center justify-center gap-1 border-t border-gray-800 pt-3 sm:order-none sm:w-auto sm:border-0 sm:pt-0 md:gap-2">
        <Link to="/" className={navLinkClass}>Home</Link><Link to="/catalog" className={navLinkClass}>Catalog</Link><Link to="/admin" className={navLinkClass}>Admin</Link><button type="button" className={navLinkClass}>Cart</button>
      </nav>
      {user ? <button type="button" onClick={handleLogout} className={secondaryButtonClass}>Logout</button> : <div className="flex items-center gap-2"><Link to="/login" className={navLinkClass}>Login</Link><Link to="/signup" className="rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 px-4 py-2.5 text-base font-semibold text-white shadow-lg shadow-purple-950/30 transition duration-200 hover:-translate-y-0.5 hover:brightness-110">Sign up</Link></div>}
    </div>
  </header>;
}
