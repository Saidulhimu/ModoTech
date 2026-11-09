import { useEffect, useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import {
  FiPackage,
  FiUser,
  FiMapPin,
  FiLogOut,
  FiShoppingBag,
  FiLayout,
  FiSettings,
  FiHeart,
  FiCheckCircle,
  FiClock,
  FiTruck,
  FiArrowRight,
  FiShield,
  FiSave,
  FiPhone,
  FiMail,
  FiPrinter,
  FiPlusCircle,
  FiGrid,
} from 'react-icons/fi';
import InvoiceModal from '../components/InvoiceModal';
import { useAuthStore, isAdminEmail } from '../store/authStore';
import { useWishlistStore } from '../store/wishlistStore';
import { formatBDT } from '../lib/format';
import { auth, signOut } from '../lib/firebase';
import authService from '../services/authService';
import orderService from '../services/orderService';
import toast from 'react-hot-toast';

const STATUS_CONFIG = {
  Pending: { bg: 'bg-amber-100 text-amber-800 border-amber-200', icon: <FiClock size={12} /> },
  Processing: { bg: 'bg-blue-100 text-blue-800 border-blue-200', icon: <FiPackage size={12} /> },
  Shipped: { bg: 'bg-purple-100 text-purple-800 border-purple-200', icon: <FiTruck size={12} /> },
  Delivered: { bg: 'bg-emerald-100 text-emerald-800 border-emerald-200', icon: <FiCheckCircle size={12} /> },
  Cancelled: { bg: 'bg-rose-100 text-rose-800 border-rose-200', icon: null },
};

export default function Profile() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = searchParams.get('tab') || 'dashboard';
  const [invoiceOrder, setInvoiceOrder] = useState(null);

  const { user, logout, updateUser } = useAuthStore();
  const isAdmin = user?.role === 'admin' || isAdminEmail(user?.email);
  const wishlistCount = useWishlistStore((s) => s.items.length);

  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);

  // Profile Edit Form State
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    avatar: user?.avatar || '',
    street: user?.addresses?.[0]?.street || '',
    city: user?.addresses?.[0]?.city || '',
    zip: user?.addresses?.[0]?.zip || '',
    country: user?.addresses?.[0]?.country || 'Bangladesh',
    newPassword: '',
  });

  // Sync form data if user changes
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        name: user.name || '',
        phone: user.phone || '',
        avatar: user.avatar || '',
        street: user.addresses?.[0]?.street || '',
        city: user.addresses?.[0]?.city || '',
        zip: user.addresses?.[0]?.zip || '',
      }));
    }
  }, [user]);

  // Fetch Orders
  useEffect(() => {
    let isMounted = true;
    orderService
      .getMyOrders()
      .then((data) => {
        if (isMounted) {
          setOrders(Array.isArray(data) ? data : []);
          setLoadingOrders(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          setOrders([]);
          setLoadingOrders(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleTabChange = (tabId) => {
    const params = new URLSearchParams(searchParams);
    params.set('tab', tabId);
    setSearchParams(params);
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Save Profile Settings
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const payload = {
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        avatar: formData.avatar.trim(),
        address: {
          street: formData.street.trim(),
          city: formData.city.trim(),
          zip: formData.zip.trim(),
          country: formData.country,
        },
      };

      if (formData.newPassword && formData.newPassword.length >= 6) {
        payload.password = formData.newPassword;
      }

      const res = await authService.updateProfile(payload);
      if (res?.user) {
        updateUser(res.user);
      } else {
        updateUser(payload);
      }

      toast.success('Profile updated successfully! 🎉', {
        style: { borderRadius: '12px' },
      });
      setFormData((prev) => ({ ...prev, newPassword: '' }));
    } catch (err) {
      toast.error(err.message || 'Failed to update profile', {
        style: { borderRadius: '12px' },
      });
    } finally {
      setSavingProfile(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch {
      // ignore
    }
    logout();
    toast.success('Logged out successfully 👋', {
      style: { borderRadius: '12px' },
    });
    navigate('/');
  };

  // Calculations for Dashboard Stats
  const totalSpent = orders.reduce((sum, o) => sum + (o.totalPrice || 0), 0);
  const activeOrders = orders.filter(
    (o) => o.orderStatus === 'Pending' || o.orderStatus === 'Processing' || o.orderStatus === 'Shipped'
  );
  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : 'U';

  return (
    <div className="pt-24 pb-20 min-h-screen bg-gray-50/70">
      <div className="container-custom max-w-6xl">
        {/* Top Header Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-150 mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="relative flex-shrink-0">
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  referrerPolicy="no-referrer"
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover ring-4 ring-primary/20 shadow-md"
                />
              ) : (
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-tr from-primary to-rose-500 text-white font-black text-2xl flex items-center justify-center shadow-lg">
                  {userInitial}
                </div>
              )}
              <span className="absolute bottom-1 right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full"></span>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-black text-dark tracking-tight">
                  {user?.name || 'Customer'}
                </h1>
                <span
                  className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-full uppercase ${user?.role === 'admin'
                    ? 'bg-purple-100 text-purple-700'
                    : 'bg-emerald-100 text-emerald-700'
                    }`}
                >
                  {user?.role === 'admin' ? '🛡️ Admin' : '✨ Member'}
                </span>
              </div>
              <p className="text-gray-400 text-sm mt-0.5 flex items-center gap-1.5">
                <FiMail size={13} /> {user?.email}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            {user?.role === 'admin' && (
              <Link to="/admin/dashboard" className="btn-outline !text-xs !py-2.5 !px-4">
                <FiShield /> Admin Dashboard
              </Link>
            )}
            <button
              onClick={handleLogout}
              className="text-rose-600 hover:bg-rose-50 border border-rose-200 px-4 py-2.5 rounded-full text-xs font-bold transition-colors flex items-center gap-2"
            >
              <FiLogOut size={14} /> Sign Out
            </button>
          </div>
        </div>

        {/* Main Content Layout */}
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Navigation Sidebar */}
          <aside className="lg:col-span-1">
            <div className="bg-white rounded-3xl p-3 shadow-sm border border-gray-150 space-y-1">
              {[
                { id: 'dashboard', label: 'User Dashboard', icon: <FiLayout size={18} /> },
                {
                  id: 'orders',
                  label: 'My Orders',
                  icon: <FiPackage size={18} />,
                  count: orders.length,
                },
                { id: 'settings', label: 'Profile Settings', icon: <FiSettings size={18} /> },
              ].map((item) => {
                const isActive = currentTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleTabChange(item.id)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-bold transition-all text-left ${isActive
                      ? 'bg-primary text-white shadow-md shadow-primary/25'
                      : 'text-gray-600 hover:bg-gray-100/80 hover:text-dark'
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <span>{item.icon}</span>
                      <span>{item.label}</span>
                    </div>
                    {item.count !== undefined && item.count > 0 && (
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${isActive ? 'bg-white/25 text-white' : 'bg-gray-100 text-gray-600'
                          }`}
                      >
                        {item.count}
                      </span>
                    )}
                  </button>
                );
              })}

              <Link
                to="/wishlist"
                className="w-full flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-bold text-gray-600 hover:bg-gray-100/80 hover:text-dark transition-all"
              >
                <div className="flex items-center gap-3">
                  <FiHeart size={18} />
                  <span>My Wishlist</span>
                </div>
                {wishlistCount > 0 && (
                  <span className="text-xs bg-rose-50 text-rose-600 px-2 py-0.5 rounded-full font-bold">
                    {wishlistCount}
                  </span>
                )}
              </Link>
            </div>
          </aside>

          {/* Tab Content Display Area */}
          <main className="lg:col-span-3">
            {/* ================================================= */}
            {/* 1. DASHBOARD OVERVIEW TAB                         */}
            {/* ================================================= */}
            {currentTab === 'dashboard' && (
              <div className="space-y-8 animate-in fade-in duration-200">
                {/* Admin Management Suite (Only visible to Admin) */}
                {isAdmin && (
                  <div className="bg-gradient-to-br from-gray-900 via-gray-950 to-black text-white rounded-3xl p-6 sm:p-7 shadow-xl border border-gray-800">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-white/10 mb-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-purple-600/30 border border-purple-500/50 flex items-center justify-center text-purple-300 font-bold text-lg">
                          👑
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-lg font-black text-white">Administrator Control Panel</h3>
                            <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[10px] font-bold uppercase">
                              Super Admin
                            </span>
                          </div>
                          <p className="text-xs text-gray-400 mt-0.5">
                            Exclusive store management routes for {user?.email}
                          </p>
                        </div>
                      </div>
                      <Link
                        to="/admin/dashboard"
                        className="btn-primary !text-xs !py-2.5 !px-5 inline-flex items-center gap-1.5 self-start sm:self-auto"
                      >
                        <FiGrid size={14} /> Open Admin Studio
                      </Link>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
                      <Link
                        to="/admin/products/add"
                        className="p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all group block"
                      >
                        <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                          <FiPlusCircle size={18} />
                        </div>
                        <h4 className="font-bold text-sm text-white group-hover:text-emerald-300 transition-colors">
                          Add New Product
                        </h4>
                        <p className="text-xs text-gray-400 mt-1">
                          Upload new gadgets, specs, pricing & photos
                        </p>
                      </Link>

                      <Link
                        to="/admin/products"
                        className="p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all group block"
                      >
                        <div className="w-9 h-9 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                          <FiPackage size={18} />
                        </div>
                        <h4 className="font-bold text-sm text-white group-hover:text-blue-300 transition-colors">
                          Manage Products & Stock
                        </h4>
                        <p className="text-xs text-gray-400 mt-1">
                          Edit prices, stock levels & categories
                        </p>
                      </Link>

                      <Link
                        to="/admin/orders"
                        className="p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all group block"
                      >
                        <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                          <FiTruck size={18} />
                        </div>
                        <h4 className="font-bold text-sm text-white group-hover:text-amber-300 transition-colors">
                          Accept & Process Orders
                        </h4>
                        <p className="text-xs text-gray-400 mt-1">
                          Approve customer orders & dispatch
                        </p>
                      </Link>
                    </div>
                  </div>
                )}
                {/* 4 Metric Stats Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="bg-white rounded-3xl p-5 border border-gray-150 shadow-sm">
                    <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
                      <FiShoppingBag size={20} />
                    </div>
                    <span className="text-xs font-bold text-gray-400 block uppercase tracking-wider">
                      Total Orders
                    </span>
                    <span className="text-2xl font-black text-dark mt-1 block">
                      {orders.length}
                    </span>
                  </div>

                  <div className="bg-white rounded-3xl p-5 border border-gray-150 shadow-sm">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
                      <FiCheckCircle size={20} />
                    </div>
                    <span className="text-xs font-bold text-gray-400 block uppercase tracking-wider">
                      Total Spent
                    </span>
                    <span className="text-2xl font-black text-emerald-600 mt-1 block">
                      {formatBDT(totalSpent)}
                    </span>
                  </div>

                  <div className="bg-white rounded-3xl p-5 border border-gray-150 shadow-sm">
                    <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mb-3">
                      <FiTruck size={20} />
                    </div>
                    <span className="text-xs font-bold text-gray-400 block uppercase tracking-wider">
                      In Transit
                    </span>
                    <span className="text-2xl font-black text-dark mt-1 block">
                      {activeOrders.length}
                    </span>
                  </div>

                  <div className="bg-white rounded-3xl p-5 border border-gray-150 shadow-sm">
                    <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mb-3">
                      <FiHeart size={20} />
                    </div>
                    <span className="text-xs font-bold text-gray-400 block uppercase tracking-wider">
                      Wishlist
                    </span>
                    <span className="text-2xl font-black text-dark mt-1 block">
                      {wishlistCount}
                    </span>
                  </div>
                </div>

                {/* Recent Orders Section */}
                <div className="bg-white rounded-3xl p-6 sm:p-7 border border-gray-150 shadow-sm">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-xl font-black text-dark tracking-tight">Recent Orders</h3>
                      <p className="text-xs text-gray-400 mt-0.5">Your latest purchases and shipping status</p>
                    </div>
                    <button
                      onClick={() => handleTabChange('orders')}
                      className="text-primary hover:text-red-700 text-xs font-bold flex items-center gap-1"
                    >
                      View All Orders <FiArrowRight />
                    </button>
                  </div>

                  {loadingOrders ? (
                    <div className="space-y-4">
                      {[1, 2].map((i) => (
                        <div key={i} className="h-24 bg-gray-100 rounded-2xl animate-pulse" />
                      ))}
                    </div>
                  ) : orders.length === 0 ? (
                    <div className="text-center py-10 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
                      <FiShoppingBag size={40} className="text-gray-300 mx-auto mb-3" />
                      <p className="font-bold text-dark text-sm">No orders placed yet</p>
                      <p className="text-xs text-gray-400 mt-1 mb-4">
                        Discover top-rated gadgets and build your dream setup!
                      </p>
                      <Link to="/shop" className="btn-primary !text-xs !py-2.5 !px-5 inline-flex">
                        Start Shopping Now
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {orders.slice(0, 3).map((order) => {
                        const statusBadge = STATUS_CONFIG[order.orderStatus] || STATUS_CONFIG.Pending;
                        return (
                          <div
                            key={order._id}
                            className="p-4 sm:p-5 rounded-2xl border border-gray-150 hover:border-primary/40 hover:shadow-sm transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                          >
                            <div className="flex items-center gap-4">
                              <div className="flex -space-x-2 overflow-hidden">
                                {order.orderItems?.slice(0, 3).map((item, idx) => (
                                  <img
                                    key={idx}
                                    src={item.imageUrl}
                                    alt={item.name}
                                    className="w-12 h-12 rounded-xl object-contain bg-gray-50 border-2 border-white shadow-sm"
                                  />
                                ))}
                              </div>
                              <div>
                                <span className="font-mono text-xs font-bold text-gray-400 block">
                                  #{String(order._id).slice(-8).toUpperCase()}
                                </span>
                                <h4 className="font-bold text-sm text-dark line-clamp-1">
                                  {order.orderItems?.[0]?.name}
                                  {order.orderItems?.length > 1 && ` +${order.orderItems.length - 1} more`}
                                </h4>
                                <span className="text-xs text-gray-400">
                                  {new Date(order.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                              <div className="text-right">
                                <span className="font-black text-dark text-base block">
                                  {formatBDT(order.totalPrice)}
                                </span>
                                <span
                                  className={`inline-flex items-center gap-1 text-[11px] font-extrabold px-2.5 py-0.5 rounded-full border ${statusBadge.bg}`}
                                >
                                  {statusBadge.icon} {order.orderStatus}
                                </span>
                              </div>

                              <button
                                onClick={() => setInvoiceOrder(order)}
                                className="p-2.5 bg-gray-100 hover:bg-gray-200 text-dark rounded-xl transition-colors"
                                title="Print Cash Memo / Invoice"
                                type="button"
                              >
                                <FiPrinter size={16} />
                              </button>
                              <Link
                                to={`/track-order?orderId=${order._id}`}
                                className="p-2.5 bg-gray-100 hover:bg-primary hover:text-white rounded-xl text-dark transition-colors"
                                title="Track Package"
                              >
                                <FiArrowRight size={16} />
                              </Link>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Quick Action Navigation Cards */}
                <div className="grid sm:grid-cols-3 gap-4">
                  <Link
                    to="/shop"
                    className="p-5 rounded-3xl bg-gradient-to-br from-dark to-gray-800 text-white shadow-md hover:-translate-y-1 transition-transform group"
                  >
                    <span className="text-2xl mb-2 block">⚡</span>
                    <h4 className="font-bold text-sm">Shop Latest Gear</h4>
                    <p className="text-xs text-gray-400 mt-1">Explore authentic chargers, docks and audio</p>
                  </Link>

                  <Link
                    to="/track-order"
                    className="p-5 rounded-3xl bg-white border border-gray-150 shadow-sm hover:-translate-y-1 transition-transform"
                  >
                    <span className="text-2xl mb-2 block">📦</span>
                    <h4 className="font-bold text-sm text-dark">Track Delivery</h4>
                    <p className="text-xs text-gray-400 mt-1">Live shipment updates on your parcel</p>
                  </Link>

                  <button
                    onClick={() => handleTabChange('settings')}
                    className="p-5 rounded-3xl bg-white border border-gray-150 shadow-sm hover:-translate-y-1 transition-transform text-left"
                  >
                    <span className="text-2xl mb-2 block">⚙️</span>
                    <h4 className="font-bold text-sm text-dark">Profile Settings</h4>
                    <p className="text-xs text-gray-400 mt-1">Edit address, phone number and security</p>
                  </button>
                </div>
              </div>
            )}

            {/* ================================================= */}
            {/* 2. FULL ORDERS TAB                                */}
            {/* ================================================= */}
            {currentTab === 'orders' && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-150 shadow-sm animate-in fade-in duration-200">
                <div className="mb-6">
                  <h3 className="text-2xl font-black text-dark tracking-tight">Order History</h3>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Review all your past and active orders with receipt details
                  </p>
                </div>

                {loadingOrders ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-28 bg-gray-100 rounded-2xl animate-pulse" />
                    ))}
                  </div>
                ) : orders.length === 0 ? (
                  <div className="text-center py-16">
                    <FiShoppingBag size={52} className="text-gray-300 mx-auto mb-4" />
                    <h4 className="text-lg font-bold text-dark">No orders found</h4>
                    <p className="text-xs text-gray-400 mt-1 mb-6">
                      You haven't placed any orders yet.
                    </p>
                    <Link to="/shop" className="btn-primary">
                      Explore Products
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-5">
                    {orders.map((order) => {
                      const statusBadge = STATUS_CONFIG[order.orderStatus] || STATUS_CONFIG.Pending;
                      return (
                        <div
                          key={order._id}
                          className="p-5 rounded-3xl border border-gray-150 hover:border-primary/40 transition-colors"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 pb-4 mb-4">
                            <div>
                              <span className="font-mono text-xs font-bold text-gray-400 block">
                                ORDER #{String(order._id).slice(-8).toUpperCase()}
                              </span>
                              <span className="text-xs text-gray-500">
                                Placed on {new Date(order.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            <span
                              className={`inline-flex items-center gap-1.5 text-xs font-extrabold px-3 py-1 rounded-full border ${statusBadge.bg}`}
                            >
                              {statusBadge.icon} {order.orderStatus}
                            </span>
                          </div>

                          <div className="space-y-3 mb-4">
                            {order.orderItems?.map((item, idx) => (
                              <div key={idx} className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-3">
                                  <img
                                    src={item.imageUrl}
                                    alt={item.name}
                                    className="w-12 h-12 rounded-xl object-contain bg-gray-50 p-1 border border-gray-100"
                                  />
                                  <div>
                                    <h5 className="font-bold text-dark line-clamp-1">{item.name}</h5>
                                    <span className="text-xs text-gray-400">
                                      Quantity: {item.quantity}
                                    </span>
                                  </div>
                                </div>
                                <span className="font-bold text-dark">
                                  {formatBDT((item.price || 0) * (item.quantity || 1))}
                                </span>
                              </div>
                            ))}
                          </div>

                          <div className="flex items-center justify-between pt-3 border-t border-gray-100 text-sm">
                            <div>
                              <span className="text-xs text-gray-400 block">Total Amount</span>
                              <span className="font-black text-dark text-base">
                                {formatBDT(order.totalPrice)}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => setInvoiceOrder(order)}
                                className="btn-outline !text-xs !py-2 !px-3 inline-flex items-center gap-1.5"
                              >
                                <FiPrinter size={13} className="text-primary" /> Cash Memo
                              </button>
                              <Link
                                to={`/track-order?orderId=${order._id}`}
                                className="btn-outline !text-xs !py-2 !px-4"
                              >
                                <FiTruck /> Track Order
                              </Link>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* ================================================= */}
            {/* 3. PROFILE SETTINGS TAB                           */}
            {/* ================================================= */}
            {currentTab === 'settings' && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-150 shadow-sm animate-in fade-in duration-200">
                <div className="mb-6">
                  <h3 className="text-2xl font-black text-dark tracking-tight">Profile Settings</h3>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Update your profile identity, contact number and default delivery address
                  </p>
                </div>

                <form onSubmit={handleSaveProfile} className="space-y-6">
                  {/* Personal Information */}
                  <div>
                    <h4 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-4">
                      Personal Information
                    </h4>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1.5">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          required
                          className="w-full border border-gray-200 rounded-2xl py-3 px-4 text-sm focus:outline-none focus:border-primary transition-colors"
                          placeholder="Your full name"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1.5">
                          Email Address
                        </label>
                        <input
                          type="email"
                          value={user?.email || ''}
                          disabled
                          className="w-full border border-gray-200 bg-gray-100 rounded-2xl py-3 px-4 text-sm text-gray-500 cursor-not-allowed"
                        />
                        <span className="text-[11px] text-gray-400 mt-1 block">
                          🔒 Linked to your Google / ModoTech account
                        </span>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1.5">
                          Phone Number
                        </label>
                        <div className="relative">
                          <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            className="w-full border border-gray-200 rounded-2xl py-3 px-4 pl-10 text-sm focus:outline-none focus:border-primary transition-colors"
                            placeholder="+880 1XXX-XXXXXX"
                          />
                          <FiPhone
                            size={15}
                            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1.5">
                          Avatar Picture URL
                        </label>
                        <input
                          type="url"
                          name="avatar"
                          value={formData.avatar}
                          onChange={handleInputChange}
                          className="w-full border border-gray-200 rounded-2xl py-3 px-4 text-sm focus:outline-none focus:border-primary transition-colors"
                          placeholder="https://images.unsplash.com/..."
                        />
                      </div>
                    </div>
                  </div>

                  {/* Shipping Address */}
                  <div className="pt-4 border-t border-gray-100">
                    <h4 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-4">
                      Default Delivery Address
                    </h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1.5">
                          Street Address / House / Road
                        </label>
                        <input
                          type="text"
                          name="street"
                          value={formData.street}
                          onChange={handleInputChange}
                          className="w-full border border-gray-200 rounded-2xl py-3 px-4 text-sm focus:outline-none focus:border-primary transition-colors"
                          placeholder="House 12, Road 4, Sector 7, Uttara"
                        />
                      </div>

                      <div className="grid sm:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-gray-700 mb-1.5">
                            City / District
                          </label>
                          <input
                            type="text"
                            name="city"
                            value={formData.city}
                            onChange={handleInputChange}
                            className="w-full border border-gray-200 rounded-2xl py-3 px-4 text-sm focus:outline-none focus:border-primary transition-colors"
                            placeholder="Dhaka"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-gray-700 mb-1.5">
                            Postal Code / ZIP
                          </label>
                          <input
                            type="text"
                            name="zip"
                            value={formData.zip}
                            onChange={handleInputChange}
                            className="w-full border border-gray-200 rounded-2xl py-3 px-4 text-sm focus:outline-none focus:border-primary transition-colors"
                            placeholder="1230"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-gray-700 mb-1.5">
                            Country
                          </label>
                          <input
                            type="text"
                            name="country"
                            value={formData.country}
                            disabled
                            className="w-full border border-gray-200 bg-gray-100 rounded-2xl py-3 px-4 text-sm text-gray-600"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Security */}
                  <div className="pt-4 border-t border-gray-100">
                    <h4 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-2">
                      Security & Password
                    </h4>
                    <p className="text-xs text-gray-400 mb-4">
                      Leave blank if you do not wish to change your password.
                    </p>
                    <div className="max-w-md">
                      <label className="block text-xs font-bold text-gray-700 mb-1.5">
                        New Password (optional)
                      </label>
                      <input
                        type="password"
                        name="newPassword"
                        value={formData.newPassword}
                        onChange={handleInputChange}
                        minLength={6}
                        className="w-full border border-gray-200 rounded-2xl py-3 px-4 text-sm focus:outline-none focus:border-primary transition-colors"
                        placeholder="••••••••"
                      />
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-4 flex justify-end">
                    <button
                      type="submit"
                      disabled={savingProfile}
                      className="btn-primary inline-flex items-center gap-2 !px-8 !py-3.5"
                    >
                      <FiSave />
                      <span>{savingProfile ? 'Saving Changes...' : 'Save Profile Changes'}</span>
                    </button>
                  </div>
                </form>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Official Cash Memo / Invoice Modal */}
      {invoiceOrder && (
        <InvoiceModal order={invoiceOrder} onClose={() => setInvoiceOrder(null)} />
      )}
    </div>
  );
}
