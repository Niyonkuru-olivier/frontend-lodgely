"use client";

import React from "react";

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

interface AccommodationCardProps {
  item: Accommodation;
  onSelect: (item: Accommodation) => void;
}

export const AccommodationCard: React.FC<AccommodationCardProps> = ({ item, onSelect }) => {
  // Use a fallback image if no images are specified
  const mainImage = item.images && item.images.length > 0
    ? item.images[0]
    : "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=600";

  return (
    <div
      onClick={() => onSelect(item)}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white cursor-pointer hover:shadow-xl dark:border-zinc-800 dark:bg-zinc-900/40 transition-all duration-300 hover:-translate-y-1"
    >
      {/* Property Image */}
      <div className="relative aspect-video w-full overflow-hidden bg-zinc-100">
        <img
          src={mainImage}
          alt={item.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />

        {/* Availability Badge */}
        <div className="absolute top-3 left-3 z-10">
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold shadow-sm ${
              item.availability
                ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300"
                : "bg-rose-100 text-rose-800 dark:bg-rose-950/70 dark:text-rose-300"
            }`}
          >
            {item.availability ? "Available" : "Fully Booked"}
          </span>
        </div>

        {/* Property Type Badge */}
        <div className="absolute bottom-3 right-3 z-10">
          <span className="inline-flex items-center rounded-lg bg-black/60 px-2 py-1 text-xs font-medium text-white backdrop-blur-sm">
            {item.type}
          </span>
        </div>
      </div>

      {/* Property Content */}
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-center justify-between text-xs font-medium text-zinc-500 dark:text-zinc-400">
          <span>{item.location}</span>
          <span className="flex items-center gap-1">
            <svg
              className="h-3.5 w-3.5 fill-amber-400 text-amber-400"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            4.8
          </span>
        </div>

        <h3 className="mt-2 line-clamp-1 text-base font-semibold group-hover:text-indigo-600 transition-colors">
          {item.title}
        </h3>

        <p className="mt-1 line-clamp-2 text-xs text-zinc-500 dark:text-zinc-400">
          {item.description}
        </p>

        {/* Footer info: Guests & Price */}
        <div className="mt-4 flex items-center justify-between border-t border-zinc-100 pt-3 dark:border-zinc-800">
          <span className="text-xs text-zinc-500 dark:text-zinc-400">
            Up to <span className="font-semibold">{item.capacity}</span> guests
          </span>
          <span className="text-sm font-bold text-zinc-900 dark:text-white">
            ${item.price} <span className="text-xs font-normal text-zinc-500">/ night</span>
          </span>
        </div>
      </div>
    </div>
  );
};
