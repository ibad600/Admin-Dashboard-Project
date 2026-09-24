'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Product } from '@/types/product';
import { Star, Eye, Edit3, Trash2 } from 'lucide-react';

interface ProductCardsProps {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
}

export const ProductCards: React.FC<ProductCardsProps> = ({
  products,
  onEdit,
  onDelete,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4">
      {products.map((product) => (
        <div
          key={product.id}
          className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
        >
          <div>
            {/* Header image & price */}
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                <Image
                  src={product.thumbnail || product.images?.[0] || 'https://via.placeholder.com/150'}
                  alt={product.title}
                  fill
                  sizes="64px"
                  className="object-cover"
                  unoptimized
                />
              </div>
              <div className="text-right">
                <p className="text-base font-bold text-slate-900">
                  ${product.price.toFixed(2)}
                </p>
                <div className="flex items-center justify-end gap-1 mt-0.5">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span className="text-xs font-semibold text-slate-700">
                    {product.rating.toFixed(1)}
                  </span>
                </div>
              </div>
            </div>

            {/* Title & Category */}
            <Link
              href={`/products/${product.id}`}
              className="font-bold text-slate-900 text-sm hover:text-indigo-600 line-clamp-2 transition-colors mb-2 block"
            >
              {product.title}
            </Link>

            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-700 capitalize">
                {product.category.replace(/-/g, ' ')}
              </span>

              <span
                className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                  product.stock > 10
                    ? 'bg-emerald-50 text-emerald-700'
                    : product.stock > 0
                    ? 'bg-amber-50 text-amber-700'
                    : 'bg-rose-50 text-rose-700'
                }`}
              >
                {product.stock > 0 ? `${product.stock} left` : 'Out of stock'}
              </span>
            </div>
          </div>

          {/* Action buttons footer */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
            <Link
              href={`/products/${product.id}`}
              className="flex-1 py-1.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-medium inline-flex items-center justify-center gap-1.5 transition-colors"
            >
              <Eye className="w-3.5 h-3.5" />
              View
            </Link>

            <button
              onClick={() => onEdit(product)}
              className="py-1.5 px-3 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-xl text-xs font-medium inline-flex items-center justify-center gap-1.5 transition-colors"
            >
              <Edit3 className="w-3.5 h-3.5" />
              Edit
            </button>

            <button
              onClick={() => onDelete(product)}
              className="py-1.5 px-3 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-medium inline-flex items-center justify-center gap-1.5 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProductCards;
