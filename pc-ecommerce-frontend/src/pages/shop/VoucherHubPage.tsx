import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import {
  Ticket,
  Copy,
  Check,
  Calendar,
  Percent,
  DollarSign,
  Sparkles,
  ShoppingBag,
  ArrowRight,
  Clock,
  Flame,
  ShieldCheck,
} from 'lucide-react';

interface Voucher {
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

export const VoucherHubPage: React.FC = () => {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filterType, setFilterType] = useState<'ALL' | 'percentage' | 'fixed'>('ALL');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const fetchVouchers = async () => {
    setLoading(true);
    try {
      const res = await api.get<Voucher[]>('/coupons/active');
      setVouchers(res.data || []);
    } catch (err) {
      console.error('Failed to fetch active vouchers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVouchers();
  }, []);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    showToast(`Voucher code "${code}" copied to clipboard.`);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  const filteredVouchers = vouchers.filter((v) => {
    if (filterType === 'ALL') return true;
    return v.discountType === filterType;
  });

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

      {/* Hero Banner Header */}
      <div className="bg-gradient-to-r from-primary/20 via-base-200 to-secondary/20 border border-base-content/10 rounded-3xl p-6 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
        <div className="space-y-2 text-center md:text-left max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/20 text-primary text-xs font-black uppercase tracking-wider">
            <Flame className="w-3.5 h-3.5 fill-current" /> Exclusive Hardware Deals
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-base-content tracking-tight">
            GearStore Promotional Voucher Hub
          </h1>
          <p className="text-xs text-base-content/60 leading-relaxed">
            Claim seasonal checkout discount codes, unlock tier thresholds, and save on premium GPUs, processors, and custom rig configurations.
          </p>
        </div>

        <div className="p-4 bg-base-100/80 rounded-2xl border border-base-content/10 text-center space-y-1 shrink-0 w-full sm:w-auto">
          <span className="text-[10px] font-bold text-base-content/50 uppercase block">
            Active Deals Ready
          </span>
          <span className="text-3xl font-black text-primary font-mono block">
            {vouchers.length} Vouchers
          </span>
          <span className="text-[10px] text-success font-semibold flex items-center justify-center gap-1">
            <ShieldCheck className="w-3 h-3" /> 100% Verified Valid
          </span>
        </div>
      </div>

      {/* Filter Tabs & Subheader */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-base-content/10 pb-4">
        <div>
          <h2 className="text-lg font-black text-base-content flex items-center gap-2">
            <Ticket className="w-5 h-5 text-primary" /> Available Promo Vouchers
          </h2>
          <p className="text-xs text-base-content/50">
            Copy code and apply directly inside your shopping cart drawer
          </p>
        </div>

        <div className="flex items-center gap-1.5 bg-base-200 p-1 rounded-2xl border border-base-content/10">
          <button
            onClick={() => setFilterType('ALL')}
            className={`btn btn-xs rounded-xl font-bold transition-all ${
              filterType === 'ALL' ? 'btn-primary shadow-sm' : 'btn-ghost'
            }`}
          >
            All ({vouchers.length})
          </button>
          <button
            onClick={() => setFilterType('percentage')}
            className={`btn btn-xs rounded-xl font-bold transition-all ${
              filterType === 'percentage' ? 'btn-primary shadow-sm' : 'btn-ghost'
            }`}
          >
            % Discount
          </button>
          <button
            onClick={() => setFilterType('fixed')}
            className={`btn btn-xs rounded-xl font-bold transition-all ${
              filterType === 'fixed' ? 'btn-primary shadow-sm' : 'btn-ghost'
            }`}
          >
            Cash Voucher ($)
          </button>
        </div>
      </div>

      {/* Voucher Cards Grid */}
      {loading ? (
        <div className="py-24 text-center">
          <span className="loading loading-spinner loading-lg text-primary"></span>
        </div>
      ) : filteredVouchers.length === 0 ? (
        <div className="py-20 text-center space-y-4 max-w-md mx-auto bg-base-200/40 rounded-3xl border border-dashed border-base-content/15 p-8">
          <Ticket className="w-12 h-12 text-base-content/30 mx-auto" />
          <div className="space-y-1">
            <h3 className="text-base font-bold">No Active Vouchers in this Category</h3>
            <p className="text-xs text-base-content/50">
              New flash coupons are distributed weekly. Check back soon or subscribe to our newsletter below.
            </p>
          </div>
          <button
            onClick={() => setFilterType('ALL')}
            className="btn btn-primary btn-sm rounded-xl text-xs font-bold"
          >
            View All Deals
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVouchers.map((voucher) => {
            const isCopied = copiedCode === voucher.code;
            const percentClaimed = Math.min(
              100,
              Math.round((voucher.usedCount / voucher.usageLimit) * 100)
            );
            const daysRemaining = Math.max(
              0,
              Math.ceil(
                (new Date(voucher.expirationDate).getTime() - Date.now()) / (1000 * 3600 * 24)
              )
            );

            return (
              <div
                key={voucher._id}
                className="bg-base-200 border border-base-content/10 rounded-3xl p-5 flex flex-col justify-between space-y-4 shadow-sm hover:border-primary/40 transition-all relative overflow-hidden group"
              >
                {/* Decorative Ticket Perforation Dots */}
                <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-base-100 border-r border-base-content/10"></div>
                <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-base-100 border-l border-base-content/10"></div>

                <div className="space-y-3.5">
                  {/* Top Meta: Badge & Expiry countdown */}
                  <div className="flex items-center justify-between">
                    <span className="badge badge-primary badge-xs font-bold uppercase text-[9px]">
                      {voucher.discountType === 'percentage' ? 'Percentage Deal' : 'Instant Cash'}
                    </span>
                    <span className="text-[10px] font-mono text-base-content/50 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {daysRemaining > 0 ? `${daysRemaining} days remaining` : 'Expires today'}
                    </span>
                  </div>

                  {/* Main Value Banner */}
                  <div className="p-4 bg-base-100 rounded-2xl border border-base-content/5 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                      {voucher.discountType === 'percentage' ? (
                        <Percent className="w-6 h-6" />
                      ) : (
                        <DollarSign className="w-6 h-6" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <span className="text-xl font-black text-primary font-mono block">
                        {voucher.discountType === 'percentage'
                          ? `${voucher.discountValue}% OFF`
                          : `$${voucher.discountValue} OFF`}
                      </span>
                      <span className="text-xs font-bold text-base-content block truncate">
                        {voucher.discountType === 'percentage' && voucher.maxDiscount
                          ? `Capped at max $${voucher.maxDiscount}`
                          : 'Valid across entire cart'}
                      </span>
                    </div>
                  </div>

                  {/* Requirements List */}
                  <div className="space-y-1.5 text-xs text-base-content/70">
                    <div className="flex justify-between">
                      <span>Minimum Purchase:</span>
                      <span className="font-bold text-base-content font-mono">
                        ${voucher.minOrderValue}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Valid Until:</span>
                      <span className="font-mono text-base-content">
                        {new Date(voucher.expirationDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {/* Quota Progress Bar */}
                  <div className="space-y-1 pt-2 border-t border-base-content/10 text-[11px]">
                    <div className="flex justify-between text-base-content/60">
                      <span>Claimed:</span>
                      <span className="font-mono font-bold text-base-content">
                        {percentClaimed}% of quota
                      </span>
                    </div>
                    <progress
                      className="progress progress-primary w-full h-1.5 bg-base-300"
                      value={voucher.usedCount}
                      max={voucher.usageLimit}
                    />
                  </div>
                </div>

                {/* Bottom One-tap Copy Bar */}
                <div className="pt-2 border-t border-base-content/10 flex items-center gap-2">
                  <div className="p-2 bg-base-100 rounded-xl border border-base-content/10 font-mono font-black text-xs text-primary flex-1 text-center tracking-wider truncate">
                    {voucher.code}
                  </div>

                  <button
                    onClick={() => handleCopyCode(voucher.code)}
                    className={`btn btn-sm rounded-xl font-bold text-xs gap-1.5 shrink-0 ${
                      isCopied ? 'btn-success text-white' : 'btn-primary'
                    }`}
                  >
                    {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {isCopied ? 'Copied' : 'Copy Code'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* How to Use Vouchers Guide */}
      <div className="p-6 sm:p-8 bg-base-200/50 border border-base-content/10 rounded-3xl space-y-4">
        <h3 className="text-base font-black text-base-content flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" /> How to Redeem Your Voucher Codes
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-base-content/70">
          <div className="p-4 bg-base-100 rounded-2xl border border-base-content/5 space-y-1">
            <span className="font-bold text-primary font-mono text-sm block">01. Copy Code</span>
            <p>Click "Copy Code" on any voucher card above to copy it to your clipboard.</p>
          </div>
          <div className="p-4 bg-base-100 rounded-2xl border border-base-content/5 space-y-1">
            <span className="font-bold text-primary font-mono text-sm block">02. Add Components</span>
            <p>Pick your required processors, graphics cards, or customized rigs meeting the minimum order spend.</p>
          </div>
          <div className="p-4 bg-base-100 rounded-2xl border border-base-content/5 space-y-1">
            <span className="font-bold text-primary font-mono text-sm block">03. Instant Deduction</span>
            <p>Paste the code or click the voucher selector inside your Cart to deduct the discount immediately.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoucherHubPage;