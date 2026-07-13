"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Fraunces, Manrope } from "next/font/google";

const display = Fraunces({
  subsets: ["latin"],
  variable: "--font-reset-display",
});

const body = Manrope({
  subsets: ["latin"],
  variable: "--font-reset-body",
});

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Invalid reset link. Please request a new one.");
    }
  }, [token]);

  const getPasswordStrength = (pwd: string) => {
    if (pwd.length === 0) return { label: "", color: "bg-transparent", width: "0%" };
    if (pwd.length < 6) return { label: "Too short", color: "bg-[#c45c4a]", width: "22%" };
    if (pwd.length < 8) return { label: "Getting there", color: "bg-[#d4a04a]", width: "48%" };
    if (/(?=.*[A-Z])(?=.*[0-9])/.test(pwd)) {
      return { label: "Strong", color: "bg-[#2f8f6b]", width: "100%" };
    }
    return { label: "Fair", color: "bg-[#3d8a7a]", width: "72%" };
  };

  const strength = getPasswordStrength(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setMessage("Passwords do not match.");
      setStatus("error");
      return;
    }
    if (password.length < 6) {
      setMessage("Password must be at least 6 characters.");
      setStatus("error");
      return;
    }

    setStatus("loading");
    setMessage("");

    try {
      const res = await fetch(`${API_URL}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();

      if (res.ok) {
        setStatus("success");
        setMessage(data.message || "Password reset successfully!");
        setTimeout(() => router.push("/"), 3000);
      } else {
        setStatus("error");
        setMessage(data.message || "Failed to reset password. The link may have expired.");
      }
    } catch {
      setStatus("error");
      setMessage("Network error. Please check your connection.");
    }
  };

  return (
    <div
      className={`${display.variable} ${body.variable} relative min-h-screen overflow-hidden bg-[#0c1412] text-[#e8efe9]`}
      style={{ fontFamily: "var(--font-reset-body), system-ui, sans-serif" }}
    >
      {/* Full-bleed atmosphere */}
      <div
        className="pointer-events-none absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=1800')",
        }}
      />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(120deg,rgba(8,18,16,0.92)_0%,rgba(8,18,16,0.72)_42%,rgba(12,28,24,0.55)_100%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-40 [background-image:radial-gradient(circle_at_20%_20%,rgba(61,138,122,0.35),transparent_40%),radial-gradient(circle_at_80%_80%,rgba(212,160,74,0.18),transparent_35%)]" />

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 py-8 sm:px-8 lg:flex-row lg:items-center lg:gap-16 lg:px-10">
        {/* Brand column */}
        <div className="mb-10 flex-1 animate-[fade-in_0.6s_ease-out] lg:mb-0">
          <Link href="/" className="inline-flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#2f8f6b] text-lg font-bold text-white shadow-[0_12px_40px_rgba(47,143,107,0.35)]">
              L
            </span>
            <span
              className="text-3xl tracking-tight text-white sm:text-4xl"
              style={{ fontFamily: "var(--font-reset-display), Georgia, serif" }}
            >
              Lodgely
            </span>
          </Link>
          <h1
            className="mt-8 max-w-md text-4xl leading-[1.1] text-white sm:text-5xl"
            style={{ fontFamily: "var(--font-reset-display), Georgia, serif" }}
          >
            Choose a fresh password for your stay.
          </h1>
          <p className="mt-4 max-w-sm text-base leading-relaxed text-[#b7c7bf]">
            Secure your account, then continue discovering lodging across Rwanda.
          </p>
          <div className="mt-8 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.18em] text-[#7fa397]">
            <span className="h-px w-8 bg-[#3d8a7a]" />
            Link expires in 1 hour
          </div>
        </div>

        {/* Form panel */}
        <div className="w-full max-w-md animate-[slide-up_0.55s_ease-out]">
          <div className="rounded-[28px] border border-white/10 bg-[#101a18]/80 p-7 shadow-[0_30px_80px_rgba(0,0,0,0.45)] backdrop-blur-xl sm:p-9">
            {status === "success" ? (
              <div className="text-center">
                <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-[#2f8f6b]/15 ring-1 ring-[#2f8f6b]/35">
                  <svg className="h-8 w-8 text-[#5ec49a]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h2
                  className="text-3xl text-white"
                  style={{ fontFamily: "var(--font-reset-display), Georgia, serif" }}
                >
                  You&apos;re all set
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-[#b7c7bf]">{message}</p>
                <p className="mt-4 text-xs text-[#7fa397]">Taking you home in a moment…</p>
                <Link
                  href="/"
                  className="mt-7 inline-flex w-full items-center justify-center rounded-2xl bg-[#2f8f6b] px-5 py-3.5 text-sm font-bold text-white transition hover:bg-[#267a5b]"
                >
                  Continue to Lodgely
                </Link>
              </div>
            ) : (
              <>
                <div className="mb-7">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#7fa397]">Account security</p>
                  <h2
                    className="mt-2 text-3xl text-white"
                    style={{ fontFamily: "var(--font-reset-display), Georgia, serif" }}
                  >
                    Set new password
                  </h2>
                  <p className="mt-2 text-sm text-[#b7c7bf]">
                    Pick something memorable and secure.
                  </p>
                </div>

                {status === "error" && message && (
                  <div className="mb-5 rounded-2xl border border-[#c45c4a]/30 bg-[#c45c4a]/10 px-4 py-3">
                    <p className="text-sm font-semibold text-[#f0a69a]">{message}</p>
                  </div>
                )}

                {!token ? (
                  <div className="text-center">
                    <p className="text-sm text-[#b7c7bf]">This reset link is invalid or missing.</p>
                    <Link href="/" className="mt-4 inline-block text-sm font-bold text-[#5ec49a] hover:underline">
                      Back to Lodgely
                    </Link>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                      <label className="text-xs font-bold uppercase tracking-[0.16em] text-[#8eaaa0]">
                        New password
                      </label>
                      <div className="relative mt-2">
                        <input
                          type={showPassword ? "text" : "password"}
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Enter a new password"
                          className="w-full rounded-2xl border border-white/10 bg-[#0c1412]/70 px-4 py-3.5 pr-12 text-sm text-white placeholder:text-[#6f857c] outline-none transition focus:border-[#3d8a7a] focus:ring-2 focus:ring-[#3d8a7a]/25"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-[#8eaaa0] transition hover:bg-white/5 hover:text-white"
                          aria-label={showPassword ? "Hide password" : "Show password"}
                        >
                          {showPassword ? (
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                            </svg>
                          ) : (
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          )}
                        </button>
                      </div>
                      {password.length > 0 && (
                        <div className="mt-2.5 space-y-1.5">
                          <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                            <div
                              className={`h-full rounded-full transition-all duration-300 ${strength.color}`}
                              style={{ width: strength.width }}
                            />
                          </div>
                          <p className="text-xs font-medium text-[#8eaaa0]">{strength.label}</p>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="text-xs font-bold uppercase tracking-[0.16em] text-[#8eaaa0]">
                        Confirm password
                      </label>
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Repeat your password"
                        className="mt-2 w-full rounded-2xl border border-white/10 bg-[#0c1412]/70 px-4 py-3.5 text-sm text-white placeholder:text-[#6f857c] outline-none transition focus:border-[#3d8a7a] focus:ring-2 focus:ring-[#3d8a7a]/25"
                      />
                      {confirmPassword && password !== confirmPassword && (
                        <p className="mt-2 text-xs font-semibold text-[#f0a69a]">Passwords do not match</p>
                      )}
                      {confirmPassword && password === confirmPassword && (
                        <p className="mt-2 text-xs font-semibold text-[#5ec49a]">Passwords match</p>
                      )}
                    </div>

                    <button
                      type="submit"
                      disabled={status === "loading" || !token}
                      className="w-full rounded-2xl bg-[#2f8f6b] py-3.5 text-sm font-bold text-white shadow-[0_14px_40px_rgba(47,143,107,0.35)] transition hover:bg-[#267a5b] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {status === "loading" ? (
                        <span className="inline-flex items-center justify-center gap-2">
                          <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                          Updating password…
                        </span>
                      ) : (
                        "Save new password"
                      )}
                    </button>
                  </form>
                )}

                <div className="mt-7 text-center">
                  <Link href="/" className="text-xs font-semibold text-[#7fa397] transition hover:text-[#b7c7bf]">
                    ← Back to Lodgely
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#0c1412]">
          <div className="h-9 w-9 animate-spin rounded-full border-2 border-[#2f8f6b] border-t-transparent" />
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
