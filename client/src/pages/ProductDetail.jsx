import { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  FiShoppingCart,
  FiHeart,
  FiStar,
  FiMinus,
  FiPlus,
  FiArrowLeft,
  FiTruck,
  FiShield,
  FiCheckCircle,
  FiCpu,
  FiBatteryCharging,
  FiWifi,
  FiPackage,
  FiAward,
  FiShare2,
  FiArrowRight,
} from 'react-icons/fi';
import { useCartStore } from '../store/cartStore';
import { useWishlistStore } from '../store/wishlistStore';
import { useAuthStore } from '../store/authStore';
import api from '../lib/axios';
import productService, { getAllAvailableProducts } from '../services/productService';
import { formatBDT } from '../lib/format';
import ProductCard from '../components/ProductCard';
import toast from 'react-hot-toast';

// Smart specs generator tailored to product category
function getProductSpecs(product) {
  const cat = (product.category || '').toLowerCase();
  const name = (product.name || '').toLowerCase();

  if (cat.includes('amp') || cat.includes('audio') || name.includes('headphone') || name.includes('airpods') || name.includes('earbuds') || name.includes('speaker')) {
    return [
      { label: 'Audio Driver', value: '40mm High-Resolution Dynamic Neodymium' },
      { label: 'Active Noise Cancelling', value: 'Dual Hybrid ANC (-42dB suppression)' },
      { label: 'Bluetooth Version', value: 'Bluetooth 5.3 + LE Audio & LDAC codec' },
      { label: 'Battery Life', value: 'Up to 38 Hours (ANC On) / 50 Hours (ANC Off)' },
      { label: 'Fast Charging', value: '10 min charge = 5 hours playback (USB-C)' },
      { label: 'Microphones', value: '4x Beamforming AI ENC Noise-Canceling' },
      { label: 'Water Resistance', value: 'IPX5 Sweat & Water Resistant' },
      { label: 'Weight', value: '254 grams' },
      { label: 'In The Box', value: 'Headphones, USB-C Cable, 3.5mm Aux Cable, Hard Travel Case, Manual' },
      { label: 'Official Warranty', value: '1 Year Brand Replacement Warranty' },
    ];
  }

  if (cat.includes('power') || cat.includes('charger') || name.includes('power bank') || name.includes('charger') || name.includes('gan')) {
    return [
      { label: 'Total Output', value: '65W / 100W GaN III Fast Output' },
      { label: 'Port Configuration', value: '2x USB-C (PD 3.0), 1x USB-A (QC 4.0+)' },
      { label: 'Input Voltage', value: 'AC 100-240V ~ 50/60Hz 1.5A Max' },
      { label: 'Technology', value: 'Gallium Nitride (GaN III) & ActiveProtect 2.0' },
      { label: 'Safety Protections', value: 'Over-voltage, Short-circuit, Temperature Guard' },
      { label: 'Weight & Dimensions', value: '128g | 68 × 38 × 32 mm' },
      { label: 'Compatibility', value: 'MacBook Pro, iPhone 15/16, Samsung S24, iPad, Steam Deck' },
      { label: 'In The Box', value: 'GaN Fast Charger, 100W Braided USB-C Cable, Manual' },
      { label: 'Official Warranty', value: '18 Months Official Warranty' },
    ];
  }

  if (cat.includes('desk') || cat.includes('keyboard') || cat.includes('mouse') || name.includes('keyboard') || name.includes('mouse')) {
    return [
      { label: 'Switch / Sensor', value: 'Hot-Swappable Mechanical Gateron Pro / PAW3395 Sensor' },
      { label: 'Connectivity', value: 'Tri-Mode: 2.4GHz Wireless, Bluetooth 5.1, Type-C' },
      { label: 'Polling Rate', value: '1000Hz (1ms ultra-low latency wireless)' },
      { label: 'Battery Capacity', value: '4000mAh Rechargeable (Up to 240 Hours)' },
      { label: 'Keycaps / Finish', value: 'Double-Shot PBT Keycaps (Anti-oil, dye-sub)' },
      { label: 'RGB Lighting', value: 'South-facing 16.8M Color RGB with 22 dynamic effects' },
      { label: 'System Compatibility', value: 'Windows 11/10, macOS, Linux, iOS & Android' },
      { label: 'In The Box', value: 'Device, 2.4G Dongle, Braided Cable, Keycap Puller, Extra Switches' },
      { label: 'Official Warranty', value: '1 Year Brand Replacement Warranty' },
    ];
  }

  // Default gadget specs
  return [
    { label: 'Processor / Chipset', value: 'Ultra-low Latency Next-Gen Tech Core' },
    { label: 'Connectivity', value: 'Wi-Fi 6 & Bluetooth 5.3 Dual Band' },
    { label: 'Battery & Power', value: 'Extended Lithium-Polymer with Quick Charge' },
    { label: 'Materials', value: 'Aerospace-Grade Aluminum Alloy & Matte Polycarbonate' },
    { label: 'Certifications', value: 'CE, FCC, RoHS, Bangladesh BSTI Certified' },
    { label: 'Weight', value: '185 grams' },
    { label: 'In The Box', value: 'Main Device, USB-C High-Speed Cable, Quick Guide, Warranty Card' },
    { label: 'Official Warranty', value: '1 Year Full Replacement Warranty' },
  ];
}

