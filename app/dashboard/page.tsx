"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";

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
}

interface Booking {
  id: number;
  chambers: number;
  guests: number;
  checkIn: string;
  checkOut: string;
  totalPrice: number;
  status: string;
  notes?: string | null;
  createdAt: string;
  accommodation: Accommodation;
}

type Tab = "overview" | "profile" | "book" | "history";

const statusStyles: Record<string, string> = {
  pending: "bg-amber-500/10 text-amber-400 ring-1 ring-amber-500/20",
  confirmed: "bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20",
  cancelled: "bg-rose-500/10 text-rose-400 ring-1 ring-rose-500/20",
  completed: "bg-sky-500/10 text-sky-400 ring-1 ring-sky-500/20",
};

export default function UserDashboard() {
  const { user, token, loading: authLoading, updateProfile, apiUrl, logout } = useAuth();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [listings, setListings] = useState<Accommodation[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Profile form
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);

  // Booking form
  const [selectedListing, setSelectedListing] = useState<Accommodation | null>(null);
  const [chambers, setChambers] = useState("1");
  const [guests, setGuests] = useState("1");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [notes, setNotes] = useState("");
  const [bookingLoading, setBookingLoading] = useState(false);

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const authHeaders = useCallback(
    () => ({
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    }),
    [token],
  );

  const fetchBookings = useCallback(async () => {
    if (!token) return;
    const res = await fetch(`${apiUrl}/bookings/me`, { headers: authHeaders() });
    if (res.ok) setBookings(await res.json());
  }, [apiUrl, authHeaders, token]);

  const fetchListings = useCallback(async () => {
    const res = await fetch(`${apiUrl}/accommodations`);
    if (res.ok) setListings(await res.json());
  }, [apiUrl]);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push("/");
      return;
    }
    if (user.role === "admin") {
      router.push("/admin");
      return;
    }
    setName(user.name);
    setEmail(user.email);
    const load = async () => {
      setLoading(true);
      await Promise.all([fetchBookings(), fetchListings()]);
      setLoading(false);
    };
    load();
  }, [authLoading, user, router, fetchBookings, fetchListings]);

  const upcoming = useMemo(
    () =>
      bookings.filter(
        (b) =>
          ["pending", "confirmed"].includes(b.status) &&
          new Date(b.checkOut) >= new Date(new Date().toDateString()),
      ),
    [bookings],
  );

  const history = useMemo(
    () =>
      bookings.filter(
        (b) =>
          b.status === "completed" ||
          b.status === "cancelled" ||
          new Date(b.checkOut) < new Date(new Date().toDateString()),
      ),
    [bookings],
  );

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    const payload: {
      name?: string;
      email?: string;
      currentPassword?: string;
      newPassword?: string;
    } = { name, email };
    if (newPassword) {
      payload.currentPassword = currentPassword;
      payload.newPassword = newPassword;
    }
    const result = await updateProfile(payload);
    setSavingProfile(false);
    if (result.success) {
      showToast("Profile updated successfully", "success");
      setCurrentPassword("");
      setNewPassword("");
    } else {
      showToast(result.error || "Failed to update profile", "error");
    }
  };

  const openBook = (item: Accommodation) => {
    setSelectedListing(item);
    setChambers("1");
    setGuests("1");
    setNotes("");
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dayAfter = new Date();
    dayAfter.setDate(dayAfter.getDate() + 2);
    setCheckIn(tomorrow.toISOString().slice(0, 10));
    setCheckOut(dayAfter.toISOString().slice(0, 10));
    setActiveTab("book");
  };

  const handleCreateBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedListing) return;
    setBookingLoading(true);
    try {
      const res = await fetch(`${apiUrl}/bookings`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({
          accommodationId: selectedListing.id,
          chambers: parseInt(chambers, 10),
          guests: parseInt(guests, 10),
          checkIn,
          checkOut,
          notes,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.message || "Booking failed", "error");
      } else {
        showToast("Booking submitted successfully", "success");
        setSelectedListing(null);
        await fetchBookings();
        setActiveTab("history");
      }
    } catch {
      showToast("Network error", "error");
    } finally {
      setBookingLoading(false);
    }
  };

  const handleCancel = async (id: number) => {
    try {
      const res = await fetch(`${apiUrl}/bookings/${id}/cancel`, {
        method: "PATCH",
        headers: authHeaders(),
      });
      if (res.ok) {
        showToast("Booking cancelled", "success");
        fetchBookings();
      } else {
        const data = await res.json();
        showToast(data.message || "Could not cancel", "error");
      }
    } catch {
      showToast("Network error", "error");
    }
  };

  if (authLoading || loading || !user) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-3 border-indigo-600 border-t-transparent" />
      </div>
    );
  }

  const navItems: { id: Tab; label: string; icon: React.ReactNode }[] = [
    {
      id: "overview",
      label: "Overview",
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
        </svg>
      ),
    },
    {
      id: "profile",
      label: "My Profile",
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
        </svg>
      ),
    },
    {
      id: "book",
      label: "Book a Stay",
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      ),
    },
    {
      id: "history",
      label: "Booking History",
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex">
      <aside className="fixed inset-y-0 left-0 z-30 flex w-64 flex-col border-r border-white/5 bg-zinc-950">
        <div className="flex h-16 items-center gap-2.5 border-b border-white/5 px-6">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white font-bold shadow-lg shadow-indigo-500/30">
            L
          </div>
          <div>
            <span className="text-base font-bold tracking-tight text-white">Lodgely</span>
            <span className="block text-[10px] font-semibold uppercase tracking-widest text-indigo-400">
              Guest Portal
            </span>
          </div>
        </div>

        <nav className="flex-1 space-y-1 p-4">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all ${
                activeTab === item.id
                  ? "bg-indigo-600/10 text-indigo-400"
                  : "text-zinc-400 hover:bg-white/5 hover:text-zinc-200"
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>

        <div className="border-t border-white/5 p-4 space-y-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-600/20 text-indigo-400 font-bold text-sm">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">{user.name}</p>
              <p className="truncate text-xs text-zinc-500">{user.email}</p>
            </div>
          </div>
          <Link
            href="/"
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-xs font-semibold text-zinc-400 hover:bg-white/5 hover:text-white transition-colors"
          >
            Back to Site
          </Link>
          <button
            onClick={() => {
              logout();
              router.push("/");
            }}
            className="w-full rounded-xl border border-rose-500/20 px-3 py-2 text-xs font-semibold text-rose-400 hover:bg-rose-500/10 transition-colors"
          >
            Log Out
          </button>
        </div>
      </aside>

      <main className="flex-1 ml-64">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-white/5 bg-zinc-950/90 backdrop-blur-md px-8">
          <h1 className="text-lg font-bold">
            {activeTab === "overview"
              ? "Dashboard Overview"
              : activeTab === "profile"
                ? "My Profile"
                : activeTab === "book"
                  ? "Book a Stay"
                  : "Booking History"}
          </h1>
        </header>

        <div className="p-8 space-y-8">
          {activeTab === "overview" && (
            <>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="rounded-2xl border border-white/5 bg-white/[.02] p-5">
                  <p className="text-xs font-bold uppercase tracking-wider text-zinc-500">Total Bookings</p>
                  <p className="mt-1 text-3xl font-bold">{bookings.length}</p>
                </div>
                <div className="rounded-2xl border border-white/5 bg-white/[.02] p-5">
                  <p className="text-xs font-bold uppercase tracking-wider text-zinc-500">Upcoming</p>
                  <p className="mt-1 text-3xl font-bold text-emerald-400">{upcoming.length}</p>
                </div>
                <div className="rounded-2xl border border-white/5 bg-white/[.02] p-5">
                  <p className="text-xs font-bold uppercase tracking-wider text-zinc-500">Past / History</p>
                  <p className="mt-1 text-3xl font-bold text-sky-400">{history.length}</p>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-500">Upcoming Stays</h3>
                  <button
                    onClick={() => setActiveTab("book")}
                    className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-500"
                  >
                    New Booking
                  </button>
                </div>
                {upcoming.length === 0 ? (
                  <p className="text-sm text-zinc-500">No upcoming bookings yet. Book a stay to get started.</p>
                ) : (
                  <div className="space-y-3">
                    {upcoming.slice(0, 3).map((b) => (
                      <BookingRow key={b.id} booking={b} onCancel={handleCancel} />
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          {activeTab === "profile" && (
            <form onSubmit={handleSaveProfile} className="max-w-xl space-y-5 rounded-2xl border border-white/5 bg-white/[.02] p-6">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Full Name</label>
                <input
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm text-white focus:border-indigo-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm text-white focus:border-indigo-500 focus:outline-none"
                />
              </div>
              <div className="border-t border-white/5 pt-5">
                <p className="text-sm font-semibold text-white mb-3">Change Password</p>
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Current Password</label>
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="mt-1.5 w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm text-white focus:border-indigo-500 focus:outline-none"
                      placeholder="Required only when changing password"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">New Password</label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="mt-1.5 w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm text-white focus:border-indigo-500 focus:outline-none"
                      placeholder="Leave blank to keep current password"
                    />
                  </div>
                </div>
              </div>
              <button
                type="submit"
                disabled={savingProfile}
                className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50"
              >
                {savingProfile ? "Saving..." : "Save Profile"}
              </button>
            </form>
          )}

          {activeTab === "book" && (
            <div className="space-y-6">
              {!selectedListing ? (
                <>
                  <p className="text-sm text-zinc-400">
                    Click a photo to book. Choose chambers, guests, and stay dates.
                  </p>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {listings
                      .filter((l) => l.availability)
                      .map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => openBook(item)}
                          className="group overflow-hidden rounded-2xl border border-white/5 bg-white/[.02] text-left hover:bg-white/[.04] transition-all"
                        >
                          <div className="relative aspect-video overflow-hidden bg-zinc-900">
                            {item.images[0] ? (
                              <img
                                src={item.images[0]}
                                alt={item.title}
                                className="h-full w-full object-cover opacity-90 group-hover:scale-105 group-hover:opacity-100 transition-all duration-500"
                              />
                            ) : (
                              <div className="flex h-full items-center justify-center text-zinc-600">No image</div>
                            )}
                            <span className="absolute top-3 left-3 rounded-lg bg-black/50 px-2.5 py-1 text-[10px] font-bold text-white backdrop-blur-sm">
                              {item.type}
                            </span>
                          </div>
                          <div className="p-4 space-y-1">
                            <h3 className="font-bold text-sm truncate">{item.title}</h3>
                            <p className="text-xs text-zinc-500">{item.location}</p>
                            <p className="text-sm font-bold text-indigo-400">${item.price}/night</p>
                          </div>
                        </button>
                      ))}
                  </div>
                </>
              ) : (
                <form
                  onSubmit={handleCreateBooking}
                  className="max-w-2xl space-y-5 rounded-2xl border border-white/5 bg-white/[.02] p-6"
                >
                  <div className="flex gap-4 items-start">
                    <div className="h-24 w-32 overflow-hidden rounded-xl bg-zinc-900 flex-shrink-0">
                      {selectedListing.images[0] && (
                        <img
                          src={selectedListing.images[0]}
                          alt={selectedListing.title}
                          className="h-full w-full object-cover"
                        />
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">{selectedListing.title}</h3>
                      <p className="text-sm text-zinc-400">{selectedListing.location}</p>
                      <p className="text-sm text-indigo-400 mt-1">${selectedListing.price}/night · up to {selectedListing.capacity} guests/chamber</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Chambers / Rooms</label>
                      <input
                        type="number"
                        min={1}
                        required
                        value={chambers}
                        onChange={(e) => setChambers(e.target.value)}
                        className="mt-1.5 w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm text-white focus:border-indigo-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Guests</label>
                      <input
                        type="number"
                        min={1}
                        required
                        value={guests}
                        onChange={(e) => setGuests(e.target.value)}
                        className="mt-1.5 w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm text-white focus:border-indigo-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Check-in</label>
                      <input
                        type="date"
                        required
                        value={checkIn}
                        onChange={(e) => setCheckIn(e.target.value)}
                        className="mt-1.5 w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm text-white focus:border-indigo-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Check-out</label>
                      <input
                        type="date"
                        required
                        value={checkOut}
                        onChange={(e) => setCheckOut(e.target.value)}
                        className="mt-1.5 w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm text-white focus:border-indigo-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Notes (optional)</label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={3}
                      className="mt-1.5 w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm text-white focus:border-indigo-500 focus:outline-none resize-none"
                      placeholder="Special requests, arrival time, etc."
                    />
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setSelectedListing(null)}
                      className="flex-1 rounded-xl border border-white/10 py-2.5 text-sm font-semibold text-zinc-300 hover:bg-white/5"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={bookingLoading}
                      className="flex-1 rounded-xl bg-indigo-600 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50"
                    >
                      {bookingLoading ? "Booking..." : "Confirm Booking"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {activeTab === "history" && (
            <div className="space-y-3">
              {bookings.length === 0 ? (
                <p className="text-sm text-zinc-500">No bookings yet.</p>
              ) : (
                bookings.map((b) => (
                  <BookingRow key={b.id} booking={b} onCancel={handleCancel} showCancel />
                ))
              )}
            </div>
          )}
        </div>
      </main>

      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 rounded-xl px-5 py-3 text-sm font-semibold shadow-2xl ${
            toast.type === "success" ? "bg-emerald-600/90 text-white" : "bg-rose-600/90 text-white"
          }`}
        >
          {toast.message}
        </div>
      )}
    </div>
  );
}

function BookingRow({
  booking,
  onCancel,
  showCancel = true,
}: {
  booking: Booking;
  onCancel: (id: number) => void;
  showCancel?: boolean;
}) {
  const canCancel = showCancel && ["pending", "confirmed"].includes(booking.status);

  return (
    <div className="flex flex-col sm:flex-row gap-4 rounded-2xl border border-white/5 bg-white/[.02] p-4">
      <div className="h-24 w-full sm:w-32 overflow-hidden rounded-xl bg-zinc-900 flex-shrink-0">
        {booking.accommodation.images[0] && (
          <img
            src={booking.accommodation.images[0]}
            alt={booking.accommodation.title}
            className="h-full w-full object-cover"
          />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="font-bold text-sm truncate">{booking.accommodation.title}</h3>
          <span className={`rounded-lg px-2 py-0.5 text-[10px] font-bold uppercase ${statusStyles[booking.status] || statusStyles.pending}`}>
            {booking.status}
          </span>
        </div>
        <p className="text-xs text-zinc-500 mt-1">{booking.accommodation.location}</p>
        <p className="text-xs text-zinc-400 mt-2">
          {new Date(booking.checkIn).toLocaleDateString()} → {new Date(booking.checkOut).toLocaleDateString()}
          {" · "}
          {booking.chambers} chamber{booking.chambers > 1 ? "s" : ""}
          {" · "}
          {booking.guests} guest{booking.guests > 1 ? "s" : ""}
        </p>
        <p className="text-sm font-bold text-white mt-1">${booking.totalPrice.toFixed(2)}</p>
      </div>
      {canCancel && (
        <button
          onClick={() => onCancel(booking.id)}
          className="self-start rounded-xl border border-rose-500/20 px-3 py-2 text-xs font-semibold text-rose-400 hover:bg-rose-500/10"
        >
          Cancel
        </button>
      )}
    </div>
  );
}
