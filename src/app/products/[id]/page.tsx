'use client';

import React, { useState, useEffect, use } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import Loader from '@/components/ui/Loader';
import ProductFormModal from '@/components/products/ProductFormModal';
import DeleteConfirmModal from '@/components/products/DeleteConfirmModal';
import productsService from '@/services/products';
import { useProductState } from '@/context/ProductContext';
import { Product } from '@/types/product';
import {
  ArrowLeft,
  Star,
  Package,
  ShieldCheck,
  RefreshCcw,
  Truck,
  Edit3,
  Trash2,
  AlertCircle,
} from 'lucide-react';

interface ProductDetailsPageProps {
  params: Promise<{ id: string }>;
}

export default function ProductDetailsPage({ params }: ProductDetailsPageProps) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { getProductById, updateLocalProduct, deleteLocalProduct } = useProductState();

  const productId = parseInt(resolvedParams.id, 10);
  const isInvalidId = isNaN(productId) || productId <= 0;

  const [product, setProduct] = useState<Product | null>(null);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(!isInvalidId);
  const [isNotFound, setIsNotFound] = useState<boolean>(isInvalidId);
  const [error, setError] = useState<string | null>(null);

  // Modal States
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  useEffect(() => {
    if (isInvalidId) {
      setIsNotFound(true);
      setIsLoading(false);
      return;
    }

    const fetchDetail = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const apiData = await productsService.getProductById(productId);
        // Merge with local state override (if edited or deleted)
        const finalProduct = getProductById(productId, apiData);
        if (!finalProduct) {
          setIsNotFound(true);
        } else {
          setProduct(finalProduct);
          setSelectedImage(finalProduct.thumbnail || finalProduct.images?.[0] || '');
        }
      } catch (err: any) {
        // Try resolving from local store (e.g. locally created item)
        const localProduct = getProductById(productId, null);
        if (localProduct) {
          setProduct(localProduct);
          setSelectedImage(localProduct.thumbnail || localProduct.images?.[0] || '');
        } else {
          setIsNotFound(true);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchDetail();
  }, [productId, isInvalidId]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleEditSuccess = (updated: Product) => {
    updateLocalProduct(updated);
    setProduct(updated);
    setSelectedImage(updated.thumbnail || updated.images?.[0] || selectedImage);
  };

  const handleDeleteConfirm = (id: number) => {
    deleteLocalProduct(id);
    router.push('/products');
  };

  // 1. Not Found Page UI
  if (isNotFound) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Header />
        <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-16 text-center flex flex-col items-center justify-center">
          <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-3xl flex items-center justify-center mb-4">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Product Not Found</h2>
          <p className="text-sm text-slate-500 max-w-md mb-6">
            The product with ID #{resolvedParams.id} could not be found or has been deleted from the catalog.
          </p>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-md transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Products Catalog
          </Link>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Link & Page Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <Link
            href="/products"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-indigo-600 bg-white px-3.5 py-2 rounded-xl border border-slate-200 transition-colors shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Products List
          </Link>

          {product && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsEditModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-xl transition-colors"
              >
                <Edit3 className="w-3.5 h-3.5" />
                Edit Product
              </button>

              <button
                onClick={() => setIsDeleteModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete Product
              </button>
            </div>
          )}
        </div>

        {isLoading || !product ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
            <Loader message="Loading product details..." />
          </div>
        ) : (
          <div className="space-y-8">
            {/* Top Product Information Card */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-sm grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Left Column: Image Gallery */}
              <div className="lg:col-span-5 space-y-4">
                <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-slate-100 border border-slate-200">
                  <Image
                    src={selectedImage || product.thumbnail}
                    alt={product.title}
                    fill
                    sizes="(max-width: 1024px) 100vw, 40vw"
                    className="object-contain p-4"
                    priority
                    unoptimized
                  />
                </div>

                {/* Gallery Thumbnails */}
                {product.images && product.images.length > 1 && (
                  <div className="flex items-center gap-2 overflow-x-auto pb-2">
                    {product.images.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedImage(img)}
                        className={`relative w-16 h-16 rounded-xl overflow-hidden border-2 shrink-0 bg-slate-50 transition-all ${
                          selectedImage === img
                            ? 'border-indigo-600 ring-2 ring-indigo-600/20'
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <Image
                          src={img}
                          alt={`Thumbnail ${idx + 1}`}
                          fill
                          sizes="64px"
                          className="object-cover"
                          unoptimized
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Right Column: Details & Specs */}
              <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
                <div>
                  {/* Category & Stock Badges */}
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 capitalize border border-indigo-100">
                      {product.category.replace(/-/g, ' ')}
                    </span>

                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        product.stock > 10
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                          : product.stock > 0
                          ? 'bg-amber-50 text-amber-700 border border-amber-200/60'
                          : 'bg-rose-50 text-rose-700 border border-rose-200/60'
                      }`}
                    >
                      {product.stock > 0 ? `${product.stock} items in stock` : 'Out of stock'}
                    </span>

                    {product.brand && (
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
                        Brand: {product.brand}
                      </span>
                    )}
                  </div>

                  {/* Title & Rating */}
                  <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight mb-2">
                    {product.title}
                  </h1>

                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex items-center gap-1 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200/60">
                      <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                      <span className="font-bold text-slate-900 text-xs">
                        {product.rating.toFixed(1)}
                      </span>
                    </div>

                    {product.reviews && (
                      <span className="text-xs text-slate-500 font-medium">
                        Based on {product.reviews.length} customer reviews
                      </span>
                    )}
                  </div>

                  {/* Pricing */}
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 mb-6 flex items-baseline gap-3">
                    <span className="text-3xl font-extrabold text-slate-900">
                      ${product.price.toFixed(2)}
                    </span>
                    {product.discountPercentage && (
                      <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-lg">
                        {product.discountPercentage.toFixed(0)}% OFF
                      </span>
                    )}
                  </div>

                  {/* Description */}
                  <div>
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                      Description
                    </h4>
                    <p className="text-sm text-slate-700 leading-relaxed">
                      {product.description}
                    </p>
                  </div>
                </div>

                {/* Additional Spec Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-6 border-t border-slate-100">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60 flex items-center gap-2.5">
                    <ShieldCheck className="w-5 h-5 text-indigo-600 shrink-0" />
                    <div>
                      <p className="text-[10px] text-slate-500 font-semibold uppercase">Warranty</p>
                      <p className="text-xs font-medium text-slate-900">
                        {product.warrantyInformation || '1 Year Warranty'}
                      </p>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60 flex items-center gap-2.5">
                    <Truck className="w-5 h-5 text-indigo-600 shrink-0" />
                    <div>
                      <p className="text-[10px] text-slate-500 font-semibold uppercase">Shipping</p>
                      <p className="text-xs font-medium text-slate-900">
                        {product.shippingInformation || 'Standard Shipping'}
                      </p>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60 flex items-center gap-2.5">
                    <RefreshCcw className="w-5 h-5 text-indigo-600 shrink-0" />
                    <div>
                      <p className="text-[10px] text-slate-500 font-semibold uppercase">Return Policy</p>
                      <p className="text-xs font-medium text-slate-900">
                        {product.returnPolicy || '30-Day Return'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Customer Reviews Section */}
            {product.reviews && product.reviews.length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-sm">
                <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                  <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                  Customer Reviews ({product.reviews.length})
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {product.reviews.map((rev, idx) => (
                    <div
                      key={idx}
                      className="p-4 bg-slate-50 rounded-xl border border-slate-200/70 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-xs text-slate-900">
                          {rev.reviewerName}
                        </span>
                        <div className="flex items-center gap-1">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          <span className="text-xs font-bold text-slate-800">
                            {rev.rating}
                          </span>
                        </div>
                      </div>

                      <p className="text-xs text-slate-600 italic">
                        &quot;{rev.comment}&quot;
                      </p>

                      <p className="text-[10px] text-slate-400">
                        {new Date(rev.date).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Modals */}
        <ProductFormModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          productToEdit={product}
          onSuccess={handleEditSuccess}
        />

        <DeleteConfirmModal
          isOpen={isDeleteModalOpen}
          product={product}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirmDelete={handleDeleteConfirm}
        />
      </main>
    </div>
  );
}
