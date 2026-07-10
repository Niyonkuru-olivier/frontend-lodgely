"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../context/AuthContext";

/* ─────────── Types ─────────── */
interface User {
  id: number;
  email: string;
  name: string;
  role: string;
  createdAt: string;
}

interface Accommodation {
  id: number;
  title: string;
  description: string;
  location: string;
  price: number;
  type: string;
  capacity: number;
  images: string[];
  amenities: string[];
  availability: boolean;
  createdAt: string;
}

interface Stats {
  totalUsers: number;
  adminCount: number;
  userCount: number;
  totalAccommodations: number;
  availableAccommodations: number;
  unavailableAccommodations: number;
}

const ACCOMMODATION_TYPES = [
  "Hotel", "Residential House", "Lodge", "Villa", "Cabin",
  "Apartment", "Guest House", "Resort", "Hostel", "Studio",
];

const AMENITY_OPTIONS = [
  "Wi-Fi", "Pool", "Spa", "AC", "Gym", "Breakfast", "Kitchen",
  "Parking", "Beach View", "Mountain View", "Lake View", "Forest View",
  "Barbecue", "Fire Pit", "Kayaks", "Fireplace", "Heating",
  "Restaurant", "Tours", "Washing Machine", "Balcony", "Garden",
];

/* ─────────── Component ─────────── */
export default function AdminDashboard() {
  const { user, token, loading: authLoading } = useAuth();
  const router = useRouter();
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  // Navigation
  const [activeTab, setActiveTab] = useState<"overview" | "users" | "accommodations">("overview");

  // Data
  const [stats, setStats] = useState<Stats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [accommodations, setAccommodations] = useState<Accommodation[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [userModal, setUserModal] = useState<{ open: boolean; mode: "add" | "edit"; user?: User }>({ open: false, mode: "add" });
  const [accModal, setAccModal] = useState<{ open: boolean; mode: "add" | "edit"; item?: Accommodation }>({ open: false, mode: "add" });
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; type: "user" | "accommodation"; id: number; name: string } | null>(null);

  // Toast
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const authHeaders = useCallback(() => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  }), [token]);

  /* ─── Data fetching ─── */
  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/admin/stats`, { headers: authHeaders() });
      if (res.ok) setStats(await res.json());
    } catch { /* ignore */ }
  }, [API_URL, authHeaders]);

  const fetchUsers = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/admin/users`, { headers: authHeaders() });
      if (res.ok) setUsers(await res.json());
    } catch { /* ignore */ }
  }, [API_URL, authHeaders]);

  const fetchAccommodations = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/accommodations`, { headers: authHeaders() });
      if (res.ok) setAccommodations(await res.json());
    } catch { /* ignore */ }
  }, [API_URL, authHeaders]);

  useEffect(() => {
    if (authLoading) return;
    if (!user || user.role !== "admin") {
      router.push("/");
      return;
    }
    const load = async () => {
      setLoading(true);
      await Promise.all([fetchStats(), fetchUsers(), fetchAccommodations()]);
      setLoading(false);
    };
    load();
  }, [authLoading, user, router, fetchStats, fetchUsers, fetchAccommodations]);

  /* ─── User CRUD ─── */
  const handleSaveUser = async (data: { name: string; email: string; password?: string; role: string }, editId?: number) => {
    const url = editId ? `${API_URL}/admin/users/${editId}` : `${API_URL}/admin/users`;
    const method = editId ? "PATCH" : "POST";
    const body: Record<string, string> = { name: data.name, email: data.email, role: data.role };
    if (data.password) body.password = data.password;

    try {
      const res = await fetch(url, { method, headers: authHeaders(), body: JSON.stringify(body) });
      if (res.ok) {
        showToast(editId ? "User updated successfully" : "User created successfully", "success");
        fetchUsers();
        fetchStats();
        setUserModal({ open: false, mode: "add" });
      } else {
        const err = await res.json();
        showToast(err.message || "Failed to save user", "error");
      }
    } catch {
      showToast("Network error", "error");
    }
  };

  const handleDeleteUser = async (id: number) => {
    try {
      const res = await fetch(`${API_URL}/admin/users/${id}`, { method: "DELETE", headers: authHeaders() });
      if (res.ok) {
        showToast("User deleted", "success");
        fetchUsers();
        fetchStats();
      } else {
        showToast("Failed to delete user", "error");
      }
    } catch {
      showToast("Network error", "error");
    }
    setDeleteConfirm(null);
  };

  /* ─── Accommodation CRUD ─── */
  const handleSaveAccommodation = async (data: Partial<Accommodation>, editId?: number) => {
    const url = editId ? `${API_URL}/accommodations/${editId}` : `${API_URL}/accommodations`;
    const method = editId ? "PATCH" : "POST";

    try {
      const res = await fetch(url, { method, headers: authHeaders(), body: JSON.stringify(data) });
      if (res.ok) {
        showToast(editId ? "Accommodation updated" : "Accommodation created", "success");
        fetchAccommodations();
        fetchStats();
        setAccModal({ open: false, mode: "add" });
      } else {
        const err = await res.json();
        showToast(err.message || "Failed to save", "error");
      }
    } catch {
      showToast("Network error", "error");
    }
  };

  const handleDeleteAccommodation = async (id: number) => {
    try {
      const res = await fetch(`${API_URL}/accommodations/${id}`, { method: "DELETE", headers: authHeaders() });
      if (res.ok) {
        showToast("Accommodation deleted", "success");
        fetchAccommodations();
        fetchStats();
      } else {
        showToast("Failed to delete", "error");
      }
    } catch {
      showToast("Network error", "error");
    }
    setDeleteConfirm(null);
  };

  /* ─── Render guards ─── */
  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-3 border-indigo-600 border-t-transparent" />
          <p className="text-sm text-zinc-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user || user.role !== "admin") return null;

  /* ─────────── Sidebar Items ─────────── */
  const sidebarItems = [
    {
      id: "overview" as const,
      label: "Overview",
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
        </svg>
      ),
    },
    {
      id: "users" as const,
      label: "User Management",
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
        </svg>
      ),
    },
    {
      id: "accommodations" as const,
      label: "Accommodations",
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.25 21v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21m0 0h4.5V3.545M12.75 21h7.5V10.75M2.25 21h1.5m18 0h-18M2.25 9l4.5-1.636M18.75 3l-1.5.545m0 6.205l3 1m1.5.5l-1.5-.5M6.75 7.364V3h-3v18m3-13.636l10.5-3.819" />
        </svg>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex">

      {/* ═══════ Sidebar ═══════ */}
      <aside className="fixed inset-y-0 left-0 z-30 flex w-64 flex-col border-r border-white/5 bg-zinc-950">
        {/* Sidebar header */}
        <div className="flex h-16 items-center gap-2.5 border-b border-white/5 px-6">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white font-bold shadow-lg shadow-indigo-500/30">
            L
          </div>
          <div>
            <span className="text-base font-bold tracking-tight text-white">Lodgely</span>
            <span className="block text-[10px] font-semibold uppercase tracking-widest text-indigo-400">Admin</span>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-1 p-4">
          {sidebarItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all
                ${activeTab === item.id
                  ? "bg-indigo-600/10 text-indigo-400 shadow-sm"
                  : "text-zinc-400 hover:bg-white/5 hover:text-zinc-200"
                }`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>

        {/* Sidebar footer */}
        <div className="border-t border-white/5 p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-600/20 text-indigo-400 font-bold text-sm">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="truncate text-sm font-semibold text-white">{user.name}</p>
              <p className="truncate text-xs text-zinc-500">{user.email}</p>
            </div>
          </div>
          <Link
            href="/"
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-xs font-semibold text-zinc-400 hover:bg-white/5 hover:text-white transition-colors"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Site
          </Link>
        </div>
      </aside>

      {/* ═══════ Main Content ═══════ */}
      <main className="flex-1 ml-64">
        {/* Top bar */}
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-white/5 bg-zinc-950/90 backdrop-blur-md px-8">
          <h1 className="text-lg font-bold capitalize">{activeTab === "overview" ? "Dashboard Overview" : activeTab === "users" ? "User Management" : "Accommodation Management"}</h1>
          <div className="text-xs text-zinc-500">
            {new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
          </div>
        </header>

        <div className="p-8">
          {/* ─── Overview Tab ─── */}
          {activeTab === "overview" && stats && (
            <div className="space-y-8">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                <StatCard label="Total Users" value={stats.totalUsers} icon="users" gradient="from-indigo-600 to-violet-600" />
                <StatCard label="Admins" value={stats.adminCount} icon="shield" gradient="from-amber-500 to-orange-500" />
                <StatCard label="Regular Users" value={stats.userCount} icon="user" gradient="from-cyan-500 to-blue-500" />
                <StatCard label="Total Accommodations" value={stats.totalAccommodations} icon="building" gradient="from-emerald-500 to-green-600" />
                <StatCard label="Available" value={stats.availableAccommodations} icon="check" gradient="from-green-500 to-emerald-500" />
                <StatCard label="Unavailable" value={stats.unavailableAccommodations} icon="x" gradient="from-rose-500 to-pink-500" />
              </div>

              {/* Quick Actions */}
              <div>
                <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-zinc-500">Quick Actions</h3>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <button onClick={() => { setActiveTab("users"); setUserModal({ open: true, mode: "add" }); }} className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/[.02] p-4 text-left hover:bg-white/5 transition-colors group">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600/10 text-indigo-400 group-hover:bg-indigo-600/20 transition-colors">
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">Add User</p>
                      <p className="text-xs text-zinc-500">Create new account</p>
                    </div>
                  </button>
                  <button onClick={() => { setActiveTab("accommodations"); setAccModal({ open: true, mode: "add" }); }} className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/[.02] p-4 text-left hover:bg-white/5 transition-colors group">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600/10 text-emerald-400 group-hover:bg-emerald-600/20 transition-colors">
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">Add Accommodation</p>
                      <p className="text-xs text-zinc-500">Create new listing</p>
                    </div>
                  </button>
                  <button onClick={() => setActiveTab("users")} className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/[.02] p-4 text-left hover:bg-white/5 transition-colors group">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-600/10 text-cyan-400 group-hover:bg-cyan-600/20 transition-colors">
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">Manage Users</p>
                      <p className="text-xs text-zinc-500">View all users</p>
                    </div>
                  </button>
                  <button onClick={() => setActiveTab("accommodations")} className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/[.02] p-4 text-left hover:bg-white/5 transition-colors group">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-600/10 text-amber-400 group-hover:bg-amber-600/20 transition-colors">
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">Manage Listings</p>
                      <p className="text-xs text-zinc-500">View all accommodations</p>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ─── Users Tab ─── */}
          {activeTab === "users" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <p className="text-sm text-zinc-400">{users.length} users total</p>
                <button
                  onClick={() => setUserModal({ open: true, mode: "add" })}
                  className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 shadow-lg shadow-indigo-600/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                  Add User
                </button>
              </div>

              {/* Users Table */}
              <div className="overflow-hidden rounded-2xl border border-white/5">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/5 bg-white/[.02]">
                      <th className="px-6 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-zinc-500">User</th>
                      <th className="px-6 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-zinc-500">Email</th>
                      <th className="px-6 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-zinc-500">Role</th>
                      <th className="px-6 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-zinc-500">Created</th>
                      <th className="px-6 py-3.5 text-right text-xs font-bold uppercase tracking-wider text-zinc-500">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {users.map((u) => (
                      <tr key={u.id} className="hover:bg-white/[.02] transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className={`flex h-9 w-9 items-center justify-center rounded-full font-bold text-sm ${u.role === "admin" ? "bg-amber-500/15 text-amber-400" : "bg-indigo-500/15 text-indigo-400"}`}>
                              {u.name.charAt(0).toUpperCase()}
                            </div>
                            <span className="font-semibold text-sm">{u.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-zinc-400">{u.email}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-bold ${u.role === "admin" ? "bg-amber-500/10 text-amber-400 ring-1 ring-amber-500/20" : "bg-indigo-500/10 text-indigo-400 ring-1 ring-indigo-500/20"}`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-zinc-500">{new Date(u.createdAt).toLocaleDateString()}</td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => setUserModal({ open: true, mode: "edit", user: u })}
                              className="rounded-lg p-2 text-zinc-500 hover:bg-white/5 hover:text-indigo-400 transition-colors"
                              title="Edit"
                            >
                              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                            </button>
                            <button
                              onClick={() => setDeleteConfirm({ open: true, type: "user", id: u.id, name: u.name })}
                              className="rounded-lg p-2 text-zinc-500 hover:bg-rose-500/10 hover:text-rose-400 transition-colors"
                              title="Delete"
                            >
                              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ─── Accommodations Tab ─── */}
          {activeTab === "accommodations" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <p className="text-sm text-zinc-400">{accommodations.length} listings total</p>
                <button
                  onClick={() => setAccModal({ open: true, mode: "add" })}
                  className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-500 shadow-lg shadow-emerald-600/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                  Add Accommodation
                </button>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                {accommodations.map((acc) => (
                  <div key={acc.id} className="group overflow-hidden rounded-2xl border border-white/5 bg-white/[.02] hover:bg-white/[.04] transition-all">
                    {/* Image */}
                    <div className="relative aspect-video bg-zinc-900 overflow-hidden">
                      {acc.images[0] ? (
                        <img src={acc.images[0]} alt={acc.title} className="h-full w-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500" />
                      ) : (
                        <div className="flex h-full items-center justify-center text-zinc-700">
                          <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                        </div>
                      )}
                      {/* Availability badge */}
                      <span className={`absolute top-3 left-3 rounded-lg px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider backdrop-blur-sm ${acc.availability ? "bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-500/30" : "bg-rose-500/20 text-rose-300 ring-1 ring-rose-500/30"}`}>
                        {acc.availability ? "Available" : "Unavailable"}
                      </span>
                      <span className="absolute top-3 right-3 rounded-lg bg-black/50 px-2.5 py-1 text-[10px] font-bold text-white backdrop-blur-sm">
                        {acc.type}
                      </span>
                    </div>

                    <div className="p-4 space-y-2">
                      <h3 className="font-bold text-sm truncate text-white">{acc.title}</h3>
                      <div className="flex items-center gap-2 text-xs text-zinc-500">
                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                        {acc.location}
                        <span className="text-zinc-700">•</span>
                        <span>{acc.capacity} guests</span>
                      </div>
                      <div className="flex items-center justify-between pt-2 border-t border-white/5">
                        <span className="text-lg font-bold text-white">${acc.price}<span className="text-xs font-normal text-zinc-500">/night</span></span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => setAccModal({ open: true, mode: "edit", item: acc })}
                            className="rounded-lg p-2 text-zinc-500 hover:bg-white/5 hover:text-indigo-400 transition-colors"
                            title="Edit"
                          >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                          </button>
                          <button
                            onClick={() => setDeleteConfirm({ open: true, type: "accommodation", id: acc.id, name: acc.title })}
                            className="rounded-lg p-2 text-zinc-500 hover:bg-rose-500/10 hover:text-rose-400 transition-colors"
                            title="Delete"
                          >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* ═══════ Modals ═══════ */}

      {/* User Modal */}
      {userModal.open && (
        <UserFormModal
          mode={userModal.mode}
          user={userModal.user}
          onSave={handleSaveUser}
          onClose={() => setUserModal({ open: false, mode: "add" })}
        />
      )}

      {/* Accommodation Modal */}
      {accModal.open && (
        <AccommodationFormModal
          mode={accModal.mode}
          item={accModal.item}
          onSave={handleSaveAccommodation}
          onClose={() => setAccModal({ open: false, mode: "add" })}
        />
      )}

      {/* Delete Confirmation */}
      {deleteConfirm?.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-zinc-900 p-6 shadow-2xl">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-500/10">
              <svg className="h-6 w-6 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-center text-lg font-bold text-white">Confirm Deletion</h3>
            <p className="mt-2 text-center text-sm text-zinc-400">
              Are you sure you want to delete <strong className="text-white">{deleteConfirm.name}</strong>? This action cannot be undone.
            </p>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 rounded-xl border border-white/10 py-2.5 text-sm font-semibold text-zinc-300 hover:bg-white/5 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteConfirm.type === "user" ? handleDeleteUser(deleteConfirm.id) : handleDeleteAccommodation(deleteConfirm.id)}
                className="flex-1 rounded-xl bg-rose-600 py-2.5 text-sm font-semibold text-white hover:bg-rose-500 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-xl px-5 py-3 text-sm font-semibold shadow-2xl backdrop-blur-md transition-all animate-slide-up ${toast.type === "success" ? "bg-emerald-600/90 text-white" : "bg-rose-600/90 text-white"}`}>
          {toast.type === "success" ? (
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
          ) : (
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          )}
          {toast.message}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════ */
/* ═══════ Sub-components ═══════════════════════════════ */
/* ═══════════════════════════════════════════════════════ */

function StatCard({ label, value, icon, gradient }: { label: string; value: number; icon: string; gradient: string }) {
  const iconMap: Record<string, React.JSX.Element> = {
    users: <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg>,
    shield: <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" /></svg>,
    user: <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>,
    building: <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 7.5h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z" /></svg>,
    check: <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    x: <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  };

  return (
    <div className="rounded-2xl border border-white/5 bg-white/[.02] p-5 hover:bg-white/[.04] transition-colors">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-zinc-500">{label}</p>
          <p className="mt-1 text-3xl font-bold text-white">{value}</p>
        </div>
        <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${gradient} text-white shadow-lg`}>
          {iconMap[icon]}
        </div>
      </div>
    </div>
  );
}

/* ─── User Form Modal ─── */
function UserFormModal({ mode, user, onSave, onClose }: {
  mode: "add" | "edit";
  user?: User;
  onSave: (data: { name: string; email: string; password?: string; role: string }, editId?: number) => void;
  onClose: () => void;
}) {
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState(user?.role || "user");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-zinc-900 p-6 shadow-2xl">
        <h3 className="text-lg font-bold text-white">{mode === "add" ? "Add New User" : "Edit User"}</h3>
        <p className="mt-1 text-sm text-zinc-500">{mode === "add" ? "Create a new user account" : "Update user details"}</p>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            const data: { name: string; email: string; password?: string; role: string } = { name, email, role };
            if (password) data.password = password;
            onSave(data, user?.id);
          }}
          className="mt-5 space-y-4"
        >
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Full Name</label>
            <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className="mt-1.5 w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm text-white placeholder-zinc-600 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500" placeholder="John Doe" />
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Email</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1.5 w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm text-white placeholder-zinc-600 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500" placeholder="user@lodgely.com" />
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">
              Password {mode === "edit" && <span className="text-zinc-600 normal-case">(leave empty to keep current)</span>}
            </label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required={mode === "add"} className="mt-1.5 w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm text-white placeholder-zinc-600 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500" placeholder="••••••••" />
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Role</label>
            <div className="mt-1.5 grid grid-cols-2 gap-2">
              <button type="button" onClick={() => setRole("user")} className={`rounded-xl border px-4 py-2.5 text-sm font-semibold transition-all ${role === "user" ? "border-indigo-500 bg-indigo-600/10 text-indigo-400" : "border-white/10 text-zinc-400 hover:bg-white/5"}`}>
                👤 User
              </button>
              <button type="button" onClick={() => setRole("admin")} className={`rounded-xl border px-4 py-2.5 text-sm font-semibold transition-all ${role === "admin" ? "border-amber-500 bg-amber-600/10 text-amber-400" : "border-white/10 text-zinc-400 hover:bg-white/5"}`}>
                🛡️ Admin
              </button>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 rounded-xl border border-white/10 py-2.5 text-sm font-semibold text-zinc-300 hover:bg-white/5 transition-colors">Cancel</button>
            <button type="submit" className="flex-1 rounded-xl bg-indigo-600 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 transition-colors">{mode === "add" ? "Create User" : "Save Changes"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ─── Accommodation Form Modal ─── */
function AccommodationFormModal({ mode, item, onSave, onClose }: {
  mode: "add" | "edit";
  item?: Accommodation;
  onSave: (data: Partial<Accommodation>, editId?: number) => void;
  onClose: () => void;
}) {
  const [title, setTitle] = useState(item?.title || "");
  const [description, setDescription] = useState(item?.description || "");
  const [location, setLocation] = useState(item?.location || "");
  const [price, setPrice] = useState(item?.price?.toString() || "");
  const [type, setType] = useState(item?.type || "Hotel");
  const [capacity, setCapacity] = useState(item?.capacity?.toString() || "2");
  const [imagesStr, setImagesStr] = useState(item?.images?.join(", ") || "");
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>(item?.amenities || []);
  const [availability, setAvailability] = useState(item?.availability ?? true);

  const toggleAmenity = (a: string) => {
    setSelectedAmenities((prev) => prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="w-full max-w-2xl my-8 rounded-2xl border border-white/10 bg-zinc-900 p-6 shadow-2xl">
        <h3 className="text-lg font-bold text-white">{mode === "add" ? "Add New Accommodation" : "Edit Accommodation"}</h3>
        <p className="mt-1 text-sm text-zinc-500">{mode === "add" ? "Create a new listing" : "Update listing details"}</p>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            const images = imagesStr.split(",").map((s) => s.trim()).filter(Boolean);
            onSave({
              title, description, location,
              price: parseFloat(price),
              type, capacity: parseInt(capacity),
              images, amenities: selectedAmenities,
              availability,
            }, item?.id);
          }}
          className="mt-5 space-y-4 max-h-[70vh] overflow-y-auto pr-1"
        >
          {/* Title */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Title</label>
            <input type="text" required value={title} onChange={(e) => setTitle(e.target.value)} className="mt-1.5 w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm text-white placeholder-zinc-600 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500" placeholder="e.g., Luxury Lake View Villa" />
          </div>

          {/* Description */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Description</label>
            <textarea required value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="mt-1.5 w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm text-white placeholder-zinc-600 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none" placeholder="Describe the accommodation..." />
          </div>

          {/* Location + Price row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Location</label>
              <input type="text" required value={location} onChange={(e) => setLocation(e.target.value)} className="mt-1.5 w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm text-white placeholder-zinc-600 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500" placeholder="Kigali" />
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Price ($/night)</label>
              <input type="number" required min="1" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} className="mt-1.5 w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm text-white placeholder-zinc-600 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500" placeholder="150" />
            </div>
          </div>

          {/* Type + Capacity row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Type</label>
              <select value={type} onChange={(e) => setType(e.target.value)} className="mt-1.5 w-full rounded-xl border border-white/10 bg-zinc-800 px-3.5 py-2.5 text-sm text-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500">
                {ACCOMMODATION_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Capacity (guests)</label>
              <input type="number" required min="1" value={capacity} onChange={(e) => setCapacity(e.target.value)} className="mt-1.5 w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm text-white placeholder-zinc-600 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500" placeholder="4" />
            </div>
          </div>

          {/* Images */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Image URLs <span className="text-zinc-600 normal-case">(comma-separated)</span></label>
            <textarea value={imagesStr} onChange={(e) => setImagesStr(e.target.value)} rows={2} className="mt-1.5 w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm text-white placeholder-zinc-600 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none" placeholder="https://images.unsplash.com/..." />
          </div>

          {/* Amenities */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Amenities</label>
            <div className="mt-2 flex flex-wrap gap-2">
              {AMENITY_OPTIONS.map((a) => (
                <button
                  key={a}
                  type="button"
                  onClick={() => toggleAmenity(a)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                    selectedAmenities.includes(a)
                      ? "bg-indigo-600/20 text-indigo-300 ring-1 ring-indigo-500/30"
                      : "bg-white/5 text-zinc-500 hover:bg-white/10 hover:text-zinc-300"
                  }`}
                >
                  {a}
                </button>
              ))}
            </div>
          </div>

          {/* Availability Toggle */}
          <div className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[.02] p-4">
            <div>
              <p className="text-sm font-semibold text-white">Availability</p>
              <p className="text-xs text-zinc-500">Set if this listing is currently available</p>
            </div>
            <button
              type="button"
              onClick={() => setAvailability(!availability)}
              className={`relative h-7 w-12 rounded-full transition-colors ${availability ? "bg-emerald-600" : "bg-zinc-700"}`}
            >
              <span className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow-md transition-transform ${availability ? "translate-x-5.5" : "translate-x-0.5"}`} />
            </button>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 rounded-xl border border-white/10 py-2.5 text-sm font-semibold text-zinc-300 hover:bg-white/5 transition-colors">Cancel</button>
            <button type="submit" className="flex-1 rounded-xl bg-emerald-600 py-2.5 text-sm font-semibold text-white hover:bg-emerald-500 transition-colors">{mode === "add" ? "Create Listing" : "Save Changes"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
