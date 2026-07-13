"use client";

import React, { useState } from "react";

interface SearchHeroProps {
  onSearch: (params: { search: string; location: string; capacity: string }) => void;
}

export const SearchHero: React.FC<SearchHeroProps> = ({ onSearch }) => {
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("");
  const [capacity, setCapacity] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch({ search, location, capacity });
  };

  return (
    <div className="relative overflow-hidden bg-zinc-900 py-20 px-4 sm:px-6 lg:px-8 text-center">
      {/* Decorative background shapes */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.15),transparent_40%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(168,85,247,0.1),transparent_40%)]" />

      <div className="relative mx-auto max-w-4xl">
        <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
          Find Your Perfect Stay
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-lg text-zinc-300">
          Discover handpicked luxury suites, beach resorts, and mountain cabins across Africa.
        </p>

        {/* Search Bar Container */}
        <form
          onSubmit={handleSubmit}
          className="mx-auto mt-10 max-w-3xl rounded-2xl border border-white/10 bg-white/5 p-3 backdrop-blur-xl shadow-2xl shadow-black/50"
        >
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
            {/* Search Query */}
            <div className="flex flex-col text-left">
              <label className="pl-3 text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Keyword
              </label>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="e.g. Pool, Marriott"
                className="mt-1 w-full rounded-xl bg-white/5 px-3 py-2 text-sm text-white placeholder-zinc-500 border border-white/5 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors"
              />
            </div>

            {/* Destination */}
            <div className="flex flex-col text-left">
              <label className="pl-3 text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Destination
              </label>
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="mt-1 w-full rounded-xl bg-zinc-800 sm:bg-white/5 px-3 py-2 text-sm text-white placeholder-zinc-500 border border-white/5 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors"
              >
                <option value="">Anywhere</option>
                <option value="Kigali">Kigali</option>
                <option value="Gisenyi">Gisenyi</option>
                <option value="Musanze">Musanze</option>
                <option value="Cyangugu">Cyangugu</option>
              </select>
            </div>

            {/* Guests */}
            <div className="flex flex-col text-left">
              <label className="pl-3 text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Guests
              </label>
              <input
                type="number"
                min="1"
                value={capacity}
                onChange={(e) => setCapacity(e.target.value)}
                placeholder="No. of guests"
                className="mt-1 w-full rounded-xl bg-white/5 px-3 py-2 text-sm text-white placeholder-zinc-500 border border-white/5 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors"
              />
            </div>

            {/* Submit Button */}
            <div className="flex items-end">
              <button
                type="submit"
                className="w-full h-[38px] rounded-xl bg-indigo-600 font-semibold text-white shadow-md shadow-indigo-600/30 hover:bg-indigo-500 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                Search Stay
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
