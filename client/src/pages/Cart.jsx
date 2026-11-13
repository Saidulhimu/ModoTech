import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FiTrash2,
  FiPlus,
  FiMinus,
  FiArrowRight,
  FiShoppingBag,
  FiTag,
  FiTruck,
  FiCheckCircle,
  FiShield,
  FiMapPin,
} from 'react-icons/fi';
import { useCartStore, FREE_SHIPPING_THRESHOLD } from '../store/cartStore';
import { formatBDT } from '../lib/format';
import toast from 'react-hot-toast';

export default function Cart() {
  const {
    items,
    removeFromCart,
    updateQuantity,
    getTotalPrice,
    getTotalItems,
    getShippingFee,
    getDiscountAmount,
    getFinalTotal,
    clearCart,
    coupon,
    applyCoupon,
    removeCoupon,
    shippingArea,
    setShippingArea,
  } = useCartStore();

  const [couponCodeInput, setCouponCodeInput] = useState('');

  if (items.length === 0) {
    return (
      <div className="pt-28 pb-20 min-h-screen flex flex-col items-center justify-center text-center px-4 bg-gray-50">
        <div className="w-24 h-24 rounded-full bg-white shadow-sm flex items-center justify-center text-gray-300 mb-6">
          <FiShoppingBag size={48} />
        </div>
        <h2 className="text-3xl font-black text-dark mb-2">Your Cart is Empty</h2>
        <p className="text-gray-500 mb-8 max-w-sm">
          Looks like you haven't added any tech items yet. Discover top-tier earbuds, chargers, keyboards and more!
        </p>
        <Link to="/shop" className="btn-primary py-3 px-8 rounded-2xl flex items-center gap-2">
          Start Shopping <FiArrowRight />
        </Link>
      </div>
    );
  }

  const subtotal = getTotalPrice();
  const totalItems = getTotalItems();
  const discountAmount = getDiscountAmount();
  const shippingFee = getShippingFee();
  const grandTotal = getFinalTotal();

  const hasFreeDelivery = subtotal > 0 && (subtotal >= FREE_SHIPPING_THRESHOLD || coupon?.code === 'FREESHIP');
  const freeShippingRemaining = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const freeShippingProgress = subtotal > 0
    ? Math.min(100, Math.round((subtotal / FREE_SHIPPING_THRESHOLD) * 100))
    : 0;

  const handleApplyCoupon = (e) => {
    e?.preventDefault();
    if (!couponCodeInput.trim()) return;

    const res = applyCoupon(couponCodeInput);
    if (res.success) {
      toast.success(res.message, { style: { borderRadius: '12px' } });
      setCouponCodeInput('');
    } else {
      toast.error(res.message, { style: { borderRadius: '12px' } });
    }
  };

  const handleQuickApply = (code) => {
    setCouponCodeInput(code);
    const res = applyCoupon(code);
    if (res.success) {
      toast.success(res.message, { style: { borderRadius: '12px' } });
      setCouponCodeInput('');
    } else {
      toast.error(res.message);
    }
  };

  return (
    <div className="pt-28 pb-20 min-h-screen bg-gray-50">
      <div className="container-custom">
        {/* Page Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-black text-dark tracking-tight">Shopping Cart</h1>
            <p className="text-sm text-gray-500 mt-1">
              Review your items and proceed to secure checkout
            </p>
          </div>
          <span className="self-start sm:self-center px-4 py-1.5 bg-white border border-gray-200 text-dark font-bold text-xs rounded-full shadow-xs">
            {totalItems} items in cart
          </span>
        </div>

        {/* Free Shipping Progress Card */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-150 shadow-sm mb-8">
          {!hasFreeDelivery ? (
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                <span className="flex items-center gap-2 text-dark font-semibold text-sm">
                  <FiTruck className="text-primary text-base" />
                  Add <strong className="text-primary">{formatBDT(freeShippingRemaining)}</strong> more to unlock <span className="underline decoration-primary decoration-2">FREE Delivery</span> anywhere in Bangladesh!
                </span>
                <span className="text-xs text-gray-400 font-mono self-end sm:self-auto">{freeShippingProgress}% Completed</span>
              </div>
              <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-rose-500 to-primary h-full rounded-full transition-all duration-500"
                  style={{ width: `${freeShippingProgress}%` }}
                />
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3 text-emerald-800 bg-emerald-50/80 p-3 rounded-xl border border-emerald-200">
              <FiCheckCircle className="text-emerald-600 text-lg shrink-0" />
              <span className="text-sm font-bold">
                Awesome! You have unlocked FREE Delivery on this entire order!
              </span>
            </div>
          )}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items List */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => {
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
                  key={item.cartId || item._id}
                  className="bg-white rounded-2xl p-4 sm:p-6 flex flex-col sm:flex-row gap-5 border border-gray-150 shadow-sm hover:shadow-md transition-shadow"
                >
                  <Link
                    to={`/product/${item._id}`}
                    className="w-full sm:w-28 h-28 bg-gray-50 rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center p-3 border border-gray-100"
                  >
                    <img
                      src={itemImage}
                      alt={item.name}
                      className="w-full h-full object-contain mix-blend-multiply"
                    />
                  </Link>

                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <Link
                            to={`/product/${item._id}`}
                            className="font-bold text-dark hover:text-primary transition-colors text-base line-clamp-2 leading-snug"
                          >
                            {item.name}
                          </Link>
                          {item.selectedColor && (
                            <div className="inline-flex items-center gap-1.5 text-xs text-gray-600 bg-gray-100/80 border border-gray-200/80 px-2.5 py-0.5 rounded-lg mt-1.5 font-medium">
                              <span className="w-2 h-2 rounded-full bg-primary" />
                              <span>Color: <strong className="text-gray-900">{item.selectedColor}</strong></span>
                            </div>
                          )}
                        </div>
                        <button
                          onClick={() => {
                            removeFromCart(item.cartId || item._id);
                            toast.success('Removed from cart', { icon: '🗑️' });
                          }}
                          className="text-gray-400 hover:text-red-500 transition-colors p-1"
                          title="Remove item"
                        >
                          <FiTrash2 size={17} />
                        </button>
                      </div>
                      <span className="inline-block mt-1 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        {item.category}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-4 mt-4 pt-3 border-t border-gray-100">
                      {/* Quantity Selector */}
                      <div className="flex items-center border border-gray-200 rounded-xl bg-gray-50/50 overflow-hidden shadow-xs">
                        <button
                          onClick={() => updateQuantity(item.cartId || item._id, item.quantity - 1)}
                          className="w-8 h-8 flex items-center justify-center hover:bg-white text-gray-600 transition-colors"
                          aria-label="Decrease quantity"
                        >
                          <FiMinus size={12} />
                        </button>
                        <span className="w-10 text-center text-sm font-bold text-dark">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.cartId || item._id, item.quantity + 1)}
                          className="w-8 h-8 flex items-center justify-center hover:bg-white text-gray-600 transition-colors"
                          aria-label="Increase quantity"
                        >
                          <FiPlus size={12} />
                        </button>
                      </div>

                      {/* Line Item Total */}
                      <div className="text-right">
                        <div className="font-black text-lg text-dark">
                          {formatBDT(itemPrice * item.quantity)}
                        </div>
                        {item.quantity > 1 && (
                          <div className="text-xs text-gray-400">
                            {formatBDT(itemPrice)} each
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            <div className="flex justify-between items-center pt-2">
              <button
                onClick={() => {
                  clearCart();
                  toast.success('Cart cleared', { icon: '🗑️' });
                }}
                className="text-xs font-bold text-gray-400 hover:text-red-500 transition-colors flex items-center gap-1.5"
              >
                <FiTrash2 size={13} /> Clear entire cart
              </button>
              <Link
                to="/shop"
                className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
              >
                ← Continue shopping
              </Link>
            </div>
          </div>

          {/* Order Summary & Coupon Card */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-2xl p-6 border border-gray-150 shadow-sm sticky top-28 space-y-6">
              <h2 className="text-lg font-black text-dark pb-3 border-b border-gray-100">
                Order Summary
              </h2>

              {/* Delivery Destination Selector */}
              <div>
                <label className="flex items-center gap-1.5 text-xs font-bold text-dark mb-2">
                  <FiMapPin className="text-primary" /> Delivery Destination
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setShippingArea('inside_dhaka')}
                    className={`p-2.5 rounded-xl border text-xs font-bold text-center transition-all ${shippingArea === 'inside_dhaka'
                      ? 'border-primary bg-primary/5 text-primary shadow-xs'
                      : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                      }`}
                  >
                    <div>Inside Dhaka</div>
                    <div className="text-[10px] font-normal opacity-80">
                      {subtotal >= FREE_SHIPPING_THRESHOLD || coupon?.code === 'FREESHIP' ? 'FREE' : '৳60'}
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setShippingArea('outside_dhaka')}
                    className={`p-2.5 rounded-xl border text-xs font-bold text-center transition-all ${shippingArea === 'outside_dhaka'
                      ? 'border-primary bg-primary/5 text-primary shadow-xs'
                      : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                      }`}
                  >
                    <div>Outside Dhaka</div>
                    <div className="text-[10px] font-normal opacity-80">
                      {subtotal >= FREE_SHIPPING_THRESHOLD || coupon?.code === 'FREESHIP' ? 'FREE' : '৳120'}
                    </div>
                  </button>
                </div>
              </div>

              {/* Promo Code Box */}
              <div>
                <label className="flex items-center gap-1.5 text-xs font-bold text-dark mb-2">
                  <FiTag className="text-primary" /> Promo / Coupon Code
                </label>
                {coupon ? (
                  <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 px-3 py-2.5 rounded-xl text-xs">
                    <div>
                      <div className="font-black text-emerald-800 uppercase tracking-wide">
                        {coupon.code}
                      </div>
                      <div className="text-emerald-600 text-[11px] font-medium">
                        {coupon.description}
                      </div>
                    </div>
                    <button
                      onClick={removeCoupon}
                      className="text-gray-400 hover:text-red-500 font-bold p-1"
                      title="Remove coupon"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <div>
                    <form onSubmit={handleApplyCoupon} className="flex gap-2">
                      <input
                        type="text"
                        value={couponCodeInput}
                        onChange={(e) => setCouponCodeInput(e.target.value.toUpperCase())}
                        placeholder="e.g. WELCOME10"
                        className="flex-1 px-3 py-2 text-xs uppercase bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:border-primary font-medium tracking-wide"
                      />
                      <button
                        type="submit"
                        disabled={!couponCodeInput.trim()}
                        className="px-4 py-2 bg-dark hover:bg-black text-white text-xs font-bold rounded-xl disabled:opacity-40 transition-colors"
                      >
                        Apply
                      </button>
                    </form>
                    <div className="flex items-center gap-1.5 mt-2 text-[11px] text-gray-500 flex-wrap">
                      <span className="text-gray-400">Available:</span>
                      <button
                        type="button"
                        onClick={() => handleQuickApply('WELCOME10')}
                        className="px-2 py-0.5 bg-gray-100 hover:bg-primary/10 hover:text-primary rounded-md font-mono text-[10px] font-bold border border-gray-200 transition-colors"
                      >
                        WELCOME10
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

              {/* Price Calculation Breakdown */}
              <div className="space-y-3 pt-4 border-t border-gray-100 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal ({totalItems} items)</span>
                  <span className="font-semibold text-dark">{formatBDT(subtotal)}</span>
                </div>

                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-semibold">
                    <span>Coupon Discount</span>
                    <span>-{formatBDT(discountAmount)}</span>
                  </div>
                )}

                <div className="flex justify-between text-gray-600">
                  <span>
                    Shipping ({shippingArea === 'outside_dhaka' ? 'Outside Dhaka' : 'Inside Dhaka'})
                  </span>
                  <span className={shippingFee === 0 ? 'text-emerald-600 font-bold' : 'font-semibold text-dark'}>
                    {shippingFee === 0 ? 'FREE' : formatBDT(shippingFee)}
                  </span>
                </div>

                <div className="flex justify-between text-lg font-black text-dark pt-3 border-t border-gray-200">
                  <span>Total Amount</span>
                  <span className="text-primary text-xl">{formatBDT(grandTotal)}</span>
                </div>
              </div>

              {/* Proceed to Checkout CTA */}
              <Link
                to="/checkout"
                className="w-full btn-primary py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-primary/25 active:scale-[0.99] transition-transform text-center"
              >
                Proceed to Checkout <FiArrowRight size={16} />
              </Link>

              {/* Trust Badge */}
              <div className="pt-2 flex items-center justify-center gap-2 text-xs text-gray-400 font-medium text-center">
                <FiShield className="text-emerald-500" size={15} />
                <span>100% Genuine Tech • Cash On Delivery</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
