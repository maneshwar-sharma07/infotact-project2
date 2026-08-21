import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import axios from "axios";
import api from "../services/api";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: "admin" | "customer";
};

type AuthContextType = {
  user: AuthUser | null;
  login: (email: string, password: string) => Promise<AuthUser>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
};

type AuthResponse = { token: string; user: AuthUser };

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function getStoredUser(): AuthUser | null {
  try {
    const storedUser = localStorage.getItem("user");
    const user = storedUser ? (JSON.parse(storedUser) as AuthUser) : null;
    const token = localStorage.getItem("token");
    if (!token || !user || !user.id || !user.name || !user.email || (user.role !== "admin" && user.role !== "customer")) throw new Error("Invalid stored session.");
    const payload = JSON.parse(atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/"))) as { exp?: unknown };
    if (typeof payload.exp === "number" && payload.exp * 1000 <= Date.now()) throw new Error("Expired session.");
    return user;
  } catch {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    return null;
  }
}

function getRequestError(error: unknown, fallback: string): string {
  if (!axios.isAxiosError(error)) return fallback;

  const responseData = error.response?.data as { message?: unknown; error?: unknown } | undefined;
  const message = responseData?.message ?? responseData?.error;
  return typeof message === "string" && message.trim() ? message : fallback;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(getStoredUser);

  useEffect(() => {
    const clearExpiredSession = () => setUser(null);
    window.addEventListener("shopsphere-session-expired", clearExpiredSession);
    return () => window.removeEventListener("shopsphere-session-expired", clearExpiredSession);
  }, []);

  const persistSession = (response: AuthResponse): AuthUser => {
    if (!response.token || !response.user?.id || !response.user.name || !response.user.email || (response.user.role !== "admin" && response.user.role !== "customer")) throw new Error("The server returned an invalid session.");
    localStorage.setItem("token", response.token);
    localStorage.setItem("user", JSON.stringify(response.user));
    setUser(response.user);
    return response.user;
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await api.post<AuthResponse>("/auth/login", { email, password });
      return persistSession(response.data);
    } catch (error: unknown) {
      throw new Error(getRequestError(error, "Invalid email or password."));
    }
  };

  const signup = async (name: string, email: string, password: string) => {
    try {
      await api.post<AuthResponse>("/auth/register", { name, email, password });
    } catch (error: unknown) {
      throw new Error(getRequestError(error, "Registration failed."));
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  return <AuthContext.Provider value={{ user, login, signup, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider.");
  return context;
}
