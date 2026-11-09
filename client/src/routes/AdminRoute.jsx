import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore, isAdminEmail } from '../store/authStore';

const AdminRoute = () => {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  const isAdmin = user?.role === 'admin' || isAdminEmail(user?.email);
  if (!isAdmin) return <Navigate to="/" replace />;

  return <Outlet />;
};

export default AdminRoute;

