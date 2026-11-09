import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiShoppingBag, FiUsers, FiDollarSign, FiTrendingUp, FiPackage, FiArrowRight } from 'react-icons/fi';
import { formatBDT } from '../../lib/format';
import api from '../../lib/axios';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ orders: [], products: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [ordersRes, productsRes] = await Promise.all([
          api.get('/orders'),
          api.get('/products?limit=1'),
        ]);
        setStats({
          orders: ordersRes.data,
          products: productsRes.data.total || 0,
        });
      } catch {
        setStats({ orders: [], products: 0 });
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const totalRevenue = stats.orders.reduce((acc, o) => acc + o.totalPrice, 0);
  const pendingOrders = stats.orders.filter((o) => o.orderStatus === 'Pending').length;
  const deliveredOrders = stats.orders.filter((o) => o.orderStatus === 'Delivered').length;

  const statCards = [
    { label: 'Total Revenue', value: formatBDT(totalRevenue), icon: <FiDollarSign size={24} />, color: 'bg-green-50 text-green-600' },
    { label: 'Total Orders', value: stats.orders.length, icon: <FiShoppingBag size={24} />, color: 'bg-blue-50 text-blue-600' },
    { label: 'Pending Orders', value: pendingOrders, icon: <FiPackage size={24} />, color: 'bg-yellow-50 text-yellow-600' },
    { label: 'Products', value: stats.products, icon: <FiTrendingUp size={24} />, color: 'bg-purple-50 text-purple-600' },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-black">Dashboard</h1>
        <Link to="/admin/products/add" className="btn-primary">
          + Add Product
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
        {statCards.map((card) => (
          <div key={card.label} className="bg-white rounded-2xl p-6 shadow-sm">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${card.color} mb-4`}>
              {card.icon}
            </div>
            <div className="text-2xl font-black text-dark mb-1">
              {loading ? <div className="h-7 bg-gray-200 rounded w-20 animate-pulse" /> : card.value}
            </div>
            <div className="text-sm text-gray-500">{card.label}</div>
          </div>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="font-bold text-lg">Recent Orders</h2>
          <Link to="/admin/orders" className="text-primary text-sm font-semibold flex items-center gap-1">
            View All <FiArrowRight size={14} />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              <tr>
                <th className="text-left px-6 py-4">Order ID</th>
                <th className="text-left px-6 py-4">Customer</th>
                <th className="text-left px-6 py-4">Amount</th>
                <th className="text-left px-6 py-4">Status</th>
                <th className="text-left px-6 py-4">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}><td colSpan={5} className="px-6 py-4"><div className="h-4 bg-gray-100 rounded animate-pulse" /></td></tr>
                ))
              ) : stats.orders.slice(0, 10).map((order) => (
                <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-mono text-xs text-gray-500">#{order._id.slice(-8).toUpperCase()}</td>
                  <td className="px-6 py-4 text-sm font-medium">{order.user?.name || 'N/A'}</td>
                  <td className="px-6 py-4 font-bold">{formatBDT(order.totalPrice)}</td>
                  <td className="px-6 py-4">
                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${{
                        Pending: 'bg-yellow-100 text-yellow-700', Processing: 'bg-blue-100 text-blue-700',
                        Shipped: 'bg-purple-100 text-purple-700', Delivered: 'bg-green-100 text-green-700',
                        Cancelled: 'bg-red-100 text-red-700'
                      }[order.orderStatus]
                      }`}>
                      {order.orderStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

