import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import api from "../services/api";

type FormErrors = {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
};

export default function SignupPage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = (): FormErrors => {
    const validationErrors: FormErrors = {};

    if (!name.trim()) validationErrors.name = "Full name is required.";
    if (!email.trim()) validationErrors.email = "Email is required.";
    if (!password) validationErrors.password = "Password is required.";
    else if (password.length < 6) {
      validationErrors.password = "Password must be at least 6 characters.";
    }
    if (!confirmPassword) {
      validationErrors.confirmPassword = "Please confirm your password.";
    } else if (password !== confirmPassword) {
      validationErrors.confirmPassword = "Passwords do not match.";
    }

    return validationErrors;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const validationErrors = validate();

    setErrors(validationErrors);
    setError("");
    setSuccess("");

    if (Object.keys(validationErrors).length > 0) return;

    setIsSubmitting(true);

    try {
      await api.post("/auth/register", {
        name: name.trim(),
        email: email.trim(),
        password,
      });

      setSuccess("Account created successfully. Redirecting to login...");
      window.setTimeout(() => navigate("/login"), 1000);
    } catch (requestError: unknown) {
      const backendMessage = axios.isAxiosError(requestError)
        ? requestError.response?.data?.message
        : undefined;
      setError(
        typeof backendMessage === "string" && backendMessage.trim()
          ? backendMessage
          : "Registration failed.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClassName =
    "w-full rounded-lg border border-gray-700 bg-[#0A0A0F] px-4 py-3 text-white placeholder:text-gray-500 transition focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/20";

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#0A0A0F] px-4 py-10">
      <section className="w-full max-w-md rounded-2xl border border-gray-800 bg-[#111118] p-6 shadow-2xl sm:p-8">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-400">
            ShopSphere
          </p>
          <h1 className="mt-3 text-3xl font-bold text-purple-400 sm:text-4xl">
            Create your account
          </h1>
          <p className="mt-2 text-gray-400">Join us and start shopping.</p>
        </div>

        {error && (
          <div role="alert" className="mt-6 rounded-lg border border-red-500/70 bg-red-500/10 p-3 text-sm text-red-300">
            {error}
          </div>
        )}

        {success && (
          <div role="status" className="mt-6 rounded-lg border border-cyan-400/70 bg-cyan-400/10 p-3 text-sm text-cyan-200">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-8 space-y-5" noValidate>
          <label className="block text-sm font-medium text-gray-300" htmlFor="name">
            Full Name
            <input id="name" type="text" autoComplete="name" value={name} onChange={(event) => setName(event.target.value)} aria-invalid={Boolean(errors.name)} aria-describedby={errors.name ? "name-error" : undefined} className={`${inputClassName} mt-2`} placeholder="Your full name" disabled={isSubmitting} />
            {errors.name && <span id="name-error" className="mt-1 block text-sm text-red-400">{errors.name}</span>}
          </label>

          <label className="block text-sm font-medium text-gray-300" htmlFor="email">
            Email
            <input id="email" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? "email-error" : undefined} className={`${inputClassName} mt-2`} placeholder="you@example.com" disabled={isSubmitting} />
            {errors.email && <span id="email-error" className="mt-1 block text-sm text-red-400">{errors.email}</span>}
          </label>

          <label className="block text-sm font-medium text-gray-300" htmlFor="password">
            Password
            <input id="password" type="password" autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} aria-invalid={Boolean(errors.password)} aria-describedby={errors.password ? "password-error" : undefined} className={`${inputClassName} mt-2`} placeholder="At least 6 characters" disabled={isSubmitting} />
            {errors.password && <span id="password-error" className="mt-1 block text-sm text-red-400">{errors.password}</span>}
          </label>

          <label className="block text-sm font-medium text-gray-300" htmlFor="confirm-password">
            Confirm Password
            <input id="confirm-password" type="password" autoComplete="new-password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} aria-invalid={Boolean(errors.confirmPassword)} aria-describedby={errors.confirmPassword ? "confirm-password-error" : undefined} className={`${inputClassName} mt-2`} placeholder="Re-enter your password" disabled={isSubmitting} />
            {errors.confirmPassword && <span id="confirm-password-error" className="mt-1 block text-sm text-red-400">{errors.confirmPassword}</span>}
          </label>

          <button type="submit" disabled={isSubmitting} className="w-full rounded-lg bg-gradient-to-r from-purple-600 to-cyan-500 py-3 font-semibold text-white transition hover:from-purple-500 hover:to-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-[#111118] disabled:cursor-not-allowed disabled:opacity-60">
            {isSubmitting ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-400">
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-cyan-400 transition hover:text-cyan-300 hover:underline">
            Login
          </Link>
        </p>
      </section>
    </main>
  );
}
