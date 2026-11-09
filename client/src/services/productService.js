import apiClient from './apiClient';
import { demoProducts } from '../data/demoProducts';

/**
 * Product Service Layer
 * Abstracts backend API communication and provides fallback resilience.
 */
export const productService = {
  /**
   * Fetch products with query parameters (category, search, price range, page, limit)
   */
  async getProducts(params = {}) {
    try {
      const searchParams = new URLSearchParams();
      if (params.category && params.category !== 'All') searchParams.set('category', params.category);
      if (params.search) searchParams.set('search', params.search);
      if (params.minPrice) searchParams.set('minPrice', params.minPrice);
      if (params.maxPrice) searchParams.set('maxPrice', params.maxPrice);
      if (params.featured) searchParams.set('featured', 'true');
      searchParams.set('page', params.page || 1);
      searchParams.set('limit', params.limit || 12);

      const { data } = await apiClient.get(`/products?${searchParams.toString()}`);
      if (data?.products && data.products.length > 0) {
        return {
          products: data.products,
          totalPages: data.totalPages || 1,
          currentPage: data.currentPage || 1,
          total: data.total || data.products.length,
        };
      }
      return this.filterLocalProducts(params);
    } catch {
      return this.filterLocalProducts(params);
    }
  },

  /**
   * Fetch featured products for the home page (instant response)
   */
  async getFeaturedProducts(limit = 8) {
    try {
      const { data } = await apiClient.get(`/products?featured=true&limit=${limit}`);
      if (data?.products && data.products.length > 0) {
        return data.products;
      }
      return demoProducts.filter((p) => p.isFeatured).slice(0, limit);
    } catch {
      return demoProducts.filter((p) => p.isFeatured).slice(0, limit);
    }
  },

  /**
   * Fetch single product by ID
   */
  async getProductById(id) {
    try {
      const { data } = await apiClient.get(`/products/${id}`);
      if (data && data._id) return data;
      return demoProducts.find((p) => String(p._id) === String(id)) || null;
    } catch {
      return demoProducts.find((p) => String(p._id) === String(id)) || null;
    }
  },

  /**
   * Create a new product (Admin)
   */
  async createProduct(productData) {
    const { data } = await apiClient.post('/products', productData);
    return data;
  },

  /**
   * Update existing product (Admin)
   */
  async updateProduct(id, productData) {
    const { data } = await apiClient.put(`/products/${id}`, productData);
    return data;
  },

  /**
   * Delete product (Admin)
   */
  async deleteProduct(id) {
    const { data } = await apiClient.delete(`/products/${id}`);
    return data;
  },

  /**
   * Local instant in-memory fallback filtering
   */
  filterLocalProducts(params = {}) {
    let filtered = [...demoProducts];

    if (params.category && params.category !== 'All') {
      filtered = filtered.filter(
        (p) => p.category.toLowerCase() === params.category.toLowerCase()
      );
    }

    if (params.search) {
      const q = params.search.toLowerCase();
      filtered = filtered.filter(
        (p) => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)
      );
    }

    if (params.minPrice) {
      filtered = filtered.filter((p) => (p.discountPrice || p.price) >= Number(params.minPrice));
    }

    if (params.maxPrice) {
      filtered = filtered.filter((p) => (p.discountPrice || p.price) <= Number(params.maxPrice));
    }

    if (params.featured) {
      filtered = filtered.filter((p) => p.isFeatured);
    }

    const page = Number(params.page) || 1;
    const limit = Number(params.limit) || 12;
    const startIndex = (page - 1) * limit;

    return {
      products: filtered.slice(startIndex, startIndex + limit),
      totalPages: Math.ceil(filtered.length / limit) || 1,
      currentPage: page,
      total: filtered.length,
    };
  },
};

export default productService;

