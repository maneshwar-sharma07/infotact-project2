import { createContext, useContext, useState, type ReactNode } from "react";
import axios from "axios";
import api from "../services/api";

export type AuthUser = {
  id?: string;
  name: string;
  email: string;
  role?: "admin" | "customer";
};

type AuthContextType = {
  user: AuthUser | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
};

type AuthResponse = { token: string; user?: AuthUser };

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function getStoredUser(): AuthUser | null {
  try {
    const storedUser = localStorage.getItem("user");
    return storedUser ? (JSON.parse(storedUser) as AuthUser) : null;
  } catch {
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

  const persistSession = (response: AuthResponse) => {
    localStorage.setItem("token", response.token);
    if (response.user) {
      localStorage.setItem("user", JSON.stringify(response.user));
      setUser(response.user);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await api.post<AuthResponse>("/auth/login", { email, password });
      persistSession(response.data);
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
