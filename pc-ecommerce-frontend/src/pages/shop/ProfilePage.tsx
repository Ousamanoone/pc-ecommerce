import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  User,
  Package,
  Calendar,
  Clock,
  MapPin,
  ExternalLink,
  Shield,
  ShoppingBag,
  CreditCard,
  Tag,
  ArrowRight,
  Settings,
  Lock,
  Phone,
  Check,
  AlertCircle,
  Save,
  Ban,
  X,
  RotateCcw,
} from 'lucide-react';

interface OrderItem {
  product: string;
  name: string;
  quantity: number;
  price: number;
  image?: string;
}

interface Order {
  _id: string;
  orderCode: string;
  shippingAddress: {
    fullName: string;
    phone: string;
    address: string;
    city: string;
  };
  paymentMethod: string;
  isPaid: boolean;
  coupon?: {
    code: string;
    discountAmount: number;
  };
  itemsPrice: number;
  totalPrice: number;
  status: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  cancellationReason?: string;
  orderItems: OrderItem[];
  createdAt: string;
}

const CANCEL_REASONS = [
  'Want to reconfigure or change PC components',
  'Found a better price / promotional deal elsewhere',
  'Incorrect shipping address or recipient contact phone',
  'Changed mind / financial constraints',
  'Ordered by mistake',
];

