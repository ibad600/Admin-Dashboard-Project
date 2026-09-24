'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product } from '@/types/product';

interface ProductContextType {
  createdProducts: Product[];
  updatedProductsMap: Record<number, Product>;
  deletedProductIds: number[];
  addLocalProduct: (product: Product) => void;
  updateLocalProduct: (product: Product) => void;
  deleteLocalProduct: (id: number) => void;
  getProductById: (id: number, apiProduct: Product | null) => Product | null;
  mergeProductsWithLocalState: (
    apiProducts: Product[],
    totalCount: number,
    skip: number
  ) => { products: Product[]; total: number };
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY_CREATED = 'local_created_products';
const LOCAL_STORAGE_KEY_UPDATED = 'local_updated_products';
const LOCAL_STORAGE_KEY_DELETED = 'local_deleted_products';

export const ProductProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [createdProducts, setCreatedProducts] = useState<Product[]>([]);
  const [updatedProductsMap, setUpdatedProductsMap] = useState<Record<number, Product>>({});
  const [deletedProductIds, setDeletedProductIds] = useState<number[]>([]);

  // Load local mutations from localStorage on mount
  useEffect(() => {
    try {
      const storedCreated = localStorage.getItem(LOCAL_STORAGE_KEY_CREATED);
      const storedUpdated = localStorage.getItem(LOCAL_STORAGE_KEY_UPDATED);
      const storedDeleted = localStorage.getItem(LOCAL_STORAGE_KEY_DELETED);

      if (storedCreated) setCreatedProducts(JSON.parse(storedCreated));
      if (storedUpdated) setUpdatedProductsMap(JSON.parse(storedUpdated));
      if (storedDeleted) setDeletedProductIds(JSON.parse(storedDeleted));
    } catch (err) {
      console.error('Failed to load local mutations from localStorage:', err);
    }
  }, []);

  // Save to localStorage helper
  const saveCreated = (items: Product[]) => {
    setCreatedProducts(items);
    localStorage.setItem(LOCAL_STORAGE_KEY_CREATED, JSON.stringify(items));
  };

  const saveUpdated = (map: Record<number, Product>) => {
    setUpdatedProductsMap(map);
    localStorage.setItem(LOCAL_STORAGE_KEY_UPDATED, JSON.stringify(map));
  };

  const saveDeleted = (ids: number[]) => {
    setDeletedProductIds(ids);
    localStorage.setItem(LOCAL_STORAGE_KEY_DELETED, JSON.stringify(ids));
  };

  const addLocalProduct = (newProduct: Product) => {
    const formatted: Product = {
      ...newProduct,
      id: newProduct.id || Date.now(), // Fallback ID if DummyJSON returns constant 195
      isLocal: true,
      images: newProduct.images?.length ? newProduct.images : [newProduct.thumbnail],
    };

    const updatedList = [formatted, ...createdProducts];
    saveCreated(updatedList);
  };

  const updateLocalProduct = (updatedProduct: Product) => {
    // If it's a locally created product, update it in createdProducts list
    const isLocallyCreated = createdProducts.some((p) => p.id === updatedProduct.id);
    if (isLocallyCreated) {
      const updatedList = createdProducts.map((p) =>
        p.id === updatedProduct.id ? { ...p, ...updatedProduct } : p
      );
      saveCreated(updatedList);
    } else {
      const newMap = {
        ...updatedProductsMap,
        [updatedProduct.id]: {
          ...(updatedProductsMap[updatedProduct.id] || {}),
          ...updatedProduct,
          isLocal: true,
        },
      };
      saveUpdated(newMap);
    }
  };

  const deleteLocalProduct = (id: number) => {
    // Remove from createdProducts if it was created locally
    const isLocallyCreated = createdProducts.some((p) => p.id === id);
    if (isLocallyCreated) {
      const updatedList = createdProducts.filter((p) => p.id !== id);
      saveCreated(updatedList);
    } else {
      if (!deletedProductIds.includes(id)) {
        const newDeleted = [...deletedProductIds, id];
        saveDeleted(newDeleted);
      }
    }
  };

  const getProductById = (id: number, apiProduct: Product | null): Product | null => {
    // Check if deleted
    if (deletedProductIds.includes(id)) {
      return null;
    }

    // Check created list first
    const createdMatch = createdProducts.find((p) => p.id === id);
    if (createdMatch) {
      return createdMatch;
    }

    // Check updated map override
    if (updatedProductsMap[id]) {
      return { ...apiProduct, ...updatedProductsMap[id] } as Product;
    }

    return apiProduct;
  };

  const mergeProductsWithLocalState = (
    apiProducts: Product[],
    totalCount: number,
    skip: number
  ) => {
    // 1. Filter out deleted items
    let processed = apiProducts.filter((p) => !deletedProductIds.includes(p.id));

    // 2. Apply updated item overrides
    processed = processed.map((p) => {
      if (updatedProductsMap[p.id]) {
        return { ...p, ...updatedProductsMap[p.id] };
      }
      return p;
    });

    // 3. Prepend created products if we are on the first page (skip === 0)
    let netTotal = totalCount + createdProducts.length - deletedProductIds.length;
    if (skip === 0) {
      processed = [...createdProducts, ...processed];
    }

    return {
      products: processed,
      total: Math.max(0, netTotal),
    };
  };

  return (
    <ProductContext.Provider
      value={{
        createdProducts,
        updatedProductsMap,
        deletedProductIds,
        addLocalProduct,
        updateLocalProduct,
        deleteLocalProduct,
        getProductById,
        mergeProductsWithLocalState,
      }}
    >
      {children}
    </ProductContext.Provider>
  );
};

export const useProductState = () => {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error('useProductState must be used within a ProductProvider');
  }
  return context;
};
