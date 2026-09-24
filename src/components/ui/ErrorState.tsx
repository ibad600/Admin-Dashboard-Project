import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorStateProps {
  message?: string;
  onRetry: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  message = 'Failed to load product data. Please check your network connection and try again.',
  onRetry,
}) => {
  return (
    <div className="w-full py-16 px-4 bg-rose-50/50 rounded-2xl border border-rose-200 text-center flex flex-col items-center justify-center">
      <div className="w-14 h-14 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mb-4">
        <AlertTriangle className="w-7 h-7" />
      </div>
      <h3 className="text-base font-semibold text-rose-950 mb-1">Something went wrong</h3>
      <p className="text-sm text-rose-700/90 max-w-md mb-6">{message}</p>
      <button
        onClick={onRetry}
        className="inline-flex items-center gap-2 px-5 py-2.5 bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white font-medium text-xs rounded-xl shadow-md shadow-rose-600/20 transition-all"
      >
        <RefreshCw className="w-4 h-4" />
        Retry
      </button>
    </div>
  );
};

export default ErrorState;