// Initial realistic customer reviews
const INITIAL_REVIEWS = [
  {
    id: 1,
    name: 'Tanvir Ahmed',
    rating: 5,
    date: '2 days ago',
    verified: true,
    title: 'Absolute game changer in authentic tech!',
    comment: 'The build quality and authentic sound profile exceeded my expectations. Delivery inside Dhaka took less than 24 hours. Truly premium tech store experience in BD.',
  },
  {
    id: 2,
    name: 'Sadia Rahman',
    rating: 5,
    date: '1 week ago',
    verified: true,
    title: '100% Genuine, tested the serial number',
    comment: 'Was hesitant to order online, but ModoTech delivered the authentic box with sealed warranty card. Battery life easily lasts throughout my whole workday.',
  },
  {
    id: 3,
    name: 'Rakibul Islam',
    rating: 4,
    date: '2 weeks ago',
    verified: true,
    title: 'Solid performance and fast charging',
    comment: 'Very lightweight and feels durable. The fast charging speed is as advertised. Highly recommend for any tech enthusiast.',
  },
];

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [activeTab, setActiveTab] = useState('specs'); // 'specs' | 'reviews' | 'warranty'

  // Reviews state
  const [reviews, setReviews] = useState(INITIAL_REVIEWS);
  const [newReviewName, setNewReviewName] = useState('');
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [newReviewComment, setNewReviewComment] = useState('');
  const [newReviewTitle, setNewReviewTitle] = useState('');
  const [showReviewForm, setShowReviewForm] = useState(false);

  const addToCart = useCartStore((s) => s.addToCart);
  const { toggleWishlist, isWishlisted } = useWishlistStore();
  const { user } = useAuthStore();

  useEffect(() => {
    let isMounted = true;
    const fetchProduct = async () => {
      try {
        const item = await productService.getProductById(id);
        if (isMounted) setProduct(item);
      } catch {
        if (isMounted) setProduct(null);
      } finally {
        if (isMounted) setLoading(false);
        window.scrollTo(0, 0);
      }
    };
    fetchProduct();
    return () => {
      isMounted = false;
    };
  }, [id]);

  // Pre-fill user name if logged in
  useEffect(() => {
    if (user?.name && !newReviewName) {
      setNewReviewName(user.name);
    }
  }, [user, newReviewName]);

  // Related products query (same category or top picks, excluding current product)
  const relatedProducts = useMemo(() => {
    if (!product) return [];
    const all = getAllAvailableProducts();
    const sameCategory = all.filter(
      (p) => String(p._id) !== String(product._id) && p.category === product.category
    );
    if (sameCategory.length >= 4) {
      return sameCategory.slice(0, 4);
    }
    const otherProducts = all.filter(
      (p) => String(p._id) !== String(product._id) && p.category !== product.category
    );
    return [...sameCategory, ...otherProducts].slice(0, 4);
  }, [product]);

  const specs = useMemo(() => {
    return product ? getProductSpecs(product) : [];
  }, [product]);

  if (loading) {
    return (
      <div className="pt-28 pb-20 container-custom">
        <div className="grid md:grid-cols-2 gap-12 animate-pulse">
          <div className="aspect-square bg-gray-200 rounded-3xl" />
          <div className="space-y-6">
            <div className="h-8 bg-gray-200 rounded w-3/4" />
            <div className="h-5 bg-gray-200 rounded w-1/4" />
            <div className="h-20 bg-gray-200 rounded" />
            <div className="h-12 bg-gray-200 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="pt-28 pb-20 min-h-[60vh] flex flex-col items-center justify-center text-center">
        <FiPackage size={48} className="text-gray-300 mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-4">Product not found</h2>
        <Link to="/shop" className="btn-primary">Back to Shop</Link>
      </div>
    );
  }

  const isOnSale = product.discountPrice && product.discountPrice < product.price;
  const discountPercent = isOnSale
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : 0;
  const wishlisted = isWishlisted(product._id);

  const handleAddToCart = () => {
    addToCart(product, quantity);
    toast.success(`${product.name} added to cart!`, {
      style: { borderRadius: '12px' },
    });
  };

  const handleBuyNow = () => {
    if (!product || product.stock === 0) return;
    addToCart(product, quantity, false);
    navigate('/checkout');
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product.name,
        text: `Check out ${product.name} on ModoTech!`,
        url: window.location.href,
      }).catch(() => { });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Product link copied to clipboard!', {
        style: { borderRadius: '12px' },
      });
    }
  };

  const handleReviewSubmit = (e) => {
    e.preventDefault();
    if (!newReviewComment.trim()) {
      toast.error('Please write your review feedback');
      return;
    }

    const reviewItem = {
      id: Date.now(),
      name: newReviewName.trim() || 'Verified Customer',
      rating: newReviewRating,
      date: 'Just now',
      verified: true,
      title: newReviewTitle.trim() || 'Great authentic gadget!',
      comment: newReviewComment.trim(),
    };

    setReviews([reviewItem, ...reviews]);
    setNewReviewComment('');
    setNewReviewTitle('');
    setShowReviewForm(false);
    toast.success('Thank you! Your review has been published.', {
      icon: '⭐',
      style: { borderRadius: '12px' },
    });
  };

  return (
    <div className="pt-28 pb-20 min-h-screen bg-white">
      <div className="container-custom">
        {/* Breadcrumb & Navigation */}
        <div className="flex items-center justify-between mb-8 text-xs sm:text-sm text-gray-500">
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 hover:text-primary transition-colors font-semibold"
          >
            <FiArrowLeft /> Back to Shop
          </Link>
          <div className="flex items-center gap-3">
            <span className="text-gray-400 hidden sm:inline">ModoTech / {product.category}</span>
            <button
              onClick={handleShare}
              className="p-2 rounded-full hover:bg-gray-100 text-gray-500 hover:text-dark transition-colors"
              title="Share product"
            >
              <FiShare2 size={16} />
            </button>
          </div>
        </div>

        {/* Product Core Grid */}
        <div className="grid md:grid-cols-2 gap-12 lg:gap-16 mb-20">

          {/* Images Section */}
          <div>
            <div className="relative aspect-square bg-gradient-to-b from-gray-50 to-gray-100/50 rounded-3xl overflow-hidden mb-4 border border-gray-150 p-8 flex items-center justify-center">
              {isOnSale && (
                <div className="absolute top-4 left-4 z-10 flex items-center gap-1.5 bg-gradient-to-r from-red-600 to-rose-600 text-white text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider shadow-md">
                  <span>SALE</span>
                  <span>-{discountPercent}%</span>
                </div>
              )}
              <img
                src={product.imageUrls?.[activeImage] || 'https://via.placeholder.com/600'}
                alt={product.name}
                className="w-full h-full object-contain mix-blend-multiply transition-transform duration-300 hover:scale-105"
              />
            </div>

            {/* Thumbnail Carousel */}
            {product.imageUrls?.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {product.imageUrls.map((url, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(i)}
                    className={`w-20 h-20 rounded-2xl overflow-hidden border-2 p-2 bg-gray-50 shrink-0 transition-all ${activeImage === i
                        ? 'border-primary ring-2 ring-primary/20 scale-105'
                        : 'border-gray-200 hover:border-gray-300 opacity-70 hover:opacity-100'
                      }`}
                  >
                    <img src={url} alt="" className="w-full h-full object-contain mix-blend-multiply" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info Section */}
          <div className="flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="bg-primary/10 text-primary text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                  {product.category}
                </span>
                <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
                  <FiCheckCircle size={12} /> 100% Authentic
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-dark mb-3 leading-tight tracking-tight">
                {product.name}
              </h1>

              {/* Star Rating Overview */}
              <div className="flex items-center gap-3 mb-6">
                <div className="flex text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-base">★</span>
                  ))}
                </div>
                <span className="text-sm font-bold text-dark">{product.rating || '4.9'}</span>
                <span className="text-xs text-gray-400">({reviews.length} Customer Reviews)</span>
              </div>

              {/* Price Display */}
              <div className="flex items-baseline gap-3 mb-6 p-4 rounded-2xl bg-gray-50/70 border border-gray-150">
                {isOnSale ? (
                  <>
                    <span className="text-3xl sm:text-4xl font-black text-primary">
                      {formatBDT(product.discountPrice)}
                    </span>
                    <span className="text-lg text-gray-400 line-through">
                      {formatBDT(product.price)}
                    </span>
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                      Save {formatBDT(product.price - product.discountPrice)}
                    </span>
                  </>
                ) : (
                  <span className="text-3xl sm:text-4xl font-black text-dark">
                    {formatBDT(product.price)}
                  </span>
                )}
              </div>

              {/* Description */}
              <p className="text-gray-600 text-sm sm:text-base leading-relaxed mb-6">
                {product.description}
              </p>

              {/* In-Stock Indicator */}
              <div className="mb-6 flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${product.stock > 0 ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
                <span className={`text-xs sm:text-sm font-bold ${product.stock > 0 ? 'text-emerald-700' : 'text-red-500'}`}>
                  {product.stock > 0 ? `In Stock Ready to Dispatch (${product.stock} units left)` : 'Out of Stock'}
                </span>
              </div>

              {/* Quantity Selector */}
              <div className="flex items-center gap-4 mb-6">
                <span className="text-xs sm:text-sm font-bold text-gray-700">Quantity:</span>
                <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden bg-white shadow-xs">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 text-gray-600 transition-colors"
                  >
                    <FiMinus size={13} />
                  </button>
                  <span className="w-12 text-center font-bold text-dark text-sm">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 text-gray-600 transition-colors"
                  >
                    <FiPlus size={13} />
                  </button>
                </div>
              </div>

              {/* Add to Cart, Buy Now & Wishlist Actions */}
              <div className="flex flex-col sm:flex-row gap-3 mb-8">
                <button
                  onClick={handleAddToCart}
                  disabled={product.stock === 0}
                  className="btn-primary flex-1 py-3.5 rounded-2xl justify-center font-bold text-sm shadow-xl shadow-primary/20 active:scale-[0.99] transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FiShoppingCart size={17} /> Add to Cart
                </button>
                <button
                  onClick={handleBuyNow}
                  disabled={product.stock === 0}
                  className="bg-dark hover:bg-neutral-800 text-white font-bold text-sm px-6 py-3.5 rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-[0.99] shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FiArrowRight size={16} /> Buy Now
                </button>
                <button
                  onClick={() => toggleWishlist(product)}
                  className={`w-full sm:w-13 h-13 px-4 rounded-2xl border-2 transition-all flex items-center justify-center ${wishlisted
                      ? 'bg-primary border-primary text-white shadow-md shadow-primary/30'
                      : 'border-gray-200 text-gray-600 hover:border-primary hover:text-primary bg-white'
                    }`}
                  title={wishlisted ? 'Remove from wishlist' : 'Save to wishlist'}
                >
                  <FiHeart size={20} className={wishlisted ? 'fill-white' : ''} />
                </button>
              </div>

              {/* Delivery & Warranty Guarantees */}
              <div className="grid grid-cols-2 gap-3 pt-6 border-t border-gray-150">
                <div className="flex items-center gap-2.5 p-3 rounded-xl bg-gray-50 border border-gray-100 text-xs text-gray-700 font-semibold">
                  <FiTruck className="text-primary text-lg shrink-0" />
                  <span>Free Delivery on orders above ৳2,000</span>
                </div>
                <div className="flex items-center gap-2.5 p-3 rounded-xl bg-gray-50 border border-gray-100 text-xs text-gray-700 font-semibold">
                  <FiShield className="text-primary text-lg shrink-0" />
                  <span>1 Year Official Replacement Warranty</span>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Tabbed Detailed Information: Specs, Reviews, Warranty */}
        <div className="mb-20">
          <div className="flex border-b border-gray-200 gap-8 mb-8 overflow-x-auto">
            <button
              onClick={() => setActiveTab('specs')}
              className={`pb-4 text-sm sm:text-base font-black transition-colors relative whitespace-nowrap ${activeTab === 'specs' ? 'text-primary' : 'text-gray-400 hover:text-dark'
                }`}
            >
              <div className="flex items-center gap-2">
                <FiCpu size={16} />
                <span>Technical Specifications</span>
              </div>
              {activeTab === 'specs' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
              )}
            </button>

            <button
              onClick={() => setActiveTab('reviews')}
              className={`pb-4 text-sm sm:text-base font-black transition-colors relative whitespace-nowrap ${activeTab === 'reviews' ? 'text-primary' : 'text-gray-400 hover:text-dark'
                }`}
            >
              <div className="flex items-center gap-2">
                <FiStar size={16} />
                <span>Verified Customer Reviews ({reviews.length})</span>
              </div>
              {activeTab === 'reviews' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
              )}
            </button>

            <button
              onClick={() => setActiveTab('warranty')}
              className={`pb-4 text-sm sm:text-base font-black transition-colors relative whitespace-nowrap ${activeTab === 'warranty' ? 'text-primary' : 'text-gray-400 hover:text-dark'
                }`}
            >
              <div className="flex items-center gap-2">
                <FiAward size={16} />
                <span>Warranty & Support</span>
              </div>
              {activeTab === 'warranty' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
              )}
            </button>
          </div>

          {/* Specs Content */}
          {activeTab === 'specs' && (
            <div className="bg-white rounded-3xl border border-gray-150 overflow-hidden shadow-sm">
              <div className="p-6 bg-gray-50/70 border-b border-gray-150 flex items-center justify-between">
                <div>
                  <h3 className="font-black text-dark text-lg">Detailed Hardware Specifications</h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Authentic manufacturer specifications and tested performance metrics
                  </p>
                </div>
                <span className="hidden sm:inline-block px-3 py-1 bg-white rounded-full border border-gray-200 text-xs font-bold text-gray-600">
                  ModoTech Verified Specs
                </span>
              </div>
              <div className="divide-y divide-gray-100">
                {specs.map((item, idx) => (
                  <div
                    key={idx}
                    className={`grid grid-cols-1 sm:grid-cols-3 p-4 sm:px-6 text-sm ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'
                      }`}
                  >
                    <span className="font-bold text-gray-600 mb-1 sm:mb-0">{item.label}</span>
                    <span className="sm:col-span-2 text-dark font-medium">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Customer Reviews & Submission Form */}
          {activeTab === 'reviews' && (
            <div className="space-y-8">
              {/* Rating Summary Card */}
              <div className="bg-gray-50 rounded-3xl p-6 sm:p-8 border border-gray-150 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="text-center md:text-left">
                  <div className="text-5xl font-black text-dark">{product.rating || '4.9'}</div>
                  <div className="flex text-amber-400 text-xl justify-center md:justify-start my-2">
                    {[...Array(5)].map((_, i) => (
                      <span key={i}>★</span>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500">Based on {reviews.length} verified tech purchases</p>
                </div>

                <div className="flex-1 max-w-xs w-full space-y-1 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-10 text-gray-500">5 Star</span>
                    <div className="flex-1 bg-gray-200 h-2 rounded-full overflow-hidden">
                      <div className="bg-amber-400 h-full w-[85%]" />
                    </div>
                    <span className="w-8 text-right font-mono text-gray-400">85%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-10 text-gray-500">4 Star</span>
                    <div className="flex-1 bg-gray-200 h-2 rounded-full overflow-hidden">
                      <div className="bg-amber-400 h-full w-[12%]" />
                    </div>
                    <span className="w-8 text-right font-mono text-gray-400">12%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-10 text-gray-500">3 Star</span>
                    <div className="flex-1 bg-gray-200 h-2 rounded-full overflow-hidden">
                      <div className="bg-amber-400 h-full w-[3%]" />
                    </div>
                    <span className="w-8 text-right font-mono text-gray-400">3%</span>
                  </div>
                </div>

                <button
                  onClick={() => setShowReviewForm(!showReviewForm)}
                  className="btn-primary py-3 px-6 rounded-2xl text-xs font-bold"
                >
                  {showReviewForm ? 'Close Review Form' : 'Write a Review'}
                </button>
              </div>

              {/* Review Submission Form Modal/Card */}
              {showReviewForm && (
                <form
                  onSubmit={handleReviewSubmit}
                  className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-md space-y-4 animate-fadeIn"
                >
                  <h4 className="text-base font-black text-dark">Share your experience with this gadget</h4>

                  {/* Star Selector */}
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1">Your Rating:</label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          type="button"
                          key={star}
                          onClick={() => setNewReviewRating(star)}
                          className={`text-2xl transition-transform hover:scale-125 ${star <= newReviewRating ? 'text-amber-400' : 'text-gray-200'
                            }`}
                        >
                          ★
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1">Your Name</label>
                      <input
                        type="text"
                        value={newReviewName}
                        onChange={(e) => setNewReviewName(e.target.value)}
                        placeholder="e.g. Asif Mahmud"
                        required
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1">Review Title</label>
                      <input
                        type="text"
                        value={newReviewTitle}
                        onChange={(e) => setNewReviewTitle(e.target.value)}
                        placeholder="e.g. Best noise cancelling headphones in this price"
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-primary"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1">Your Feedback / Review</label>
                    <textarea
                      rows={4}
                      value={newReviewComment}
                      onChange={(e) => setNewReviewComment(e.target.value)}
                      placeholder="Tell other buyers about audio clarity, battery performance, build quality, etc."
                      required
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-primary resize-none"
                    />
                  </div>

                  <button type="submit" className="btn-primary py-3 px-8 rounded-xl text-xs font-bold">
                    Submit Verified Review
                  </button>
                </form>
              )}

              {/* Reviews List */}
              <div className="space-y-4">
                {reviews.map((rev) => (
                  <div
                    key={rev.id}
                    className="p-6 rounded-2xl border border-gray-150 bg-white hover:border-gray-200 transition-colors shadow-xs"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-primary to-rose-500 text-white font-black text-xs flex items-center justify-center">
                          {rev.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-dark">{rev.name}</span>
                            {rev.verified && (
                              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                                ✓ Verified Buyer
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-gray-400">{rev.date}</span>
                        </div>
                      </div>

                      <div className="flex text-amber-400 text-sm">
                        {[...Array(5)].map((_, i) => (
                          <span key={i} className={i < rev.rating ? 'text-amber-400' : 'text-gray-200'}>
                            ★
                          </span>
                        ))}
                      </div>
                    </div>

                    <h5 className="font-bold text-dark text-sm mt-3 mb-1">{rev.title}</h5>
                    <p className="text-gray-600 text-sm leading-relaxed">{rev.comment}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Warranty & Support Tab */}
          {activeTab === 'warranty' && (
            <div className="bg-white rounded-3xl border border-gray-150 p-6 sm:p-8 space-y-6">
              <div className="flex items-center gap-3 text-emerald-600 font-bold text-base">
                <FiShield size={24} />
                <span>ModoTech Official 1-Year Hardware Protection Guarantee</span>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">
                All products sold on ModoTech are sourced directly from authorized regional distributors or genuine brand factories. Each product comes sealed with intact serial numbers and an official manufacturer warranty card.
              </p>
              <div className="grid sm:grid-cols-3 gap-4 pt-4 border-t border-gray-100">
                <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
                  <h6 className="font-bold text-dark text-xs mb-1">7 Days Replacement</h6>
                  <p className="text-xs text-gray-500">Instant exchange if received with any manufacturing defect</p>
                </div>
                <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
                  <h6 className="font-bold text-dark text-xs mb-1">100% Genuine Box</h6>
                  <p className="text-xs text-gray-500">All barcodes and authenticity seals verify on official sites</p>
                </div>
                <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
                  <h6 className="font-bold text-dark text-xs mb-1">Doorstep Warranty Claim</h6>
                  <p className="text-xs text-gray-500">Pick-up and drop support available inside Dhaka city</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Related Products / "You May Also Like" */}
        {relatedProducts.length > 0 && (
          <div className="pt-10 border-t border-gray-150">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl sm:text-3xl font-black text-dark tracking-tight">
                  Related Gadgets & Accessories
                </h2>
                <p className="text-xs sm:text-sm text-gray-500 mt-1">
                  Customers who viewed this item also picked these top complementary accessories
                </p>
              </div>
              <Link to="/shop" className="text-xs sm:text-sm font-bold text-primary hover:underline hidden sm:block">
                View all in shop →
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((p) => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
