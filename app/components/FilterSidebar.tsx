"use client";

import React, { useState, useEffect } from "react";

interface Filters {
  type: string;
  minPrice: string;
  maxPrice: string;
  availableOnly: boolean;
}

interface FilterSidebarProps {
  filters: Filters;
  onChange: (filters: Filters) => void;
  onClear: () => void;
}

export const FilterSidebar: React.FC<FilterSidebarProps> = ({ filters, onChange, onClear }) => {
  const [type, setType] = useState(filters.type);
  const [minPrice, setMinPrice] = useState(filters.minPrice);
  const [maxPrice, setMaxPrice] = useState(filters.maxPrice);
  const [availableOnly, setAvailableOnly] = useState(filters.availableOnly);

  // Sync state with parent filters
  useEffect(() => {
    setType(filters.type);
    setMinPrice(filters.minPrice);
    setMaxPrice(filters.maxPrice);
    setAvailableOnly(filters.availableOnly);
  }, [filters]);

  const handleApply = () => {
    onChange({
      type,
      minPrice,
      maxPrice,
      availableOnly,
    });
  };

  return (
    <div className="w-full rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/50">
      <div className="flex items-center justify-between border-b border-zinc-100 pb-4 dark:border-zinc-800">
        <h2 className="text-lg font-bold">Filters</h2>
        <button
          onClick={onClear}
          className="text-xs font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
        >
          Clear All
        </button>
      </div>

      <div className="mt-6 space-y-6">
        {/* Accommodation Type */}
        <div className="flex flex-col">
          <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
            Property Type
          </label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="mt-2 w-full rounded-xl border border-zinc-200 bg-transparent px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none dark:border-zinc-850 dark:bg-zinc-950"
          >
            <option value="">Any Type</option>
            <option value="Hotel">Hotel</option>
            <option value="Apartment">Apartment</option>
            <option value="Villa">Villa</option>
            <option value="Cabin">Cabin</option>
          </select>
        </div>

        {/* Price Range */}
        <div>
          <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
            Price Range (USD / night)
          </label>
          <div className="mt-2 flex items-center gap-2">
            <input
              type="number"
              placeholder="Min"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="w-full rounded-xl border border-zinc-200 bg-transparent px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none dark:border-zinc-850 dark:bg-zinc-950"
            />
            <span className="text-zinc-400">—</span>
            <input
              type="number"
              placeholder="Max"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="w-full rounded-xl border border-zinc-200 bg-transparent px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none dark:border-zinc-850 dark:bg-zinc-950"
            />
          </div>
        </div>

        {/* Availability Switch */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
            Show Available Only
          </span>
          <button
            type="button"
            onClick={() => setAvailableOnly(!availableOnly)}
            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              availableOnly ? "bg-indigo-600" : "bg-zinc-200 dark:bg-zinc-800"
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                availableOnly ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
        </div>

        {/* Apply Button */}
        <button
          onClick={handleApply}
          className="mt-4 w-full rounded-xl bg-indigo-600 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-600/10 hover:bg-indigo-500 transition-colors"
        >
          Apply Filters
        </button>
      </div>
    </div>
  );
};
