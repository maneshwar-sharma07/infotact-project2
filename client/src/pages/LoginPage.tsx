import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout, { authInputClass, googleButtonClass, primaryButtonClass } from "../components/auth/AuthLayout";
import { useAuth } from "../hooks/useAuth";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); setError(""); if (!email.trim() || !password) { setError("Email and password are required."); return; } setLoading(true); try { await login(email.trim(), password); navigate("/"); } catch (requestError: unknown) { setError(requestError instanceof Error ? requestError.message : "Login failed."); } finally { setLoading(false); } };

  return <AuthLayout eyebrow="Welcome back" title="Sign in to ShopSphere" subtitle="Continue discovering products picked for every part of your day.">
    {error && <div role="alert" className="mt-7 rounded-xl border border-red-500/70 bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</div>}
    <form onSubmit={handleSubmit} noValidate className="mt-8 space-y-5">
      <label htmlFor="email" className="block text-sm font-semibold text-gray-300">Email<input id="email" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} disabled={loading} className={authInputClass} placeholder="you@example.com" /></label>
      <label htmlFor="password" className="block text-sm font-semibold text-gray-300">Password<input id="password" type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} disabled={loading} className={authInputClass} placeholder="Your password" /></label>
      <div className="flex justify-end"><a href="mailto:support@shopsphere.com?subject=Password%20reset" className="text-sm font-semibold text-cyan-400 transition hover:text-cyan-300 hover:underline">Forgot password?</a></div>
      <button type="submit" disabled={loading} className={primaryButtonClass}>{loading ? "Signing in..." : "Login"}</button>
    </form>
    <div className="my-7 flex items-center gap-4 text-xs font-semibold uppercase tracking-[0.18em] text-gray-500"><span className="h-px flex-1 bg-gray-800" />or<span className="h-px flex-1 bg-gray-800" /></div>
    <button type="button" onClick={() => setError("Google sign-in is not configured yet.")} className={googleButtonClass}><span className="grid h-5 w-5 place-items-center rounded-full bg-white text-xs font-bold text-[#4285F4]">G</span>Continue with Google</button>
    <p className="mt-8 text-center text-sm text-gray-400">Don't have an account? <Link to="/signup" className="font-semibold text-cyan-400 transition hover:text-cyan-300 hover:underline">Create Account</Link></p>
  </AuthLayout>;
}
