"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "./context/AuthContext";
import { Header } from "./components/Header";
import { SearchHero } from "./components/SearchHero";
import { FilterSidebar } from "./components/FilterSidebar";
import { AccommodationCard } from "./components/AccommodationCard";
import { AuthModal } from "./components/AuthModal";
import { DetailModal } from "./components/DetailModal";

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

export default function Home() {
  const { user } = useAuth();
  const [accommodations, setAccommodations] = useState<Accommodation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<Accommodation | null>(null);
  
  // Auth Modal State
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");

  // Search and Filter States
  const [searchParams, setSearchParams] = useState({
    search: "",
    location: "",
    capacity: "",
  });

  const [filters, setFilters] = useState({
    type: "",
    minPrice: "",
    maxPrice: "",
    availableOnly: false,
  });

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  const fetchAccommodations = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams();
      if (searchParams.search) query.append("search", searchParams.search);
      if (searchParams.location) query.append("location", searchParams.location);
      if (searchParams.capacity) query.append("capacity", searchParams.capacity);
      
      if (filters.type) query.append("type", filters.type);
      if (filters.minPrice) query.append("minPrice", filters.minPrice);
      if (filters.maxPrice) query.append("maxPrice", filters.maxPrice);
      if (filters.availableOnly) query.append("availableOnly", "true");

      const response = await fetch(`${API_URL}/accommodations?${query.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setAccommodations(data);
      } else {
        console.error("Failed to fetch accommodations");
      }
    } catch (error) {
      console.error("Error fetching accommodations:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccommodations();
  }, [searchParams, filters]);

  const handleSearch = (params: typeof searchParams) => {
    setSearchParams(params);
  };

  const handleFilterChange = (newFilters: typeof filters) => {
    setFilters(newFilters);
  };

  const handleClearFilters = () => {
    setFilters({
      type: "",
      minPrice: "",
      maxPrice: "",
      availableOnly: false,
    });
    setSearchParams({
      search: "",
      location: "",
      capacity: "",
    });
  };

  const handleOpenAuth = (mode: "login" | "register") => {
    setAuthMode(mode);
    setAuthOpen(true);
  };

  // Skeleton Loader for Grid
  const SkeletonGrid = () => (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="flex flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900/40 animate-pulse">
          <div className="aspect-video w-full bg-zinc-200 dark:bg-zinc-850" />
          <div className="p-5 space-y-3">
            <div className="h-3 w-1/4 rounded bg-zinc-200 dark:bg-zinc-850" />
            <div className="h-5 w-3/4 rounded bg-zinc-200 dark:bg-zinc-850" />
            <div className="h-3 w-full rounded bg-zinc-200 dark:bg-zinc-850" />
            <div className="h-3 w-5/6 rounded bg-zinc-200 dark:bg-zinc-850" />
            <div className="flex justify-between items-center pt-3 border-t border-zinc-100 dark:border-zinc-805">
              <div className="h-3 w-1/3 rounded bg-zinc-200 dark:bg-zinc-850" />
              <div className="h-4 w-1/4 rounded bg-zinc-200 dark:bg-zinc-850" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 font-sans">
      {/* Navigation Header */}
      <Header onOpenAuth={handleOpenAuth} />

      {/* Hero Banner with Search Controls */}
      <SearchHero onSearch={handleSearch} />

      {/* Main Grid Content */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 flex-1 w-full">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
          
          {/* Sidebar Filters */}
          <div className="lg:col-span-1">
            <FilterSidebar
              filters={filters}
              onChange={handleFilterChange}
              onClear={handleClearFilters}
            />
          </div>

          {/* Accommodation Grid */}
          <div className="lg:col-span-3">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">
                {loading ? "Searching..." : `${accommodations.length} stays found`}
              </h2>
              {user && (
                <div className="text-xs text-zinc-500 font-medium">
                  Logged in as <span className="text-indigo-600 font-semibold">{user.name}</span>
                </div>
              )}
            </div>

            {loading ? (
              <SkeletonGrid />
            ) : accommodations.length > 0 ? (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {accommodations.map((item) => (
                  <AccommodationCard
                    key={item.id}
                    item={item}
                    onSelect={setSelectedItem}
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border-2 border-dashed border-zinc-200 p-12 text-center dark:border-zinc-800">
                <svg
                  className="mx-auto h-12 w-12 text-zinc-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
                <h3 className="mt-4 text-lg font-semibold">No accommodations match your search</h3>
                <p className="mt-2 text-sm text-zinc-500">
                  Try adjusting your filters or search keywords to find more options.
                </p>
                <button
                  onClick={handleClearFilters}
                  className="mt-6 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 transition-colors"
                >
                  Clear All Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-200 dark:border-zinc-800 py-6 text-center text-xs text-zinc-500 mt-auto">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          &copy; {new Date().getFullYear()} Lodgely. All rights reserved.
        </div>
      </footer>

      {/* Auth Modal Overlay */}
      <AuthModal
        isOpen={authOpen}
        onClose={() => setAuthOpen(false)}
        initialMode={authMode}
      />

      {/* Detail Modal Overlay */}
      <DetailModal
        item={selectedItem}
        onClose={() => setSelectedItem(null)}
        onOpenAuth={handleOpenAuth}
      />
    </div>
  );
}
