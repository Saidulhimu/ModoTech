import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  FiPackage,
  FiTruck,
  FiCheckCircle,
  FiClock,
  FiArrowLeft,
  FiPrinter,
  FiFileText,
  FiMapPin,
} from 'react-icons/fi';
import { formatBDT } from '../lib/format';
import api from '../lib/axios';
import InvoiceModal from '../components/InvoiceModal';

const steps = [
  { key: 'Pending', label: 'Order Placed', icon: <FiClock size={20} /> },
  { key: 'Processing', label: 'Processing & QC', icon: <FiPackage size={20} /> },
  { key: 'Shipped', label: 'Dispatched to Courier', icon: <FiTruck size={20} /> },
  { key: 'Delivered', label: 'Delivered to Doorstep', icon: <FiCheckCircle size={20} /> },
];

export default function TrackOrder() {
  const [searchParams] = useSearchParams();
  const orderIdParam = searchParams.get('orderId') || '';
  const isNewOrder = searchParams.get('new') === 'true';

  const [orderId, setOrderId] = useState(orderIdParam);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [showInvoice, setShowInvoice] = useState(false);

  const fetchOrder = async (idToSearch) => {
    if (!idToSearch) return;
    setLoading(true);
    setSearched(true);
    try {
      const { data } = await api.get(`/orders/${idToSearch}`);
      setOrder(data);
    } catch {
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (orderIdParam) {
      fetchOrder(orderIdParam);
    }
  }, [orderIdParam]);

  const handleSubmit = (e) => {
    e.preventDefault();
    fetchOrder(orderId.trim());
  };

  const getStepIndex = (status) => {
    const map = { Pending: 0, Processing: 1, Shipped: 2, Delivered: 3 };
    return map[status] ?? 0;
  };

  const currentStep = order ? getStepIndex(order.orderStatus) : 0;

  return (
    <div className="pt-28 pb-20 min-h-screen bg-gray-50">
      <div className="container-custom max-w-3xl">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-gray-500 hover:text-primary mb-6 transition-colors text-sm font-semibold"
        >
          <FiArrowLeft /> Back to Home
        </Link>

        {/* If newly created order banner */}
        {isNewOrder && order && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-6 sm:p-7 mb-8 shadow-sm">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md">
                <FiCheckCircle size={22} />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-black text-emerald-950">
                  Your Order is Confirmed
                </h2>
                <p className="text-xs sm:text-sm text-emerald-800 mt-1 leading-relaxed">
                  We have received your order and our dispatch team is prepping your parcel. You can track real-time delivery progress or print your official cash memo below.
                </p>
                <div className="mt-4 flex flex-wrap gap-3">
                  <button
                    onClick={() => setShowInvoice(true)}
                    className="flex items-center gap-2 px-5 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold transition-all shadow-md"
                  >
                    <FiPrinter size={15} />
                    <span>View / Print Cash Memo</span>
                  </button>
                  <Link
                    to="/shop"
                    className="px-5 py-2.5 bg-white text-emerald-900 border border-emerald-300 rounded-xl text-xs font-bold hover:bg-emerald-100 transition-colors"
                  >
                    Continue Shopping
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-black text-dark tracking-tight">Track Your Order</h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Enter your Order ID to track real-time fulfillment and download official cash memos.
          </p>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSubmit} className="flex gap-2 sm:gap-3 mb-10">
          <input
            type="text"
            placeholder="Paste your Order ID (e.g. ord_173...)"
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
            required
            className="flex-1 border border-gray-200 rounded-2xl px-4 sm:px-5 py-3 sm:py-3.5 bg-white text-dark focus:outline-none focus:border-primary transition-all text-sm font-mono"
          />
          <button
            type="submit"
            disabled={loading}
            className="btn-primary py-3 sm:py-3.5 px-6 sm:px-8 text-xs sm:text-sm rounded-2xl"
          >
            {loading ? 'Searching...' : 'Track'}
          </button>
        </form>

        {/* Order Details Card */}
        {order ? (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-150 shadow-sm space-y-8">
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-gray-150">
              <div>
                <span className="text-[11px] uppercase tracking-wider text-gray-400 font-bold block">
                  Order Identifier
                </span>
                <span className="font-mono font-black text-dark text-base sm:text-lg">#{order._id}</span>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowInvoice(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-dark rounded-xl text-xs font-bold border border-gray-200 transition-colors shadow-xs"
                >
                  <FiPrinter size={14} className="text-primary" />
                  <span>Print Invoice / Cash Memo</span>
                </button>
                <div className="text-right pl-3 border-l border-gray-200 hidden sm:block">
                  <span className="text-[11px] uppercase tracking-wider text-gray-400 font-bold block">
                    Placed Date
                  </span>
                  <span className="text-xs font-semibold text-gray-600">
                    {new Date(order.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                </div>
              </div>
            </div>

            {/* Stepper Progress */}
            <div>
              <div className="grid grid-cols-4 relative">
                {/* Connecting line */}
                <div className="absolute top-5 left-[12.5%] right-[12.5%] h-1 bg-gray-200 -z-0">
                  <div
                    className="h-full bg-primary transition-all duration-700"
                    style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
                  />
                </div>

                {steps.map((s, index) => {
                  const isCompleted = index <= currentStep;
                  const isCurrent = index === currentStep;
                  return (
                    <div key={s.key} className="flex flex-col items-center text-center relative z-10">
                      <div
                        className={`w-11 h-11 rounded-full flex items-center justify-center transition-all ${isCompleted
                            ? 'bg-primary text-white shadow-lg shadow-primary/30 ring-4 ring-primary/10'
                            : 'bg-white border-2 border-gray-200 text-gray-400'
                          }`}
                      >
                        {s.icon}
                      </div>
                      <p
                        className={`mt-2.5 text-[11px] sm:text-xs font-bold ${isCurrent ? 'text-primary' : isCompleted ? 'text-dark' : 'text-gray-400'
                          }`}
                      >
                        {s.label}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Shipping & Delivery Specs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-gray-50 border border-gray-150 text-xs">
              <div>
                <span className="font-bold text-gray-400 uppercase tracking-wider text-[10px] block mb-1">
                  Delivery Destination
                </span>
                <p className="font-bold text-dark">{order.shippingAddress?.fullName || 'Customer'}</p>
                <p className="text-gray-600 mt-0.5">{order.shippingAddress?.street}</p>
                <p className="text-gray-600">
                  {order.shippingAddress?.city} (
                  {order.deliveryArea === 'outside_dhaka' ? 'Outside Dhaka' : 'Inside Dhaka'}
                  )
                </p>
              </div>

              <div>
                <span className="font-bold text-gray-400 uppercase tracking-wider text-[10px] block mb-1">
                  Payment & Instructions
                </span>
                <p className="text-gray-700">
                  <strong>Method:</strong> {order.paymentMethod || 'Cash on Delivery'}
                </p>
                {order.deliveryNote && (
                  <p className="text-gray-700 mt-1 italic bg-white p-2 rounded-lg border border-gray-200">
                    "{order.deliveryNote}"
                  </p>
                )}
              </div>
            </div>

            {/* Ordered Items */}
            <div className="border-t border-gray-150 pt-6">
              <h3 className="font-bold text-sm uppercase tracking-wider text-gray-400 mb-4">
                Purchased Tech Gear ({order.orderItems?.length || 0})
              </h3>
              <div className="space-y-3">
                {order.orderItems?.map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between py-2.5 border-b border-gray-100 last:border-0"
                  >
                    <div className="flex items-center gap-3">
                      {item.imageUrl && (
                        <div className="w-12 h-12 rounded-xl bg-gray-50 border border-gray-100 p-1 flex items-center justify-center overflow-hidden">
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            className="w-full h-full object-contain mix-blend-multiply"
                          />
                        </div>
                      )}
                      <div>
                        <p className="font-bold text-xs sm:text-sm text-dark">{item.name}</p>
                        <p className="text-[11px] text-gray-400">Qty: {item.quantity}</p>
                      </div>
                    </div>
                    <span className="font-bold text-xs sm:text-sm text-dark">
                      {formatBDT(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-4 border-t border-gray-150 flex justify-between items-center">
                <span className="text-gray-500 text-xs sm:text-sm font-semibold">Total Order Value</span>
                <span className="text-xl sm:text-2xl font-black text-primary">
                  {formatBDT(order.totalPrice)}
                </span>
              </div>
            </div>
          </div>
        ) : searched && !loading ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-gray-150 shadow-sm">
            <FiPackage size={48} className="text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-dark mb-2">Order Not Found</h3>
            <p className="text-gray-500 mb-6 text-sm">
              Please check the order ID or log in to view your orders under Profile.
            </p>
            <Link to="/profile?tab=orders" className="btn-primary inline-flex">
              View My Orders
            </Link>
          </div>
        ) : null}

        {/* Invoice Modal for Official Cash Memo */}
        {showInvoice && order && (
          <InvoiceModal order={order} onClose={() => setShowInvoice(false)} />
        )}

      </div>
    </div>
  );
}
