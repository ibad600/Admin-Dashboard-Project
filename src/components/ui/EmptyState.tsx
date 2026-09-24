import React from 'react';
import { PackageSearch } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  description?: string;
  onReset?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No products found',
  description = 'Try adjusting your search keywords, clearing filters, or resetting pagination.',
  onReset,
}) => {
  return (
    <div className="w-full py-16 px-4 bg-white rounded-2xl border border-slate-200 text-center flex flex-col items-center justify-center">
      <div className="w-14 h-14 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center mb-4">
        <PackageSearch className="w-7 h-7" />
      </div>
      <h3 className="text-base font-semibold text-slate-900 mb-1">{title}</h3>
      <p className="text-sm text-slate-500 max-w-sm mb-6">{description}</p>
      {onReset && (
        <button
          onClick={onReset}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs rounded-xl shadow-sm transition-colors"
        >
          Reset Filters
        </button>
      )}
    </div>
  );
};

export default EmptyState;
