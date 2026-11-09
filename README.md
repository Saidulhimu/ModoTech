# 🚀 ModoTech E-Commerce Platform

A production-ready, ultra-smooth Full-Stack MERN e-commerce platform engineered for modern tech gadgets and accessories, with Firebase Google Authentication, BDT (৳) currency pricing, and zero-latency Cache-First rendering.

---

## 🏗️ Clean Project Architecture

```
ModoTech/
├── client/                     # Vite + React 18 Frontend
│   ├── src/
│   │   ├── components/         # Modular Reusable UI Components
│   │   │   ├── common/         # ErrorBoundary, SectionHeader, etc.
│   │   │   ├── HeroSlider.jsx  # Dynamic hero banner with color transitions
│   │   │   ├── CategoryGrid.jsx
│   │   │   ├── TrustBadges.jsx # Floating luxury trust badges
│   │   │   ├── PromoBanner.jsx # Split promotion showcase
│   │   │   ├── ProductCard.jsx # Optimized product card with sale capsule
│   │   │   ├── Navbar.jsx      # Dynamic transparent-to-solid header
│   │   │   └── Footer.jsx      # Minimal 3-column footer
│   │   ├── config/             # Centralized App Configurations
│   │   │   └── appConfig.js    # Env constants, currency defaults (৳)
│   │   ├── data/               # Static dataset for fallback & seeding
│   │   │   └── demoProducts.js # 28 authentic tech products
│   │   ├── hooks/              # Custom React Hooks
│   │   │   └── useProducts.js  # Cache-first product fetcher
│   │   ├── lib/                # Third-party wrappers & helpers
│   │   │   ├── axios.js        # Axios instance with auth interceptor
│   │   │   ├── firebase.js     # Firebase Auth (Google Popup)
│   │   │   └── format.js       # BDT currency formatter (৳)
│   │   ├── pages/              # Routed View Components
│   │   │   ├── Home.jsx        # Instant zero-stutter home view
│   │   │   ├── Shop.jsx        # Instant filterable catalog
│   │   │   ├── ProductDetail.jsx
│   │   │   ├── Cart.jsx
│   │   │   ├── Checkout.jsx
│   │   │   ├── TrackOrder.jsx
│   │   │   ├── Profile.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   └── admin/          # Admin Dashboard & Inventory
│   │   ├── services/           # Business Logic & API Layer
│   │   │   ├── apiClient.js    # Centralized HTTP Client
│   │   │   ├── productService.js
│   │   │   ├── orderService.js
│   │   │   └── authService.js
│   │   └── store/              # Zustand State Management
│   │       ├── authStore.js    # JWT & User profile persistence
│   │       ├── cartStore.js    # Cart items, qty & subtotal calculation
│   │       └── wishlistStore.js
├── server/                     # Node.js + Express REST API
│   ├── config/
│   │   └── db.js               # MongoDB connection with zero-latency in-memory fallback
│   ├── controllers/            # Separated Business Logic
│   │   ├── productController.js
│   │   ├── orderController.js
│   │   └── authController.js
│   ├── middleware/             # Security & Error Middlewares
│   │   ├── verifyToken.js
│   │   ├── verifyAdmin.js
│   │   └── errorHandler.js    # Centralized Error & 404 handler
│   ├── models/                 # Mongoose Data Schemas
│   │   ├── User.js
│   │   ├── Product.js
│   │   └── Order.js
│   ├── routes/                 # Express REST Endpoints
│   │   ├── auth.js
│   │   ├── products.js
│   │   ├── orders.js
│   │   └── upload.js
│   ├── seedData.js             # Initial catalog seed data
│   └── index.js                # Express Server entry point
```

---

## ⚡ Performance Optimizations

1. **Zero-Lag Cache-First Rendering:** Home and Shop pages initialize immediately from local state/cache and background-sync with the API. Users never encounter blank screen loading stalls or layout shifts.
2. **Resilient In-Memory Fallback:** If local MongoDB is offline, the backend automatically serves the full 28-product catalog from an in-memory data store in `< 1ms`, preventing 30-second connection timeouts.
3. **Optimized BDT (৳) Currency:** Formatted uniformly via `formatBDT()` helper with comma-separation (e.g., `৳37,500`).
4. **Official Firebase Auth:** Google OAuth popup authentication with backend JWT synchronization.
5. **Centralized Error Boundaries:** React `ErrorBoundary` and Express `errorHandler` capture all anomalies gracefully.

---

## 🚀 Running Locally

```bash
# Start Backend (Port 5001)
cd server
npm start

# Start Frontend (Port 5173)
cd client
npm run dev
```
- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:5001/api`
- Health Check: `http://localhost:5001/api/health`
