'use client';

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  total: number;
  limit: number;
  skip: number;
  onPageChange: (newSkip: number) => void;
  onLimitChange: (newLimit: number) => void;
  disabled?: boolean;
}

export const Pagination: React.FC<PaginationProps> = ({
  total,
  limit,
  skip,
  onPageChange,
  onLimitChange,
  disabled = false,
}) => {
  const currentPage = Math.floor(skip / limit) + 1;
  const totalPages = Math.max(1, Math.ceil(total / limit));

  const fromItem = total === 0 ? 0 : skip + 1;
  const toItem = Math.min(skip + limit, total);

  // Generate page number window (e.g. 1 2 3 ... 10)
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push('...');

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        if (i > 1 && i < totalPages) pages.push(i);
      }

      if (currentPage < totalPages - 2) pages.push('...');
      pages.push(totalPages);
    }

    return pages;
  };

  const handlePrev = () => {
    if (currentPage > 1) {
      const newSkip = Math.max(0, skip - limit);
      onPageChange(newSkip);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      const newSkip = skip + limit;
      onPageChange(newSkip);
    }
  };

  const handlePageClick = (page: number) => {
    const newSkip = (page - 1) * limit;
    onPageChange(newSkip);
  };

  return (
    <div className="bg-white px-4 py-3.5 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 rounded-b-2xl">
      {/* Left: Item Counter & Page Size Selector */}
      <div className="flex items-center gap-4 text-xs text-slate-600">
        <span className="font-medium text-slate-700">
          Showing <span className="font-semibold text-slate-900">{fromItem}–{toItem}</span> of{' '}
          <span className="font-semibold text-slate-900">{total}</span>
        </span>

        <div className="flex items-center gap-2">
          <label htmlFor="limit-select" className="text-slate-500 font-medium">
            Per page:
          </label>
          <select
            id="limit-select"
            value={limit}
            onChange={(e) => onLimitChange(Number(e.target.value))}
            disabled={disabled}
            className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600 disabled:opacity-50"
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
        </div>
      </div>

      {/* Right: Prev / Next & Page Buttons */}
      <div className="flex items-center gap-1.5">
        {/* Previous Button */}
        <button
          onClick={handlePrev}
          disabled={disabled || currentPage <= 1}
          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Previous</span>
        </button>

        {/* Page Numbers */}
        <div className="hidden md:flex items-center gap-1">
          {getPageNumbers().map((page, idx) => (
            <React.Fragment key={idx}>
              {typeof page === 'number' ? (
                <button
                  onClick={() => handlePageClick(page)}
                  disabled={disabled}
                  className={`w-8 h-8 text-xs font-semibold rounded-lg transition-all ${
                    currentPage === page
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-700 hover:bg-slate-100 bg-white border border-slate-200'
                  } disabled:opacity-50`}
                >
                  {page}
                </button>
              ) : (
                <span className="px-1 text-xs text-slate-400 font-medium">...</span>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Next Button */}
        <button
          onClick={handleNext}
          disabled={disabled || currentPage >= totalPages}
          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <span>Next</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
