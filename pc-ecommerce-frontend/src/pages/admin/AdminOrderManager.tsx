import React, { useState, useEffect, useMemo } from 'react';
import api from '../../services/api';
import {
  ShoppingCart,
  Search,
  CheckCircle2,
  Clock,
  Truck,
  AlertCircle,
  Eye,
  Printer,
  DollarSign,
  X,
  Check,
  PackageCheck,
  Ban,
  Filter,
  CreditCard,
  Building2,
  Trash2,
  Download,
  Calendar,
} from 'lucide-react';

interface OrderItem {
  product: string;
  name: string;
  image: string;
  price: number;
  qty: number;
}

interface Order {
  _id: string;
  user?: {
    _id: string;
    name: string;
    email: string;
  };
  orderItems: OrderItem[];
  shippingAddress: {
    fullName: string;
    phone: string;
    address: string;
    city: string;
    note?: string;
  };
  paymentMethod: string;
  itemsPrice: number;
  discountPrice: number;
  totalPrice: number;
  isPaid: boolean;
  paidAt?: string;
  status: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  createdAt: string;
}

export const AdminOrderManager: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [paymentFilter, setPaymentFilter] = useState<string>('ALL');
  const [dateFilter, setDateFilter] = useState<string>('ALL');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await api.get<Order[]>('/orders');
      setOrders(res.data || []);
    } catch (err) {
      console.error('Failed to load orders:', err);
      showToast('Failed to fetch orders ledger.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleUpdateStatus = async (orderId: string, newStatus: Order['status']) => {
    try {
      const res = await api.put<Order>(`/orders/${orderId}/status`, { status: newStatus });
      setOrders((prev) => prev.map((o) => (o._id === orderId ? res.data : o)));
      if (selectedOrder?._id === orderId) {
        setSelectedOrder(res.data);
      }
      showToast(`Order status updated to ${newStatus}.`);
    } catch (err) {
      console.error('Failed to update status:', err);
      showToast('Status update failed.');
    }
  };

  const handleTogglePayment = async (orderId: string, currentPaidState: boolean) => {
    try {
      const res = await api.put<Order>(`/orders/${orderId}/pay`, { isPaid: !currentPaidState });
      setOrders((prev) => prev.map((o) => (o._id === orderId ? res.data : o)));
      if (selectedOrder?._id === orderId) {
        setSelectedOrder(res.data);
      }
      showToast(!currentPaidState ? 'Payment confirmed and verified.' : 'Payment reverted to Unsettled.');
    } catch (err) {
      console.error('Failed to update payment:', err);
      showToast('Payment verification failed.');
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    if (!window.confirm('Permanently delete this order record? This cannot be undone.')) return;

    try {
      await api.delete(`/orders/${orderId}`);
      setOrders((prev) => prev.filter((o) => o._id !== orderId));
      if (selectedOrder?._id === orderId) {
        setSelectedOrder(null);
      }
      showToast('Order record removed.');
    } catch (err) {
      console.error('Failed to delete order:', err);
      showToast('Failed to remove order.');
    }
  };

  // Filtered list by query, status, payment, and date
  const filteredOrders = useMemo(() => {
    const now = new Date();

    return orders.filter((o) => {
      const matchesSearch =
        o._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.shippingAddress?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.shippingAddress?.phone?.includes(searchTerm);

      const matchesStatus = statusFilter === 'ALL' || o.status === statusFilter;
      const matchesPayment =
        paymentFilter === 'ALL' ||
        (paymentFilter === 'PAID' && o.isPaid) ||
        (paymentFilter === 'UNPAID' && !o.isPaid);

      let matchesDate = true;
      const orderDate = new Date(o.createdAt);
      if (dateFilter === 'TODAY') {
        matchesDate = orderDate.toDateString() === now.toDateString();
      } else if (dateFilter === '7DAYS') {
        const diffDays = (now.getTime() - orderDate.getTime()) / (1000 * 3600 * 24);
        matchesDate = diffDays <= 7;
      } else if (dateFilter === 'MONTH') {
        matchesDate =
          orderDate.getMonth() === now.getMonth() &&
          orderDate.getFullYear() === now.getFullYear();
      }

      return matchesSearch && matchesStatus && matchesPayment && matchesDate;
    });
  }, [orders, searchTerm, statusFilter, paymentFilter, dateFilter]);

  // Metrics
  const metrics = useMemo(() => {
    const totalOrders = filteredOrders.length;
    const totalRevenue = filteredOrders
      .filter((o) => o.isPaid)
      .reduce((sum, o) => sum + (o.totalPrice || 0), 0);
    const pendingOrders = filteredOrders.filter((o) => o.status === 'Pending').length;
    const pendingTransfers = filteredOrders.filter((o) => !o.isPaid && o.paymentMethod === 'Bank Transfer').length;

    return { totalOrders, totalRevenue, pendingOrders, pendingTransfers };
  }, [filteredOrders]);

  // Export filtered orders to CSV
  const handleExportCSV = () => {
    if (filteredOrders.length === 0) {
      showToast('No orders matching current criteria to export.');
      return;
    }

    const headers = [
      'Order ID',
      'Created Date',
      'Customer Name',
      'Phone',
      'Delivery Address',
      'City',
      'Purchased Items',
      'Subtotal (USD)',
      'Discount (USD)',
      'Total Price (USD)',
      'Payment Gateway',
      'Payment Status',
      'Logistics Status',
    ];

    const rows = filteredOrders.map((o) => {
      const itemsString = o.orderItems
        ?.map((item) => `${item.name} (x${item.qty})`)
        .join('; ')
        .replace(/"/g, '""');

      const cleanAddress = (o.shippingAddress?.address || '').replace(/"/g, '""');
      const cleanName = (o.shippingAddress?.fullName || 'Anonymous').replace(/"/g, '""');

      return [
        `"${o._id}"`,
        `"${new Date(o.createdAt).toLocaleString('en-US')}"`,
        `"${cleanName}"`,
        `"${o.shippingAddress?.phone || ''}"`,
        `"${cleanAddress}"`,
        `"${o.shippingAddress?.city || ''}"`,
        `"${itemsString}"`,
        o.itemsPrice,
        o.discountPrice,
        o.totalPrice,
        `"${o.paymentMethod}"`,
        `"${o.isPaid ? 'PAID' : 'UNPAID'}"`,
        `"${o.status}"`,
      ].join(',');
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `GearStore_Orders_Ledger_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`Exported ${filteredOrders.length} order records to CSV.`);
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="toast toast-top toast-end z-50">
          <div className="alert alert-success shadow-xl rounded-2xl text-xs font-bold text-white">
            <Check className="w-4 h-4" /> {toastMessage}
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-base-content/10 pb-5">
        <div>
          <span className="badge badge-primary badge-xs font-bold uppercase text-[9px] mb-1">
            Operations & Fulfillment
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-base-content flex items-center gap-2">
            <ShoppingCart className="w-6 h-6 text-primary" /> Customer Orders & Settlement
          </h1>
          <p className="text-xs text-base-content/60 mt-0.5">
            Audit hardware invoices, verify VietQR bank settlements, and track parcel logistics.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="btn btn-primary btn-xs rounded-xl font-bold gap-1.5 shadow-sm"
          >
            <Download className="w-3.5 h-3.5" /> Export CSV
          </button>
          <button
            onClick={fetchOrders}
            className="btn btn-ghost btn-xs rounded-xl border border-base-content/15 font-bold"
          >
            Refresh Ledger
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-base-200 border border-base-content/10 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-base-content/50 uppercase block">Total Bookings</span>
            <span className="text-xl font-black text-base-content font-mono">{metrics.totalOrders} Orders</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
            <ShoppingCart className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 bg-base-200 border border-base-content/10 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-base-content/50 uppercase block">Settled Revenue</span>
            <span className="text-xl font-black text-success font-mono">${metrics.totalRevenue}</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-success/10 text-success flex items-center justify-center font-bold">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 bg-base-200 border border-base-content/10 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-base-content/50 uppercase block">Pending Dispatch</span>
            <span className="text-xl font-black text-warning font-mono">{metrics.pendingOrders} Queued</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-warning/10 text-warning flex items-center justify-center font-bold">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 bg-base-200 border border-base-content/10 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-base-content/50 uppercase block">Unverified VietQR</span>
            <span className="text-xl font-black text-error font-mono">{metrics.pendingTransfers} Transfers</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-error/10 text-error flex items-center justify-center font-bold">
            <Building2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3 bg-base-200 p-3 rounded-2xl border border-base-content/10">
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-base-content/40" />
          <input
            type="text"
            placeholder="Search ID, recipient, phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input input-bordered input-sm rounded-xl w-full pl-9 text-xs bg-base-100 font-mono"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap w-full md:w-auto">
          {/* Date Filter */}
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="select select-bordered select-xs rounded-xl text-xs bg-base-100"
          >
            <option value="ALL">All Dates</option>
            <option value="TODAY">Today Only</option>
            <option value="7DAYS">Past 7 Days</option>
            <option value="MONTH">This Month</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="select select-bordered select-xs rounded-xl text-xs bg-base-100"
          >
            <option value="ALL">All Logistics</option>
            <option value="Pending">Pending</option>
            <option value="Processing">Processing</option>
            <option value="Shipped">Shipped</option>
            <option value="Delivered">Delivered</option>
            <option value="Cancelled">Cancelled</option>
          </select>

          {/* Payment Filter */}
          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="select select-bordered select-xs rounded-xl text-xs bg-base-100"
          >
            <option value="ALL">All Settlement</option>
            <option value="PAID">Paid / Cleared</option>
            <option value="UNPAID">Unsettled</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      {loading ? (
        <div className="py-24 text-center">
          <span className="loading loading-spinner loading-lg text-primary"></span>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="py-20 text-center space-y-2 bg-base-200/50 rounded-3xl border border-dashed border-base-content/15 p-8">
          <ShoppingCart className="w-10 h-10 text-base-content/30 mx-auto" />
          <p className="font-bold text-sm text-base-content">No orders found</p>
          <p className="text-xs text-base-content/50">Modify search filters or await incoming customer checkout.</p>
        </div>
      ) : (
        <div className="bg-base-200 border border-base-content/10 rounded-3xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="table table-sm text-xs">
              <thead className="bg-base-300/50 text-[11px] uppercase tracking-wider text-base-content/60">
                <tr>
                  <th>Order Reference</th>
                  <th>Recipient / Contact</th>
                  <th>Total Amount</th>
                  <th>Payment Gate</th>
                  <th>Settlement</th>
                  <th>Logistics Phase</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-base-content/5">
                {filteredOrders.map((order) => {
                  return (
                    <tr key={order._id} className="hover:bg-base-100/50 transition-colors">
                      <td className="py-3">
                        <span className="font-mono font-bold text-primary block">
                          #{order._id.slice(-8).toUpperCase()}
                        </span>
                        <span className="text-[10px] text-base-content/40 font-mono">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </span>
                      </td>

                      <td>
                        <p className="font-bold text-base-content truncate max-w-[140px]">
                          {order.shippingAddress?.fullName || 'Anonymous'}
                        </p>
                        <span className="text-[10px] text-base-content/50 font-mono block">
                          {order.shippingAddress?.phone}
                        </span>
                      </td>

                      <td>
                        <span className="font-mono font-black text-sm text-base-content block">
                          ${order.totalPrice}
                        </span>
                        <span className="text-[10px] text-base-content/40">
                          {order.orderItems?.length || 0} items
                        </span>
                      </td>

                      <td>
                        <span className="badge badge-ghost badge-xs font-bold text-[9px] uppercase">
                          {order.paymentMethod}
                        </span>
                      </td>

                      <td>
                        <button
                          onClick={() => handleTogglePayment(order._id, order.isPaid)}
                          className={`badge badge-xs font-bold text-[9px] uppercase cursor-pointer hover:scale-105 transition-transform ${
                            order.isPaid ? 'badge-success text-white' : 'badge-error text-white'
                          }`}
                          title="Click to toggle settlement"
                        >
                          {order.isPaid ? 'Paid' : 'Unpaid'}
                        </button>
                      </td>

                      <td>
                        <select
                          value={order.status}
                          onChange={(e) =>
                            handleUpdateStatus(order._id, e.target.value as Order['status'])
                          }
                          className={`select select-bordered select-xs rounded-xl font-bold text-[10px] ${
                            order.status === 'Delivered'
                              ? 'text-success'
                              : order.status === 'Cancelled'
                              ? 'text-error'
                              : 'text-primary'
                          }`}
                        >
                          <option value="Pending">Pending</option>
                          <option value="Processing">Processing</option>
                          <option value="Shipped">Shipped</option>
                          <option value="Delivered">Delivered</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </td>

                      <td className="text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setSelectedOrder(order)}
                            className="btn btn-ghost btn-xs btn-circle text-primary hover:bg-primary/10"
                            title="Inspect Manifest"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteOrder(order._id)}
                            className="btn btn-ghost btn-xs btn-circle text-error hover:bg-error/10"
                            title="Delete record"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* INSPECT ORDER & PACKING SLIP MODAL */}
      {selectedOrder && (
        <div className="modal modal-open z-50">
          <div className="modal-box max-w-3xl rounded-3xl bg-base-100 border border-base-content/10 p-6 space-y-6 shadow-2xl relative max-h-[90vh] flex flex-col">
            <div className="flex items-start justify-between border-b border-base-content/10 pb-4">
              <div>
                <span className="badge badge-primary badge-xs font-bold uppercase text-[9px] mb-1">
                  Packing Slip & Inspection
                </span>
                <h3 className="text-xl font-black text-base-content font-mono">
                  Order #{selectedOrder._id}
                </h3>
                <p className="text-xs text-base-content/50">
                  Booked: {new Date(selectedOrder.createdAt).toLocaleString()}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="btn btn-ghost btn-xs rounded-xl border border-base-content/15 font-bold gap-1"
                >
                  <Printer className="w-3.5 h-3.5" /> Print Slip
                </button>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="btn btn-ghost btn-xs btn-circle text-base-content/50 hover:text-base-content"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 text-xs pr-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 bg-base-200/60 rounded-2xl border border-base-content/5 space-y-1">
                  <span className="text-[10px] font-bold text-base-content/50 uppercase">
                    Delivery Address
                  </span>
                  <p className="font-bold text-base-content">{selectedOrder.shippingAddress?.fullName}</p>
                  <p className="text-base-content/70">Phone: {selectedOrder.shippingAddress?.phone}</p>
                  <p className="text-base-content/70">
                    {selectedOrder.shippingAddress?.address}, {selectedOrder.shippingAddress?.city}
                  </p>
                  {selectedOrder.shippingAddress?.note && (
                    <p className="text-[11px] text-base-content/50 italic">
                      Note: "{selectedOrder.shippingAddress.note}"
                    </p>
                  )}
                </div>

                <div className="p-3.5 bg-base-200/60 rounded-2xl border border-base-content/5 space-y-1">
                  <span className="text-[10px] font-bold text-base-content/50 uppercase">
                    Settlement & Logistics
                  </span>
                  <div className="flex items-center justify-between">
                    <span>Payment Gateway:</span>
                    <span className="font-bold text-base-content">{selectedOrder.paymentMethod}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Ledger Status:</span>
                    <span
                      className={`badge badge-xs font-bold ${
                        selectedOrder.isPaid ? 'badge-success text-white' : 'badge-error text-white'
                      }`}
                    >
                      {selectedOrder.isPaid ? 'Paid' : 'Unpaid'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Parcel State:</span>
                    <span className="font-bold text-primary">{selectedOrder.status}</span>
                  </div>
                </div>
              </div>

              <div className="border border-base-content/10 rounded-2xl overflow-hidden">
                <table className="table table-xs w-full">
                  <thead className="bg-base-200 text-base-content/60">
                    <tr>
                      <th>Hardware Item</th>
                      <th className="text-center">Qty</th>
                      <th className="text-right">Unit Price</th>
                      <th className="text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-base-content/5">
                    {selectedOrder.orderItems?.map((item, idx) => (
                      <tr key={idx}>
                        <td className="py-2">
                          <div className="flex items-center gap-2">
                            <img
                              src={item.image || 'https://via.placeholder.com/40'}
                              alt={item.name}
                              className="w-8 h-8 object-contain rounded bg-base-200 p-0.5"
                            />
                            <span className="font-bold truncate max-w-xs">{item.name}</span>
                          </div>
                        </td>
                        <td className="text-center font-mono">{item.qty}</td>
                        <td className="text-right font-mono">${item.price}</td>
                        <td className="text-right font-mono font-bold">${item.price * item.qty}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="p-3 bg-base-200/40 rounded-2xl flex flex-col items-end space-y-1 text-xs">
                <div className="flex justify-between w-52 text-base-content/70">
                  <span>Hardware Subtotal:</span>
                  <span className="font-mono font-bold">${selectedOrder.itemsPrice}</span>
                </div>
                {selectedOrder.discountPrice > 0 && (
                  <div className="flex justify-between w-52 text-success">
                    <span>Promotional Discount:</span>
                    <span className="font-mono font-bold">-${selectedOrder.discountPrice}</span>
                  </div>
                )}
                <div className="flex justify-between w-52 text-sm font-black text-base-content pt-1 border-t border-base-content/10">
                  <span>Grand Total:</span>
                  <span className="font-mono text-primary">${selectedOrder.totalPrice}</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-base-content/10 flex items-center justify-between">
              <button
                onClick={() => handleTogglePayment(selectedOrder._id, selectedOrder.isPaid)}
                className={`btn btn-sm rounded-xl text-xs font-bold ${
                  selectedOrder.isPaid ? 'btn-warning' : 'btn-success text-white'
                }`}
              >
                {selectedOrder.isPaid ? 'Revert to Unpaid' : 'Confirm VietQR Paid'}
              </button>

              <button
                onClick={() => setSelectedOrder(null)}
                className="btn btn-ghost btn-sm rounded-xl text-xs font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrderManager;