import type { ReactNode } from "react";
import { Link } from "react-router-dom";

type AuthLayoutProps = { eyebrow: string; title: string; subtitle: string; children: ReactNode };

export default function AuthLayout({ eyebrow, title, subtitle, children }: AuthLayoutProps) {
  return <section className="relative flex min-h-[calc(100vh-5rem)] items-center justify-center overflow-hidden bg-[#0A0A0F] px-4 py-12 sm:min-h-[calc(100vh-5.5rem)] sm:px-6 lg:px-8">
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(124,58,237,0.18),_transparent_35%),radial-gradient(circle_at_bottom_left,_rgba(6,182,212,0.12),_transparent_30%)]" />
    <div className="relative w-full max-w-xl rounded-3xl border border-white/10 bg-[#111118]/95 p-6 shadow-2xl shadow-purple-950/40 backdrop-blur sm:p-10">
      <Link to="/" className="mx-auto block w-fit text-2xl font-extrabold tracking-tight text-purple-400 transition hover:text-purple-300">ShopSphere</Link>
      <div className="mt-7 text-center"><p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-400">{eyebrow}</p><h1 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">{title}</h1><p className="mx-auto mt-3 max-w-md leading-7 text-gray-400">{subtitle}</p></div>
      {children}
    </div>
  </section>;
}

export const authInputClass = "mt-2 w-full rounded-xl border border-gray-700 bg-[#0A0A0F] px-4 py-3.5 text-base text-white placeholder:text-gray-500 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 disabled:cursor-not-allowed disabled:opacity-60";
export const primaryButtonClass = "w-full rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 px-5 py-3.5 text-base font-semibold text-white shadow-lg shadow-purple-950/30 transition duration-200 hover:-translate-y-0.5 hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-[#111118] disabled:cursor-not-allowed disabled:opacity-60";
export const googleButtonClass = "flex w-full items-center justify-center gap-3 rounded-xl border border-gray-700 bg-white/5 px-5 py-3.5 text-base font-semibold text-white transition duration-200 hover:-translate-y-0.5 hover:border-cyan-400/70 hover:bg-white/10";
