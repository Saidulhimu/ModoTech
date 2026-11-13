import { useState, useEffect, useRef, useMemo } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  FiSearch,
  FiHeart,
  FiShoppingCart,
  FiUser,
  FiMenu,
  FiX,
  FiLayout,
  FiPackage,
  FiSettings,
  FiLogOut,
  FiShield,
  FiChevronDown,
  FiPlus,
  FiCheckCircle,
  FiArrowRight,
} from 'react-icons/fi';
import { useCartStore } from '../store/cartStore';
import { useAuthStore, isAdminEmail } from '../store/authStore';
import { useWishlistStore } from '../store/wishlistStore';
import NotificationBell from './NotificationBell';
import { getAllAvailableProducts } from '../services/productService';
import { formatBDT } from '../lib/format';
import { auth, signOut } from '../lib/firebase';
import toast from 'react-hot-toast';

const navLinks = [
  { label: 'Home', to: '/' },
  { label: 'Shop', to: '/shop' },
  { label: 'Track Order', to: '/track-order' },
];

export default function Navbar({ transparent = false }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const dropdownRef = useRef(null);
  const totalItems = useCartStore((s) => s.getTotalItems());
  const openDrawer = useCartStore((s) => s.openDrawer);
  const wishlistCount = useWishlistStore((s) => s.items.length);
  const { isAuthenticated, user, logout } = useAuthStore();
  const isAdmin = user?.role === 'admin' || isAdminEmail(user?.email);

  // Live Auto-Complete search results
  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q || q.length < 1) return [];
    const all = getAllAvailableProducts();
    return all
      .filter(
        (p) =>
          p.name?.toLowerCase().includes(q) ||
          p.category?.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q)
      )
      .slice(0, 5);
  }, [searchQuery]);

  // Scroll listener for transparent header effect
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdown on route change
  useEffect(() => {
    setUserDropdownOpen(false);
    setMenuOpen(false);
    setSearchOpen(false);
  }, [location.pathname]);

  // Click outside to close profile dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Logout handler
  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch {
      // ignore
    }
    logout();
    setUserDropdownOpen(false);
    toast.success('Logged out successfully 👋', {
      style: { borderRadius: '12px' },
    });
    navigate('/');
  };

  const navBg =
    transparent && !scrolled
      ? 'bg-transparent text-white'
      : 'bg-white/95 backdrop-blur-md text-dark border-b border-gray-150 shadow-[0_4px_20px_rgba(0,0,0,0.03)]';

  // Fallback default avatar generator
  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : 'U';
  const hasAvatar = Boolean(user?.avatar);

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${navBg}`}>
      <div className="container-custom">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo with Gadget Emblem */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <img
              src="/logo.svg"
              alt="ModoTech"
              className="w-8 h-8 md:w-9 md:h-9 rounded-xl shadow-sm group-hover:scale-105 transition-transform"
            />
            <span className="text-2xl md:text-3xl font-black tracking-tight">
              Modo<span className="text-primary group-hover:text-red-600 transition-colors">Tech</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-7">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `text-sm font-bold tracking-wide uppercase hover:text-primary transition-colors ${isActive ? 'text-primary' : ''
                  }`
                }
                end={link.to === '/'}
              >
                {link.label}
              </NavLink>
            ))}

            {/* Exclusive Admin Panel Tab in Navbar */}
            {isAdmin && (
              <NavLink
                to="/admin/dashboard"
                className={({ isActive }) =>
                  `text-xs font-black tracking-wide uppercase px-3 py-1.5 rounded-full border transition-all flex items-center gap-1.5 ${isActive
                    ? 'bg-purple-600 text-white border-purple-600 shadow-sm shadow-purple-500/30'
                    : 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100'
                  }`
                }
              >
                <FiShield size={13} className="shrink-0 text-current" />
                <span>Admin Panel</span>
              </NavLink>
            )}
          </nav>

          {/* Action Icons */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Search Toggle */}
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="p-2 hover:text-primary transition-colors rounded-full hover:bg-black/5"
              aria-label="Search"
            >
              <FiSearch size={20} />
            </button>

            {/* Notification Bell */}
            <NotificationBell />

            {/* Wishlist */}
            <Link
              to="/wishlist"
              className="p-2 hover:text-primary transition-colors relative rounded-full hover:bg-black/5"
              aria-label="Wishlist"
            >
              <FiHeart size={20} />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-white text-[11px] w-5 h-5 rounded-full flex items-center justify-center font-black shadow-sm">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Cart Button with Drawer Trigger */}
            <button
              onClick={openDrawer}
              className="p-2 hover:text-primary transition-colors relative rounded-full hover:bg-black/5"
              aria-label="Shopping Cart"
              type="button"
            >
              <FiShoppingCart size={20} />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-white text-[11px] w-5 h-5 rounded-full flex items-center justify-center font-black shadow-sm">
                  {totalItems}
                </span>
              )}
            </button>

            {/* User Profile / Auth Area */}
            {isAuthenticated && user ? (
              <div className="relative" ref={dropdownRef}>
                {/* Trigger Button with Avatar */}
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 p-1 pl-1.5 pr-2.5 rounded-full border border-gray-200/80 hover:border-primary/50 transition-all bg-white/10 hover:bg-black/5 text-dark"
                  aria-expanded={userDropdownOpen}
                >
                  <div className="relative">
                    {hasAvatar ? (
                      <img
                        src={user.avatar}
                        alt={user.name || 'User'}
                        referrerPolicy="no-referrer"
                        className="w-8 h-8 rounded-full object-cover ring-2 ring-primary/40 shadow-sm"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-rose-500 text-white font-black text-xs flex items-center justify-center shadow-md">
                        {userInitial}
                      </div>
                    )}
                    {/* Online status indicator dot */}
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full"></span>
                  </div>

                  <span className="text-xs font-bold hidden sm:inline-block max-w-[90px] truncate text-current">
                    {user.name?.split(' ')[0] || 'Account'}
                  </span>
                  <FiChevronDown
                    size={14}
                    className={`transition-transform duration-200 opacity-60 ${userDropdownOpen ? 'rotate-180' : ''
                      }`}
                  />
                </button>

                {/* Luxury Dropdown Menu */}
                {userDropdownOpen && (
                  <div className="absolute right-0 mt-3 w-72 bg-white rounded-3xl shadow-2xl border border-gray-150 py-3 text-dark z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    {/* Header: User Info */}
                    <div className="px-5 py-3 border-b border-gray-100 flex items-center gap-3">
                      <div className="relative flex-shrink-0">
                        {hasAvatar ? (
                          <img
                            src={user.avatar}
                            alt={user.name}
                            referrerPolicy="no-referrer"
                            className="w-12 h-12 rounded-full object-cover ring-2 ring-primary/30"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-primary to-rose-500 text-white font-black text-lg flex items-center justify-center">
                            {userInitial}
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <h4 className="font-black text-sm text-dark truncate">
                            {user.name || 'Valued Customer'}
                          </h4>
                        </div>
                        <p className="text-xs text-gray-400 truncate mb-1">{user.email}</p>
                        <span
                          className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full inline-flex items-center gap-1 ${isAdmin
                              ? 'bg-purple-100 text-purple-700'
                              : 'bg-emerald-100 text-emerald-700'
                            }`}
                        >
                          {isAdmin ? <FiShield size={11} /> : <FiCheckCircle size={11} />}
                          <span>{isAdmin ? 'Administrator' : 'Verified Member'}</span>
                        </span>
                      </div>
                    </div>

                    {/* Navigation Items */}
                    <div className="px-2 py-2 space-y-0.5 text-sm">
                      {/* 1. Dashboard */}
                      <Link
                        to="/profile?tab=dashboard"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl hover:bg-gray-100/80 transition-colors group"
                      >
                        <div className="w-8 h-8 rounded-lg bg-gray-100 group-hover:bg-primary/10 text-gray-600 group-hover:text-primary flex items-center justify-center transition-colors">
                          <FiLayout size={16} />
                        </div>
                        <div className="flex-1">
                          <span className="font-bold text-dark block leading-snug">User Dashboard</span>
                          <span className="text-[11px] text-gray-400 block">Orders, stats & activity</span>
                        </div>
                      </Link>

                      {/* 2. My Orders */}
                      <Link
                        to="/profile?tab=orders"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl hover:bg-gray-100/80 transition-colors group"
                      >
                        <div className="w-8 h-8 rounded-lg bg-gray-100 group-hover:bg-primary/10 text-gray-600 group-hover:text-primary flex items-center justify-center transition-colors">
                          <FiPackage size={16} />
                        </div>
                        <div className="flex-1">
                          <span className="font-bold text-dark block leading-snug">My Orders</span>
                          <span className="text-[11px] text-gray-400 block">Track packages & history</span>
                        </div>
                      </Link>

                      {/* 3. Profile Settings */}
                      <Link
                        to="/profile?tab=settings"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl hover:bg-gray-100/80 transition-colors group"
                      >
                        <div className="w-8 h-8 rounded-lg bg-gray-100 group-hover:bg-primary/10 text-gray-600 group-hover:text-primary flex items-center justify-center transition-colors">
                          <FiSettings size={16} />
                        </div>
                        <div className="flex-1">
                          <span className="font-bold text-dark block leading-snug">Profile Settings</span>
                          <span className="text-[11px] text-gray-400 block">Name, address & info</span>
                        </div>
                      </Link>

                      {/* Exclusive Admin Management Options */}
                      {isAdmin && (
                        <div className="pt-2 mt-1 border-t border-purple-100 space-y-1">
                          <Link
                            to="/admin/dashboard"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-3 px-3.5 py-2 rounded-xl bg-purple-50/80 hover:bg-purple-100 text-purple-800 transition-colors group"
                          >
                            <div className="w-8 h-8 rounded-lg bg-purple-200/70 text-purple-800 flex items-center justify-center font-bold">
                              <FiShield size={15} />
                            </div>
                            <div className="flex-1">
                              <span className="font-bold text-xs block leading-snug">Admin Dashboard</span>
                              <span className="text-[10px] text-purple-600 block">Analytics & Controls</span>
                            </div>
                          </Link>

                          <Link
                            to="/admin/products/add"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-3 px-3.5 py-2 rounded-xl hover:bg-emerald-50 text-emerald-800 transition-colors group"
                          >
                            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                              <FiPlus size={15} />
                            </div>
                            <div className="flex-1">
                              <span className="font-bold text-xs block leading-snug">Add New Product</span>
                              <span className="text-[10px] text-emerald-600 block">Create live gadget listing</span>
                            </div>
                          </Link>

                          <Link
                            to="/admin/orders"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-3 px-3.5 py-2 rounded-xl hover:bg-blue-50 text-blue-800 transition-colors group"
                          >
                            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                              <FiPackage size={15} />
                            </div>
                            <div className="flex-1">
                              <span className="font-bold text-xs block leading-snug">Manage Orders</span>
                              <span className="text-[10px] text-blue-600 block">Accept & dispatch</span>
                            </div>
                          </Link>
                        </div>
                      )}
                    </div>

                    {/* Footer: Logout */}
                    <div className="border-t border-gray-100 px-2 pt-2">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-rose-600 hover:bg-rose-50 transition-colors text-sm font-bold text-left"
                      >
                        <div className="w-8 h-8 rounded-lg bg-rose-100/60 text-rose-600 flex items-center justify-center">
                          <FiLogOut size={16} />
                        </div>
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Non-authenticated login button */
              <Link
                to="/login"
                className="btn-primary text-xs !px-4 !py-2.5 font-bold"
                aria-label="Account Login"
              >
                <FiUser size={15} />
                <span>Log In</span>
              </Link>
            )}

            {/* Mobile Menu Toggle */}
            <button
              className="md:hidden p-2 rounded-full hover:bg-black/5"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
            >
              {menuOpen ? <FiX size={22} /> : <FiMenu size={22} />}
            </button>
          </div>
        </div>

        {/* Search Expansion Dropdown & Live Auto-Complete */}
        {searchOpen && (
          <div className="pb-4 animate-in fade-in duration-200">
            <div className="relative max-w-xl mx-auto">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (searchQuery.trim()) {
                    setSearchOpen(false);
                    navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
                  }
                }}
              >
                <input
                  type="text"
                  placeholder="Search gadgets, accessories, power banks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                  className="w-full border border-gray-200 rounded-2xl py-3 px-5 pr-14 text-dark focus:outline-none focus:border-primary shadow-sm bg-white"
                />
                <button
                  type="submit"
                  className="absolute right-3 top-3 p-2 text-gray-500 hover:text-primary transition-colors"
                  aria-label="Search"
                >
                  <FiSearch size={18} />
                </button>
              </form>

              {/* Live Search Auto-Complete Dropdown */}
              {searchQuery.trim().length > 0 && (
                <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  {searchResults.length > 0 ? (
                    <div>
                      <div className="px-4 py-2 bg-gray-50/80 border-b border-gray-100 flex items-center justify-between text-xs text-gray-500 font-semibold">
                        <span>Matching Products ({searchResults.length})</span>
                        <span>Click to view details</span>
                      </div>
                      <div className="divide-y divide-gray-100 max-h-80 overflow-y-auto">
                        {searchResults.map((p) => {
                          const img = p.images?.[0] || p.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100';
                          return (
                            <button
                              key={p._id}
                              type="button"
                              onClick={() => {
                                setSearchOpen(false);
                                setSearchQuery('');
                                navigate(`/product/${p._id}`);
                              }}
                              className="w-full px-4 py-3 flex items-center gap-3.5 hover:bg-gray-50/80 transition-colors text-left group"
                            >
                              <img
                                src={img}
                                alt={p.name}
                                className="w-12 h-12 object-cover rounded-xl border border-gray-100 flex-shrink-0 group-hover:scale-105 transition-transform"
                              />
                              <div className="flex-1 min-w-0">
                                <p className="text-xs uppercase tracking-wider text-primary font-bold line-clamp-1">
                                  {p.category || 'Gadget'}
                                </p>
                                <p className="text-sm font-semibold text-gray-900 line-clamp-1 group-hover:text-primary transition-colors">
                                  {p.name}
                                </p>
                                <div className="flex items-center gap-2 mt-0.5">
                                  <span className="text-xs font-black text-gray-900">
                                    {formatBDT(p.price)}
                                  </span>
                                  {p.originalPrice && p.originalPrice > p.price && (
                                    <span className="text-[10px] text-gray-400 line-through">
                                      {formatBDT(p.originalPrice)}
                                    </span>
                                  )}
                                  {p.isFeatured && (
                                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-50 text-amber-700 font-bold border border-amber-200/60">
                                      Popular
                                    </span>
                                  )}
                                </div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                      <div className="p-2.5 bg-gray-50/80 border-t border-gray-100 text-center">
                        <button
                          type="button"
                          onClick={() => {
                            setSearchOpen(false);
                            navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
                          }}
                          className="text-xs font-bold text-primary hover:underline inline-flex items-center gap-1"
                        >
                          View all results for &ldquo;{searchQuery}&rdquo; &rarr;
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="p-6 text-center text-sm text-gray-500">
                      <FiSearch className="mx-auto mb-2 text-gray-300" size={24} />
                      <p className="font-semibold text-gray-700">No gadgets found for &ldquo;{searchQuery}&rdquo;</p>
                      <p className="text-xs text-gray-400 mt-1">Try checking for typos or searching general terms like &lsquo;headphone&rsquo; or &lsquo;charger&rsquo;</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Mobile Navigation Drawer */}
        {menuOpen && (
          <div className="md:hidden pb-6 pt-2 border-t border-gray-200/50 animate-in fade-in duration-200">
            <nav className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  onClick={() => setMenuOpen(false)}
                  className={({ isActive }) =>
                    `px-4 py-2.5 rounded-xl text-sm font-bold uppercase transition-colors ${isActive ? 'bg-primary text-white' : 'hover:bg-black/5'
                    }`
                  }
                  end={link.to === '/'}
                >
                  {link.label}
                </NavLink>
              ))}

              {isAdmin && (
                <NavLink
                  to="/admin/dashboard"
                  onClick={() => setMenuOpen(false)}
                  className={({ isActive }) =>
                    `px-4 py-2.5 rounded-xl text-sm font-black uppercase transition-colors flex items-center gap-2 ${isActive ? 'bg-purple-600 text-white' : 'bg-purple-50 text-purple-700'
                    }`
                  }
                >
                  <FiShield size={14} /> Admin Panel
                </NavLink>
              )}

              {isAuthenticated && user && (
                <div className="border-t border-gray-150 pt-3 mt-2 space-y-1">
                  <Link
                    to="/profile?tab=dashboard"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-black/5 text-sm font-bold"
                  >
                    <FiLayout size={16} /> User Dashboard
                  </Link>
                  <Link
                    to="/profile?tab=orders"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-black/5 text-sm font-bold"
                  >
                    <FiPackage size={16} /> My Orders
                  </Link>
                  <Link
                    to="/profile?tab=settings"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-black/5 text-sm font-bold"
                  >
                    <FiSettings size={16} /> Profile Settings
                  </Link>
                  {isAdmin && (
                    <Link
                      to="/admin/dashboard"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-purple-50 text-purple-700 text-sm font-bold"
                    >
                      <FiShield size={16} /> Admin Control Center
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-rose-600 hover:bg-rose-50 text-sm font-bold text-left"
                  >
                    <FiLogOut size={16} /> Sign Out
                  </button>
                </div>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
