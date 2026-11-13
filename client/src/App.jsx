import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import ErrorBoundary from './components/common/ErrorBoundary';

// Layout
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';
import CartDrawer from './components/CartDrawer';
import WhatsAppWidget from './components/WhatsAppWidget';

// Critical Direct Route (Instant Initial Paint)
import Home from './pages/Home';

// Lazy Loaded Routes for High Performance Code-Splitting
const Shop = lazy(() => import('./pages/Shop'));
const ProductDetail = lazy(() => import('./pages/ProductDetail'));
const Cart = lazy(() => import('./pages/Cart'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const TrackOrder = lazy(() => import('./pages/TrackOrder'));

// Protected Routes
const Checkout = lazy(() => import('./pages/Checkout'));
const Profile = lazy(() => import('./pages/Profile'));
const Wishlist = lazy(() => import('./pages/Wishlist'));

// Admin Routes
const AdminLayout = lazy(() => import('./pages/admin/AdminLayout'));
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'));
const AdminProducts = lazy(() => import('./pages/admin/Products'));
const AddProduct = lazy(() => import('./pages/admin/AddProduct'));
const AdminOrders = lazy(() => import('./pages/admin/Orders'));

// Route Guards
import ProtectedRoute from './routes/ProtectedRoute';
import AdminRoute from './routes/AdminRoute';

// Minimalist Page Loader
function PageLoading() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="w-8 h-8 border-3 border-gray-200 border-t-primary rounded-full animate-spin" />
    </div>
  );
}

// Main layout wrapper (Navbar + Footer)
function MainLayout({ children, transparent }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar transparent={transparent} />
      <main className="flex-1">
        <Suspense fallback={<PageLoading />}>
          {children}
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <ScrollToTop />
        <CartDrawer />
        <WhatsAppWidget />
        <Toaster position="top-right" />
        <Routes>
          {/* Public Routes */}
          <Route
            path="/"
            element={
              <MainLayout transparent={true}>
                <Home />
              </MainLayout>
            }
          />
          <Route
            path="/shop"
            element={
              <MainLayout>
                <Shop />
              </MainLayout>
            }
          />
          <Route
            path="/product/:id"
            element={
              <MainLayout>
                <ProductDetail />
              </MainLayout>
            }
          />
          <Route
            path="/cart"
            element={
              <MainLayout>
                <Cart />
              </MainLayout>
            }
          />
          <Route
            path="/track-order"
            element={
              <MainLayout>
                <TrackOrder />
              </MainLayout>
            }
          />
          <Route
            path="/login"
            element={
              <Suspense fallback={<PageLoading />}>
                <Login />
              </Suspense>
            }
          />
          <Route
            path="/register"
            element={
              <Suspense fallback={<PageLoading />}>
                <Register />
              </Suspense>
            }
          />

          {/* Protected Routes (User) */}
          <Route element={<ProtectedRoute />}>
            <Route
              path="/checkout"
              element={
                <MainLayout>
                  <Checkout />
                </MainLayout>
              }
            />
            <Route
              path="/profile"
              element={
                <MainLayout>
                  <Profile />
                </MainLayout>
              }
            />
            <Route
              path="/wishlist"
              element={
                <MainLayout>
                  <Wishlist />
                </MainLayout>
              }
            />
          </Route>

          {/* Admin Routes */}
          <Route element={<AdminRoute />}>
            <Route
              path="/admin"
              element={
                <Suspense fallback={<PageLoading />}>
                  <AdminLayout />
                </Suspense>
              }
            >
              <Route index element={<AdminDashboard />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="products" element={<AdminProducts />} />
              <Route path="products/add" element={<AddProduct />} />
              <Route path="products/edit/:id" element={<AddProduct />} />
              <Route path="orders" element={<AdminOrders />} />
            </Route>
          </Route>

          {/* 404 */}
          <Route
            path="*"
            element={
              <MainLayout>
                <div className="pt-28 pb-20 min-h-screen flex flex-col items-center justify-center text-center">
                  <p className="text-8xl font-black text-gray-100">404</p>
                  <h2 className="text-2xl font-bold text-dark mt-4 mb-2">Page not found</h2>
                  <p className="text-gray-500 mb-8">The page you're looking for doesn't exist.</p>
                  <a href="/" className="btn-primary">Go Home</a>
                </div>
              </MainLayout>
            }
          />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
