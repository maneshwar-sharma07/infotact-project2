import { Link } from "react-router-dom";

const QUICK_LINKS: [string, string][] = [["Home", "/"], ["Catalog", "/catalog"], ["Admin", "/admin"], ["Login", "/login"]];
const CATEGORY_LINKS: [string, string][] = [["Electronics", "/catalog"], ["Fashion", "/catalog"], ["Books", "/catalog"], ["Accessories", "/catalog"]];

export default function Footer() {
  return <footer className="border-t border-gray-800 bg-[#0A0A0F]">
    <div className="mx-auto w-full max-w-[1600px] px-4 py-14 sm:px-6 sm:py-16 lg:px-8">
      <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr] lg:gap-12">
        <div><Link to="/" className="text-2xl font-bold text-purple-400">ShopSphere</Link><p className="mt-4 max-w-sm leading-7 text-gray-400">Curated products and a premium shopping experience, all in one place.</p><div className="mt-6 flex gap-3"><SocialLink label="Instagram">◎</SocialLink><SocialLink label="Facebook">f</SocialLink><SocialLink label="X">𝕏</SocialLink></div></div>
        <FooterLinks title="Quick Links" links={QUICK_LINKS} />
        <FooterLinks title="Categories" links={CATEGORY_LINKS} />
        <div><h2 className="text-base font-semibold text-white">Contact</h2><div className="mt-4 space-y-3 text-sm leading-6 text-gray-400"><p><a href="mailto:support@shopsphere.com" className="transition hover:text-cyan-400">support@shopsphere.com</a></p><p>India</p><p>Monday–Friday, 9:00 AM–6:00 PM</p></div></div>
      </div>
      <p className="mt-12 border-t border-gray-800 pt-7 text-center text-sm text-gray-500">© 2026 ShopSphere. All rights reserved.</p>
    </div>
  </footer>;
}

function FooterLinks({ title, links }: { title: string; links: [string, string][] }) { return <div><h2 className="text-base font-semibold text-white">{title}</h2><nav className="mt-4 flex flex-col gap-3 text-sm text-gray-400">{links.map(([label, path]) => <Link key={label} to={path} className="transition hover:text-cyan-400">{label}</Link>)}</nav></div>; }
function SocialLink({ label, children }: { label: string; children: React.ReactNode }) { return <a href="#" aria-label={label} className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-700 text-gray-300 transition hover:-translate-y-0.5 hover:border-cyan-400 hover:text-cyan-300">{children}</a>; }
