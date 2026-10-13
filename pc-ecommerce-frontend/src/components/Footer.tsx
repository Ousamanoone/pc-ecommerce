import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import {
  Package,
  Mail,
  Send,
  Check,
  Tag,
  ShieldCheck,
  Truck,
  RotateCcw,
  Zap,
  Cpu,
  CreditCard,
  Phone,
  MapPin,
  Heart,
  Copy,
} from 'lucide-react';

export const Footer: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [welcomeCode, setWelcomeCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const res = await api.post('/subscribers', { email: email.trim() });
      setWelcomeCode(res.data.voucherCode || 'WELCOME10');
      setEmail('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to register subscription.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <footer className="bg-base-200 border-t border-base-content/10 text-base-content mt-16 print:hidden">
      {/* Top Newsletter CTA Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 border-b border-base-content/10">
        <div className="bg-gradient-to-r from-primary/15 via-base-100 to-secondary/15 border border-base-content/10 rounded-3xl p-6 sm:p-10 flex flex-col lg:flex-row items-center justify-between gap-6 shadow-sm">
          <div className="space-y-1 text-center lg:text-left max-w-lg">
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-primary/20 text-primary text-[10px] font-black uppercase tracking-wider mb-1">
              <Tag className="w-3 h-3" /> Special Subscriber Privilege
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-base-content">
              Subscribe for Hardware Drops & Instant $10 Off
            </h3>
            <p className="text-xs text-base-content/60">
              Get notified first on GPU restocks, flash component vouchers, and custom build guide releases.
            </p>
          </div>

          <div className="w-full max-w-md">
            {welcomeCode ? (
              <div className="p-4 bg-success/15 border border-success/30 rounded-2xl flex items-center justify-between gap-3 text-xs">
                <div className="space-y-0.5">
                  <span className="font-bold text-success flex items-center gap-1">
                    <Check className="w-4 h-4" /> Subscription Confirmed!
                  </span>
                  <p className="text-[11px] text-base-content/70">
                    Use code <strong className="font-mono text-base-content">{welcomeCode}</strong> on your next order.
                  </p>
                </div>
                <button
                  onClick={() => handleCopyCode(welcomeCode)}
                  className="btn btn-success btn-xs rounded-xl font-bold text-white gap-1 shrink-0 shadow-sm"
                >
                  <Copy className="w-3 h-3" /> {copied ? 'Copied' : 'Copy'}
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="space-y-2">
                <div className="relative flex items-center">
                  <Mail className="w-4 h-4 absolute left-3.5 text-base-content/40" />
                  <input
                    type="email"
                    required
                    placeholder="Enter your email for instant voucher..."
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input input-bordered input-sm rounded-2xl pl-10 pr-24 text-xs w-full bg-base-100 placeholder:text-base-content/40"
                  />
                  <button
                    type="submit"
                    disabled={loading || !email.trim()}
                    className={`btn btn-primary btn-sm rounded-xl font-bold text-xs absolute right-1 px-4 gap-1 ${
                      loading ? 'loading' : ''
                    }`}
                  >
                    <Send className="w-3.5 h-3.5" /> Claim $10
                  </button>
                </div>
                {error && <p className="text-[11px] text-error font-medium pl-2">{error}</p>}
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Main Footer Directory Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Col 1: Brand & Bio */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="text-xl font-black tracking-wider text-primary flex items-center gap-2">
              <Package className="w-6 h-6" />
              <span>GEARSTORE</span>
            </Link>
            <p className="text-xs text-base-content/60 leading-relaxed max-w-sm">
              Premier PC hardware retailer and custom workstation builder. Offering genuine desktop processors,
              graphics cards, high-speed storage, and factory warranties.
            </p>

            <div className="space-y-1.5 text-xs text-base-content/70">
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
                <span>Tech Innovation District, San Francisco, CA</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-primary shrink-0" />
                <span>Hotline: +1 (800) 432-7786 (Mon - Sat)</span>
              </div>
            </div>
          </div>

          {/* Col 2: Navigation */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-base-content">
              Explore Hardware
            </h4>
            <ul className="space-y-2 text-xs text-base-content/70">
              <li>
                <Link to="/products" className="hover:text-primary transition-colors">
                  All Components
                </Link>
              </li>
              <li>
                <Link to="/products?category=GPU" className="hover:text-primary transition-colors">
                  Graphics Cards
                </Link>
              </li>
              <li>
                <Link to="/products?category=CPU" className="hover:text-primary transition-colors">
                  Processors (CPUs)
                </Link>
              </li>
              <li>
                <Link to="/builder" className="hover:text-primary transition-colors flex items-center gap-1 text-primary font-bold">
                  <Zap className="w-3 h-3" /> Rig Configurator
                </Link>
              </li>
              <li>
                <Link to="/compare" className="hover:text-primary transition-colors">
                  Compare Specs
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Customer Care */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-base-content">
              Customer Care
            </h4>
            <ul className="space-y-2 text-xs text-base-content/70">
              <li>
                <Link to="/track-order" className="hover:text-primary transition-colors">
                  Track Package
                </Link>
              </li>
              <li>
                <Link to="/vouchers" className="hover:text-primary transition-colors">
                  Voucher Hub
                </Link>
              </li>
              <li>
                <Link to="/wishlist" className="hover:text-primary transition-colors">
                  Saved Wishlist
                </Link>
              </li>
              <li>
                <Link to="/profile" className="hover:text-primary transition-colors">
                  My Orders & Profile
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Trust & Guarantees */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-base-content">
              Service Guarantees
            </h4>
            <div className="space-y-2.5 text-xs text-base-content/70">
              <div className="flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-success shrink-0 mt-0.5" />
                <span>36-Month official warranty with factory direct replacement</span>
              </div>
              <div className="flex items-start gap-2">
                <Truck className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <span>Complimentary insured shipping on orders over $150</span>
              </div>
              <div className="flex items-start gap-2">
                <RotateCcw className="w-4 h-4 text-warning shrink-0 mt-0.5" />
                <span>7-Day hassle-free hardware returns</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Copyright Bar */}
      <div className="border-t border-base-content/10 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-base-content/50">
          <p>© {new Date().getFullYear()} GEARSTORE Technologies Inc. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span className="hover:underline cursor-pointer">Privacy Policy</span>
            <span>•</span>
            <span className="hover:underline cursor-pointer">Terms of Service</span>
            <span>•</span>
            <Link to="/admin" className="hover:text-primary font-bold">
              Admin Console
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;