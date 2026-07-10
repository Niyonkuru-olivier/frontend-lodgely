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
  const { user } = useAuth();
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [activeImage, setActiveImage] = useState(0);

  if (!item) return null;

  const handleBook = () => {
    if (!user) {
      onOpenAuth("login");
    } else {
      setBookingSuccess(true);
      setTimeout(() => {
        setBookingSuccess(false);
        onClose();
      }, 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/40 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-950 flex flex-col max-h-[90vh]">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 rounded-full p-2 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200 shadow-sm transition-colors"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Scrollable Container */}
        <div className="overflow-y-auto flex-1">
          {/* Main Large Image */}
          <div className="relative h-64 sm:h-80 w-full bg-zinc-100">
            <img
              src={item.images[activeImage] || item.images[0]}
              alt={item.title}
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
            
            {/* Title Overlay */}
            <div className="absolute bottom-6 left-6 right-6 text-white">
              <span className="inline-flex items-center rounded-md bg-indigo-600 px-2.5 py-0.5 text-xs font-semibold">
                {item.type}
              </span>
              <h2 className="mt-2 text-2xl font-bold leading-tight drop-shadow-md sm:text-3xl">
                {item.title}
              </h2>
              <p className="mt-1 text-sm text-zinc-200 drop-shadow-sm">{item.location}</p>
            </div>
          </div>

          {/* Thumbnail Selector */}
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

          {/* Details Content */}
          <div className="p-6 sm:p-8 space-y-6">
            
            {/* Description */}
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-400">About this stay</h3>
              <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
                {item.description}
              </p>
            </div>

            {/* Capacity & Price */}
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

            {/* Amenities */}
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-400">Amenities offered</h3>
              <div className="mt-3 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                {item.amenities.map((amenity, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 rounded-xl bg-zinc-50 px-3 py-2 text-xs font-semibold dark:bg-zinc-900/60"
                  >
                    <svg
                      className="h-4 w-4 text-emerald-500 flex-shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>{amenity}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* Action Bar */}
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
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
                Booking Requested!
              </span>
            ) : (
              <button
                onClick={handleBook}
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
