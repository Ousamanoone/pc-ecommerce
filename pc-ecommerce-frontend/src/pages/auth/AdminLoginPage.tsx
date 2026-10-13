import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { ShieldAlert, Lock, Mail, ArrowRight, AlertCircle, UserPlus } from 'lucide-react';

export const AdminLoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await api.post('/auth/login', { email, password });
      const resData = response.data;

      const token = resData.token || (resData.user && resData.user.token);
      const userData = resData.user || resData;

      if (!token || !userData) {
        throw new Error('Dữ liệu phản hồi từ server không hợp lệ.');
      }

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      login(token, userData);

      if (userData.role === 'admin' || userData.role === 'staff') {
        navigate('/admin/dashboard');
      } else {
        navigate('/');
      }
    } catch (err: any) {
      console.error('Lỗi đăng nhập:', err);
      const serverMsg = err.response?.data?.message;
      const clientMsg = err.message;
      setError(serverMsg || clientMsg || 'Đăng nhập thất bại. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-base-200 border border-base-content/10 rounded-3xl p-8 shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary mx-auto flex items-center justify-center">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-black text-base-content tracking-tight">
            Sign In to GearStore
          </h1>
          <p className="text-xs text-base-content/50">
            Access your customer account or internal staff portal.
          </p>
        </div>

        {error && (
          <div className="alert alert-error rounded-2xl text-xs font-bold text-white flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-base-content/70">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-base-content/40" />
              <input
                type="email"
                required
                placeholder="name@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input input-bordered input-sm rounded-xl w-full pl-10 text-xs bg-base-100"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-base-content/70">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-base-content/40" />
              <input
                type="password"
                required
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input input-bordered input-sm rounded-xl w-full pl-10 text-xs bg-base-100"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary btn-sm rounded-xl w-full font-black text-xs gap-2 mt-2 shadow-lg shadow-primary/20"
          >
            {loading ? (
              <span className="loading loading-spinner loading-xs"></span>
            ) : (
              <>
                Sign In <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>

        {/* Link chuyển sang trang Đăng ký cho khách hàng */}
        <div className="pt-4 border-t border-base-content/10 text-center space-y-3">
          <p className="text-xs text-base-content/60">
            Don't have a customer account yet?
          </p>
          <Link
            to="/register"
            className="btn btn-outline btn-sm rounded-xl w-full font-bold text-xs gap-2"
          >
            <UserPlus className="w-3.5 h-3.5" /> Create Customer Account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;