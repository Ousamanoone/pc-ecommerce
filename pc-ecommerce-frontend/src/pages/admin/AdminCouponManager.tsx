import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import {
  Tag,
  Plus,
  Trash2,
  Calendar,
  Percent,
  DollarSign,
  Check,
  X,
  Clock,
  Sparkles,
  Ticket,
} from 'lucide-react';

interface Coupon {
  _id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrderValue: number;
  maxDiscount?: number;
  expirationDate: string;
  usageLimit: number;
  usedCount: number;
  isActive: boolean;
}

export const AdminCouponManager: React.FC = () => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form State for new voucher
  const [formData, setFormData] = useState({
    code: '',
    discountType: 'percentage' as 'percentage' | 'fixed',
    discountValue: 10,
    minOrderValue: 50,
    maxDiscount: 50,
    expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0],
    usageLimit: 100,
    isActive: true,
  });

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const res = await api.get<Coupon[]>('/coupons');
      setCoupons(res.data || []);
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to retrieve promotional coupons.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleOpenAddModal = () => {
    setFormData({
      code: '',
      discountType: 'percentage',
      discountValue: 15,
      minOrderValue: 100,
      maxDiscount: 75,
      expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0],
      usageLimit: 100,
      isActive: true,
    });
    setIsModalOpen(true);
  };

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.code.trim()) {
      showToast('Please provide a unique promotional code.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
        code: formData.code.trim().toUpperCase(),
        discountValue: Number(formData.discountValue),
        minOrderValue: Number(formData.minOrderValue),
        maxDiscount: formData.discountType === 'percentage' ? Number(formData.maxDiscount) : undefined,
        usageLimit: Number(formData.usageLimit),
      };

      await api.post('/coupons', payload);
      showToast(`Promotional voucher "${payload.code}" created successfully.`);
      setIsModalOpen(false);
      fetchCoupons();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to create promotional code.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCoupon = async (id: string, code: string) => {
    if (!window.confirm(`Permanently remove voucher code "${code}"?`)) return;

    try {
      await api.delete(`/coupons/${id}`);
      showToast(`Voucher code "${code}" deleted.`);
      setCoupons((prev) => prev.filter((c) => c._id !== id));
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to delete voucher.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="toast toast-top toast-end z-50">
          <div className="alert alert-info shadow-xl rounded-2xl text-xs font-bold text-white">
            <Check className="w-4 h-4" /> {toastMessage}
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-base-content flex items-center gap-2">
            <Tag className="w-6 h-6 text-primary" /> Vouchers & Promotional Discounts
          </h1>
          <p className="text-xs text-base-content/60">
            Issue checkout promo codes, manage percentage off thresholds, and set redemption quotas.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchCoupons}
            className="btn btn-ghost btn-sm rounded-xl text-xs font-bold border border-base-content/10"
          >
            Refresh Vouchers
          </button>
          <button
            onClick={handleOpenAddModal}
            className="btn btn-primary btn-sm rounded-xl font-bold gap-2 text-xs shadow-md shadow-primary/20"
          >
            <Plus className="w-4 h-4" /> Issue New Voucher
          </button>
        </div>
      </div>

      {/* Vouchers Grid */}
      {loading ? (
        <div className="py-20 text-center">
          <span className="loading loading-spinner loading-lg text-primary"></span>
        </div>
      ) : coupons.length === 0 ? (
        <div className="py-16 text-center space-y-4 bg-base-200 border border-dashed border-base-content/10 rounded-3xl max-w-md mx-auto">
          <Ticket className="w-12 h-12 text-base-content/30 mx-auto" />
          <div className="space-y-1">
            <h3 className="text-base font-bold">No Promotional Codes Configured</h3>
            <p className="text-xs text-base-content/50">
              Create seasonal flash-sale vouchers to drive customer conversions and reward loyal builders.
            </p>
          </div>
          <button
            onClick={handleOpenAddModal}
            className="btn btn-primary btn-sm rounded-xl text-xs font-bold"
          >
            Create First Voucher
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {coupons.map((coupon) => {
            const isExpired = new Date(coupon.expirationDate) < new Date();
            const percentClaimed = Math.min(
              100,
              Math.round((coupon.usedCount / coupon.usageLimit) * 100)
            );

            return (
              <div
                key={coupon._id}
                className="bg-base-200 border border-base-content/10 rounded-3xl p-5 flex flex-col justify-between space-y-4 shadow-sm hover:border-primary/40 transition-all relative group"
              >
                {/* Top Badge & Delete Button */}
                <div className="flex items-center justify-between">
                  <span
                    className={`badge font-bold uppercase text-[9px] ${
                      isExpired
                        ? 'badge-error'
                        : coupon.isActive
                        ? 'badge-success text-white'
                        : 'badge-ghost'
                    }`}
                  >
                    {isExpired ? 'Expired' : coupon.isActive ? 'Active' : 'Inactive'}
                  </span>

                  <button
                    onClick={() => handleDeleteCoupon(coupon._id, coupon.code)}
                    className="btn btn-ghost btn-xs btn-circle text-error hover:bg-error/10"
                    title="Delete promotional code"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Voucher Core Value Display */}
                <div className="p-4 bg-base-100 rounded-2xl border border-base-content/5 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    {coupon.discountType === 'percentage' ? (
                      <Percent className="w-6 h-6" />
                    ) : (
                      <DollarSign className="w-6 h-6" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <span className="font-mono font-black text-base text-primary tracking-wider block">
                      {coupon.code}
                    </span>
                    <span className="text-xs font-bold text-base-content block">
                      {coupon.discountType === 'percentage'
                        ? `${coupon.discountValue}% Off (Max $${coupon.maxDiscount || '∞'})`
                        : `$${coupon.discountValue} Flat Discount`}
                    </span>
                  </div>
                </div>

                {/* Threshold & Expiry Meta */}
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between text-base-content/60">
                    <span>Minimum Order Spend:</span>
                    <span className="font-bold text-base-content font-mono">
                      ${coupon.minOrderValue}
                    </span>
                  </div>
                  <div className="flex justify-between text-base-content/60">
                    <span>Valid Until:</span>
                    <span className="font-mono text-base-content flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(coupon.expirationDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* Quota Progress */}
                <div className="space-y-1.5 pt-2 border-t border-base-content/10 text-[11px]">
                  <div className="flex justify-between text-base-content/60">
                    <span>Redemption Progress:</span>
                    <span className="font-mono font-bold text-base-content">
                      {coupon.usedCount} / {coupon.usageLimit} ({percentClaimed}%)
                    </span>
                  </div>
                  <progress
                    className="progress progress-primary w-full h-1.5 bg-base-300"
                    value={coupon.usedCount}
                    max={coupon.usageLimit}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CREATE NEW VOUCHER MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-base-200 border border-base-content/10 rounded-3xl p-6 sm:p-8 w-full max-w-lg shadow-2xl space-y-5 my-6">
            <div className="flex items-center justify-between border-b border-base-content/10 pb-4">
              <h3 className="text-base font-black text-base-content flex items-center gap-2">
                <Tag className="w-4 h-4 text-primary" /> Issue New Promotional Voucher
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="btn btn-ghost btn-xs btn-circle"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateCoupon} className="space-y-4">
              {/* Code */}
              <div className="form-control">
                <label className="label text-xs font-bold">Promotional Code (Uppercase)</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. FLASH20, RTXBONUS"
                  className="input input-bordered input-sm rounded-xl text-xs uppercase font-mono tracking-wider"
                  value={formData.code}
                  onChange={(e) =>
                    setFormData({ ...formData, code: e.target.value.toUpperCase() })
                  }
                />
              </div>

              {/* Discount Type Radio */}
              <div className="form-control">
                <label className="label text-xs font-bold">Discount Mechanism</label>
                <div className="grid grid-cols-2 gap-3">
                  <label className="flex items-center gap-2 p-3 bg-base-100 rounded-xl border border-base-content/10 cursor-pointer hover:border-primary">
                    <input
                      type="radio"
                      name="discountType"
                      value="percentage"
                      checked={formData.discountType === 'percentage'}
                      onChange={() => setFormData({ ...formData, discountType: 'percentage' })}
                      className="radio radio-primary radio-xs"
                    />
                    <span className="text-xs font-bold">Percentage (%)</span>
                  </label>

                  <label className="flex items-center gap-2 p-3 bg-base-100 rounded-xl border border-base-content/10 cursor-pointer hover:border-primary">
                    <input
                      type="radio"
                      name="discountType"
                      value="fixed"
                      checked={formData.discountType === 'fixed'}
                      onChange={() => setFormData({ ...formData, discountType: 'fixed' })}
                      className="radio radio-primary radio-xs"
                    />
                    <span className="text-xs font-bold">Fixed Amount ($)</span>
                  </label>
                </div>
              </div>

              {/* Values & Limits */}
              <div className="grid grid-cols-2 gap-3">
                <div className="form-control">
                  <label className="label text-xs font-bold">
                    {formData.discountType === 'percentage' ? 'Percentage Off (%)' : 'Deduction ($)'}
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={formData.discountType === 'percentage' ? 100 : 10000}
                    required
                    className="input input-bordered input-sm rounded-xl text-xs font-mono"
                    value={formData.discountValue}
                    onChange={(e) =>
                      setFormData({ ...formData, discountValue: Number(e.target.value) })
                    }
                  />
                </div>

                <div className="form-control">
                  <label className="label text-xs font-bold">Minimum Order Value ($)</label>
                  <input
                    type="number"
                    min="0"
                    required
                    className="input input-bordered input-sm rounded-xl text-xs font-mono"
                    value={formData.minOrderValue}
                    onChange={(e) =>
                      setFormData({ ...formData, minOrderValue: Number(e.target.value) })
                    }
                  />
                </div>
              </div>

              {/* Max Discount (for % only) & Quota */}
              <div className="grid grid-cols-2 gap-3">
                {formData.discountType === 'percentage' ? (
                  <div className="form-control">
                    <label className="label text-xs font-bold">Max Discount Cap ($)</label>
                    <input
                      type="number"
                      min="1"
                      className="input input-bordered input-sm rounded-xl text-xs font-mono"
                      value={formData.maxDiscount}
                      onChange={(e) =>
                        setFormData({ ...formData, maxDiscount: Number(e.target.value) })
                      }
                    />
                  </div>
                ) : (
                  <div></div>
                )}

                <div className="form-control">
                  <label className="label text-xs font-bold">Total Usage Limit (Times)</label>
                  <input
                    type="number"
                    min="1"
                    required
                    className="input input-bordered input-sm rounded-xl text-xs font-mono"
                    value={formData.usageLimit}
                    onChange={(e) =>
                      setFormData({ ...formData, usageLimit: Number(e.target.value) })
                    }
                  />
                </div>
              </div>

              {/* Expiration Date */}
              <div className="form-control">
                <label className="label text-xs font-bold">Expiration Date</label>
                <input
                  type="date"
                  required
                  className="input input-bordered input-sm rounded-xl text-xs"
                  value={formData.expirationDate}
                  onChange={(e) =>
                    setFormData({ ...formData, expirationDate: e.target.value })
                  }
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-base-content/10">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn btn-ghost btn-sm rounded-xl text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`btn btn-primary btn-sm rounded-xl text-xs font-bold gap-1.5 ${
                    isSubmitting ? 'loading' : ''
                  }`}
                >
                  <Check className="w-4 h-4" /> Issue Voucher
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCouponManager;