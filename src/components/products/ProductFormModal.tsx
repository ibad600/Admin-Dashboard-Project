'use client';

import React, { useState, useEffect } from 'react';
import { Product, CreateProductInput } from '@/types/product';
import { X, Save, AlertCircle } from 'lucide-react';
import productsService from '@/services/products';

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  productToEdit?: Product | null;
  onSuccess: (product: Product, isEdit: boolean) => void;
}

export const ProductFormModal: React.FC<ProductFormModalProps> = ({
  isOpen,
  onClose,
  productToEdit,
  onSuccess,
}) => {
  const isEditMode = Boolean(productToEdit);

  // Form Fields State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('beauty');
  const [price, setPrice] = useState<string>('');
  const [stock, setStock] = useState<string>('');
  const [rating, setRating] = useState<string>('4.5');
  const [thumbnail, setThumbnail] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Populate form fields if editing an existing product
  useEffect(() => {
    if (productToEdit) {
      setTitle(productToEdit.title || '');
      setDescription(productToEdit.description || '');
      setCategory(productToEdit.category || 'beauty');
      setPrice(productToEdit.price !== undefined ? String(productToEdit.price) : '');
      setStock(productToEdit.stock !== undefined ? String(productToEdit.stock) : '');
      setRating(productToEdit.rating !== undefined ? String(productToEdit.rating) : '4.5');
      setThumbnail(productToEdit.thumbnail || productToEdit.images?.[0] || '');
    } else {
      // Default reset for Add mode
      setTitle('');
      setDescription('');
      setCategory('beauty');
      setPrice('');
      setStock('');
      setRating('4.5');
      setThumbnail('https://cdn.dummyjson.com/products/images/beauty/Essence%20Mascara%20Lash%20Princess/thumbnail.png');
    }
    setValidationError(null);
  }, [productToEdit, isOpen]);

  if (!isOpen) return null;

  const validateForm = (): boolean => {
    if (!title.trim() || title.trim().length < 3) {
      setValidationError('Product title must be at least 3 characters long.');
      return false;
    }
    if (!description.trim() || description.trim().length < 10) {
      setValidationError('Description must be at least 10 characters long.');
      return false;
    }
    const parsedPrice = parseFloat(price);
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      setValidationError('Please enter a valid price greater than $0.');
      return false;
    }
    const parsedStock = parseInt(stock, 10);
    if (isNaN(parsedStock) || parsedStock < 0) {
      setValidationError('Please enter a valid non-negative stock quantity.');
      return false;
    }
    const parsedRating = parseFloat(rating);
    if (isNaN(parsedRating) || parsedRating < 0 || parsedRating > 5) {
      setValidationError('Rating must be a number between 0.0 and 5.0.');
      return false;
    }
    if (!thumbnail.trim()) {
      setValidationError('Please provide a valid thumbnail image URL.');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Prevent double clicking submit button
    if (isSubmitting) return;

    setValidationError(null);

    if (!validateForm()) return;

    const payload: CreateProductInput = {
      title: title.trim(),
      description: description.trim(),
      category: category.trim(),
      price: parseFloat(price),
      stock: parseInt(stock, 10),
      rating: parseFloat(rating),
      thumbnail: thumbnail.trim(),
      images: [thumbnail.trim()],
    };

    setIsSubmitting(true);

    try {
      if (isEditMode && productToEdit) {
        // Call Axios PUT /products/{id}
        const updatedApiData = await productsService.updateProduct(productToEdit.id, payload);
        const resultProduct: Product = {
          ...productToEdit,
          ...payload,
          ...updatedApiData,
        };
        onSuccess(resultProduct, true);
      } else {
        // Call Axios POST /products/add
        const createdApiData = await productsService.createProduct(payload);
        const resultProduct: Product = {
          ...createdApiData,
          ...payload,
          id: createdApiData.id || Date.now(),
        };
        onSuccess(resultProduct, false);
      }
      onClose();
    } catch (err: any) {
      setValidationError(
        err.response?.data?.message || 'Failed to save product. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <h3 className="text-base font-bold text-slate-900">
            {isEditMode ? `Edit Product #${productToEdit?.id}` : 'Add New Product'}
          </h3>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
          {validationError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
              <span>{validationError}</span>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Premium Leather Headphones"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white"
            />
          </div>

          {/* Category & Price Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600 capitalize"
              >
                <option value="beauty">Beauty</option>
                <option value="fragrances">Fragrances</option>
                <option value="furniture">Furniture</option>
                <option value="groceries">Groceries</option>
                <option value="laptops">Laptops</option>
                <option value="smartphones">Smartphones</option>
                <option value="home-decoration">Home Decoration</option>
                <option value="sunglasses">Sunglasses</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Price ($) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="29.99"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white"
              />
            </div>
          </div>

          {/* Stock & Rating Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Stock Quantity *
              </label>
              <input
                type="number"
                min="0"
                required
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                placeholder="50"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Rating (0.0 - 5.0) *
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="5"
                required
                value={rating}
                onChange={(e) => setRating(e.target.value)}
                placeholder="4.5"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white"
              />
            </div>
          </div>

          {/* Thumbnail URL */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Thumbnail Image URL *
            </label>
            <input
              type="url"
              required
              value={thumbnail}
              onChange={(e) => setThumbnail(e.target.value)}
              placeholder="https://example.com/image.jpg"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Description *
            </label>
            <textarea
              rows={3}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter detailed product specifications and description..."
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white"
            />
          </div>

          {/* Footer Action Buttons */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-600/20 disabled:opacity-50 transition-all"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 10 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  {isEditMode ? 'Update Product' : 'Create Product'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductFormModal;
