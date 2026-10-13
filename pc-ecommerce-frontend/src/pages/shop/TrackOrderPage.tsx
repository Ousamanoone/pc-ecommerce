import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../../services/api';
import VietQRModal from '../../components/VietQRModal';
import {
  Search,
  Package,
  Clock,
  CheckCircle2,
  Truck,
  AlertCircle,
  QrCode,
  MapPin,
  Phone,
  CreditCard,
  ChevronRight,
  ArrowLeft,
  ShieldCheck,
} from 'lucide-react';

interface OrderItem {
  product: string;
  name: string;
  image: string;
  price: number;
  qty: number;
}

interface OrderData {
  _id: string;
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

export const TrackOrderPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchId, setSearchId] = useState<string>('');
  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [isQrOpen, setIsQrOpen] = useState<boolean>(false);

  const fetchOrderDetails = async (id: string) => {
    if (!id.trim()) return;
    setLoading(true);
    setError('');
    try {
      const res = await api.get(`/orders/${id.trim()}`);
      setOrder(res.data);
    } catch (err: any) {
      console.error('Track order error:', err);
      setError(err.response?.data?.message || 'No hardware order matching this reference ID was found.');
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const orderIdParam = searchParams.get('orderId');
    if (orderIdParam) {
      setSearchId(orderIdParam);
      fetchOrderDetails(orderIdParam);
    }
  }, [searchParams]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchId.trim()) return;
    setSearchParams({ orderId: searchId.trim() });
    fetchOrderDetails(searchId.trim());
  };

  const getStatusStep = (status: string) => {
    switch (status) {
      case 'Pending':
        return 1;
      case 'Processing':
        return 2;
      case 'Shipped':
        return 3;
      case 'Delivered':
        return 4;
      default:
        return 1;
    }
  };

  const currentStep = order ? getStatusStep(order.status) : 1;

  return (
    <div className="space-y-6 py-4 max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center space-y-1">
        <span className="badge badge-primary badge-xs font-bold uppercase text-[9px]">
          Fulfillment Status
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-base-content tracking-tight">
          Track & Inspect Order Dispatch
        </h1>
        <p className="text-xs text-base-content/60 max-w-md mx-auto">
          Input your Order Reference ID to verify package transit checkpoints and settlement history.
        </p>
      </div>

      {/* Query Bar */}
      <form onSubmit={handleSearchSubmit} className="flex gap-2 max-w-lg mx-auto">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-base-content/40" />
          <input
            type="text"
            placeholder="Paste Order ID (e.g. 66e...)"
            value={searchId}
            onChange={(e) => setSearchId(e.target.value)}
            className="input input-bordered input-sm rounded-xl w-full pl-9 text-xs bg-base-200/50 font-mono"
          />
        </div>
        <button type="submit" disabled={loading} className="btn btn-primary btn-sm rounded-xl font-bold text-xs px-5">
          {loading ? <span className="loading loading-spinner loading-xs"></span> : 'Locate Order'}
        </button>
      </form>

      {/* Error alert */}
      {error && (
        <div className="p-4 bg-error/10 border border-error/20 rounded-2xl max-w-lg mx-auto flex items-center gap-3 text-xs text-error font-semibold">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* ORDER SUMMARY SHEET */}
      {order && (
        <div className="bg-base-200 border border-base-content/10 rounded-3xl p-5 sm:p-7 space-y-6 shadow-xs animate-in fade-in duration-200">
          {/* Top Identifier Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-base-content/10 pb-4">
            <div>
              <span className="text-[10px] font-bold text-base-content/50 uppercase block">
                Order Tracking ID
              </span>
              <p className="font-mono font-black text-base text-primary">#{order._id}</p>
              <span className="text-[11px] text-base-content/50">
                Booked on: {new Date(order.createdAt).toLocaleString('en-US')}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span
                className={`badge badge-sm font-bold text-xs px-3 py-2 uppercase ${
                  order.status === 'Delivered'
                    ? 'badge-success text-white'
                    : order.status === 'Cancelled'
                    ? 'badge-error text-white'
                    : 'badge-primary'
                }`}
              >
                {order.status}
              </span>
            </div>
          </div>

          {/* Stepper */}
          <div className="py-2">
            <ul className="steps steps-horizontal w-full text-xs">
              <li className={`step ${currentStep >= 1 ? 'step-primary font-bold' : 'text-base-content/40'}`}>
                Order Placed
              </li>
              <li className={`step ${currentStep >= 2 ? 'step-primary font-bold' : 'text-base-content/40'}`}>
                Bench Testing
              </li>
              <li className={`step ${currentStep >= 3 ? 'step-primary font-bold' : 'text-base-content/40'}`}>
                In Transit
              </li>
              <li className={`step ${currentStep >= 4 ? 'step-primary font-bold' : 'text-base-content/40'}`}>
                Delivered
              </li>
            </ul>
          </div>

          {/* UNPAID VIETQR BANNER */}
          {!order.isPaid && order.paymentMethod === 'Bank Transfer' && (
            <div className="p-4 bg-primary/10 border border-primary/20 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-primary text-primary-content flex items-center justify-center font-bold shrink-0">
                  <QrCode className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-xs text-base-content">
                    Pending Bank Transfer Settlement
                  </p>
                  <p className="text-[11px] text-base-content/60">
                    Scan VietQR Napas247 code to complete wire transfer for <strong>${order.totalPrice}</strong>.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsQrOpen(true)}
                className="btn btn-primary btn-sm rounded-xl font-bold text-xs gap-1.5 shadow-md shadow-primary/20 shrink-0"
              >
                <QrCode className="w-4 h-4" /> Scan VietQR
              </button>
            </div>
          )}

          {/* PAID CONFIRMATION */}
          {order.isPaid && (
            <div className="p-3.5 bg-success/10 border border-success/20 rounded-2xl flex items-center gap-2.5 text-xs text-success font-bold">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>
                Payment verified and cleared {order.paidAt ? `on ${new Date(order.paidAt).toLocaleString('en-US')}` : ''}.
              </span>
            </div>
          )}

          {/* Shipping & Payment Meta */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 bg-base-100 rounded-2xl border border-base-content/5 space-y-2">
              <span className="font-bold text-base-content flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-base-content/50">
                <MapPin className="w-3.5 h-3.5 text-primary" /> Delivery Destination
              </span>
              <p className="font-bold text-base-content">{order.shippingAddress.fullName}</p>
              <p className="text-base-content/70 flex items-center gap-1">
                <Phone className="w-3 h-3 text-base-content/40" /> {order.shippingAddress.phone}
              </p>
              <p className="text-base-content/70">
                {order.shippingAddress.address}, {order.shippingAddress.city}
              </p>
              {order.shippingAddress.note && (
                <p className="text-[11px] text-base-content/50 italic">
                  Note: "{order.shippingAddress.note}"
                </p>
              )}
            </div>

            <div className="p-4 bg-base-100 rounded-2xl border border-base-content/5 space-y-2">
              <span className="font-bold text-base-content flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-base-content/50">
                <CreditCard className="w-3.5 h-3.5 text-primary" /> Payment Method & Ledger
              </span>
              <p className="font-bold text-base-content">{order.paymentMethod}</p>
              <div className="flex items-center gap-2">
                <span className="text-base-content/60">Ledger Status:</span>
                <span
                  className={`badge badge-xs font-bold ${
                    order.isPaid ? 'badge-success text-white' : 'badge-warning'
                  }`}
                >
                  {order.isPaid ? 'Settled / Paid' : 'Awaiting Payment'}
                </span>
              </div>
              <p className="text-[11px] text-base-content/50">
                Includes official 36-month standard hardware manufacturer warranty.
              </p>
            </div>
          </div>

          {/* Items Manifest */}
          <div className="space-y-3 pt-2">
            <span className="font-bold text-xs text-base-content block">Itemized Package Manifest</span>
            <div className="divide-y divide-base-content/5 bg-base-100 rounded-2xl border border-base-content/5 overflow-hidden">
              {order.orderItems.map((item, idx) => (
                <div key={idx} className="p-3 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={item.image || 'https://via.placeholder.com/40'}
                      alt={item.name}
                      className="w-10 h-10 object-contain rounded-lg bg-base-200/50 p-1 shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="font-bold text-base-content truncate">{item.name}</p>
                      <span className="text-[11px] text-base-content/50 font-mono">
                        Quantity: {item.qty}
                      </span>
                    </div>
                  </div>
                  <span className="font-mono font-bold text-primary shrink-0">
                    ${item.price * item.qty}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Total Breakdown */}
          <div className="pt-3 border-t border-base-content/10 flex flex-col items-end space-y-1 text-xs">
            <div className="flex justify-between w-48 text-base-content/70">
              <span>Subtotal:</span>
              <span className="font-mono font-bold">${order.itemsPrice}</span>
            </div>
            {order.discountPrice > 0 && (
              <div className="flex justify-between w-48 text-success">
                <span>Voucher:</span>
                <span className="font-mono font-bold">-${order.discountPrice}</span>
              </div>
            )}
            <div className="flex justify-between w-48 text-base font-black text-base-content pt-1 border-t border-base-content/10">
              <span>Grand Total:</span>
              <span className="font-mono text-primary">${order.totalPrice}</span>
            </div>
          </div>
        </div>
      )}

      {/* RE-SCAN MODAL */}
      {order && (
        <VietQRModal
          isOpen={isQrOpen}
          onClose={() => setIsQrOpen(false)}
          orderId={order._id}
          totalUSD={order.totalPrice}
          onConfirmPaid={() => setIsQrOpen(false)}
        />
      )}
    </div>
  );
};

export default TrackOrderPage;