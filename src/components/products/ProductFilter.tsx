"use client";

import React, { useState, useEffect } from "react";
import { Search, X, Filter, ArrowUpDown, RotateCcw } from "lucide-react";
import { CategoryItem } from "@/types/product";
import productsService from "@/services/products";
import useDebounce from "@/hooks/useDebounce";

interface ProductFilterProps {
  searchParam: string;
  categoryParam: string;
  sortByParam: string;
  orderParam: string;
  onFilterChange: (filters: {
    search?: string;
    category?: string;
    sortBy?: string;
    order?: string;
    page?: number;
  }) => void;
  onReset: () => void;
}

export const ProductFilter: React.FC<ProductFilterProps> = ({
  searchParam,
  categoryParam,
  sortByParam,
  orderParam,
  onFilterChange,
  onReset,
}) => {
  // Local input state for search to allow instant typing feedback
  const [searchInput, setSearchInput] = useState<string>(searchParam);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] =
    useState<boolean>(false);

  // Debounce the search input by 400ms
  const debouncedSearch = useDebounce(searchInput, 400);

  // Fetch categories on mount
  useEffect(() => {
    const loadCategories = async () => {
      setIsLoadingCategories(true);
      try {
        const data = await productsService.getCategories();
        setCategories(data);
      } catch (err) {
        console.error("Failed to load categories:", err);
      } finally {
        setIsLoadingCategories(false);
      }
    };
    loadCategories();
  }, []);

  // Sync search input if searchParam changes externally (e.g., URL change or reset)
  useEffect(() => {
    setSearchInput(searchParam);
  }, [searchParam]);

  // Trigger search filter when debounced value changes
  useEffect(() => {
    if (debouncedSearch !== searchParam) {
      onFilterChange({
        search: debouncedSearch,
        // DummyJSON API limitation: cannot combine search and category filter simultaneously.
        // Clearing category when search is typed for predictable behavior.
        category: debouncedSearch ? "" : categoryParam,
        page: 1, // Always reset to page 1 on search change
      });
    }
  }, [debouncedSearch]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedCategory = e.target.value;
    // Clear search when selecting category due to DummyJSON API limitation
    setSearchInput("");
    onFilterChange({
      category: selectedCategory,
      search: "",
      page: 1,
    });
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (!val) {
      onFilterChange({ sortBy: "", order: "", page: 1 });
      return;
    }

    const [field, dir] = val.split("-");
    onFilterChange({
      sortBy: field,
      order: dir,
      page: 1,
    });
  };

  const currentSortValue = sortByParam ? `${sortByParam}-${orderParam}` : "";

  const handleClearSearch = () => {
    setSearchInput("");
    onFilterChange({ search: "", page: 1 });
  };

  const hasActiveFilters = Boolean(searchParam || categoryParam || sortByParam);

  return (
    <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm mb-6 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
      {/* Left: Search Bar */}
      <div className="relative flex-1 min-w-[240px]">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
          <Search className="w-4 h-4" />
        </div>
        <input
          type="text"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search products by title..."
          className="w-full pl-10 pr-9 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs font-medium placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white transition-all"
        />
        {searchInput && (
          <button
            onClick={handleClearSearch}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
            title="Clear search"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Right Controls: Category Filter, Sort Select, Clear Button */}
      <div className="flex w-full flex-col items-stretch gap-3 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center">
        {/* Category Filter */}
        <div className="relative w-full sm:w-auto sm:flex-initial">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Filter className="w-3.5 h-3.5" />
          </div>
          <select
            value={categoryParam}
            onChange={handleCategoryChange}
            disabled={isLoadingCategories}
            className="w-full min-w-0 sm:w-auto pl-9 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs font-medium capitalize focus:outline-none focus:ring-2 focus:ring-indigo-600 appearance-none cursor-pointer disabled:opacity-50"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.slug} value={cat.slug}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Sort Selector */}
        <div className="relative w-full sm:w-auto sm:flex-initial">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <ArrowUpDown className="w-3.5 h-3.5" />
          </div>
          <select
            value={currentSortValue}
            onChange={handleSortChange}
            className="w-full min-w-0 sm:w-auto pl-9 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-600 appearance-none cursor-pointer"
          >
            <option value="">Sort By: Default</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="rating-desc">Rating: High to Low</option>
            <option value="title-asc">Title: A to Z</option>
          </select>
        </div>

        {/* Reset Button */}
        {hasActiveFilters && (
          <button
            onClick={onReset}
            className="hidden px-3 py-2.5 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl sm:inline-flex items-center gap-1.5 transition-colors"
            title="Reset all filters"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default ProductFilter;
