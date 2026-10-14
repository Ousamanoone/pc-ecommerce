import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useTheme } from '../../context/ThemeContext';
import {
  Share2,
  MessageCircle,
  Phone,
  Mail,
  Globe,
  CheckCircle2,
  Save,
} from 'lucide-react';

const FacebookIcon = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
  </svg>
);

const YoutubeIcon = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
  </svg>
);

export const AdminSocialSettings: React.FC = () => {
  const { socialSettings, refreshSocialSettings } = useTheme();
  const [formData, setFormData] = useState(socialSettings);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    setFormData(socialSettings);
  }, [socialSettings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setToast(null);
    try {
      await api.put('/settings', formData);
      await refreshSocialSettings();
      setToast('Đã cập nhật đường dẫn Fanpage & Liên hệ thành công!');
      setTimeout(() => setToast(null), 3500);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Lỗi khi lưu cấu hình.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div className="border-b border-base-content/10 pb-4">
        <span className="badge badge-primary badge-xs font-bold uppercase text-[9px] mb-1">
          Storefront Channels
        </span>
        <h1 className="text-2xl font-black text-base-content flex items-center gap-2">
          <Share2 className="w-6 h-6 text-primary" /> Social & Fanpage Links
        </h1>
        <p className="text-xs text-base-content/60 mt-0.5">
          Cấu hình đường dẫn Fanpage Facebook, Messenger, Zalo và Hotline hiển thị trên toàn hệ thống (Dành cho Admin & Staff).
        </p>
      </div>

      {toast && (
        <div className="alert alert-success rounded-2xl text-xs font-bold text-white flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toast}</span>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="bg-base-200 border border-base-content/10 rounded-3xl p-5 sm:p-8 space-y-4 shadow-sm"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="form-control">
            <label className="label text-xs font-bold gap-1.5 justify-start">
              <FacebookIcon className="w-4 h-4 text-[#1877F2]" /> Link Facebook Fanpage
            </label>
            <input
              type="url"
              placeholder="https://facebook.com/your-fanpage"
              value={formData.facebookUrl}
              onChange={(e) => setFormData({ ...formData, facebookUrl: e.target.value })}
              className="input input-bordered input-sm rounded-xl text-xs bg-base-100"
            />
          </div>

          <div className="form-control">
            <label className="label text-xs font-bold gap-1.5 justify-start">
              <MessageCircle className="w-4 h-4 text-[#0084FF]" /> Link Chat Messenger
            </label>
            <input
              type="url"
              placeholder="https://m.me/your-fanpage"
              value={formData.messengerUrl}
              onChange={(e) => setFormData({ ...formData, messengerUrl: e.target.value })}
              className="input input-bordered input-sm rounded-xl text-xs bg-base-100"
            />
          </div>

          <div className="form-control">
            <label className="label text-xs font-bold gap-1.5 justify-start">
              <Globe className="w-4 h-4 text-[#0068FF]" /> Link Zalo OA / Cá nhân
            </label>
            <input
              type="url"
              placeholder="https://zalo.me/0901234567"
              value={formData.zaloUrl}
              onChange={(e) => setFormData({ ...formData, zaloUrl: e.target.value })}
              className="input input-bordered input-sm rounded-xl text-xs bg-base-100"
            />
          </div>

          <div className="form-control">
            <label className="label text-xs font-bold gap-1.5 justify-start">
              <YoutubeIcon className="w-4 h-4 text-[#FF0000]" /> Link Kênh YouTube
            </label>
            <input
              type="url"
              placeholder="https://youtube.com/@gearstore"
              value={formData.youtubeUrl}
              onChange={(e) => setFormData({ ...formData, youtubeUrl: e.target.value })}
              className="input input-bordered input-sm rounded-xl text-xs bg-base-100"
            />
          </div>

          <div className="form-control">
            <label className="label text-xs font-bold gap-1.5 justify-start">
              <Phone className="w-4 h-4 text-success" /> Số điện thoại Hotline
            </label>
            <input
              type="text"
              placeholder="0901 234 567"
              value={formData.hotline}
              onChange={(e) => setFormData({ ...formData, hotline: e.target.value })}
              className="input input-bordered input-sm rounded-xl text-xs bg-base-100"
            />
          </div>

          <div className="form-control">
            <label className="label text-xs font-bold gap-1.5 justify-start">
              <Mail className="w-4 h-4 text-warning" /> Email hỗ trợ
            </label>
            <input
              type="email"
              placeholder="support@gearstore.com"
              value={formData.supportEmail}
              onChange={(e) => setFormData({ ...formData, supportEmail: e.target.value })}
              className="input input-bordered input-sm rounded-xl text-xs bg-base-100"
            />
          </div>
        </div>

        <div className="form-control pt-2">
          <label className="label cursor-pointer justify-start gap-3">
            <input
              type="checkbox"
              checked={formData.showFloatingSocial}
              onChange={(e) =>
                setFormData({ ...formData, showFloatingSocial: e.target.checked })
              }
              className="toggle toggle-primary toggle-sm"
            />
            <span className="text-xs font-bold">
              Hiển thị cụm nút liên hệ Fanpage nổi ở góc màn hình trang chủ
            </span>
          </label>
        </div>

        <div className="pt-4 border-t border-base-content/10 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="btn btn-primary btn-sm rounded-xl font-black text-xs gap-2 px-6"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Đang lưu...' : 'Lưu cấu hình Fanpage'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminSocialSettings;