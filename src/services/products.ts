import apiClient from './api';
import {
  Product,
  ProductsResponse,
  CategoryItem,
  ProductQueryParams,
  CreateProductInput,
  UpdateProductInput,
} from '@/types/product';

export const productsService = {
  /**
   * Fetch products with support for pagination, search, category filtering, and sorting.
   * All calls use the shared Axios instance.
   */
  async getProducts(
    params: ProductQueryParams = {},
    signal?: AbortSignal
  ): Promise<ProductsResponse> {
    const { limit = 10, skip = 0, search, category, sortBy, order } = params;

    // 1. Search endpoint if search query exists
    if (search && search.trim() !== '') {
      const response = await apiClient.get<ProductsResponse>('/products/search', {
        params: {
          q: search.trim(),
          limit,
          skip,
        },
        signal,
      });
      return response.data;
    }

    // 2. Category endpoint if category filter is active
    if (category && category.trim() !== '') {
      const response = await apiClient.get<ProductsResponse>(
        `/products/category/${encodeURIComponent(category.trim())}`,
        {
          params: {
            limit,
            skip,
          },
          signal,
        }
      );
      return response.data;
    }

    // 3. Standard products list with optional sorting
    const queryParams: Record<string, any> = { limit, skip };
    if (sortBy) {
      queryParams.sortBy = sortBy;
      queryParams.order = order || 'asc';
    }

    const response = await apiClient.get<ProductsResponse>('/products', {
      params: queryParams,
      signal,
    });
    return response.data;
  },

  /**
   * Fetch all product categories
   * Endpoint: GET /products/categories
   */
  async getCategories(): Promise<CategoryItem[]> {
    const response = await apiClient.get<CategoryItem[] | string[]>('/products/categories');
    
    // DummyJSON returns either an array of objects or strings depending on version
    if (Array.isArray(response.data)) {
      return response.data.map((cat: any) => {
        if (typeof cat === 'string') {
          return { slug: cat, name: cat.replace(/-/g, ' '), url: '' };
        }
        return cat;
      });
    }
    return [];
  },

  /**
   * Fetch a single product by ID
   * Endpoint: GET /products/{id}
   */
  async getProductById(id: number, signal?: AbortSignal): Promise<Product> {
    const response = await apiClient.get<Product>(`/products/${id}`, { signal });
    return response.data;
  },

  /**
   * Add a new product
   * Endpoint: POST /products/add
   */
  async createProduct(input: CreateProductInput): Promise<Product> {
    const response = await apiClient.post<Product>('/products/add', input);
    return response.data;
  },

  /**
   * Update an existing product
   * Endpoint: PUT /products/{id}
   */
  async updateProduct(id: number, input: Partial<CreateProductInput>): Promise<Product> {
    const response = await apiClient.put<Product>(`/products/${id}`, input);
    return response.data;
  },

  /**
   * Delete a product
   * Endpoint: DELETE /products/{id}
   */
  async deleteProduct(id: number): Promise<{ id: number; isDeleted: boolean }> {
    const response = await apiClient.delete<{ id: number; isDeleted: boolean }>(
      `/products/${id}`
    );
    return response.data;
  },
};

export default productsService;
