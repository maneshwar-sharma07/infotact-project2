import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="border-t border-gray-800 bg-[#0A0A0F]">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
          <div><Link to="/" className="text-2xl font-bold text-purple-400">ShopSphere</Link><p className="mt-4 max-w-sm leading-7 text-gray-400">A carefully curated shopping experience built for discovering products you will love.</p></div>
          <div><h2 className="text-base font-semibold text-white">Quick Links</h2><nav className="mt-4 flex flex-col gap-3 text-sm text-gray-400"><Link to="/" className="transition hover:text-cyan-400">Home</Link><Link to="/catalog" className="transition hover:text-cyan-400">Catalog</Link><Link to="/login" className="transition hover:text-cyan-400">Login</Link><Link to="/signup" className="transition hover:text-cyan-400">Create account</Link></nav></div>
          <div><h2 className="text-base font-semibold text-white">Contact</h2><div className="mt-4 space-y-3 text-sm text-gray-400"><p><a href="mailto:support@shopsphere.com" className="transition hover:text-cyan-400">support@shopsphere.com</a></p><p>India</p><p>Monday–Friday, 9:00 AM–6:00 PM</p></div></div>
        </div>
        <p className="mt-10 border-t border-gray-800 pt-6 text-center text-sm text-gray-500">© 2026 ShopSphere. All rights reserved.</p>
      </div>
    </footer>
  );
}
