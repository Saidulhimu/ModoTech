import { useWishlistStore } from '../store/wishlistStore';
import ProductCard from '../components/ProductCard';
import { FiHeart } from 'react-icons/fi';
import { Link } from 'react-router-dom';

export default function Wishlist() {
  const { items } = useWishlistStore();

  if (items.length === 0) {
    return (
      <div className="pt-28 pb-20 min-h-screen flex flex-col items-center justify-center text-center px-4">
        <FiHeart size={64} className="text-gray-200 mb-6" />
        <h2 className="text-2xl font-bold text-dark mb-2">Your wishlist is empty</h2>
        <p className="text-gray-500 mb-8">Save your favorite products to come back later.</p>
        <Link to="/shop" className="btn-primary">Browse Products</Link>
      </div>
    );
  }

  return (
    <div className="pt-28 pb-20 min-h-screen bg-gray-50">
      <div className="container-custom">
        <h1 className="text-4xl font-black text-dark mb-10">My Wishlist ({items.length})</h1>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {items.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      </div>
    </div>
  );
}

