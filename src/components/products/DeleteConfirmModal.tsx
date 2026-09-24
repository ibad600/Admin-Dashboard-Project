'use client';

import React, { useState } from 'react';
import { Product } from '@/types/product';
import { AlertTriangle, Trash2, X } from 'lucide-react';
import productsService from '@/services/products';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  product: Product | null;
  onClose: () => void;
  onConfirmDelete: (productId: number) => void;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  product,
  onClose,
  onConfirmDelete,
}) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !product) return null;

  const handleDelete = async () => {
    if (isDeleting) return;

    setIsDeleting(true);
    setError(null);

    try {
      // Call Axios DELETE /products/{id}
      await productsService.deleteProduct(product.id);
      onConfirmDelete(product.id);
      onClose();
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          'Failed to delete product from API. Removing locally...'
      );
      // Fallback: delete locally anyway after 1s
      setTimeout(() => {
        onConfirmDelete(product.id);
        onClose();
      }, 1000);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-rose-50/50">
          <div className="flex items-center gap-2 text-rose-700 font-bold text-sm">
            <AlertTriangle className="w-5 h-5 text-rose-600" />
            <span>Confirm Deletion</span>
          </div>
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 text-slate-700 text-sm">
          {error && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700">
              {error}
            </div>
          )}

          <p className="mb-2">
            Are you sure you want to delete this product?
          </p>
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl mb-4">
            <p className="font-bold text-slate-900 text-sm">{product.title}</p>
            <p className="text-xs text-slate-500 font-mono mt-0.5">
              ID: #{product.id} • Category: {product.category} • ${product.price}
            </p>
          </div>
          <p className="text-xs text-slate-500">
            This action will remove the item from your current active product catalog session.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 active:bg-rose-800 rounded-xl shadow-md shadow-rose-600/20 disabled:opacity-50 transition-all"
          >
            {isDeleting ? (
              <>
                <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 10 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="w-3.5 h-3.5" />
                Delete Product
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmModal;
