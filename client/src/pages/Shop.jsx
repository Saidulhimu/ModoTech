import { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import productService from '../services/productService';

const CATEGORIES = ['All', 'AMP Zone', 'Cable Core', 'Smart Hold', 'Smart Shells'];

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();

  const selectedCategory = searchParams.get('category') || 'All';
  const searchQuery = searchParams.get('search') || '';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  const currentPage = Number(searchParams.get('page')) || 1;

  // Memoized query filter object
  const filterParams = useMemo(
    () => ({
      category: selectedCategory,
      search: searchQuery,
      minPrice,
      maxPrice,
      page: currentPage,
      limit: 12,
    }),
    [selectedCategory, searchQuery, minPrice, maxPrice, currentPage]
  );

  // Initialize immediately with local filtered data so user NEVER sees a freeze or blank delay
  const [productsData, setProductsData] = useState(() =>
    productService.filterLocalProducts(filterParams)
  );
  const [loading, setLoading] = useState(false);

  const loadProducts = useCallback(async () => {
    try {
      const res = await productService.getProducts(filterParams);
      if (res?.products) {
        setProductsData(res);
      }
    } catch (err) {
      console.warn('API error, falling back locally:', err);
      setProductsData(productService.filterLocalProducts(filterParams));
    } finally {
      setLoading(false);
    }
  }, [filterParams]);

  useEffect(() => {
    // Instantly update with local filter for buttery smooth responsiveness
    setProductsData(productService.filterLocalProducts(filterParams));
    // Asynchronously synchronize with API
    loadProducts();
  }, [loadProducts, filterParams]);

  const updateFilter = (key, value) => {
    const params = new URLSearchParams(searchParams);
    if (value && value !== 'All') {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete('page'); // Reset page on filter change
    setSearchParams(params);
  };

  const handlePageChange = (page) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', page);
    setSearchParams(params);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const { products, totalPages } = productsData;

  return (
    <div className="pt-24 pb-20 min-h-screen bg-gray-50">
      <div className="container-custom">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-black text-dark tracking-tight">
            {selectedCategory !== 'All' ? selectedCategory : 'All Products'}
          </h1>
          {searchQuery && (
            <p className="text-gray-500 mt-1">
              Search results for: <strong>"{searchQuery}"</strong>
            </p>
          )}
        </div>

        <div className="flex gap-8">
          {/* Sidebar Filters */}
          <aside className="w-64 flex-shrink-0 hidden lg:block">
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-150 sticky top-28">
              <h3 className="font-bold text-lg mb-6">Filters</h3>

              {/* Category */}
              <div className="mb-6">
                <h4 className="font-semibold text-xs uppercase tracking-wider text-gray-400 mb-3">
                  Category
                </h4>
                <div className="space-y-1.5">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => updateFilter('category', cat)}
                      className={`w-full text-left px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${selectedCategory === cat
                          ? 'bg-primary text-white shadow-md shadow-primary/25'
                          : 'text-gray-600 hover:bg-gray-100/80'
                        }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div className="mb-6">
                <h4 className="font-semibold text-xs uppercase tracking-wider text-gray-400 mb-3">
                  Price Range (৳)
                </h4>
                <div className="flex gap-2 items-center">
                  <input
                    type="number"
                    placeholder="Min"
                    value={minPrice}
                    onChange={(e) => updateFilter('minPrice', e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-primary"
                  />
                  <span className="text-gray-400">—</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={maxPrice}
                    onChange={(e) => updateFilter('maxPrice', e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              {/* Clear */}
              <button
                onClick={() => setSearchParams({})}
                className="w-full border border-gray-200 text-gray-600 py-2.5 rounded-xl text-xs font-bold hover:border-primary hover:text-primary transition-colors"
              >
                Clear All Filters
              </button>
            </div>
          </aside>

          {/* Product Grid */}
          <div className="flex-1">
            {products.length === 0 ? (
              <div className="bg-white rounded-3xl p-16 text-center shadow-sm border border-gray-150">
                <p className="text-5xl mb-4">🔍</p>
                <h3 className="text-xl font-bold text-dark mb-2">No products found</h3>
                <p className="text-gray-500 mb-6">Try adjusting your filters or search term.</p>
                <button
                  onClick={() => setSearchParams({})}
                  className="btn-primary inline-flex"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                  {products.map((product) => (
                    <ProductCard key={product._id} product={product} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center gap-2 mt-12">
                    {[...Array(totalPages)].map((_, i) => (
                      <button
                        key={i}
                        onClick={() => handlePageChange(i + 1)}
                        className={`w-10 h-10 rounded-xl font-bold text-sm transition-all ${currentPage === i + 1
                            ? 'bg-primary text-white shadow-md shadow-primary/25'
                            : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                          }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
