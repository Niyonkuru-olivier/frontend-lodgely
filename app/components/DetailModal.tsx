"use client";

import React, { useState } from "react";
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

interface DetailModalProps {
  item: Accommodation | null;
  onClose: () => void;
  onOpenAuth: (mode: "login" | "register") => void;
}

export const DetailModal: React.FC<DetailModalProps> = ({ item, onClose, onOpenAuth }) => {
  const { user, token, apiUrl } = useAuth();
  const [activeImage, setActiveImage] = useState(0);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [chambers, setChambers] = useState("1");
  const [guests, setGuests] = useState("1");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [notes, setNotes] = useState("");

  if (!item) return null;

  const startBooking = () => {
    if (!user) {
      onOpenAuth("login");
      return;
    }
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dayAfter = new Date();
    dayAfter.setDate(dayAfter.getDate() + 2);
    setCheckIn(tomorrow.toISOString().slice(0, 10));
    setCheckOut(dayAfter.toISOString().slice(0, 10));
    setChambers("1");
    setGuests("1");
    setNotes("");
    setError("");
    setShowBookingForm(true);
  };

  const submitBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      onOpenAuth("login");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${apiUrl}/bookings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          accommodationId: item.id,
          chambers: parseInt(chambers, 10),
          guests: parseInt(guests, 10),
          checkIn,
          checkOut,
          notes,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(Array.isArray(data.message) ? data.message.join(", ") : data.message || "Booking failed");
      } else {
        setBookingSuccess(true);
        setShowBookingForm(false);
        setTimeout(() => {
          setBookingSuccess(false);
          onClose();
        }, 2200);
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/40 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-950 flex flex-col max-h-[90vh]">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 rounded-full p-2 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200 shadow-sm transition-colors"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="overflow-y-auto flex-1">
          <button type="button" onClick={startBooking} className="relative h-64 sm:h-80 w-full bg-zinc-100 block text-left group">
            <img
              src={item.images[activeImage] || item.images[0]}
              alt={item.title}
              className="h-full w-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
            <div className="absolute bottom-6 left-6 right-6 text-white">
              <span className="inline-flex items-center rounded-md bg-indigo-600 px-2.5 py-0.5 text-xs font-semibold">
                {item.type}
              </span>
              <h2 className="mt-2 text-2xl font-bold leading-tight drop-shadow-md sm:text-3xl">{item.title}</h2>
              <p className="mt-1 text-sm text-zinc-200 drop-shadow-sm">{item.location}</p>
              {item.availability && (
                <p className="mt-2 text-xs font-semibold text-indigo-200">Click photo to book →</p>
              )}
            </div>
          </button>

          {item.images.length > 1 && (
            <div className="flex gap-2 px-6 pt-4 overflow-x-auto">
              {item.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(idx)}
                  className={`relative h-14 w-20 flex-shrink-0 overflow-hidden rounded-lg border-2 ${
                    activeImage === idx ? "border-indigo-600" : "border-transparent"
                  }`}
                >
                  <img src={img} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}

          <div className="p-6 sm:p-8 space-y-6">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-400">About this stay</h3>
              <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">{item.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-4 border-y border-zinc-100 py-4 dark:border-zinc-800">
              <div>
                <span className="text-xs text-zinc-500">Capacity</span>
                <p className="text-sm font-semibold mt-0.5">Up to {item.capacity} guests</p>
              </div>
              <div>
                <span className="text-xs text-zinc-500">Price per night</span>
                <p className="text-sm font-semibold mt-0.5">${item.price} USD</p>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-400">Amenities offered</h3>
              <div className="mt-3 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                {item.amenities.map((amenity, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 rounded-xl bg-zinc-50 px-3 py-2 text-xs font-semibold dark:bg-zinc-900/60"
                  >
                    <svg className="h-4 w-4 text-emerald-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>{amenity}</span>
                  </div>
                ))}
              </div>
            </div>

            {showBookingForm && (
              <form onSubmit={submitBooking} className="space-y-4 rounded-2xl border border-indigo-100 bg-indigo-50/50 p-4 dark:border-indigo-900/40 dark:bg-indigo-950/20">
                <h3 className="text-sm font-bold text-indigo-700 dark:text-indigo-300">Complete your booking</h3>
                {error && (
                  <p className="text-xs font-semibold text-rose-600 dark:text-rose-400">{error}</p>
                )}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Chambers</label>
                    <input
                      type="number"
                      min={1}
                      required
                      value={chambers}
                      onChange={(e) => setChambers(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Guests</label>
                    <input
                      type="number"
                      min={1}
                      required
                      value={guests}
                      onChange={(e) => setGuests(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Check-in</label>
                    <input
                      type="date"
                      required
                      value={checkIn}
                      onChange={(e) => setCheckIn(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Check-out</label>
                    <input
                      type="date"
                      required
                      value={checkOut}
                      onChange={(e) => setCheckOut(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Notes</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={2}
                    className="mt-1 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900 resize-none"
                    placeholder="Expected arrival time, special requests..."
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowBookingForm(false)}
                    className="flex-1 rounded-xl border border-zinc-200 py-2.5 text-sm font-semibold dark:border-zinc-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 rounded-xl bg-indigo-600 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50"
                  >
                    {loading ? "Submitting..." : "Confirm Booking"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        <div className="border-t border-zinc-100 bg-zinc-50 p-6 dark:border-zinc-800 dark:bg-zinc-900/30 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-xs text-zinc-400">Price details</span>
            <span className="text-lg font-bold">
              ${item.price} <span className="text-xs font-normal text-zinc-500">/ night</span>
            </span>
          </div>
          <div>
            {bookingSuccess ? (
              <span className="inline-flex items-center gap-2 rounded-xl bg-emerald-100 px-4 py-2.5 text-sm font-semibold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                Booking Confirmed!
              </span>
            ) : (
              <button
                onClick={startBooking}
                disabled={!item.availability}
                className="rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-600/20 hover:bg-indigo-500 disabled:opacity-50 transition-colors"
              >
                {!item.availability ? "Fully Booked" : user ? "Reserve Now" : "Login to Book"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