export const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'orders' | 'settings'>('orders');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Cancellation Modal State
  const [cancellingOrder, setCancellingOrder] = useState<Order | null>(null);
  const [selectedReason, setSelectedReason] = useState<string>(CANCEL_REASONS[0]);
  const [customReason, setCustomReason] = useState<string>('');
  const [isSubmittingCancel, setIsSubmittingCancel] = useState<boolean>(false);

  // Profile Form State
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    address: '',
    city: '',
  });
  const [savingProfile, setSavingProfile] = useState(false);

  // Password Form State
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const fetchUserOrders = () => {
    setLoadingOrders(true);
    api
      .get<Order[]>('/orders/my-orders')
      .then((res) => {
        setOrders(res.data || []);
      })
      .catch((err) => {
        console.error('Failed to load user orders:', err);
      })
      .finally(() => {
        setLoadingOrders(false);
      });
  };

  useEffect(() => {
    if (!user) {
      navigate('/admin/login');
      return;
    }

    api
      .get('/users/profile')
      .then((res) => {
        setProfileForm({
          name: res.data.name || '',
          email: res.data.email || '',
          phone: res.data.phone || '',
          address: res.data.address || '',
          city: res.data.city || '',
        });
      })
      .catch((err) => console.error('Failed to load profile details:', err));

    fetchUserOrders();
  }, [user, navigate]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      await api.put('/users/profile', {
        name: profileForm.name,
        phone: profileForm.phone,
        address: profileForm.address,
        city: profileForm.city,
      });
      showToast('Personal information & default delivery address updated.');
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('New password and confirmation do not match.');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters long.');
      return;
    }

    setSavingPassword(true);
    try {
      await api.put('/users/change-password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      showToast('Account password changed successfully.');
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (err: any) {
      setPasswordError(err.response?.data?.message || 'Failed to change password.');
    } finally {
      setSavingPassword(false);
    }
  };

  const handleExecuteCancellation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cancellingOrder) return;

    const finalReason = customReason.trim() ? customReason.trim() : selectedReason;
    setIsSubmittingCancel(true);

    try {
      const res = await api.put(`/orders/${cancellingOrder._id}/cancel`, {
        reason: finalReason,
      });

      setOrders((prev) =>
        prev.map((o) => (o._id === cancellingOrder._id ? res.data.order : o))
      );
      showToast(`Order ${cancellingOrder.orderCode} cancelled. Warehouse inventory restored.`);
      setCancellingOrder(null);
      setCustomReason('');
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to cancel order.');
    } finally {
      setIsSubmittingCancel(false);
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'Pending':
        return 'badge-warning';
      case 'Processing':
        return 'badge-info';
      case 'Shipped':
        return 'badge-primary';
      case 'Delivered':
        return 'badge-success';
      case 'Cancelled':
        return 'badge-error';
      default:
        return 'badge-ghost';
    }
  };

  const filteredOrders = orders.filter(
    (ord) => statusFilter === 'ALL' || ord.status === statusFilter
  );

  return (
    <div className="space-y-8 py-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="toast toast-top toast-end z-50">
          <div className="alert alert-success shadow-xl rounded-2xl text-xs font-bold text-white">
            <Check className="w-4 h-4" /> {toastMessage}
          </div>
        </div>
      )}

      {/* Account Overview Header */}
      <div className="bg-base-200/70 border border-base-content/10 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-primary text-primary-content flex items-center justify-center font-black text-2xl shadow-lg shadow-primary/20">
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-base-content">{user?.name}</h1>
              <span className="badge badge-primary badge-sm font-bold uppercase text-[10px]">
                {user?.role || 'Customer'}
              </span>
            </div>
            <p className="text-xs text-base-content/60 font-mono">{user?.email}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="p-3 bg-base-100 rounded-2xl border border-base-content/5 flex-1 md:flex-initial text-center md:text-left min-w-[120px]">
            <span className="text-[10px] font-bold text-base-content/50 uppercase block">Total Orders</span>
            <span className="text-xl font-black text-primary font-mono">{orders.length}</span>
          </div>
          <div className="p-3 bg-base-100 rounded-2xl border border-base-content/5 flex-1 md:flex-initial text-center md:text-left min-w-[120px]">
            <span className="text-[10px] font-bold text-base-content/50 uppercase block">Delivered</span>
            <span className="text-xl font-black text-success font-mono">
              {orders.filter((o) => o.status === 'Delivered').length}
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-base-content/10 pb-3">
        <button
          onClick={() => setActiveTab('orders')}
          className={`btn btn-sm rounded-2xl font-black text-xs gap-2 transition-all ${
            activeTab === 'orders' ? 'btn-primary shadow-sm' : 'btn-ghost'
          }`}
        >
          <Package className="w-4 h-4" /> Purchase History ({orders.length})
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`btn btn-sm rounded-2xl font-black text-xs gap-2 transition-all ${
            activeTab === 'settings' ? 'btn-primary shadow-sm' : 'btn-ghost'
          }`}
        >
          <Settings className="w-4 h-4" /> Account & Security Settings
        </button>
      </div>

      {/* TAB 1: ORDER HISTORY */}
      {activeTab === 'orders' && (
        <div className="space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-black text-base-content flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-primary" /> Hardware Orders Manifest
              </h2>
              <p className="text-xs text-base-content/60">
                Review past hardware transactions, current fulfillment states, and courier milestones.
              </p>
            </div>

            {/* Status Filter Tabs */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
              {['ALL', 'Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'].map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`btn btn-xs rounded-xl font-bold transition-all ${
                    statusFilter === st ? 'btn-primary' : 'btn-ghost bg-base-200/60'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {loadingOrders ? (
            <div className="py-20 text-center">
              <span className="loading loading-spinner loading-lg text-primary"></span>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="py-16 text-center space-y-4 bg-base-200/40 rounded-3xl border border-dashed border-base-content/10 max-w-md mx-auto">
              <ShoppingBag className="w-12 h-12 text-base-content/30 mx-auto" />
              <div className="space-y-1">
                <h3 className="text-base font-bold">No Order Records Found</h3>
                <p className="text-xs text-base-content/50">
                  You have not placed any orders matching the current filter.
                </p>
              </div>
              <Link to="/products" className="btn btn-primary btn-sm rounded-xl text-xs font-bold gap-2">
                Browse Components <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredOrders.map((order) => {
                const canCancel = order.status === 'Pending' || order.status === 'Processing';

                return (
                  <div
                    key={order._id}
                    className="bg-base-200/60 border border-base-content/10 rounded-3xl p-5 sm:p-6 space-y-5 shadow-xs hover:border-primary/40 transition-all"
                  >
                    {/* Top Info Bar */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-base-content/10 pb-4">
                      <div className="flex items-center gap-3">
                        <span className="font-mono font-black text-sm text-primary tracking-wider">
                          {order.orderCode}
                        </span>
                        <span
                          className={`badge font-bold text-[10px] uppercase ${getStatusBadgeClass(
                            order.status
                          )}`}
                        >
                          {order.status}
                        </span>
                        <span
                          className={`badge font-bold text-[10px] uppercase ${
                            order.isPaid ? 'badge-success text-white' : 'badge-warning'
                          }`}
                        >
                          {order.isPaid ? 'Paid' : 'Unpaid'}
                        </span>
                      </div>

                      <div className="flex items-center gap-4 text-xs text-base-content/60 font-mono">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5" />
                          {new Date(order.createdAt).toLocaleDateString()}
                        </span>
                        <span>•</span>
                        <span className="badge badge-neutral badge-xs font-bold uppercase text-[9px]">
                          {order.paymentMethod}
                        </span>
                      </div>
                    </div>

                    {/* Cancellation Notice if Cancelled */}
                    {order.status === 'Cancelled' && (
                      <div className="p-3 bg-error/10 border border-error/20 rounded-2xl text-xs text-error font-medium flex items-center gap-2">
                        <Ban className="w-4 h-4 shrink-0" />
                        <span>
                          <strong>Order Cancelled:</strong> {order.cancellationReason || 'Cancelled upon customer request.'}
                        </span>
                      </div>
                    )}

                    {/* Items List */}
                    <div className="space-y-3">
                      {order.orderItems.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between gap-4 text-xs">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-10 h-10 rounded-xl bg-base-100 p-1 flex items-center justify-center shrink-0 border border-base-content/5">
                              <img
                                src={item.image || 'https://via.placeholder.com/60'}
                                alt={item.name}
                                className="max-h-full max-w-full object-contain"
                              />
                            </div>
                            <div className="min-w-0">
                              <span className="font-bold text-base-content block truncate max-w-sm">
                                {item.name}
                              </span>
                              <span className="text-[10px] text-base-content/50 font-mono">
                                Qty: {item.quantity} × ${item.price}
                              </span>
                            </div>
                          </div>
                          <span className="font-mono font-black text-base-content shrink-0">
                            ${item.price * item.quantity}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Bottom Summary Bar */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-base-content/10 text-xs">
                      <div className="flex items-center gap-4 text-base-content/60">
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-primary" />
                          <span className="truncate max-w-[220px]">
                            {order.shippingAddress.address}, {order.shippingAddress.city}
                          </span>
                        </div>
                        {order.coupon?.code && (
                          <div className="flex items-center gap-1 text-success font-bold">
                            <Tag className="w-3.5 h-3.5" />
                            <span>Code: {order.coupon.code} (-${order.coupon.discountAmount})</span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-3">
                        <div className="text-right mr-2">
                          <span className="text-[10px] text-base-content/50 block">Final Total:</span>
                          <span className="text-base font-black text-primary font-mono">
                            ${order.totalPrice}
                          </span>
                        </div>

                        {canCancel && (
                          <button
                            onClick={() => {
                              setCancellingOrder(order);
                              setSelectedReason(CANCEL_REASONS[0]);
                              setCustomReason('');
                            }}
                            className="btn btn-ghost btn-sm rounded-xl font-bold text-xs text-error hover:bg-error/10 border border-error/20 gap-1"
                          >
                            <Ban className="w-3.5 h-3.5" /> Cancel Order
                          </button>
                        )}

                        <Link
                          to={`/track-order?code=${order.orderCode}`}
                          className="btn btn-outline btn-sm rounded-xl font-bold text-xs gap-1.5 hover:btn-primary"
                        >
                          Track Shipment <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: ACCOUNT SETTINGS & SECURITY */}
      {activeTab === 'settings' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-7 bg-base-200/60 border border-base-content/10 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
            <div className="border-b border-base-content/10 pb-4">
              <h2 className="text-lg font-black text-base-content flex items-center gap-2">
                <User className="w-5 h-5 text-primary" /> Personal Information & Delivery Address
              </h2>
              <p className="text-xs text-base-content/50 mt-1">
                Saved shipping details will automatically prefill your future checkout sessions.
              </p>
            </div>

            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="form-control">
                <label className="label text-xs font-bold">Full Name</label>
                <input
                  type="text"
                  required
                  className="input input-bordered input-sm rounded-xl text-xs"
                  value={profileForm.name}
                  onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                />
              </div>

              <div className="form-control">
                <label className="label text-xs font-bold">Account Email (Permanent)</label>
                <input
                  type="email"
                  disabled
                  className="input input-bordered input-sm rounded-xl text-xs opacity-60 font-mono"
                  value={profileForm.email}
                />
              </div>

              <div className="form-control">
                <label className="label text-xs font-bold">Contact Phone Number</label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-base-content/40" />
                  <input
                    type="tel"
                    placeholder="+1 (555) 019-2834"
                    className="input input-bordered input-sm rounded-xl pl-10 text-xs w-full"
                    value={profileForm.phone}
                    onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="form-control">
                  <label className="label text-xs font-bold">Default Street Address</label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-base-content/40" />
                    <input
                      type="text"
                      placeholder="123 Tech Boulevard"
                      className="input input-bordered input-sm rounded-xl pl-10 text-xs w-full"
                      value={profileForm.address}
                      onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-control">
                  <label className="label text-xs font-bold">City / Province</label>
                  <input
                    type="text"
                    placeholder="San Francisco, CA"
                    className="input input-bordered input-sm rounded-xl text-xs w-full"
                    value={profileForm.city}
                    onChange={(e) => setProfileForm({ ...profileForm, city: e.target.value })}
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={savingProfile}
                  className={`btn btn-primary btn-sm rounded-xl font-bold text-xs gap-1.5 shadow-md shadow-primary/20 ${
                    savingProfile ? 'loading' : ''
                  }`}
                >
                  <Save className="w-4 h-4" /> Save Profile Details
                </button>
              </div>
            </form>
          </div>

          <div className="lg:col-span-5 bg-base-200/60 border border-base-content/10 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
            <div className="border-b border-base-content/10 pb-4">
              <h2 className="text-lg font-black text-base-content flex items-center gap-2">
                <Lock className="w-5 h-5 text-warning" /> Security & Password
              </h2>
              <p className="text-xs text-base-content/50 mt-1">
                Update your account password with salted Bcrypt hashing.
              </p>
            </div>

            {passwordError && (
              <div className="alert alert-error rounded-2xl text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4" /> {passwordError}
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-4">
              <div className="form-control">
                <label className="label text-xs font-bold">Current Password</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  className="input input-bordered input-sm rounded-xl text-xs font-mono"
                  value={passwordForm.currentPassword}
                  onChange={(e) =>
                    setPasswordForm({ ...passwordForm, currentPassword: e.target.value })
                  }
                />
              </div>

              <div className="form-control">
                <label className="label text-xs font-bold">New Password (Min. 6 chars)</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  className="input input-bordered input-sm rounded-xl text-xs font-mono"
                  value={passwordForm.newPassword}
                  onChange={(e) =>
                    setPasswordForm({ ...passwordForm, newPassword: e.target.value })
                  }
                />
              </div>

              <div className="form-control">
                <label className="label text-xs font-bold">Confirm New Password</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  className="input input-bordered input-sm rounded-xl text-xs font-mono"
                  value={passwordForm.confirmPassword}
                  onChange={(e) =>
                    setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })
                  }
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={savingPassword}
                  className={`btn btn-warning btn-sm rounded-xl font-bold text-xs gap-1.5 shadow-sm ${
                    savingPassword ? 'loading' : ''
                  }`}
                >
                  <Lock className="w-3.5 h-3.5" /> Update Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CANCEL ORDER REASON MODAL */}
      {cancellingOrder && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-base-200 border border-base-content/10 rounded-3xl p-6 sm:p-7 w-full max-w-md shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-base-content/10 pb-4">
              <div>
                <h3 className="text-base font-black text-base-content flex items-center gap-2">
                  <Ban className="w-5 h-5 text-error" /> Cancel Order {cancellingOrder.orderCode}
                </h3>
                <p className="text-xs text-base-content/50">
                  Reserved hardware components will be immediately restocked.
                </p>
              </div>
              <button
                onClick={() => setCancellingOrder(null)}
                className="btn btn-ghost btn-xs btn-circle"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleExecuteCancellation} className="space-y-4">
              <div className="form-control">
                <label className="label text-xs font-bold">Please tell us why you are cancelling:</label>
                <div className="space-y-2">
                  {CANCEL_REASONS.map((reason) => (
                    <label
                      key={reason}
                      className="flex items-center gap-2.5 p-2.5 bg-base-100 rounded-xl border border-base-content/10 cursor-pointer hover:border-primary text-xs"
                    >
                      <input
                        type="radio"
                        name="cancelReason"
                        checked={selectedReason === reason}
                        onChange={() => {
                          setSelectedReason(reason);
                          setCustomReason('');
                        }}
                        className="radio radio-primary radio-xs"
                      />
                      <span className="font-medium text-base-content/80">{reason}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="form-control">
                <label className="label text-xs font-bold">Other specific comments (optional):</label>
                <textarea
                  rows={2}
                  placeholder="Provide additional details..."
                  className="textarea textarea-bordered text-xs rounded-xl bg-base-100"
                  value={customReason}
                  onChange={(e) => setCustomReason(e.target.value)}
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-base-content/10">
                <button
                  type="button"
                  onClick={() => setCancellingOrder(null)}
                  className="btn btn-ghost btn-sm rounded-xl text-xs font-bold"
                >
                  Keep Order
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingCancel}
                  className={`btn btn-error btn-sm rounded-xl font-bold text-xs text-white gap-1.5 shadow-sm ${
                    isSubmittingCancel ? 'loading' : ''
                  }`}
                >
                  <Check className="w-4 h-4" /> Confirm Cancellation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;