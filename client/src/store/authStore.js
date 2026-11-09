import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const isAdminEmail = (email) => {
  const clean = (email || '').trim().toLowerCase();
  return clean === 'saidulhimuu@gmail.com' || clean === 'admin@modotech.com';
};

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      setAuth: (user, token) => {
        const role = isAdminEmail(user?.email) ? 'admin' : (user?.role || 'user');
        const enhancedUser = user ? { ...user, role } : null;
        set({ user: enhancedUser, token, isAuthenticated: true });
      },

      logout: () => {
        set({ user: null, token: null, isAuthenticated: false });
      },

      updateUser: (userData) => {
        const updated = { ...get().user, ...userData };
        if (isAdminEmail(updated.email)) {
          updated.role = 'admin';
        }
        set({ user: updated });
      },
    }),
    {
      name: 'modotech-auth',
    }
  )
);
