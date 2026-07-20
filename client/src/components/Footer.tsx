import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="mt-20 border-t border-gray-800 bg-[#0A0A0F]">
      <div className="mx-auto max-w-7xl px-6 py-12">

        <div className="grid gap-10 md:grid-cols-3">

          {/* Brand */}
          <div>
            <h2 className="text-3xl font-bold text-purple-500">
              ShopSphere
            </h2>

            <p className="mt-4 text-gray-400 leading-7">
              A modern MERN E-Commerce platform built with
              React, TypeScript, Express and MongoDB.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="mb-4 text-xl font-semibold text-white">
              Quick Links
            </h3>

            <div className="flex flex-col gap-3 text-gray-400">

              <Link to="/" className="hover:text-cyan-400">
                Home
              </Link>

              <Link to="/admin" className="hover:text-cyan-400">
                Admin Dashboard
              </Link>

            </div>
          </div>

          {/* Contact */}
          <div>
            <h3 className="mb-4 text-xl font-semibold text-white">
              Contact
            </h3>

            <p className="text-gray-400">
              📧 support@shopsphere.com
            </p>

            <p className="mt-2 text-gray-400">
              📍 India
            </p>
          </div>

        </div>

        <div className="mt-10 border-t border-gray-800 pt-6 text-center text-gray-500">
          © 2026 ShopSphere. All Rights Reserved.
        </div>

      </div>
    </footer>
  );
}