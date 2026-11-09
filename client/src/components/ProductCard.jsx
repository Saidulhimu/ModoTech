import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiHeart, FiShoppingCart, FiEye } from 'react-icons/fi';
import { useCartStore } from '../store/cartStore';
import { useWishlistStore } from '../store/wishlistStore';
import { formatBDT } from '../lib/format';
import toast from 'react-hot-toast';

export default function ProductCard({ product }) {
  const [hovered, setHovered] = useState(false);
  const addToCart = useCartStore((s) => s.addToCart);
  const { toggleWishlist, isWishlisted } = useWishlistStore();

  const isOnSale = product.discountPrice && product.discountPrice < product.price;
  const discountPercent = isOnSale ? Math.round(((product.price - product.discountPrice) / product.price) * 100) : 0;
  const wishlisted = isWishlisted(product._id);

  const handleAddToCart = (e) => {
    e.preventDefault();
    addToCart(product, 1);
    toast.success(`${product.name} added to cart!`, {
      icon: '🛒',
      style: { borderRadius: '14px', fontSize: '13px', fontWeight: 'bold' },
    });
  };

  const handleWishlist = (e) => {
    e.preventDefault();
    toggleWishlist(product);
    toast(wishlisted ? 'Removed from wishlist' : 'Saved to wishlist!', {
      icon: wishlisted ? '💔' : '❤️',
      style: { borderRadius: '14px', fontSize: '13px', fontWeight: 'bold' },
    });
  };

  return (
    <div
      className="group relative bg-white rounded-3xl border border-gray-150 overflow-hidden shadow-sm hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Top Image Area */}
      <div className="relative aspect-square overflow-hidden bg-gradient-to-b from-gray-50/80 to-gray-100/50 p-6 flex items-center justify-center">

        {/* Clean Luxury Sale Tag */}
        {isOnSale && (
          <div className="absolute top-3 left-3 z-10 flex items-center gap-1 bg-gradient-to-r from-red-600 to-rose-600 text-white text-[11px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider shadow-md shadow-red-500/30">
            <span>SALE</span>
            {discountPercent > 0 && (
              <span className="bg-white/25 px-1 py-0.2 rounded-full text-[10px] font-bold">
                -{discountPercent}%
              </span>
            )}
          </div>
        )}

        {/* Quick Wishlist on top right */}
        <button
          onClick={handleWishlist}
          className={`absolute top-3.5 right-3.5 z-10 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 shadow-sm ${
            wishlisted
              ? 'bg-primary text-white scale-110 shadow-primary/30'
              : 'bg-white/80 hover:bg-white text-gray-600 hover:text-primary backdrop-blur-sm'
          }`}
          title={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <FiHeart size={16} className={wishlisted ? 'fill-white' : ''} />
        </button>

        {/* Main Product Image */}
        <Link to={`/product/${product._id}`} className="block w-full h-full">
          <img
            src={product.imageUrls?.[0] || 'https://via.placeholder.com/400x400?text=No+Image'}
            alt={product.name}
            loading="lazy"
            className="w-full h-full object-contain mix-blend-multiply transition-transform duration-500 group-hover:scale-105"
          />
        </Link>

        {/* Hover Floating Action Bar */}
        <div
          className={`absolute inset-x-4 bottom-3 flex gap-2 justify-center z-10 transition-all duration-300 ${
            hovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3 pointer-events-none'
          }`}
        >
          <button
            onClick={handleAddToCart}
            className="flex-1 bg-dark hover:bg-primary text-white py-2.5 px-4 rounded-xl text-xs font-bold transition-colors shadow-lg flex items-center justify-center gap-1.5 active:scale-95"
          >
            <FiShoppingCart size={14} />
            <span>Add to Cart</span>
          </button>
          <Link
            to={`/product/${product._id}`}
            className="w-10 h-10 bg-white hover:bg-gray-100 text-dark rounded-xl flex items-center justify-center transition-colors shadow-md border border-gray-200"
            title="Quick View"
          >
            <FiEye size={16} />
          </Link>
        </div>
      </div>

      {/* Info Area */}
      <div className="p-5 flex flex-col flex-1 justify-between">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1 block">
            {product.category}
          </span>
          <Link to={`/product/${product._id}`}>
            <h3 className="font-bold text-dark text-sm sm:text-base hover:text-primary transition-colors line-clamp-2 leading-snug mb-2">
              {product.name}
            </h3>
          </Link>
        </div>

        <div>
          {/* Price */}
          <div className="flex items-baseline gap-2 mt-2">
            {isOnSale ? (
              <>
                <span className="font-black text-primary text-lg sm:text-xl">
                  {formatBDT(product.discountPrice)}
                </span>
                <span className="text-xs sm:text-sm text-gray-400 line-through">
                  {formatBDT(product.price)}
                </span>
              </>
            ) : (
              <span className="font-black text-dark text-lg sm:text-xl">
                {formatBDT(product.price)}
              </span>
            )}
          </div>

          {/* Reviews & Stock */}
          <div className="flex items-center justify-between text-xs text-gray-400 mt-2.5 pt-2.5 border-t border-gray-100">
            <div className="flex items-center gap-1">
              <span className="text-yellow-400 text-sm">★</span>
              <span className="font-bold text-dark">{product.rating || '4.8'}</span>
              <span>({product.numReviews || '12'})</span>
            </div>
            <span className={product.stock > 0 ? 'text-emerald-600 font-semibold' : 'text-red-500'}>
              {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
