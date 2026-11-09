import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FiBell,
  FiCheck,
  FiCheckCircle,
  FiPackage,
  FiTruck,
  FiX,
  FiCheckSquare,
  FiShoppingBag,
} from 'react-icons/fi';
import { useNotificationStore } from '../store/notificationStore';
import { useAuthStore, isAdminEmail } from '../store/authStore';

// Format relative time helper
function formatTimeAgo(dateString) {
  try {
    const diff = Math.floor((Date.now() - new Date(dateString).getTime()) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  } catch {
    return 'Recently';
  }
}

export default function NotificationBell() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  const { user } = useAuthStore();
  const isAdmin = user?.role === 'admin' || isAdminEmail(user?.email);
  const userEmail = user?.email || null;

  const {
    getUserNotifications,
    getUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotificationStore();

  const notifications = getUserNotifications(userEmail, isAdmin);
  const unreadCount = getUnreadCount(userEmail, isAdmin);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNotificationClick = (notif) => {
    markAsRead(notif.id);
    setOpen(false);
    if (notif.link) {
      navigate(notif.link);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'order_accepted':
        return (
          <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
            <FiCheckCircle size={16} />
          </div>
        );
      case 'order_placed':
      case 'admin_new_order':
        return (
          <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <FiPackage size={16} />
          </div>
        );
      case 'order_shipped':
        return (
          <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
            <FiTruck size={16} />
          </div>
        );
      default:
        return (
          <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
            <FiBell size={16} />
          </div>
        );
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="p-2 hover:text-primary transition-colors relative rounded-full hover:bg-black/5 flex items-center justify-center"
        aria-label="Notifications"
        title="View Notifications"
      >
        <FiBell size={20} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-md animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown Panel */}
      {open && (
        <div className="absolute right-0 top-full mt-3 w-80 sm:w-96 bg-white rounded-3xl shadow-2xl border border-gray-150 z-50 overflow-hidden animate-fadeIn">
          {/* Header */}
          <div className="p-4 bg-gray-50/80 border-b border-gray-150 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-black text-sm text-dark">Notifications</span>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-black">
                  {unreadCount} new
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={() => markAllAsRead(userEmail, isAdmin)}
                className="text-[11px] font-bold text-gray-500 hover:text-primary transition-colors flex items-center gap-1"
                title="Mark all as read"
              >
                <FiCheck size={12} /> Mark all read
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-gray-100">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-400">
                <FiBell size={32} className="mx-auto mb-2 text-gray-300" />
                <p className="text-xs font-semibold">No notifications yet</p>
                <p className="text-[10px] text-gray-400 mt-0.5">
                  Order updates & notifications will appear here
                </p>
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => handleNotificationClick(notif)}
                  className={`p-3.5 sm:p-4 hover:bg-gray-50 transition-colors cursor-pointer flex items-start gap-3 relative ${
                    !notif.read ? 'bg-primary/5' : ''
                  }`}
                >
                  {/* Icon */}
                  {getIcon(notif.type)}

                  {/* Text Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <h4
                        className={`text-xs sm:text-sm font-bold truncate ${
                          !notif.read ? 'text-dark' : 'text-gray-700'
                        }`}
                      >
                        {notif.title}
                      </h4>
                      {!notif.read && (
                        <span className="w-2 h-2 rounded-full bg-primary shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                      {notif.message}
                    </p>
                    <span className="text-[10px] text-gray-400 mt-1 block">
                      {formatTimeAgo(notif.createdAt)}
                    </span>
                  </div>

                  {/* Quick Delete */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteNotification(notif.id);
                    }}
                    className="text-gray-300 hover:text-gray-500 p-1"
                    title="Remove"
                  >
                    <FiX size={12} />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-3 bg-gray-50 border-t border-gray-150 text-center">
            {isAdmin ? (
              <Link
                to="/admin/orders"
                onClick={() => setOpen(false)}
                className="text-xs font-bold text-primary hover:underline block"
              >
                Go to Admin Orders Control →
              </Link>
            ) : (
              <Link
                to="/profile?tab=orders"
                onClick={() => setOpen(false)}
                className="text-xs font-bold text-primary hover:underline block"
              >
                View My Orders History →
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

