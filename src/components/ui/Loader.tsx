import React from 'react';

export const Loader: React.FC<{ message?: string }> = ({ message = 'Loading products...' }) => {
  return (
    <div className="w-full py-16 flex flex-col items-center justify-center text-slate-500">
      <div className="relative w-12 h-12 mb-4">
        <div className="absolute inset-0 rounded-full border-4 border-slate-200" />
        <div className="absolute inset-0 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin" />
      </div>
      <p className="text-sm font-medium text-slate-600 animate-pulse">{message}</p>
    </div>
  );
};

export default Loader;
