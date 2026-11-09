/**
 * ModoTech Application Centralized Configuration
 * Manages environment variables and global defaults.
 */
export const APP_CONFIG = {
  APP_NAME: 'ModoTech',
  API_BASE_URL: import.meta.env.VITE_API_URL || '/api',
  CURRENCY: {
    SYMBOL: '৳',
    CODE: 'BDT',
    NAME: 'Bangladeshi Taka',
    FREE_SHIPPING_THRESHOLD: 2000,
    DEFAULT_SHIPPING_FEE: 120,
  },
  FIREBASE: {
    API_KEY: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyADjPF6gkAJR9L9zRDtSfR1yqAP4wl3iGw',
    AUTH_DOMAIN: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'modotech.firebaseapp.com',
    PROJECT_ID: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'modotech',
    STORAGE_BUCKET: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'modotech.firebasestorage.app',
    MESSAGING_SENDER_ID: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '874884690438',
    APP_ID: import.meta.env.VITE_FIREBASE_APP_ID || '1:874884690438:web:3e57be40833f1d5bd6c987',
    MEASUREMENT_ID: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || 'G-Z7K42X2L27',
  },
  PAGINATION: {
    DEFAULT_PAGE_SIZE: 12,
  },
};

export default APP_CONFIG;

