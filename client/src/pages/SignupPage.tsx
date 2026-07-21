import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

type FormErrors = { name?: string; email?: string; password?: string; confirmPassword?: string };

export default function SignupPage() {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors: FormErrors = {};
    if (!name.trim()) nextErrors.name = "Full name is required.";
    if (!email.trim()) nextErrors.email = "Email is required.";
    if (!password) nextErrors.password = "Password is required.";
    else if (password.length < 6) nextErrors.password = "Password must be at least 6 characters.";
    if (!confirmPassword) nextErrors.confirmPassword = "Please confirm your password.";
    else if (password !== confirmPassword) nextErrors.confirmPassword = "Passwords do not match.";
    setErrors(nextErrors);
    setError("");
    setSuccess("");
    if (Object.keys(nextErrors).length) return;

    setLoading(true);
    try {
      await signup(name.trim(), email.trim(), password);
      setSuccess("Account created successfully. Redirecting to login...");
      window.setTimeout(() => navigate("/login"), 1000);
    } catch (requestError: unknown) {
      setError(requestError instanceof Error ? requestError.message : "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  const inputClassName = "mt-2 w-full rounded-lg border border-gray-700 bg-[#0A0A0F] px-4 py-3 text-white placeholder:text-gray-500 transition focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/20 disabled:opacity-60";
  const renderError = (message: string | undefined, id: string) => message && <span id={id} className="mt-1 block text-sm text-red-400">{message}</span>;

  return (
    <section className="flex min-h-screen items-center justify-center bg-[#0A0A0F] px-4 py-10">
      <div className="w-full max-w-md rounded-2xl border border-gray-800 bg-[#111118] p-6 shadow-2xl shadow-purple-950/30 sm:p-8">
        <p className="text-center text-sm font-semibold uppercase tracking-[0.2em] text-cyan-400">ShopSphere</p>
        <h1 className="mt-3 text-center text-3xl font-bold text-purple-400 sm:text-4xl">Create your account</h1>
        <p className="mt-2 text-center text-gray-400">Join us and start shopping.</p>
        {error && <div role="alert" className="mt-6 rounded-lg border border-red-500/70 bg-red-500/10 p-3 text-sm text-red-300">{error}</div>}
        {success && <div role="status" className="mt-6 rounded-lg border border-cyan-400/70 bg-cyan-400/10 p-3 text-sm text-cyan-200">{success}</div>}
        <form onSubmit={handleSubmit} noValidate className="mt-8 space-y-5">
          <label htmlFor="name" className="block text-sm font-medium text-gray-300">Full Name<input id="name" type="text" autoComplete="name" value={name} onChange={(event) => setName(event.target.value)} disabled={loading} aria-invalid={Boolean(errors.name)} aria-describedby={errors.name ? "name-error" : undefined} className={inputClassName} placeholder="Your full name" />{renderError(errors.name, "name-error")}</label>
          <label htmlFor="email" className="block text-sm font-medium text-gray-300">Email<input id="email" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} disabled={loading} aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? "email-error" : undefined} className={inputClassName} placeholder="you@example.com" />{renderError(errors.email, "email-error")}</label>
          <label htmlFor="password" className="block text-sm font-medium text-gray-300">Password<input id="password" type="password" autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} disabled={loading} aria-invalid={Boolean(errors.password)} aria-describedby={errors.password ? "password-error" : undefined} className={inputClassName} placeholder="At least 6 characters" />{renderError(errors.password, "password-error")}</label>
          <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-300">Confirm Password<input id="confirm-password" type="password" autoComplete="new-password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} disabled={loading} aria-invalid={Boolean(errors.confirmPassword)} aria-describedby={errors.confirmPassword ? "confirm-password-error" : undefined} className={inputClassName} placeholder="Re-enter your password" />{renderError(errors.confirmPassword, "confirm-password-error")}</label>
          <button type="submit" disabled={loading} className="w-full rounded-lg bg-gradient-to-r from-purple-600 to-cyan-500 py-3 font-semibold text-white transition hover:from-purple-500 hover:to-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-[#111118] disabled:cursor-not-allowed disabled:opacity-60">{loading ? "Creating Account..." : "Create Account"}</button>
        </form>
        <p className="mt-6 text-center text-sm text-gray-400">Already have an account? <Link to="/login" className="font-semibold text-cyan-400 hover:text-cyan-300 hover:underline">Login</Link></p>
      </div>
    </section>
  );
}
