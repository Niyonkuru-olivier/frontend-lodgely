"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode: "login" | "register";
}

type ModalMode = "login" | "register" | "forgot-password" | "forgot-success";

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, initialMode }) => {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<ModalMode>(initialMode);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  useEffect(() => {
    setMode(initialMode);
    setError("");
    setName("");
    setEmail("");
    setPassword("");
  }, [initialMode, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (mode === "forgot-password") {
      try {
        const res = await fetch(`${API_URL}/auth/forgot-password`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });
        setLoading(false);
        if (res.ok) {
          setMode("forgot-success");
        } else {
          setError("Something went wrong. Please try again.");
        }
      } catch {
        setLoading(false);
        setError("Network error. Is the backend running?");
      }
      return;
    }

    let res;
    if (mode === "login") {
      res = await login(email, password);
    } else {
      res = await register(name, email, password);
    }

    setLoading(false);

    if (res.success) {
      onClose();
    } else {
      setError(res.error || "Something went wrong. Try again.");
    }
  };

  const titles: Record<ModalMode, string> = {
    login: "Welcome Back",
    register: "Create Your Account",
    "forgot-password": "Reset Your Password",
    "forgot-success": "Check Your Email",
  };

  const subtitles: Record<ModalMode, string> = {
    login: "Sign in to access your Lodgely bookings",
    register: "Join Lodgely to search and book accommodations",
    "forgot-password": "Enter your email and we'll send you a reset link",
    "forgot-success": "A password reset link has been sent to your email",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/40 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-zinc-200 bg-white p-8 shadow-2xl dark:border-zinc-800 dark:bg-zinc-950">

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 rounded-full p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-900 dark:hover:text-zinc-200 transition-colors"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Header */}
        <div className="text-center">
          {/* Icon */}
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 dark:bg-indigo-950/40">
            {mode === "forgot-success" ? (
              <svg className="h-6 w-6 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ) : mode === "forgot-password" ? (
              <svg className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
            ) : (
              <svg className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            )}
          </div>
          <h2 className="text-2xl font-bold tracking-tight">{titles[mode]}</h2>
          <p className="mt-1 text-sm text-zinc-500">{subtitles[mode]}</p>
        </div>

        {/* Success State */}
        {mode === "forgot-success" && (
          <div className="mt-6 space-y-4">
            <div className="rounded-xl bg-emerald-50 border border-emerald-100 p-4 dark:bg-emerald-950/20 dark:border-emerald-900">
              <p className="text-sm text-emerald-700 dark:text-emerald-400">
                ✅ We&apos;ve sent a password reset link to <strong>{email}</strong>.
                Check your inbox (and spam folder). The link expires in 1 hour.
              </p>
            </div>
            <p className="text-xs text-center text-zinc-400">
              Didn&apos;t receive it?{" "}
              <button
                onClick={() => { setMode("forgot-password"); setError(""); }}
                className="text-indigo-600 hover:underline dark:text-indigo-400 font-semibold"
              >
                Resend
              </button>
            </p>
            <button
              onClick={() => setMode("login")}
              className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 py-2.5 text-sm font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors"
            >
              Back to Sign In
            </button>
          </div>
        )}

        {/* Error Alert */}
        {error && mode !== "forgot-success" && (
          <div className="mt-4 rounded-xl bg-rose-50 p-3 text-xs font-semibold text-rose-600 dark:bg-rose-950/20 dark:text-rose-400 border border-rose-100 dark:border-rose-950">
            {error}
          </div>
        )}

        {/* Form */}
        {mode !== "forgot-success" && (
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {mode === "register" && (
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  className="mt-1.5 w-full rounded-xl border border-zinc-200 bg-transparent px-3.5 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-zinc-800 dark:bg-zinc-900/30"
                />
              </div>
            )}

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@lodgely.com"
                className="mt-1.5 w-full rounded-xl border border-zinc-200 bg-transparent px-3.5 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-zinc-800 dark:bg-zinc-900/30"
              />
            </div>

            {(mode === "login" || mode === "register") && (
              <div>
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">Password</label>
                  {mode === "login" && (
                    <button
                      type="button"
                      onClick={() => { setMode("forgot-password"); setError(""); }}
                      className="text-xs text-indigo-600 hover:underline dark:text-indigo-400 font-medium"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="mt-1.5 w-full rounded-xl border border-zinc-200 bg-transparent px-3.5 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-zinc-800 dark:bg-zinc-900/30"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-indigo-600 py-3 font-semibold text-white shadow-lg shadow-indigo-600/20 hover:bg-indigo-500 disabled:opacity-50 transition-colors"
            >
              {loading
                ? "Please wait..."
                : mode === "login"
                ? "Sign In"
                : mode === "register"
                ? "Create Account"
                : "Send Reset Link"}
            </button>
          </form>
        )}

        {/* Toggle / Navigation */}
        {mode !== "forgot-success" && (
          <div className="mt-6 text-center text-xs text-zinc-500">
            {mode === "login" ? (
              <p>
                Don&apos;t have an account?{" "}
                <button
                  onClick={() => { setMode("register"); setError(""); }}
                  className="font-bold text-indigo-600 hover:underline dark:text-indigo-400"
                >
                  Sign Up
                </button>
              </p>
            ) : mode === "register" ? (
              <p>
                Already have an account?{" "}
                <button
                  onClick={() => { setMode("login"); setError(""); }}
                  className="font-bold text-indigo-600 hover:underline dark:text-indigo-400"
                >
                  Sign In
                </button>
              </p>
            ) : (
              <p>
                Remember your password?{" "}
                <button
                  onClick={() => { setMode("login"); setError(""); }}
                  className="font-bold text-indigo-600 hover:underline dark:text-indigo-400"
                >
                  Sign In
                </button>
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
