import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import {
  Image as ImageIcon,
  Plus,
  Trash2,
  Edit3,
  Check,
  X,
  Upload,
  ExternalLink,
  Eye,
  EyeOff,
} from 'lucide-react';

interface Banner {
  _id: string;
  title: string;
  subtitle: string;
  badgeText: string;
  imageUrl: string;
  linkUrl: string;
  isActive: boolean;
  displayOrder: number;
}

export const AdminBannerManager: React.FC = () => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    badgeText: 'LIMITED EDITION',
    imageUrl: '',
    linkUrl: '/products',
    isActive: true,
    displayOrder: 0,
  });

  const fetchBanners = async () => {
    setLoading(true);
    try {
      const res = await api.get<Banner[]>('/banners');
      setBanners(res.data || []);
    } catch (err) {
      console.error('Failed to retrieve banners:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleOpenAddModal = () => {
    setEditingBanner(null);
    setFormData({
      title: '',
      subtitle: '',
      badgeText: 'HOT PROMOTION',
      imageUrl: '',
      linkUrl: '/products',
      isActive: true,
      displayOrder: banners.length,
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (banner: Banner) => {
    setEditingBanner(banner);
    setFormData({
      title: banner.title,
      subtitle: banner.subtitle,
      badgeText: banner.badgeText,
      imageUrl: banner.imageUrl,
      linkUrl: banner.linkUrl,
      isActive: banner.isActive,
      displayOrder: banner.displayOrder,
    });
    setIsModalOpen(true);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const uploadData = new FormData();
    uploadData.append('image', file);

    setIsUploading(true);
    try {
      const res = await api.post('/upload', uploadData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setFormData((prev) => ({ ...prev, imageUrl: res.data.imageUrl }));
      showToast('Banner background asset uploaded successfully.');
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to upload image file.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.imageUrl.trim()) {
      showToast('Please provide or upload a banner background image.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingBanner) {
        await api.put(`/banners/${editingBanner._id}`, formData);
        showToast('Promotional slide updated successfully.');
      } else {
        await api.post('/banners', formData);
        showToast('New promotional slide created.');
      }
      setIsModalOpen(false);
      fetchBanners();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to save slide.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (banner: Banner) => {
    try {
      await api.put(`/banners/${banner._id}`, { isActive: !banner.isActive });
      setBanners((prev) =>
        prev.map((b) => (b._id === banner._id ? { ...b, isActive: !b.isActive } : b))
      );
      showToast(`Banner visibility toggled ${!banner.isActive ? 'Active' : 'Inactive'}.`);
    } catch (err) {
      showToast('Failed to change slide visibility.');
    }
  };

  const handleDeleteBanner = async (id: string, title: string) => {
    if (!window.confirm(`Delete promotional slide "${title}"?`)) return;

    try {
      await api.delete(`/banners/${id}`);
      showToast('Slide deleted successfully.');
      setBanners((prev) => prev.filter((b) => b._id !== id));
    } catch (err) {
      showToast('Failed to delete slide.');
    }
  };

  return (
    <div className="space-y-6">
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
            <ImageIcon className="w-6 h-6 text-primary" /> Hero Promotional Banners
          </h1>
          <p className="text-xs text-base-content/60">
            Manage storefront slider campaigns, promotional tags, and hardware discount spotlights.
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="btn btn-primary btn-sm rounded-xl font-bold gap-2 text-xs shadow-md shadow-primary/20"
        >
          <Plus className="w-4 h-4" /> Add Hero Slide
        </button>
      </div>

      {/* Banner Cards Grid */}
      {loading ? (
        <div className="py-20 text-center">
          <span className="loading loading-spinner loading-lg text-primary"></span>
        </div>
      ) : banners.length === 0 ? (
        <div className="py-16 text-center space-y-4 bg-base-200 border border-dashed border-base-content/10 rounded-3xl max-w-md mx-auto">
          <ImageIcon className="w-12 h-12 text-base-content/30 mx-auto" />
          <div className="space-y-1">
            <h3 className="text-base font-bold">No Custom Banners Configured</h3>
            <p className="text-xs text-base-content/50">
              Create your first promotional carousel banner to highlight keyboards, GPUs, or seasonal sales.
            </p>
          </div>
          <button
            onClick={handleOpenAddModal}
            className="btn btn-primary btn-sm rounded-xl text-xs font-bold"
          >
            Create Slide
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {banners.map((banner) => (
            <div
              key={banner._id}
              className="bg-base-200 border border-base-content/10 rounded-3xl overflow-hidden shadow-sm flex flex-col justify-between"
            >
              {/* Image Preview & Overlay */}
              <div className="relative h-48 bg-base-100 flex items-center justify-center overflow-hidden">
                <img
                  src={banner.imageUrl}
                  alt={banner.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex flex-col justify-end p-5">
                  <span className="badge badge-primary badge-xs font-bold uppercase text-[9px] mb-1 w-fit">
                    {banner.badgeText}
                  </span>
                  <h3 className="text-lg font-black text-white line-clamp-1">{banner.title}</h3>
                  {banner.subtitle && (
                    <p className="text-xs text-white/80 line-clamp-1">{banner.subtitle}</p>
                  )}
                </div>

                <div className="absolute top-3 right-3 flex items-center gap-1.5">
                  <span
                    className={`badge badge-xs font-bold uppercase text-[9px] ${
                      banner.isActive ? 'badge-success' : 'badge-ghost bg-black/60 text-white'
                    }`}
                  >
                    {banner.isActive ? 'Active' : 'Hidden'}
                  </span>
                </div>
              </div>

              {/* Card Meta & Actions */}
              <div className="p-4 flex items-center justify-between gap-3 text-xs border-t border-base-content/10">
                <div className="flex items-center gap-3 text-base-content/60 font-mono">
                  <span>Order: #{banner.displayOrder}</span>
                  <span>•</span>
                  <span className="truncate max-w-[150px]">{banner.linkUrl}</span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleToggleStatus(banner)}
                    className="btn btn-ghost btn-xs btn-square"
                    title={banner.isActive ? 'Hide slide' : 'Show slide'}
                  >
                    {banner.isActive ? (
                      <Eye className="w-3.5 h-3.5 text-success" />
                    ) : (
                      <EyeOff className="w-3.5 h-3.5 text-base-content/40" />
                    )}
                  </button>
                  <button
                    onClick={() => handleOpenEditModal(banner)}
                    className="btn btn-ghost btn-xs btn-square text-primary hover:bg-primary/10"
                    title="Edit slide"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteBanner(banner._id, banner.title)}
                    className="btn btn-ghost btn-xs btn-square text-error hover:bg-error/10"
                    title="Delete slide"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit / Create Slide Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-base-200 border border-base-content/10 rounded-3xl p-6 sm:p-8 w-full max-w-lg shadow-2xl space-y-5 my-6">
            <div className="flex items-center justify-between border-b border-base-content/10 pb-4">
              <h3 className="text-base font-black text-base-content flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-primary" />
                {editingBanner ? 'Edit Promotional Slide' : 'Create New Promotional Slide'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="btn btn-ghost btn-xs btn-circle"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveBanner} className="space-y-4">
              <div className="form-control">
                <label className="label text-xs font-bold">Campaign Headline / Title</label>
                <input
                  type="text"
                  required
                  placeholder="Ultimate Mechanical Keyboards & Custom Gear"
                  className="input input-bordered input-sm rounded-xl text-xs"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              <div className="form-control">
                <label className="label text-xs font-bold">Subtitle / Supporting Description</label>
                <input
                  type="text"
                  placeholder="Discover enthusiast tactile switches, lubed stabilizers, and PBT keycaps"
                  className="input input-bordered input-sm rounded-xl text-xs"
                  value={formData.subtitle}
                  onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="form-control">
                  <label className="label text-xs font-bold">Badge Text</label>
                  <input
                    type="text"
                    required
                    placeholder="SPECIAL PROMOTION"
                    className="input input-bordered input-sm rounded-xl text-xs uppercase"
                    value={formData.badgeText}
                    onChange={(e) => setFormData({ ...formData, badgeText: e.target.value })}
                  />
                </div>

                <div className="form-control">
                  <label className="label text-xs font-bold">Display Order</label>
                  <input
                    type="number"
                    min="0"
                    className="input input-bordered input-sm rounded-xl text-xs"
                    value={formData.displayOrder}
                    onChange={(e) =>
                      setFormData({ ...formData, displayOrder: Number(e.target.value) })
                    }
                  />
                </div>
              </div>

              <div className="form-control">
                <label className="label text-xs font-bold">Target Action URL (On Click)</label>
                <input
                  type="text"
                  required
                  placeholder="/products or /product/rtx-4090"
                  className="input input-bordered input-sm rounded-xl text-xs"
                  value={formData.linkUrl}
                  onChange={(e) => setFormData({ ...formData, linkUrl: e.target.value })}
                />
              </div>

              <div className="form-control space-y-2">
                <label className="label text-xs font-bold pb-0">Banner Image (1200x500 recommended)</label>
                <div className="flex items-center gap-3">
                  <label
                    className={`btn btn-outline btn-sm rounded-xl text-xs gap-2 ${
                      isUploading ? 'loading' : ''
                    }`}
                  >
                    <Upload className="w-4 h-4" />
                    {isUploading ? 'Uploading...' : 'Upload Image'}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                      disabled={isUploading}
                    />
                  </label>
                  <span className="text-[11px] text-base-content/50">Stored in /uploads folder</span>
                </div>
                <input
                  type="text"
                  required
                  placeholder="https://... or /uploads/..."
                  className="input input-bordered input-sm rounded-xl text-xs w-full"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                />
              </div>

              <div className="form-control">
                <label className="label cursor-pointer justify-start gap-3">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="checkbox checkbox-primary checkbox-sm rounded-lg"
                  />
                  <span className="text-xs font-bold">Visible on Storefront Carousel</span>
                </label>
              </div>

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
                  className={`btn btn-primary btn-sm rounded-xl text-xs font-bold gap-2 ${
                    isSubmitting ? 'loading' : ''
                  }`}
                >
                  <Check className="w-4 h-4" /> Save Banner
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBannerManager;