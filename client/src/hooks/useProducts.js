import { useState, useEffect, useCallback } from 'react';
import productService from '../services/productService';

/**
 * Custom Hook: useProducts
 * Encapsulates product fetching, caching, pagination, and error state.
 * Uses cache-first strategy for instant zero-lag rendering.
 */
export const useProducts = (filterParams = {}) => {
  const [products, setProducts] = useState(() => {
    // Initial instant mount from local cache
    return productService.filterLocalProducts(filterParams).products;
  });
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(filterParams.page || 1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchProducts = useCallback(async () => {
    try {
      setError(null);
      const res = await productService.getProducts(filterParams);
      if (res?.products) {
        setProducts(res.products);
        setTotalPages(res.totalPages || 1);
        setCurrentPage(res.currentPage || 1);
      }
    } catch (err) {
      setError(err.message || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  }, [
    filterParams.category,
    filterParams.search,
    filterParams.minPrice,
    filterParams.maxPrice,
    filterParams.page,
    filterParams.limit,
    filterParams.featured,
  ]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return {
    products,
    loading,
    totalPages,
    currentPage,
    error,
    refetch: fetchProducts,
  };
};

export default useProducts;

