'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Product } from '@/types/product';
import { Star, Eye, Edit3, Trash2 } from 'lucide-react';

interface ProductTableProps {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
}

export const ProductTable: React.FC<ProductTableProps> = ({
  products,
  onEdit,
  onDelete,
}) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-slate-50/80 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
            <th className="py-3.5 px-4">Product</th>
            <th className="py-3.5 px-4">Category</th>
            <th className="py-3.5 px-4">Price</th>
            <th className="py-3.5 px-4">Rating</th>
            <th className="py-3.5 px-4">Stock</th>
            <th className="py-3.5 px-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white text-sm">
          {products.map((product) => (
            <tr
              key={product.id}
              className="hover:bg-slate-50/80 transition-colors group"
            >
              {/* Image & Title */}
              <td className="py-3 px-4">
                <div className="flex items-center gap-3">
                  <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-slate-100 border border-slate-200/80 shrink-0">
                    <Image
                      src={product.thumbnail || product.images?.[0] || 'https://via.placeholder.com/150'}
                      alt={product.title}
                      fill
                      sizes="48px"
                      className="object-cover group-hover:scale-105 transition-transform duration-200"
                      unoptimized
                    />
                  </div>
                  <div className="min-w-0">
                    <Link
                      href={`/products/${product.id}`}
                      className="font-semibold text-slate-900 hover:text-indigo-600 truncate block transition-colors"
                    >
                      {product.title}
                    </Link>
                    <span className="text-xs text-slate-400 font-mono">
                      ID: #{product.id} {product.isLocal && <span className="text-indigo-600 font-medium ml-1">(Local)</span>}
                    </span>
                  </div>
                </div>
              </td>

              {/* Category */}
              <td className="py-3 px-4">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 capitalize border border-slate-200/50">
                  {product.category.replace(/-/g, ' ')}
                </span>
              </td>

              {/* Price */}
              <td className="py-3 px-4 font-bold text-slate-900">
                ${product.price.toFixed(2)}
              </td>

              {/* Rating */}
              <td className="py-3 px-4">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span className="font-semibold text-slate-800 text-xs">
                    {product.rating.toFixed(1)}
                  </span>
                </div>
              </td>

              {/* Stock */}
              <td className="py-3 px-4">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                    product.stock > 10
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                      : product.stock > 0
                      ? 'bg-amber-50 text-amber-700 border border-amber-200/60'
                      : 'bg-rose-50 text-rose-700 border border-rose-200/60'
                  }`}
                >
                  {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                </span>
              </td>

              {/* Actions */}
              <td className="py-3 px-4 text-right">
                <div className="flex items-center justify-end gap-1.5">
                  <Link
                    href={`/products/${product.id}`}
                    title="View Details"
                    className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                  </Link>

                  <button
                    onClick={() => onEdit(product)}
                    title="Edit Product"
                    className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => onDelete(product)}
                    title="Delete Product"
                    className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ProductTable;
