'use client';

import React, { useState, useEffect, useCallback, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import axios from 'axios';
import Header from '@/components/layout/Header';
import ProductTable from '@/components/products/ProductTable';
import ProductCards from '@/components/products/ProductCards';
import ProductFilter from '@/components/products/ProductFilter';
import Pagination from '@/components/products/Pagination';
import Loader from '@/components/ui/Loader';
import EmptyState from '@/components/ui/EmptyState';
import ErrorState from '@/components/ui/ErrorState';
import ProductFormModal from '@/components/products/ProductFormModal';
import DeleteConfirmModal from '@/components/products/DeleteConfirmModal';
import productsService from '@/services/products';
import { useProductState } from '@/context/ProductContext';
import { Product } from '@/types/product';
import { Package, Plus } from 'lucide-react';

function ProductsDashboardContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Local state store context (handles DummyJSON optimistic mutations)
  const {
    addLocalProduct,
    updateLocalProduct,
    deleteLocalProduct,
    mergeProductsWithLocalState,
  } = useProductState();

  // Ref to hold current AbortController for race condition cancellation
  const abortControllerRef = useRef<AbortController | null>(null);

  // 1. Safe Resilient URL Query Parameter Parsing
  const rawPage = parseInt(searchParams.get('page') || '1', 10);
  const safePage = isNaN(rawPage) || rawPage < 1 ? 1 : rawPage;

  const rawLimit = parseInt(searchParams.get('limit') || '10', 10);
  const safeLimit = [10, 20, 50].includes(rawLimit) ? rawLimit : 10;

  const search = searchParams.get('search') || '';
  const category = searchParams.get('category') || '';
  const sortBy = (searchParams.get('sortBy') as 'price' | 'rating' | 'title' | '') || '';
  const order = (searchParams.get('order') as 'asc' | 'desc') || 'asc';

  const skip = (safePage - 1) * safeLimit;

  // Component local state
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Modals state
  const [isFormModalOpen, setIsFormModalOpen] = useState<boolean>(false);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  // 2. Data Fetching with Axios AbortController
  const fetchProducts = useCallback(async () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    setIsLoading(true);
    setError(null);

    try {
      const data = await productsService.getProducts(
        {
          limit: safeLimit,
          skip,
          search,
          category,
          sortBy,
          order,
        },
        controller.signal
      );

      // Merge API products with optimistic local additions, updates & deletions
      const merged = mergeProductsWithLocalState(
        data.products || [],
        data.total || 0,
        skip
      );

      setProducts(merged.products);
      setTotal(merged.total);

      // Auto-correct page if URL had out-of-range page number
      const maxPages = Math.max(1, Math.ceil(merged.total / safeLimit));
      if (safePage > maxPages && merged.total > 0) {
        const params = new URLSearchParams(searchParams.toString());
        params.set('page', String(maxPages));
        router.replace(`/products?${params.toString()}`);
      }
    } catch (err: any) {
      if (
        axios.isCancel(err) ||
        err.name === 'CanceledError' ||
        err.name === 'AbortError'
      ) {
        return;
      }

      setError(
        err.response?.data?.message ||
          'Failed to fetch products. Please check your network connection.'
      );
    } finally {
      setIsLoading(false);
    }
  }, [safeLimit, safePage, skip, search, category, sortBy, order, searchParams, router, mergeProductsWithLocalState]);

  useEffect(() => {
    fetchProducts();

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchProducts]);

  // Helper to update URL query parameters cleanly
  const updateQueryParams = (newParams: Record<string, string | number | null>) => {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(newParams).forEach(([key, value]) => {
      if (value === null || value === '' || value === undefined) {
        params.delete(key);
      } else {
        params.set(key, String(value));
      }
    });

    router.push(`/products?${params.toString()}`);
  };

  const handleFilterChange = (filters: {
    search?: string;
    category?: string;
    sortBy?: string;
    order?: string;
    page?: number;
  }) => {
    updateQueryParams({
      search: filters.search !== undefined ? filters.search : search,
      category: filters.category !== undefined ? filters.category : category,
      sortBy: filters.sortBy !== undefined ? filters.sortBy : sortBy,
      order: filters.order !== undefined ? filters.order : order,
      page: filters.page || 1,
    });
  };

  const handlePageChange = (newSkip: number) => {
    const newPage = Math.floor(newSkip / safeLimit) + 1;
    updateQueryParams({ page: newPage });
  };

  const handleLimitChange = (newLimit: number) => {
    updateQueryParams({ limit: newLimit, page: 1 });
  };

  const handleResetFilters = () => {
    router.push('/products');
  };

  // CRUD Handlers
  const handleOpenAddModal = () => {
    setProductToEdit(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEditModal = (product: Product) => {
    setProductToEdit(product);
    setIsFormModalOpen(true);
  };

  const handleOpenDeleteModal = (product: Product) => {
    setProductToDelete(product);
    setIsDeleteModalOpen(true);
  };

  const handleFormSuccess = (resultProduct: Product, isEdit: boolean) => {
    if (isEdit) {
      updateLocalProduct(resultProduct);
    } else {
      addLocalProduct(resultProduct);
    }
    fetchProducts();
  };

  const handleDeleteConfirm = (productId: number) => {
    deleteLocalProduct(productId);
    fetchProducts();
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Top Header Section */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 text-indigo-600 font-semibold text-xs uppercase tracking-wider mb-1">
              <Package className="w-4 h-4" />
              <span>Catalog Management</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
              Products Overview
            </h2>
          </div>

          <button
            onClick={handleOpenAddModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-md shadow-indigo-600/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            Add Product
          </button>
        </div>

        {/* Filter & Search Toolbar */}
        <ProductFilter
          searchParam={search}
          categoryParam={category}
          sortByParam={sortBy}
          orderParam={order}
          onFilterChange={handleFilterChange}
          onReset={handleResetFilters}
        />

        {/* Main Products Display Section */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {isLoading ? (
            <Loader message="Loading product catalog..." />
          ) : error ? (
            <ErrorState message={error} onRetry={fetchProducts} />
          ) : products.length === 0 ? (
            <EmptyState
              title={search ? `No products match "${search}"` : 'No products found'}
              description={
                search || category
                  ? 'Try clearing your search query or selecting a different category filter.'
                  : 'No items exist in the catalog right now.'
              }
              onReset={handleResetFilters}
            />
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden md:block">
                <ProductTable
                  products={products}
                  onEdit={handleOpenEditModal}
                  onDelete={handleOpenDeleteModal}
                />
              </div>

              {/* Mobile Cards View */}
              <div className="block md:hidden">
                <ProductCards
                  products={products}
                  onEdit={handleOpenEditModal}
                  onDelete={handleOpenDeleteModal}
                />
              </div>

              {/* Custom Manual Pagination */}
              <Pagination
                total={total}
                limit={safeLimit}
                skip={skip}
                onPageChange={handlePageChange}
                onLimitChange={handleLimitChange}
                disabled={isLoading}
              />
            </>
          )}
        </div>

        {/* Add / Edit Form Modal */}
        <ProductFormModal
          isOpen={isFormModalOpen}
          onClose={() => setIsFormModalOpen(false)}
          productToEdit={productToEdit}
          onSuccess={handleFormSuccess}
        />

        {/* Delete Confirmation Modal */}
        <DeleteConfirmModal
          isOpen={isDeleteModalOpen}
          product={productToDelete}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirmDelete={handleDeleteConfirm}
        />
      </main>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<Loader message="Loading dashboard..." />}>
      <ProductsDashboardContent />
    </Suspense>
  );
}
