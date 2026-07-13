"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface User {
  id: number;
  email: string;
  name: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  requestPasswordReset: (email: string) => Promise<{
    success: boolean;
    message?: string;
    error?: string;
    resetLink?: string;
    emailSent?: boolean;
  }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  const normalizeEmail = (value: string) => value.trim().toLowerCase();

  useEffect(() => {
    // Check local storage for token
    const storedToken = localStorage.getItem("lodgely_token");
    const storedUser = localStorage.getItem("lodgely_user");

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: normalizeEmail(email), password }),
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.message || "Invalid credentials" };
      }

      localStorage.setItem("lodgely_token", data.access_token);
      localStorage.setItem("lodgely_user", JSON.stringify(data.user));
      setToken(data.access_token);
      setUser(data.user);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: "Network error. Please check if backend is running." };
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email: normalizeEmail(email), password }),
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.message || "Registration failed" };
      }

      // Automatically login on registration success
      return login(email, password);
    } catch (err: any) {
      return { success: false, error: "Network error. Please check if backend is running." };
    }
  };

  const requestPasswordReset = async (email: string) => {
    const normalizedEmail = normalizeEmail(email);

    if (!normalizedEmail) {
      return { success: false, error: "Email is required." };
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      return { success: false, error: "Please enter a valid email address." };
    }

    try {
      const response = await fetch(`${API_URL}/auth/forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: normalizedEmail }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        return {
          success: false,
          error: data.message || "Unable to process your request. Please try again.",
        };
      }

      return {
        success: true,
        message:
          data.message ||
          "If an account with that email exists, a password reset link has been sent.",
        resetLink: data.resetLink,
        emailSent: data.emailSent,
      };
    } catch {
      return {
        success: false,
        error: "Network error. Please check your connection and try again.",
      };
    }
  };

  const logout = () => {
    localStorage.removeItem("lodgely_token");
    localStorage.removeItem("lodgely_user");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, requestPasswordReset, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
