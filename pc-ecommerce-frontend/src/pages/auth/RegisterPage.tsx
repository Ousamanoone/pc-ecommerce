import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  UserPlus,
  Mail,
  Lock,
  User,
  AlertCircle,
  ShieldCheck,
  Cpu,
} from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match. Please verify.');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must contain at least 6 characters.');
      return;
    }

    setLoading(true);

    try {
      const res = await api.post('/auth/register', {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
      });

      const resData = res.data;
      const token = resData.token || (resData.user && resData.user.token);
      const userData = resData.user || resData;

      if (token && userData) {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));
        login(token, userData);
      }

      navigate('/');
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          'Registration failed. Email may already be in use.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center py-10 px-4">
      <div className="bg-base-200/70 border border-base-content/10 rounded-3xl p-6 sm:p-10 w-full max-w-md shadow-xl space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-primary text-primary-content flex items-center justify-center font-black mx-auto shadow-md shadow-primary/20">
            <Cpu className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-black text-base-content tracking-tight">
            Create Customer Account
          </h1>
          <p className="text-xs text-base-content/60">
            Join the GearStore community to save custom PC builds, track dispatches, and unlock exclusive discounts.
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="alert alert-error rounded-2xl text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="form-control">
            <label className="label text-xs font-bold text-base-content/80">
              Full Name
            </label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-base-content/40" />
              <input
                type="text"
                required
                placeholder="Alex Morgan"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="input input-bordered input-sm rounded-xl pl-10 text-xs w-full bg-base-100"
              />
            </div>
          </div>

          <div className="form-control">
            <label className="label text-xs font-bold text-base-content/80">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-base-content/40" />
              <input
                type="email"
                required
                placeholder="alex.morgan@domain.com"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="input input-bordered input-sm rounded-xl pl-10 text-xs w-full bg-base-100 font-mono"
              />
            </div>
          </div>

          <div className="form-control">
            <label className="label text-xs font-bold text-base-content/80">
              Password (Min. 6 chars)
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-base-content/40" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                className="input input-bordered input-sm rounded-xl pl-10 text-xs w-full bg-base-100 font-mono"
              />
            </div>
          </div>

          <div className="form-control">
            <label className="label text-xs font-bold text-base-content/80">
              Confirm Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-base-content/40" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={(e) =>
                  setFormData({ ...formData, confirmPassword: e.target.value })
                }
                className="input input-bordered input-sm rounded-xl pl-10 text-xs w-full bg-base-100 font-mono"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`btn btn-primary w-full rounded-xl font-bold text-xs py-2.5 gap-2 shadow-md shadow-primary/20 ${
              loading ? 'loading' : ''
            }`}
          >
            <UserPlus className="w-4 h-4" /> Create Account
          </button>
        </form>

        {/* Direct Link to Login */}
        <div className="pt-2 text-center text-xs text-base-content/60 border-t border-base-content/10">
          <span>Already have a GearStore account? </span>
          <Link
            to="/admin/login"
            className="text-primary font-bold hover:underline"
          >
            Sign In Here
          </Link>
        </div>

        {/* Security badge */}
        <div className="flex items-center justify-center gap-1.5 text-[11px] text-base-content/40">
          <ShieldCheck className="w-3.5 h-3.5 text-success" />
          <span>Encrypted with salted Bcrypt security</span>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;