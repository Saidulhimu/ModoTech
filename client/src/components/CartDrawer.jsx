import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FiX,
  FiShoppingBag,
  FiTrash2,
  FiPlus,
  FiMinus,
  FiArrowRight,
  FiTag,
  FiCheckCircle,
  FiTruck,
  FiShield,
} from 'react-icons/fi';
import { useCartStore, FREE_SHIPPING_THRESHOLD } from '../store/cartStore';
import { formatBDT } from '../lib/format';
import toast from 'react-hot-toast';

export default function CartDrawer() {
  const navigate = useNavigate();
  const {
    items,
    isDrawerOpen,
    closeDrawer,
    updateQuantity,
    removeFromCart,
    getTotalPrice,
    getTotalItems,
    getShippingFee,
    getDiscountAmount,
    getFinalTotal,
    coupon,
    applyCoupon,
    removeCoupon,
  } = useCartStore();

  const [couponInput, setCouponInput] = useState('');
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

  const subtotal = getTotalPrice();
  const totalItems = getTotalItems();
  const discountAmount = getDiscountAmount();
  const shippingFee = getShippingFee();
  const grandTotal = getFinalTotal();

  // Progress towards free delivery
  const hasFreeDelivery = subtotal > 0 && (subtotal >= FREE_SHIPPING_THRESHOLD || coupon?.code === 'FREESHIP');
  const freeShippingNeeded = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const freeShippingProgress = subtotal > 0
    ? Math.min(100, Math.round((subtotal / FREE_SHIPPING_THRESHOLD) * 100))
    : 0;

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isDrawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isDrawerOpen]);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isDrawerOpen) {
        closeDrawer();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDrawerOpen, closeDrawer]);

  const handleApplyCoupon = (e) => {
    e?.preventDefault();
    if (!couponInput.trim()) return;

    setIsApplyingCoupon(true);
    const result = applyCoupon(couponInput);
    setIsApplyingCoupon(false);

    if (result.success) {
      toast.success(result.message, {
        style: { borderRadius: '12px' },
      });
      setCouponInput('');
    } else {
      toast.error(result.message, {
        style: { borderRadius: '12px' },
      });
    }
  };

  const handleQuickApply = (code) => {
    setCouponInput(code);
    const result = applyCoupon(code);
    if (result.success) {
      toast.success(result.message, { style: { borderRadius: '12px' } });
      setCouponInput('');
    } else {
      toast.error(result.message);
    }
  };

  const handleCheckoutClick = () => {
    closeDrawer();
    navigate('/checkout');
  };

  const handleViewCartClick = () => {
    closeDrawer();
    navigate('/cart');
  };

  if (!isDrawerOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-dark/60 backdrop-blur-sm transition-opacity duration-300 animate-fadeIn"
        onClick={closeDrawer}
        aria-hidden="true"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out">

          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-gray-100 flex items-center justify-between bg-white z-10">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                <FiShoppingBag size={18} />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-black text-dark">
                  Shopping Cart
                </h2>
                <span className="text-xs text-gray-400 font-medium">
                  {totalItems} {totalItems === 1 ? 'item' : 'items'} in your bag
                </span>
              </div>
            </div>
            <button
              onClick={closeDrawer}
              className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-dark hover:bg-gray-100 transition-colors"
              aria-label="Close cart"
            >
              <FiX size={20} />
            </button>
          </div>

          {/* Free Shipping Dynamic Progress Banner */}
          <div className="bg-gradient-to-r from-gray-50 via-red-50/30 to-gray-50 px-5 py-3 border-b border-gray-100 text-xs">
            {hasFreeDelivery ? (
              <div className="flex items-center gap-2 text-emerald-700 font-bold bg-emerald-50 p-2 rounded-xl border border-emerald-200">
                <FiCheckCircle className="text-emerald-600 shrink-0" size={16} />
                <span>Congratulations! You unlocked FREE Delivery across Bangladesh!</span>
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between text-gray-700 font-semibold mb-1.5">
                  <span className="flex items-center gap-1.5">
                    <FiTruck className="text-primary" size={14} />
                    Add <strong className="text-primary">{formatBDT(freeShippingNeeded)}</strong> more for Free Delivery!
                  </span>
                  <span className="text-gray-400 font-mono text-[11px]">{freeShippingProgress}%</span>
                </div>
                <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-rose-500 to-primary h-full rounded-full transition-all duration-500"
                    style={{ width: `${freeShippingProgress}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12">
                <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center text-gray-300 mb-4">
                  <FiShoppingBag size={36} />
                </div>
                <h3 className="font-bold text-dark text-base sm:text-lg mb-1">
                  Your cart is empty
                </h3>
                <p className="text-xs text-gray-400 max-w-xs mb-6">
                  Looks like you haven't added anything to your cart yet. Explore our top tech gadgets!
                </p>
                <button
                  onClick={() => {
                    closeDrawer();
                    navigate('/shop');
                  }}
                  className="btn-primary py-2.5 px-6 text-sm rounded-xl"
                >
                  Explore Gadgets
                </button>
              </div>
            ) : (
              items.map((item) => {
                const itemKey = item.cartId || item._id;
                const itemPrice = Number(
                  item.discountPrice !== null && item.discountPrice !== undefined && item.discountPrice !== ''
                    ? item.discountPrice
                    : item.price
                ) || 0;
                const itemImage =
                  (Array.isArray(item.imageUrls) && item.imageUrls[0]) ||
                  item.imageUrl ||
                  item.image ||
                  'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=400';
                return (
                  <div
                    key={itemKey}
                    className="flex gap-3.5 p-3 rounded-2xl bg-gray-50/70 border border-gray-100 hover:border-gray-200 transition-colors"
                  >
                    {/* Thumbnail */}
                    <div className="w-20 h-20 bg-white rounded-xl p-2 shrink-0 border border-gray-150 flex items-center justify-center overflow-hidden">
                      <img
                        src={itemImage}
                        alt={item.name}
                        className="w-full h-full object-contain mix-blend-multiply"
                      />
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div className="flex justify-between items-start gap-1">
                        <div>
                          <Link
                            to={`/product/${item._id}`}
                            onClick={closeDrawer}
                            className="font-bold text-xs sm:text-sm text-dark hover:text-primary transition-colors line-clamp-2 leading-snug"
                          >
                            {item.name}
                          </Link>
                          {item.selectedColor && (
                            <span className="inline-flex items-center gap-1 text-[11px] text-gray-500 font-medium mt-0.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                              <span>Color: <strong className="text-gray-700">{item.selectedColor}</strong></span>
                            </span>
                          )}
                        </div>
                        <button
                          onClick={() => removeFromCart(itemKey)}
                          className="text-gray-400 hover:text-red-500 transition-colors p-1"
                          title="Remove item"
                        >
                          <FiTrash2 size={14} />
                        </button>
                      </div>

                      <div className="flex items-center justify-between mt-2 pt-1">
                        {/* Quantity adjuster */}
                        <div className="flex items-center border border-gray-200 rounded-lg bg-white overflow-hidden shadow-xs">
                          <button
                            onClick={() => updateQuantity(itemKey, item.quantity - 1)}
                            className="w-7 h-7 flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors"
                            aria-label="Decrease quantity"
                          >
                            <FiMinus size={11} />
                          </button>
                          <span className="w-8 text-center text-xs font-bold text-dark">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(itemKey, item.quantity + 1)}
                            className="w-7 h-7 flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors"
                            aria-label="Increase quantity"
                          >
                            <FiPlus size={11} />
                          </button>
                        </div>

                        {/* Price */}
                        <div className="text-right">
                          <div className="font-black text-sm text-dark">
                            {formatBDT(itemPrice * item.quantity)}
                          </div>
                          {item.quantity > 1 && (
                            <div className="text-[10px] text-gray-400">
                              {formatBDT(itemPrice)} each
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer Area with Promo Code & Checkout */}
          {items.length > 0 && (
            <div className="p-4 sm:p-5 border-t border-gray-150 bg-white space-y-4">

              {/* Promo Code Accordion/Bar */}
              <div className="space-y-2">
                {coupon ? (
                  <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 px-3 py-2 rounded-xl text-xs">
                    <div className="flex items-center gap-1.5 text-emerald-700">
                      <FiTag className="shrink-0" size={13} />
                      <span className="font-black tracking-wider uppercase">{coupon.code}</span>
                      <span className="text-emerald-600 font-medium">({coupon.description})</span>
                    </div>
                    <button
                      onClick={removeCoupon}
                      className="text-gray-400 hover:text-red-500 text-xs font-bold p-1"
                      title="Remove coupon"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <div>
                    <form onSubmit={handleApplyCoupon} className="flex gap-2">
                      <div className="relative flex-1">
                        <FiTag className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                        <input
                          type="text"
                          value={couponInput}
                          onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                          placeholder="Coupon code (e.g. WELCOME10)"
                          className="w-full pl-9 pr-3 py-2 text-xs uppercase bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:border-primary font-medium tracking-wide"
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={isApplyingCoupon || !couponInput.trim()}
                        className="px-4 py-2 bg-dark hover:bg-black text-white text-xs font-bold rounded-xl disabled:opacity-40 transition-colors"
                      >
                        Apply
                      </button>
                    </form>

                    {/* Quick promo suggestion badges */}
                    <div className="flex items-center gap-1.5 mt-2 text-[11px] text-gray-500 flex-wrap">
                      <span className="text-gray-400">Try:</span>
                      <button
                        type="button"
                        onClick={() => handleQuickApply('WELCOME10')}
                        className="px-2 py-0.5 bg-gray-100 hover:bg-primary/10 hover:text-primary rounded-md font-mono text-[10px] font-bold border border-gray-200 transition-colors"
                      >
                        WELCOME10 (10% OFF)
                      </button>
                      <button
                        type="button"
                        onClick={() => handleQuickApply('FREESHIP')}
                        className="px-2 py-0.5 bg-gray-100 hover:bg-primary/10 hover:text-primary rounded-md font-mono text-[10px] font-bold border border-gray-200 transition-colors"
                      >
                        FREESHIP
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-1.5 text-xs pt-2 border-t border-gray-100">
                <div className="flex justify-between text-gray-500">
                  <span>Subtotal</span>
                  <span className="font-semibold text-dark">{formatBDT(subtotal)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-semibold">
                    <span>Coupon Discount</span>
                    <span>-{formatBDT(discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-500">
                  <span>Estimated Shipping</span>
                  <span className={shippingFee === 0 ? 'text-emerald-600 font-bold' : 'text-dark font-semibold'}>
                    {shippingFee === 0 ? 'FREE' : formatBDT(shippingFee)}
                  </span>
                </div>
                <div className="flex justify-between text-sm sm:text-base font-black text-dark pt-2 border-t border-gray-200">
                  <span>Total</span>
                  <span className="text-primary">{formatBDT(grandTotal)}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-1">
                <button
                  onClick={handleCheckoutClick}
                  className="w-full btn-primary py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-primary/25 active:scale-[0.99] transition-transform"
                >
                  <span>Proceed to Checkout</span>
                  <FiArrowRight size={16} />
                </button>
                <button
                  onClick={handleViewCartClick}
                  className="w-full py-2.5 text-xs font-bold text-gray-600 hover:text-dark hover:bg-gray-100 rounded-xl transition-colors text-center"
                >
                  View Full Cart ({totalItems})
                </button>
              </div>

              {/* Security Trust Micro-badge */}
              <div className="flex items-center justify-center gap-2 text-[11px] text-gray-400 font-medium pt-1">
                <FiShield className="text-emerald-500" size={13} />
                <span>100% Authentic Tech • Cash on Delivery</span>
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
}

