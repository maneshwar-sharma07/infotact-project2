import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (!email.trim() || !password) {
      setError("Email and password are required.");
      return;
    }

    setLoading(true);
    try {
      await login(email.trim(), password);
      navigate("/");
    } catch (requestError: unknown) {
      setError(requestError instanceof Error ? requestError.message : "Login failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="flex min-h-screen items-center justify-center bg-[#0A0A0F] px-4 py-10">
      <div className="w-full max-w-md rounded-2xl border border-gray-800 bg-[#111118] p-6 shadow-2xl shadow-purple-950/30 sm:p-8">
        <p className="text-center text-sm font-semibold uppercase tracking-[0.2em] text-cyan-400">ShopSphere</p>
        <h1 className="mt-3 text-center text-3xl font-bold text-purple-400 sm:text-4xl">Welcome back</h1>
        <p className="mt-2 text-center text-gray-400">Log in to continue your shopping journey.</p>

        {error && <div role="alert" className="mt-6 rounded-lg border border-red-500/70 bg-red-500/10 p-3 text-sm text-red-300">{error}</div>}

        <form onSubmit={handleSubmit} noValidate className="mt-8 space-y-5">
          <label htmlFor="email" className="block text-sm font-medium text-gray-300">
            Email
            <input id="email" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} disabled={loading} className="mt-2 w-full rounded-lg border border-gray-700 bg-[#0A0A0F] px-4 py-3 text-white placeholder:text-gray-500 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/20 disabled:opacity-60" placeholder="you@example.com" />
          </label>
          <label htmlFor="password" className="block text-sm font-medium text-gray-300">
            Password
            <input id="password" type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} disabled={loading} className="mt-2 w-full rounded-lg border border-gray-700 bg-[#0A0A0F] px-4 py-3 text-white placeholder:text-gray-500 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/20 disabled:opacity-60" placeholder="Your password" />
          </label>
          <button type="submit" disabled={loading} className="w-full rounded-lg bg-gradient-to-r from-purple-600 to-cyan-500 py-3 font-semibold text-white transition hover:from-purple-500 hover:to-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-[#111118] disabled:cursor-not-allowed disabled:opacity-60">
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-gray-400">Don't have an account? <Link to="/signup" className="font-semibold text-cyan-400 hover:text-cyan-300 hover:underline">Sign Up</Link></p>
      </div>
    </section>
  );
}
