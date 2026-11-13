import apiClient from './apiClient';
import { demoProducts } from '../data/demoProducts';

const CUSTOM_PRODUCTS_KEY = 'modotech_custom_products';

/**
 * Helper to get admin-added custom products from persistent storage
 */
export const getCustomProducts = () => {
  try {
    const raw = localStorage.getItem(CUSTOM_PRODUCTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

/**
 * Helper to save/update custom product
 */
export const saveCustomProductLocally = (product) => {
  try {
    const current = getCustomProducts();
    const existingIndex = current.findIndex((p) => String(p._id) === String(product._id));
    if (existingIndex >= 0) {
      current[existingIndex] = { ...current[existingIndex], ...product };
    } else {
      current.unshift(product);
    }
    localStorage.setItem(CUSTOM_PRODUCTS_KEY, JSON.stringify(current));
    return product;
  } catch (err) {
    console.warn('Failed to save custom product locally:', err);
    return product;
  }
};

/**
 * Helper to remove custom product
 */
export const removeCustomProductLocally = (id) => {
  try {
    const current = getCustomProducts().filter((p) => String(p._id) !== String(id));
    localStorage.setItem(CUSTOM_PRODUCTS_KEY, JSON.stringify(current));
  } catch (err) {
    console.warn('Failed to remove custom product locally:', err);
  }
};

/**
 * Merge custom products at top of catalog
 */
export const getAllAvailableProducts = () => {
  const custom = getCustomProducts();
  const customIds = new Set(custom.map((p) => String(p._id)));
  const uniqueDemo = demoProducts.filter((p) => !customIds.has(String(p._id)));
  return [...custom, ...uniqueDemo];
};

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
        // Merge any local custom products with server products
        const custom = getCustomProducts();
        if (custom.length > 0) {
          const serverIds = new Set(data.products.map((p) => String(p._id)));
          const unmergedCustom = custom.filter((p) => !serverIds.has(String(p._id)));
          return {
            products: [...unmergedCustom, ...data.products],
            totalPages: data.totalPages || 1,
            currentPage: data.currentPage || 1,
            total: (data.total || data.products.length) + unmergedCustom.length,
          };
        }
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
      return getAllAvailableProducts().filter((p) => p.isFeatured).slice(0, limit);
    } catch {
      return getAllAvailableProducts().filter((p) => p.isFeatured).slice(0, limit);
    }
  },

  /**
   * Fetch single product by ID
   */
  async getProductById(id) {
    // 1. Check custom added products first
    const custom = getCustomProducts().find((p) => String(p._id) === String(id));
    if (custom) return custom;

    try {
      const { data } = await apiClient.get(`/products/${id}`);
      if (data && data._id) return data;
      return getAllAvailableProducts().find((p) => String(p._id) === String(id)) || null;
    } catch {
      return getAllAvailableProducts().find((p) => String(p._id) === String(id)) || null;
    }
  },

  /**
   * Create a new product (Admin) - Saves to local storage AND attempts backend API
   */
  async createProduct(productData) {
    const formatted = {
      ...productData,
      _id: productData._id || `prod_${Date.now()}`,
      price: Number(productData.price) || 0,
      discountPrice: productData.discountPrice ? Number(productData.discountPrice) : null,
      stock: Number(productData.stock) || 10,
      imageUrls: Array.isArray(productData.imageUrls) && productData.imageUrls.length
        ? productData.imageUrls
        : ['https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800'],
      isFeatured: Boolean(productData.isFeatured),
      rating: productData.rating || 5.0,
      numReviews: productData.numReviews || 1,
      createdAt: new Date().toISOString(),
    };

    // Save locally immediately so it works without server
    saveCustomProductLocally(formatted);

    try {
      const { data } = await apiClient.post('/products', formatted);
      if (data && data._id) {
        saveCustomProductLocally(data);
        return data;
      }
      return formatted;
    } catch {
      return formatted;
    }
  },

  /**
   * Update existing product (Admin)
   */
  async updateProduct(id, productData) {
    const formatted = {
      ...productData,
      _id: id,
      price: Number(productData.price) || 0,
      discountPrice: productData.discountPrice ? Number(productData.discountPrice) : null,
      stock: Number(productData.stock) || 10,
    };

    saveCustomProductLocally(formatted);

    try {
      const { data } = await apiClient.put(`/products/${id}`, formatted);
      return data || formatted;
    } catch {
      return formatted;
    }
  },

  /**
   * Delete product (Admin)
   */
  async deleteProduct(id) {
    removeCustomProductLocally(id);
    try {
      const { data } = await apiClient.delete(`/products/${id}`);
      return data;
    } catch {
      return { success: true };
    }
  },

  /**
   * Local instant fallback filtering combining custom products and catalog
   */
  filterLocalProducts(params = {}) {
    let filtered = getAllAvailableProducts();

    if (params.category && params.category !== 'All') {
      filtered = filtered.filter(
        (p) => p.category?.toLowerCase() === params.category.toLowerCase()
      );
    }

    if (params.search) {
      const q = params.search.toLowerCase().trim();
      filtered = filtered.filter(
        (p) =>
          p.name?.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q) ||
          p.category?.toLowerCase().includes(q)
      );
    }

    if (params.minPrice) {
      filtered = filtered.filter(
        (p) => (p.discountPrice !== null && p.discountPrice !== undefined ? p.discountPrice : p.price) >= Number(params.minPrice)
      );
    }

    if (params.maxPrice) {
      filtered = filtered.filter(
        (p) => (p.discountPrice !== null && p.discountPrice !== undefined ? p.discountPrice : p.price) <= Number(params.maxPrice)
      );
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

