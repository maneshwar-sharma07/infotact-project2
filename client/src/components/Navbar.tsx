import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function Navbar() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const linkClassName = "rounded-lg px-3 py-2 text-sm font-medium text-gray-300 transition hover:bg-white/5 hover:text-cyan-400";

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-50 border-b border-gray-800 bg-[#0A0A0F]/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <Link to="/" className="text-xl font-bold tracking-tight text-purple-400 sm:text-2xl">ShopSphere</Link>
        <nav aria-label="Primary navigation" className="order-3 flex w-full items-center justify-center gap-1 border-t border-gray-800 pt-3 sm:order-none sm:w-auto sm:border-0 sm:pt-0">
          <Link to="/" className={linkClassName}>Home</Link>
          {user ? <><Link to="/admin" className={linkClassName}>Admin</Link><button type="button" className={linkClassName}>Cart</button></> : <><Link to="/login" className={linkClassName}>Login</Link><Link to="/signup" className={linkClassName}>Signup</Link></>}
        </nav>
        {user ? (
          <button type="button" onClick={handleLogout} className="rounded-lg border border-cyan-400/70 px-3 py-2 text-sm font-semibold text-cyan-300 transition hover:bg-cyan-400 hover:text-[#0A0A0F]">Logout</button>
        ) : (
          <Link to="/login" className="rounded-lg bg-gradient-to-r from-purple-600 to-cyan-500 px-3 py-2 text-sm font-semibold text-white transition hover:opacity-90">Get Started</Link>
        )}
      </div>
    </header>
  );
}
