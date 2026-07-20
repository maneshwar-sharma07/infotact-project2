import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-gray-800 bg-[#0A0A0F]/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">

        <Link
          to="/"
          className="text-3xl font-bold text-purple-500"
        >
          ShopSphere
        </Link>

        <nav className="hidden gap-8 text-gray-300 md:flex">
          <Link to="/" className="hover:text-cyan-400 transition">
            Home
          </Link>

          <Link to="/admin" className="hover:text-cyan-400 transition">
            Admin
          </Link>
        </nav>

        <div className="flex items-center gap-3">

          <button className="rounded-lg border border-cyan-500 px-4 py-2 text-cyan-400 hover:bg-cyan-500 hover:text-black transition">
            Login
          </button>

          <button className="rounded-lg bg-purple-600 px-4 py-2 hover:bg-purple-700 transition">
            Cart
          </button>

        </div>

      </div>
    </header>
  );
}