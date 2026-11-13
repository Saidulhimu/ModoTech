import { useEffect, useState } from 'react';
import {
  FiCheckCircle,
  FiClock,
  FiPackage,
  FiTruck,
  FiPrinter,
  FiPhone,
  FiMapPin,
  FiFileText,
} from 'react-icons/fi';
import { formatBDT } from '../../lib/format';
import api from '../../lib/axios';
import orderService from '../../services/orderService';
import { useNotificationStore } from '../../store/notificationStore';
import InvoiceModal from '../../components/InvoiceModal';
import toast from 'react-hot-toast';

const statusOptions = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
const statusColors = {
  Pending: 'bg-amber-100 text-amber-800 border-amber-200',
  Processing: 'bg-blue-100 text-blue-800 border-blue-200',
  Shipped: 'bg-purple-100 text-purple-800 border-purple-200',
  Delivered: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  Cancelled: 'bg-rose-100 text-rose-800 border-rose-200',
};

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  const fetchOrders = async () => {
    try {
      const data = await orderService.getAllOrders();
      setOrders(Array.isArray(data) ? data : []);
    } catch {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (order, newStatus) => {
    const orderId = order._id;
    setUpdating(orderId);
    try {
      await orderService.updateOrderStatus(orderId, newStatus);
      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? { ...o, orderStatus: newStatus } : o))
      );

      const orderShortId = String(order._id || '').slice(-6).toUpperCase();
      const customerEmail = order.user?.email || null;
      const customerName = order.shippingAddress?.fullName || order.user?.name || 'Customer';

      // If status changed to Processing or Shipped, send Step 2 notification to user
      if (newStatus === 'Processing' || newStatus === 'Shipped') {
        useNotificationStore.getState().addNotification({
          targetRole: 'user',
          targetUserEmail: customerEmail,
          title: `Order #${orderShortId} Accepted by Admin`,
          message: `Great news, ${customerName}! Admin has confirmed and accepted your order. Package is being prepared for dispatch!`,
          type: 'order_accepted',
          orderId: order._id,
          link: `/track-order?orderId=${order._id}`,
          showToast: true,
        });

        toast.success(`Order #${orderShortId} accepted! Notification sent to customer.`, {
          style: { borderRadius: '12px' },
        });
      } else {
        toast.success(`Order #${orderShortId} status updated to ${newStatus}`, {
          style: { borderRadius: '12px' },
        });
      }
    } catch {
      toast.error('Failed to update status.');
    } finally {
      setUpdating(null);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-dark tracking-tight">Orders Management</h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Review customer orders, accept pending requests, and dispatch notifications
          </p>
        </div>
        <span className="self-start sm:self-center px-4 py-1.5 rounded-full bg-primary/10 text-primary font-bold text-xs">
          {orders.length} Total Orders
        </span>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-150 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-gray-50/80 text-[11px] font-bold text-gray-400 uppercase tracking-wider border-b border-gray-150">
              <tr>
                <th className="px-6 py-4">Order ID</th>
                <th className="px-6 py-4">Customer & Contact</th>
                <th className="px-6 py-4">Items</th>
                <th className="px-6 py-4">Total</th>
                <th className="px-6 py-4">Area & Notes</th>
                <th className="px-6 py-4">Status & Action</th>
                <th className="px-6 py-4 text-right">Invoice</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                [...Array(4)].map((_, i) => (
                  <tr key={i}>
                    <td colSpan={7} className="px-6 py-6">
                      <div className="h-4 bg-gray-100 rounded animate-pulse" />
                    </td>
                  </tr>
                ))
              ) : orders.map((order) => {
                const isPending = order.orderStatus === 'Pending';
                return (
                  <tr key={order._id} className="hover:bg-gray-50/60 transition-colors">
                    {/* Order ID */}
                    <td className="px-6 py-4 font-mono font-bold text-dark text-xs">
                      #{String(order._id).slice(-8).toUpperCase()}
                      <span className="text-[10px] text-gray-400 block font-normal mt-0.5">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </span>
                    </td>

                    {/* Customer Info */}
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-bold text-dark text-sm">
                          {order.shippingAddress?.fullName || order.user?.name || 'Customer'}
                        </p>
                        {order.shippingAddress?.phone && (
                          <p className="text-xs text-gray-500 flex items-center gap-1 font-mono mt-0.5">
                            <FiPhone size={11} className="text-gray-400" />
                            {order.shippingAddress.phone}
                          </p>
                        )}
                        <p className="text-[11px] text-gray-400 truncate max-w-[150px]">
                          {order.user?.email}
                        </p>
                      </div>
                    </td>

                    {/* Items */}
                    <td className="px-6 py-4 text-xs font-semibold text-gray-600">
                      {order.orderItems?.length || 0} item(s)
                      <span className="text-[10px] text-gray-400 block truncate max-w-[140px]">
                        {order.orderItems?.[0]?.name}
                      </span>
                    </td>

                    {/* Total Price */}
                    <td className="px-6 py-4 font-black text-dark text-sm">
                      {formatBDT(order.totalPrice)}
                    </td>

                    {/* Area & Delivery Notes */}
                    <td className="px-6 py-4">
                      <span className="inline-block px-2 py-0.5 rounded-md bg-gray-100 text-gray-600 text-[10px] font-bold">
                        {order.deliveryArea === 'outside_dhaka' ? 'Outside Dhaka' : 'Inside Dhaka'}
                      </span>
                      {order.deliveryNote && (
                        <p
                          className="text-[11px] text-amber-700 italic truncate max-w-[130px] mt-1"
                          title={order.deliveryNote}
                        >
                          "{order.deliveryNote}"
                        </p>
                      )}
                    </td>

                    {/* Status & Accept Order Button */}
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-2">
                        {/* Quick Accept Button for Pending Orders */}
                        {isPending && (
                          <button
                            type="button"
                            disabled={updating === order._id}
                            onClick={() => handleStatusChange(order, 'Processing')}
                            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
                            title="Accept order and notify customer"
                          >
                            <FiCheckCircle size={13} />
                            <span>Accept Order</span>
                          </button>
                        )}

                        {/* Status Dropdown */}
                        <select
                          value={order.orderStatus}
                          disabled={updating === order._id}
                          onChange={(e) => handleStatusChange(order, e.target.value)}
                          className={`text-xs font-bold px-2.5 py-1 rounded-xl border cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/20 ${statusColors[order.orderStatus] || 'bg-gray-100 text-gray-700'
                            }`}
                        >
                          {statusOptions.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                      </div>
                    </td>

                    {/* Invoice View Button */}
                    <td className="px-6 py-4 text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedInvoice(order)}
                        className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-dark transition-colors inline-flex items-center gap-1 text-xs font-bold"
                        title="View & Print Official Cash Memo"
                      >
                        <FiPrinter size={14} className="text-primary" />
                        <span className="hidden sm:inline">Memo</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {!loading && orders.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <FiPackage size={40} className="mx-auto mb-2 text-gray-300" />
            <p className="text-sm font-bold text-dark">No orders found</p>
            <p className="text-xs text-gray-400 mt-0.5">
              When customers place an order, it will appear here for your approval.
            </p>
          </div>
        )}
      </div>

      {/* Cash Memo / Invoice Modal */}
      {selectedInvoice && (
        <InvoiceModal
          order={selectedInvoice}
          onClose={() => setSelectedInvoice(null)}
        />
      )}
    </div>
  );
}
