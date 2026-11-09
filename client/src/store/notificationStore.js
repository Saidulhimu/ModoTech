import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import toast from 'react-hot-toast';

export const useNotificationStore = create(
  persist(
    (set, get) => ({
      notifications: [
        // Welcome notification
        {
          id: 'notif_welcome',
          targetRole: 'all',
          targetUserEmail: null,
          title: 'Welcome to ModoTech! ⚡',
          message: 'Explore genuine audio, chargers, mechanical keyboards and gadgets with official 1-year warranty.',
          type: 'system',
          orderId: null,
          link: '/shop',
          createdAt: new Date().toISOString(),
          read: false,
        },
      ],

      // Add a new notification
      addNotification: ({
        targetRole = 'all', // 'all' | 'admin' | 'user'
        targetUserEmail = null,
        title,
        message,
        type = 'system', // 'order_placed' | 'order_accepted' | 'order_shipped' | 'system'
        orderId = null,
        link = '/profile?tab=orders',
        showToast = false,
      }) => {
        const newNotif = {
          id: `notif_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
          targetRole,
          targetUserEmail: targetUserEmail ? targetUserEmail.toLowerCase() : null,
          title,
          message,
          type,
          orderId,
          link,
          createdAt: new Date().toISOString(),
          read: false,
        };

        set({ notifications: [newNotif, ...get().notifications] });

        if (showToast) {
          toast(title, {
            icon: type === 'order_accepted' ? '🚀' : type === 'order_placed' ? '📦' : '🔔',
            style: { borderRadius: '14px', fontSize: '13px', fontWeight: 'bold' },
          });
        }

        return newNotif;
      },

      // Mark single notification as read
      markAsRead: (id) => {
        set({
          notifications: get().notifications.map((n) =>
            n.id === id ? { ...n, read: true } : n
          ),
        });
      },

      // Mark all relevant notifications as read
      markAllAsRead: (userEmail, isAdmin) => {
        const cleanEmail = (userEmail || '').toLowerCase();
        set({
          notifications: get().notifications.map((n) => {
            const isTarget =
              n.targetRole === 'all' ||
              (isAdmin && n.targetRole === 'admin') ||
              (cleanEmail && n.targetUserEmail === cleanEmail);

            return isTarget ? { ...n, read: true } : n;
          }),
        });
        toast.success('All notifications marked as read', {
          style: { borderRadius: '12px', fontSize: '12px' },
        });
      },

      // Delete / Clear a notification
      deleteNotification: (id) => {
        set({
          notifications: get().notifications.filter((n) => n.id !== id),
        });
      },

      // Get count of unread notifications for current user/admin
      getUnreadCount: (userEmail, isAdmin) => {
        const cleanEmail = (userEmail || '').toLowerCase();
        return get().notifications.filter((n) => {
          if (n.read) return false;
          if (isAdmin && n.targetRole === 'admin') return true;
          if (cleanEmail && n.targetUserEmail === cleanEmail) return true;
          if (n.targetRole === 'all' || n.targetRole === 'user') return true;
          return false;
        }).length;
      },

      // Get list of notifications for current user/admin
      getUserNotifications: (userEmail, isAdmin) => {
        const cleanEmail = (userEmail || '').toLowerCase();
        return get().notifications.filter((n) => {
          if (isAdmin) {
            // Admin sees admin notifications, their own user notifications, and broadcast notifications
            return (
              n.targetRole === 'admin' ||
              n.targetRole === 'all' ||
              (cleanEmail && n.targetUserEmail === cleanEmail)
            );
          }
          // Regular user sees notifications meant for their email or general user broadcasts
          return (
            n.targetRole === 'all' ||
            (n.targetRole === 'user' && !n.targetUserEmail) ||
            (cleanEmail && n.targetUserEmail === cleanEmail)
          );
        });
      },
    }),
    {
      name: 'modotech-notifications',
    }
  )
);

