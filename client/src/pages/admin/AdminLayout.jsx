import { NavLink, Outlet, Link } from 'react-router-dom';
import { FiGrid, FiPackage, FiShoppingBag, FiLogOut, FiPlusCircle, FiHome } from 'react-icons/fi';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';

const navItems = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: <FiGrid size={18} /> },
  { to: '/admin/products', label: 'Products', icon: <FiPackage size={18} /> },
  { to: '/admin/products/add', label: 'Add Product', icon: <FiPlusCircle size={18} /> },
  { to: '/admin/orders', label: 'Orders', icon: <FiShoppingBag size={18} /> },
];

export default function AdminLayout() {
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    toast.success('Logged out!');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-dark text-white flex flex-col fixed top-0 left-0 h-full z-40">
        {/* Logo */}
        <div className="p-6 border-b border-white/10">
          <Link to="/" className="inline-block">
            <span className="text-xl font-black">Modo<span className="text-primary">Tech</span></span>
          </Link>
          <div className="mt-4 flex items-center gap-3">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-xs font-bold">
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-semibold">{user?.name}</p>
              <p className="text-xs text-gray-400">Administrator</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/admin/dashboard'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                  isActive ? 'bg-primary text-white' : 'text-gray-400 hover:text-white hover:bg-white/10'
                }`
              }
            >
              {item.icon} {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 space-y-1">
          <Link to="/" className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-gray-400 hover:text-white hover:bg-white/10 transition-all">
            <FiHome size={18} /> View Store
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
          >
            <FiLogOut size={18} /> Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="ml-64 flex-1 p-8 min-h-screen">
        <Outlet />
      </main>
    </div>
  );
}

