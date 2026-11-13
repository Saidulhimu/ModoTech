import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  FiMapPin,
  FiCreditCard,
  FiCheck,
  FiCopy,
  FiSmartphone,
  FiTruck,
  FiTag,
  FiShield,
  FiShoppingBag,
  FiFileText,
  FiArrowRight,
  FiPhone,
  FiUser,
} from 'react-icons/fi';
import { useCartStore, FREE_SHIPPING_THRESHOLD } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';
import { useNotificationStore } from '../store/notificationStore';
import { formatBDT } from '../lib/format';
import orderService from '../services/orderService';
import toast from 'react-hot-toast';

const SEND_MONEY_NUMBER = '01303962860';

export default function Checkout() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const {
    items,
    getTotalPrice,
    getTotalItems,
    getShippingFee,
    getDiscountAmount,
    getFinalTotal,
    clearCart,
    shippingArea,
    setShippingArea,
    deliveryNote,
    setDeliveryNote,
    coupon,
    applyCoupon,
    removeCoupon,
  } = useCartStore();

  const [loading, setLoading] = useState(false);
  const [couponInput, setCouponInput] = useState('');
  const [paymentPhone, setPaymentPhone] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [copiedNumber, setCopiedNumber] = useState(false);
  const [form, setForm] = useState({
    fullName: user?.name || '',
    phone: user?.phone || '',
    street: user?.addresses?.[0]?.street || '',
    city: user?.addresses?.[0]?.city || 'Dhaka',
    zip: user?.addresses?.[0]?.zip || '1212',
    state: 'Dhaka Division',
    country: 'Bangladesh',
    paymentMethod: 'Cash on Delivery',
  });

  // Sync profile details if auth loads after checkout mounted
  useEffect(() => {
    if (user) {
      setForm((prev) => ({
        ...prev,
        fullName: prev.fullName || user.name || '',
        phone: prev.phone || user.phone || '',
        street: prev.street || user.addresses?.[0]?.street || '',
        city: prev.city || user.addresses?.[0]?.city || 'Dhaka',
      }));
    }
  }, [user]);

  const subtotal = getTotalPrice();
  const totalItems = getTotalItems();
  const discountAmount = getDiscountAmount();
  const shippingFee = getShippingFee();
  const grandTotal = getFinalTotal();

  if (items.length === 0) {
    return (
      <div className="pt-28 pb-20 min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
        <FiShoppingBag size={56} className="text-gray-300 mb-4" />
        <h2 className="text-2xl font-black text-dark mb-2">No items to checkout</h2>
        <p className="text-gray-500 mb-6 text-sm">Please add some tech products to your bag first.</p>
        <Link to="/shop" className="btn-primary">Browse Shop</Link>
      </div>
    );
  }

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleApplyCoupon = (e) => {
    e?.preventDefault();
    if (!couponInput.trim()) return;
    const res = applyCoupon(couponInput);
    if (res.success) {
      toast.success(res.message, { style: { borderRadius: '12px' } });
      setCouponInput('');
    } else {
      toast.error(res.message, { style: { borderRadius: '12px' } });
    }
  };

  const handleCopyNumber = () => {
    navigator.clipboard.writeText(SEND_MONEY_NUMBER);
    setCopiedNumber(true);
    toast.success('Number copied: 01303962860', {
      icon: '📋',
      style: { borderRadius: '12px' },
    });
    setTimeout(() => setCopiedNumber(false), 2500);
  };

  const handleOrder = async (e) => {
    e.preventDefault();
    if (!form.phone.trim()) {
      toast.error('Please provide a valid contact phone number');
      return;
    }

    if (!form.street.trim()) {
      toast.error('Please enter your detailed delivery address');
      return;
    }

    if (form.paymentMethod === 'bKash' || form.paymentMethod === 'Nagad') {
      if (!paymentPhone.trim()) {
        toast.error(`Please enter your ${form.paymentMethod} account / sender mobile number`);
        return;
      }
      if (!transactionId.trim()) {
        toast.error(`Please enter the ${form.paymentMethod} Transaction ID (TrxID)`);
        return;
      }
    }

    setLoading(true);
    try {
      const customerName = (form.fullName || user?.name || 'Valued Customer').trim();
      const customerEmail = user?.email || 'customer@modotech.com';

      const orderPayload = {
        userId: user?._id || user?.uid || null,
        userEmail: customerEmail,
        customerName: customerName,
        orderItems: items.map((item) => {
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
          return {
            product: item._id,
            name: item.name || 'Tech Product',
            selectedColor: item.selectedColor || null,
            imageUrl: itemImage,
            price: itemPrice,
            quantity: Number(item.quantity) || 1,
          };
        }),
        shippingAddress: {
          fullName: customerName,
          phone: form.phone.trim(),
          street: form.street.trim(),
          city: form.city.trim(),
          state: form.state,
          zip: form.zip,
          country: form.country,
        },
        deliveryArea: shippingArea,
        deliveryNote: deliveryNote,
        paymentMethod: form.paymentMethod,
        paymentDetails:
          form.paymentMethod === 'Cash on Delivery'
            ? { method: 'Cash on Delivery' }
            : {
                method: form.paymentMethod,
                senderNumber: paymentPhone.trim(),
                transactionId: transactionId.trim().toUpperCase(),
              },
        coupon: coupon
          ? {
            code: coupon.code,
            discount: discountAmount,
          }
          : null,
        itemsPrice: subtotal,
        discountPrice: discountAmount,
        shippingPrice: shippingFee,
        totalPrice: grandTotal,
      };

      const order = await orderService.createOrder(orderPayload);
      clearCart();

      const orderShortId = String(order._id || '').slice(-6).toUpperCase();

      // 1. Notification for Customer (Step 1)
      useNotificationStore.getState().addNotification({
        targetRole: 'user',
        targetUserEmail: customerEmail,
        title: `Order #${orderShortId} Confirmed`,
        message: `Hello ${customerName}, your order for ${formatBDT(grandTotal)} is placed! Waiting for Admin confirmation.`,
        type: 'order_placed',
        orderId: order._id,
        link: `/track-order?orderId=${order._id}`,
        showToast: true,
      });

      // 2. Notification for Admin (Step 1)
      const payDetailNote = transactionId.trim()
        ? ` via ${form.paymentMethod} (TrxID: ${transactionId.trim().toUpperCase()})`
        : ` via ${form.paymentMethod}`;

      useNotificationStore.getState().addNotification({
        targetRole: 'admin',
        targetUserEmail: 'saidulhimuu@gmail.com',
        title: `New Order #${orderShortId} Received`,
        message: `${customerName} (${form.phone}) ordered ${totalItems} item(s) worth ${formatBDT(grandTotal)}${payDetailNote}. Click to review & accept.`,
        type: 'admin_new_order',
        orderId: order._id,
        link: '/admin/orders',
      });

      toast.success('Order placed successfully!', {
        style: { borderRadius: '14px', fontSize: '13px', fontWeight: 'bold' },
      });
      navigate(`/track-order?orderId=${order._id}&new=true`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to place order.', {
        style: { borderRadius: '12px' },
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-28 pb-20 min-h-screen bg-gray-50">
      <div className="container-custom max-w-6xl">

        {/* Title */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-black text-dark tracking-tight">Express Checkout</h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Complete your shipping address and payment preferences for safe delivery
          </p>
        </div>

        <div className="grid lg:grid-cols-5 gap-8">
          {/* Main Checkout Form */}
          <form onSubmit={handleOrder} className="lg:col-span-3 space-y-6">

            {/* 1. Delivery Area Selector */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-gray-150 shadow-sm">
              <h3 className="font-bold text-base text-dark mb-4 flex items-center gap-2">
                <FiTruck className="text-primary" /> Delivery Area (Bangladesh)
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setShippingArea('inside_dhaka');
                    if (form.city !== 'Dhaka') setForm({ ...form, city: 'Dhaka' });
                  }}
                  className={`p-4 rounded-2xl border-2 text-left transition-all ${shippingArea === 'inside_dhaka'
                    ? 'border-primary bg-primary/5 text-dark shadow-sm'
                    : 'border-gray-200 text-gray-600 hover:border-gray-300'
                    }`}
                >
                  <div className="font-bold text-sm">Inside Dhaka</div>
                  <div className="text-xs text-gray-500 mt-0.5">Express Doorstep (24h)</div>
                  <div className="text-primary font-black text-xs mt-2">
                    {subtotal >= FREE_SHIPPING_THRESHOLD || coupon?.code === 'FREESHIP' ? 'FREE DELIVERY' : '৳60 Delivery Charge'}
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setShippingArea('outside_dhaka')}
                  className={`p-4 rounded-2xl border-2 text-left transition-all ${shippingArea === 'outside_dhaka'
                    ? 'border-primary bg-primary/5 text-dark shadow-sm'
                    : 'border-gray-200 text-gray-600 hover:border-gray-300'
                    }`}
                >
                  <div className="font-bold text-sm">Outside Dhaka</div>
                  <div className="text-xs text-gray-500 mt-0.5">Steadfast / RedX Courier (48h)</div>
                  <div className="text-primary font-black text-xs mt-2">
                    {subtotal >= FREE_SHIPPING_THRESHOLD || coupon?.code === 'FREESHIP' ? 'FREE DELIVERY' : '৳120 Delivery Charge'}
                  </div>
                </button>
              </div>
            </div>

            {/* 2. Customer & Shipping Address */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-gray-150 shadow-sm space-y-4">
              <h3 className="font-bold text-base text-dark mb-4 flex items-center gap-2">
                <FiMapPin className="text-primary" /> Recipient Details & Delivery Address
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5 flex items-center gap-1">
                    <FiUser size={13} className="text-gray-400" /> Full Name
                  </label>
                  <input
                    name="fullName"
                    value={form.fullName}
                    onChange={handleChange}
                    required
                    className="w-full border border-gray-200 rounded-xl py-2.5 px-3.5 text-sm focus:outline-none focus:border-primary"
                    placeholder="e.g. Asif Mahmud"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5 flex items-center gap-1">
                    <FiPhone size={13} className="text-gray-400" /> Phone Number (Active)
                  </label>
                  <input
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    required
                    className="w-full border border-gray-200 rounded-xl py-2.5 px-3.5 text-sm focus:outline-none focus:border-primary font-mono"
                    placeholder="017XXXXXXXX"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  Detailed Address (House, Road, Area)
                </label>
                <input
                  name="street"
                  value={form.street}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-200 rounded-xl py-2.5 px-3.5 text-sm focus:outline-none focus:border-primary"
                  placeholder="e.g. House 42, Road 11, Block D, Banani"
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">City / District</label>
                  <input
                    name="city"
                    value={form.city}
                    onChange={handleChange}
                    required
                    className="w-full border border-gray-200 rounded-xl py-2.5 px-3.5 text-sm focus:outline-none focus:border-primary"
                    placeholder="Dhaka"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">Postal Code</label>
                  <input
                    name="zip"
                    value={form.zip}
                    onChange={handleChange}
                    required
                    className="w-full border border-gray-200 rounded-xl py-2.5 px-3.5 text-sm focus:outline-none focus:border-primary"
                    placeholder="1213"
                  />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">Country</label>
                  <input
                    name="country"
                    value={form.country}
                    readOnly
                    className="w-full border border-gray-200 rounded-xl py-2.5 px-3.5 text-sm bg-gray-50 text-gray-500 cursor-not-allowed"
                  />
                </div>
              </div>

              {/* 3. Delivery Note / Special Instructions Box */}
              <div className="pt-2">
                <label className="block text-xs font-bold text-gray-700 mb-1.5 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <FiFileText className="text-primary" /> Delivery Note / Special Rider Instructions
                  </span>
                  <span className="text-[11px] text-gray-400 font-normal">Optional</span>
                </label>
                <textarea
                  rows={2}
                  value={deliveryNote}
                  onChange={(e) => setDeliveryNote(e.target.value)}
                  placeholder="e.g. Call before delivery, deliver after 5 PM, or leave at security gate"
                  className="w-full border border-gray-200 rounded-xl p-3 text-xs sm:text-sm focus:outline-none focus:border-primary resize-none"
                />
              </div>

            </div>

            {/* 4. Payment Method */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-gray-150 shadow-sm">
              <h3 className="font-bold text-base text-dark mb-4 flex items-center gap-2">
                <FiCreditCard className="text-primary" /> Preferred Payment Method
              </h3>
              <div className="space-y-3">
                {[
                  { id: 'Cash on Delivery', label: 'Cash on Delivery (Pay when parcel arrives at doorstep)', badge: 'Recommended' },
                  { id: 'bKash', label: 'bKash Online / QR Payment', badge: 'Instant' },
                  { id: 'Nagad', label: 'Nagad Digital Payment', badge: 'Instant' },
                ].map((item) => (
                  <label
                    key={item.id}
                    className={`flex items-center justify-between p-4 border-2 rounded-2xl cursor-pointer transition-all ${form.paymentMethod === item.id
                      ? 'border-primary bg-primary/5 shadow-xs'
                      : 'border-gray-200 hover:border-gray-300'
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value={item.id}
                        checked={form.paymentMethod === item.id}
                        onChange={handleChange}
                        className="w-4 h-4 accent-primary"
                      />
                      <span className="font-bold text-xs sm:text-sm text-dark">{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 hidden sm:inline-block">
                        {item.badge}
                      </span>
                    )}
                  </label>
                ))}
              </div>

              {/* bKash / Nagad Send Money Instructions & TrxID Input Card */}
              {(form.paymentMethod === 'bKash' || form.paymentMethod === 'Nagad') && (
                <div className="mt-4 p-5 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100/80 border border-gray-200 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between pb-3 border-b border-gray-200">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center text-white font-black text-xs shadow-sm ${
                          form.paymentMethod === 'bKash' ? 'bg-[#D12053]' : 'bg-[#F7941D]'
                        }`}
                      >
                        {form.paymentMethod === 'bKash' ? 'bK' : 'NG'}
                      </div>
                      <div>
                        <h4 className="text-xs sm:text-sm font-black text-gray-900">
                          {form.paymentMethod} Personal Send Money
                        </h4>
                        <p className="text-[11px] text-gray-500">
                          Send total <strong>{formatBDT(grandTotal)}</strong> to our verified account
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                      Active 24/7
                    </span>
                  </div>

                  {/* Send Money Number Display with 1-Click Copy */}
                  <div className="my-3.5 p-3.5 bg-white rounded-xl border border-gray-200 flex items-center justify-between shadow-2xs">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-gray-400 block tracking-wider">
                        Personal Account Number
                      </span>
                      <span className="font-mono font-black text-base sm:text-lg text-gray-900 tracking-wider">
                        {SEND_MONEY_NUMBER}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={handleCopyNumber}
                      className="flex items-center gap-1.5 px-3.5 py-2 bg-gray-100 hover:bg-gray-200 active:scale-95 text-gray-800 text-xs font-bold rounded-xl transition-all"
                    >
                      {copiedNumber ? (
                        <>
                          <FiCheck className="text-emerald-600" size={14} />
                          <span className="text-emerald-700">Copied!</span>
                        </>
                      ) : (
                        <>
                          <FiCopy size={14} />
                          <span>Copy Number</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Instructions List */}
                  <ol className="text-[11px] text-gray-600 space-y-1 mb-4 pl-4 list-decimal leading-relaxed">
                    <li>Open your <strong>{form.paymentMethod} App</strong> &rarr; tap <strong>Send Money</strong>.</li>
                    <li>Enter receiver number: <strong className="font-mono text-dark">{SEND_MONEY_NUMBER}</strong></li>
                    <li>Amount: <strong className="text-primary">{formatBDT(grandTotal)}</strong></li>
                    <li>Reference: <span className="font-mono font-bold text-dark">{form.fullName || 'ModoTech'}</span></li>
                    <li>Complete payment and copy the <strong>Transaction ID (TrxID)</strong>.</li>
                  </ol>

                  {/* Inputs */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <div>
                      <label className="block text-[11px] font-bold text-gray-700 mb-1">
                        Your {form.paymentMethod} Mobile Number *
                      </label>
                      <input
                        type="tel"
                        value={paymentPhone}
                        onChange={(e) => setPaymentPhone(e.target.value)}
                        placeholder="01XXXXXXXXX"
                        className="w-full border border-gray-300 rounded-xl py-2 px-3 text-xs sm:text-sm font-mono focus:outline-none focus:border-primary bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-gray-700 mb-1">
                        Transaction ID (TrxID) *
                      </label>
                      <input
                        type="text"
                        value={transactionId}
                        onChange={(e) => setTransactionId(e.target.value)}
                        placeholder="e.g. BL99XK281M"
                        className="w-full border border-gray-300 rounded-xl py-2 px-3 text-xs sm:text-sm font-mono uppercase focus:outline-none focus:border-primary bg-white"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full justify-center py-4 rounded-2xl text-base font-bold shadow-xl shadow-primary/25 active:scale-[0.99] transition-transform disabled:opacity-50"
            >
              {loading ? 'Processing Order...' : `Confirm Order — ${formatBDT(grandTotal)}`}
            </button>
          </form>

          {/* Right Summary Sidebar */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-gray-150 shadow-sm sticky top-28 space-y-6">
              <h3 className="font-black text-base text-dark pb-3 border-b border-gray-100 flex items-center justify-between">
                <span>Order Summary</span>
                <span className="text-xs font-bold text-gray-400">{totalItems} items</span>
              </h3>

              {/* Items List */}
              <div className="space-y-3.5 max-h-60 overflow-y-auto pr-1">
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
                    <div key={item.cartId || item._id} className="flex gap-3 items-center">
                      <div className="w-14 h-14 bg-gray-50 rounded-xl overflow-hidden flex-shrink-0 border border-gray-100 p-1 flex items-center justify-center">
                        <img
                          src={itemImage}
                          alt={item.name}
                          className="w-full h-full object-contain mix-blend-multiply"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-dark line-clamp-1">{item.name}</p>
                        {item.selectedColor && (
                          <p className="text-[10px] text-gray-500 font-medium">Color: {item.selectedColor}</p>
                        )}
                        <p className="text-[11px] text-gray-400">Qty: {item.quantity}</p>
                      </div>
                      <span className="font-bold text-xs sm:text-sm text-dark">
                        {formatBDT(itemPrice * (Number(item.quantity) || 1))}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Promo Code Box */}
              <div className="pt-2 border-t border-gray-100">
                {coupon ? (
                  <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 px-3 py-2 rounded-xl text-xs">
                    <div>
                      <span className="font-black text-emerald-800 uppercase tracking-wide mr-1.5">
                        {coupon.code}
                      </span>
                      <span className="text-[11px] text-emerald-600">({coupon.description})</span>
                    </div>
                    <button
                      onClick={removeCoupon}
                      className="text-gray-400 hover:text-red-500 font-bold p-1"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyCoupon} className="flex gap-2">
                    <input
                      type="text"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                      placeholder="Coupon code (e.g. WELCOME10)"
                      className="flex-1 px-3 py-2 text-xs uppercase bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-primary font-medium tracking-wide"
                    />
                    <button
                      type="submit"
                      disabled={!couponInput.trim()}
                      className="px-3 py-2 bg-dark hover:bg-black text-white text-xs font-bold rounded-xl disabled:opacity-40 transition-colors"
                    >
                      Apply
                    </button>
                  </form>
                )}
              </div>

              {/* Totals */}
              <div className="border-t border-gray-100 pt-4 space-y-2.5 text-xs sm:text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span className="font-semibold text-dark">{formatBDT(subtotal)}</span>
                </div>

                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-semibold">
                    <span>Coupon Discount</span>
                    <span>-{formatBDT(discountAmount)}</span>
                  </div>
                )}

                <div className="flex justify-between text-gray-600">
                  <span>Shipping Fee</span>
                  <span className={shippingFee === 0 ? 'text-emerald-600 font-bold' : 'font-semibold text-dark'}>
                    {shippingFee === 0 ? 'FREE' : formatBDT(shippingFee)}
                  </span>
                </div>

                <div className="flex justify-between text-base font-black text-dark pt-3 border-t-2 border-gray-200">
                  <span>Grand Total</span>
                  <span className="text-primary text-xl">{formatBDT(grandTotal)}</span>
                </div>
              </div>

              {/* Trust Guarantee */}
              <div className="pt-2 flex items-center justify-center gap-2 text-xs text-gray-400 font-medium">
                <FiShield className="text-emerald-500" size={14} />
                <span>Cash On Delivery • 7 Days Replacement</span>
              </div>

            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
