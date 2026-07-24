import { createContext, useCallback, useContext, useState, type ReactNode } from "react";

type Toast = { id: number; message: string; tone: "success" | "info" | "error" };
type ToastContextValue = { notify: (message: string, tone?: Toast["tone"]) => void };
const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const notify = useCallback((message: string, tone: Toast["tone"] = "success") => { const id = Date.now(); setToasts((current) => [...current, { id, message, tone }]); window.setTimeout(() => setToasts((current) => current.filter((toast) => toast.id !== id)), 3200); }, []);
  return <ToastContext.Provider value={{ notify }}>{children}<div aria-live="polite" className="fixed right-4 top-24 z-[70] flex w-[min(360px,calc(100vw-2rem))] flex-col gap-3">{toasts.map((toast) => <div key={toast.id} className={`rounded-xl border px-4 py-3 text-sm font-semibold shadow-2xl backdrop-blur ${toast.tone === "error" ? "border-red-400/50 bg-red-950/95 text-red-100" : toast.tone === "info" ? "border-cyan-400/50 bg-cyan-950/95 text-cyan-100" : "border-emerald-400/50 bg-emerald-950/95 text-emerald-100"}`}>{toast.message}</div>)}</div></ToastContext.Provider>;
}
export function useToast() { const context = useContext(ToastContext); if (!context) throw new Error("useToast must be used within ToastProvider."); return context; }
