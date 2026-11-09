import { useRef } from 'react';
import { FiPrinter, FiDownload, FiX, FiCheckCircle, FiShield, FiPhone, FiMail } from 'react-icons/fi';
import { formatBDT } from '../lib/format';

export default function InvoiceModal({ order, onClose }) {
  const invoiceRef = useRef(null);

  if (!order) return null;

  const invoiceNumber = `INV-${(order._id || '').slice(-8).toUpperCase() || 'MODO2026'}`;
  const orderDate = new Date(order.createdAt || Date.now()).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-dark/70 backdrop-blur-sm flex items-center justify-center p-4">
      {/* Outer Modal Container */}
      <div className="relative bg-white w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden my-8">
        
        {/* Floating Top Control Toolbar (Hidden during print) */}
        <div className="bg-gray-900 text-white px-6 py-4 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
              Official Printable Invoice
            </span>
            <span className="font-mono text-xs bg-white/10 px-2 py-0.5 rounded text-white">
              {invoiceNumber}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-all shadow-md"
            >
              <FiPrinter size={15} />
              <span>Print / Save as PDF</span>
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center bg-white/10 hover:bg-white/20 text-white transition-colors"
              aria-label="Close invoice"
            >
              <FiX size={18} />
            </button>
          </div>
        </div>

        {/* Printable Paper Area */}
        <div ref={invoiceRef} className="p-8 sm:p-10 bg-white text-dark printable-content">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-6 pb-8 border-b-2 border-gray-150">
            <div>
              <div className="flex items-center gap-2.5 mb-2">
                <img src="/logo.svg" alt="ModoTech" className="h-9 w-auto" />
                <span className="text-2xl font-black tracking-tight text-dark">
                  Modo<span className="text-primary">Tech</span>
                </span>
              </div>
              <p className="text-xs text-gray-500 font-medium max-w-xs">
                Premium Tech, Authentic Audio & Smart Gadgets Store
              </p>
              <div className="flex items-center gap-4 text-xs text-gray-400 mt-2">
                <span className="flex items-center gap-1">
                  <FiPhone size={11} /> +880 1800-MODOTECH
                </span>
                <span className="flex items-center gap-1">
                  <FiMail size={11} /> support@modotech.com
                </span>
              </div>
            </div>

            <div className="text-left sm:text-right">
              <span className="inline-block px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 font-black text-xs uppercase tracking-wider border border-emerald-200 mb-2">
                {order.paymentMethod === 'Cash on Delivery' ? 'CASH ON DELIVERY (DUE)' : 'PAID INVOICE'}
              </span>
              <h2 className="text-lg font-black text-dark tracking-tight">CASH MEMO / INVOICE</h2>
              <p className="font-mono text-sm font-bold text-gray-700">{invoiceNumber}</p>
              <p className="text-xs text-gray-500 mt-1">Date: {orderDate}</p>
            </div>
          </div>

          {/* Customer & Shipping Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 py-6 border-b border-gray-150 text-xs">
            <div>
              <h4 className="font-bold text-gray-400 uppercase tracking-wider text-[11px] mb-2">
                Billed & Shipped To:
              </h4>
              <p className="font-bold text-sm text-dark">
                {order.shippingAddress?.fullName || order.user?.name || 'Valued Customer'}
              </p>
              <p className="text-gray-600 mt-0.5">{order.shippingAddress?.street}</p>
              <p className="text-gray-600">
                {order.shippingAddress?.city}{order.shippingAddress?.zip ? ` - ${order.shippingAddress.zip}` : ''}, Bangladesh
              </p>
              {order.shippingAddress?.phone && (
                <p className="text-gray-600 mt-1">Contact: {order.shippingAddress.phone}</p>
              )}
            </div>

            <div className="sm:text-right">
              <h4 className="font-bold text-gray-400 uppercase tracking-wider text-[11px] mb-2">
                Order & Shipping Spec:
              </h4>
              <p className="text-gray-600">
                <strong>Area:</strong>{' '}
                {order.deliveryArea === 'outside_dhaka' ? 'Outside Dhaka (Courier)' : 'Inside Dhaka City (Express)'}
              </p>
              <p className="text-gray-600 mt-0.5">
                <strong>Payment Method:</strong> {order.paymentMethod || 'Cash on Delivery'}
              </p>
              <p className="text-gray-600 mt-0.5">
                <strong>Fulfillment:</strong> {order.orderStatus || 'Pending'}
              </p>
              {order.deliveryNote && (
                <div className="mt-2.5 p-2 bg-amber-50/70 border border-amber-200/80 rounded-lg text-left sm:text-right">
                  <span className="text-[10px] font-bold text-amber-900 block uppercase">
                    Delivery Note:
                  </span>
                  <span className="text-amber-800 text-[11px]">{order.deliveryNote}</span>
                </div>
              )}
            </div>
          </div>

          {/* Itemized Table */}
          <div className="py-6">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b-2 border-gray-200 text-gray-400 uppercase font-black tracking-wider text-[10px]">
                  <th className="pb-3 w-8">#</th>
                  <th className="pb-3">Item Description</th>
                  <th className="pb-3 text-center w-16">Qty</th>
                  <th className="pb-3 text-right w-24">Unit Price</th>
                  <th className="pb-3 text-right w-24">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {order.orderItems?.map((item, idx) => (
                  <tr key={idx} className="py-3">
                    <td className="py-3 text-gray-400 font-mono">{idx + 1}</td>
                    <td className="py-3 pr-2">
                      <div className="font-bold text-dark text-xs sm:text-sm">{item.name}</div>
                      <span className="text-[10px] text-gray-400">1 Year Official Brand Warranty</span>
                    </td>
                    <td className="py-3 text-center font-bold text-gray-700">{item.quantity}</td>
                    <td className="py-3 text-right text-gray-600">{formatBDT(item.price)}</td>
                    <td className="py-3 text-right font-bold text-dark">
                      {formatBDT(item.price * item.quantity)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals & Signature */}
          <div className="pt-4 border-t-2 border-gray-200 flex flex-col sm:flex-row justify-between items-start gap-6 text-xs">
            
            {/* Warranty Assurance & Barcode */}
            <div className="max-w-xs space-y-2">
              <div className="flex items-center gap-1.5 text-emerald-700 font-bold text-xs">
                <FiShield size={14} /> Official 1-Year Hardware Protection Card
              </div>
              <p className="text-[11px] text-gray-400 leading-relaxed">
                Please retain this printed invoice or PDF as your official proof of purchase for manufacturer warranty claims and exchange.
              </p>
              <div className="pt-2 font-mono text-[10px] text-gray-300 tracking-widest uppercase">
                |||||| | |||||||| |||||||||| ||| |||||||
              </div>
            </div>

            {/* Calculations Breakdown */}
            <div className="w-full sm:w-64 space-y-2">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal:</span>
                <span className="font-semibold text-dark">
                  {formatBDT(order.itemsPrice || order.totalPrice - (order.shippingPrice || 0))}
                </span>
              </div>

              {(order.discountPrice > 0 || order.coupon?.discount > 0) && (
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>Coupon Discount:</span>
                  <span>-{formatBDT(order.discountPrice || order.coupon?.discount || 0)}</span>
                </div>
              )}

              <div className="flex justify-between text-gray-600">
                <span>Shipping Fee:</span>
                <span className="font-semibold text-dark">
                  {order.shippingPrice === 0 ? 'FREE' : formatBDT(order.shippingPrice || 0)}
                </span>
              </div>

              <div className="flex justify-between text-base font-black text-dark pt-2 border-t-2 border-gray-300">
                <span>Net Total:</span>
                <span className="text-primary text-lg">{formatBDT(order.totalPrice)}</span>
              </div>
            </div>

          </div>

          {/* Authorized Signature Stamp */}
          <div className="mt-10 pt-6 border-t border-gray-150 flex justify-between items-end text-[11px] text-gray-400">
            <div>
              <p>ModoTech E-Commerce BD Ltd.</p>
              <p>Road 11, Banani, Dhaka-1213, Bangladesh</p>
            </div>
            <div className="text-right">
              <div className="w-36 border-b border-gray-300 mb-1 inline-block" />
              <p className="font-bold text-gray-600">Authorized Signature</p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}

