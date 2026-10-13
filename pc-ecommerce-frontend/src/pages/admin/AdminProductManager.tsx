import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import type { Product } from '../../types';
import { Editor } from '@tinymce/tinymce-react';
import {
  Package,
  Plus,
  Trash2,
  Edit3,
  X,
  Check,
  Search,
  Upload,
  Cpu,
  FileEdit,
} from 'lucide-react';

const CATEGORIES = ['GPU', 'CPU', 'RAM', 'Mainboard', 'PSU', 'Case', 'Monitor', 'Storage', 'Gear'];

const SPEC_PRESETS: Record<string, string[]> = {
  CPU: ['Cores & Threads', 'Socket Type', 'Base Clock', 'Boost Clock', 'L3 Cache', 'TDP / Power Consumption'],
  GPU: ['VRAM Capacity & Type', 'Memory Bus Width', 'CUDA Cores / Stream Processors', 'Recommended PSU', 'Outputs (HDMI / DP)'],
  RAM: ['Capacity', 'Memory Type (DDR4/DDR5)', 'Bus Speed', 'Latency / Timings', 'Voltage'],
  Mainboard: ['Chipset', 'Socket', 'Form Factor (ATX/mATX)', 'RAM Slots Supported', 'PCIe Version'],
  Storage: ['Interface (NVMe PCIe / SATA)', 'Form Factor', 'Read Speed', 'Write Speed', 'TBW Endurance'],
  PSU: ['Form Factor', 'Wattage Output', 'Efficiency Certification', 'Modularity'],
  Case: ['Motherboard Support', 'Dimensions', 'Max GPU Length', 'Fan Support'],
  Monitor: ['Screen Size', 'Resolution', 'Refresh Rate', 'Panel Type', 'Response Time'],
};

export const AdminProductManager: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    brand: '',
    category: 'GPU',
    price: 0,
    discountPrice: 0,
    stock: 0,
    images: '',
    description: '',
  });

  // Specs State
  const [specsList, setSpecsList] = useState<{ label: string; value: string }[]>([]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await api.get<{ products: Product[] }>('/products?limit=100');
      setProducts(res.data.products || []);
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to fetch inventory.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleOpenAddModal = () => {
    setFormData({
      name: '',
      slug: '',
      brand: '',
      category: 'GPU',
      price: 0,
      discountPrice: 0,
      stock: 10,
      images: '',
      description: '<h2>Đặc điểm nổi bật</h2><p>Nhập mô tả sản phẩm tại đây...</p>',
    });
    setSpecsList([]);
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name || '',
      slug: product.slug || '',
      brand: product.brand || '',
      category: product.category || 'GPU',
      price: product.price || 0,
      discountPrice: product.discountPrice || 0,
      stock: product.stock || 0,
      images: Array.isArray(product.images) ? product.images.join(', ') : '',
      description: product.description || '',
    });

    if (product.specs && Array.isArray(product.specs)) {
      setSpecsList(
        product.specs.map((s) => ({
          label: s.label || '',
          value: s.value || '',
        }))
      );
    } else {
      setSpecsList([]);
    }
  };

  const handleApplyPreset = (cat: string) => {
    const fields = SPEC_PRESETS[cat] || ['Specification 1', 'Specification 2'];
    setSpecsList(fields.map((f) => ({ label: f, value: '' })));
  };

  const handleAddSpecRow = () => {
    setSpecsList([...specsList, { label: '', value: '' }]);
  };

  const handleRemoveSpecRow = (index: number) => {
    setSpecsList(specsList.filter((_, i) => i !== index));
  };

  const handleSpecChange = (index: number, field: 'label' | 'value', val: string) => {
    const updated = [...specsList];
    updated[index][field] = val;
    setSpecsList(updated);
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
      const newUrl = res.data.imageUrl;
      setFormData((prev) => ({
        ...prev,
        images: prev.images ? `${prev.images}, ${newUrl}` : newUrl,
      }));
      showToast('Ảnh đã được thêm vào thư viện sản phẩm.');
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Tải ảnh thất bại.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const payload = {
        ...formData,
        price: Number(formData.price),
        discountPrice: Number(formData.discountPrice),
        stock: Number(formData.stock),
        images: formData.images
          ? formData.images.split(',').map((img) => img.trim()).filter(Boolean)
          : [],
        specs: specsList
          .map((s) => ({
            label: (s?.label || '').trim(),
            value: (s?.value || '').trim(),
          }))
          .filter((s) => s.label && s.value),
      };

      if (editingProduct) {
        await api.put(`/products/${editingProduct._id}`, payload);
        showToast('Cập nhật sản phẩm thành công.');
        setEditingProduct(null);
      } else {
        await api.post('/products', payload);
        showToast('Tạo mới sản phẩm thành công.');
        setIsAddModalOpen(false);
      }
      await fetchProducts();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Lỗi khi lưu sản phẩm.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteProduct = async (id: string, name: string) => {
    if (!window.confirm(`Xác nhận xóa linh kiện "${name}"?`)) return;

    try {
      await api.delete(`/products/${id}`);
      showToast('Đã xóa linh kiện.');
      setProducts((prev) => prev.filter((item) => item._id !== id));
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Xóa thất bại.');
    }
  };

  const filteredProducts = products.filter(
    (item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {toastMessage && (
        <div className="toast toast-top toast-end z-50">
          <div className="alert alert-info shadow-xl rounded-2xl text-xs font-bold text-white">
            <Check className="w-4 h-4" /> {toastMessage}
          </div>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-base-content flex items-center gap-2">
            <Package className="w-6 h-6 text-primary" /> Hardware Inventory
          </h1>
          <p className="text-xs text-base-content/60">
            Quản lý kho hàng, thông số kỹ thuật và bài viết mô tả sản phẩm.
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="btn btn-primary btn-sm rounded-xl font-bold gap-2 text-xs shadow-md shadow-primary/20"
        >
          <Plus className="w-4 h-4" /> Thêm Sản Phẩm Mới
        </button>
      </div>

      {/* Search Filter */}
      <div className="flex items-center gap-3 bg-base-200 p-2.5 rounded-2xl border border-base-content/10 max-w-md">
        <Search className="w-4 h-4 text-base-content/40 ml-1" />
        <input
          type="text"
          placeholder="Tìm theo tên, hãng hoặc danh mục..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="bg-transparent border-none outline-none text-xs w-full placeholder:text-base-content/40"
        />
      </div>

      {/* Products Table */}
      <div className="bg-base-200 border border-base-content/10 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="table table-zebra w-full text-xs">
            <thead>
              <tr className="border-b border-base-content/10 text-base-content/60 font-bold uppercase text-[11px]">
                <th>Sản phẩm</th>
                <th>Danh mục</th>
                <th>Giá bán</th>
                <th>Giảm giá</th>
                <th>Tồn kho</th>
                <th className="text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-12">
                    <span className="loading loading-spinner loading-md text-primary"></span>
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-base-content/50">
                    Không tìm thấy sản phẩm phù hợp.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => (
                  <tr key={p._id} className="hover:bg-base-300/40 transition-colors">
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-base-100 border border-base-content/10 p-1 flex items-center justify-center shrink-0">
                          <img
                            src={p.images?.[0] || 'https://via.placeholder.com/60'}
                            alt={p.name}
                            className="max-h-full max-w-full object-contain"
                          />
                        </div>
                        <div>
                          <span className="font-bold text-base-content line-clamp-1 max-w-xs block">
                            {p.name}
                          </span>
                          <span className="text-[10px] text-base-content/50 uppercase font-semibold">
                            {p.brand}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-ghost font-bold text-[10px]">{p.category}</span>
                    </td>
                    <td className="font-bold text-base-content">${p.price}</td>
                    <td>
                      {p.discountPrice ? (
                        <span className="badge badge-error badge-outline font-bold text-[10px]">
                          ${p.discountPrice}
                        </span>
                      ) : (
                        <span className="text-base-content/40">-</span>
                      )}
                    </td>
                    <td>
                      <span
                        className={`badge font-bold text-[10px] ${
                          p.stock <= 5 ? 'badge-error' : 'badge-success badge-outline'
                        }`}
                      >
                        {p.stock} cái
                      </span>
                    </td>
                    <td className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEditModal(p)}
                          className="btn btn-square btn-ghost btn-xs rounded-lg text-primary hover:bg-primary/10"
                          title="Sửa sản phẩm"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(p._id, p.name)}
                          className="btn btn-square btn-ghost btn-xs rounded-lg text-error hover:bg-error/10"
                          title="Xóa"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit / Add Modal */}
      {(isAddModalOpen || editingProduct) && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-base-200 border border-base-content/10 rounded-3xl p-6 sm:p-8 w-full max-w-4xl shadow-2xl space-y-6 my-6 max-h-[94vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-base-content/10 pb-4">
              <h2 className="text-base font-black text-base-content flex items-center gap-2">
                {editingProduct ? <Edit3 className="w-4 h-4 text-primary" /> : <Plus className="w-4 h-4 text-primary" />}
                {editingProduct ? 'Chỉnh Sửa Sản Phẩm' : 'Tạo Sản Phẩm Mới'}
              </h2>
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  setEditingProduct(null);
                }}
                className="btn btn-ghost btn-xs btn-circle"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="form-control sm:col-span-2">
                  <label className="label text-xs font-bold">Tên sản phẩm</label>
                  <input
                    type="text"
                    required
                    className="input input-bordered input-sm rounded-xl text-xs"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div className="form-control">
                  <label className="label text-xs font-bold">Đường dẫn tĩnh (Slug)</label>
                  <input
                    type="text"
                    required
                    className="input input-bordered input-sm rounded-xl text-xs"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  />
                </div>

                <div className="form-control">
                  <label className="label text-xs font-bold">Thương hiệu / Hãng</label>
                  <input
                    type="text"
                    required
                    className="input input-bordered input-sm rounded-xl text-xs"
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                  />
                </div>

                <div className="form-control">
                  <label className="label text-xs font-bold">Danh mục</label>
                  <select
                    className="select select-bordered select-sm rounded-xl text-xs"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-control">
                  <label className="label text-xs font-bold">Số lượng tồn kho</label>
                  <input
                    type="number"
                    min="0"
                    required
                    className="input input-bordered input-sm rounded-xl text-xs"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
                  />
                </div>

                <div className="form-control">
                  <label className="label text-xs font-bold">Giá bán gốc ($)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    className="input input-bordered input-sm rounded-xl text-xs"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                  />
                </div>

                <div className="form-control">
                  <label className="label text-xs font-bold">Giá khuyến mãi ($ tùy chọn)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    className="input input-bordered input-sm rounded-xl text-xs"
                    value={formData.discountPrice}
                    onChange={(e) => setFormData({ ...formData, discountPrice: Number(e.target.value) })}
                  />
                </div>

                {/* Gallery Images */}
                <div className="form-control sm:col-span-2 space-y-2">
                  <label className="label text-xs font-bold pb-0">Hình ảnh đại diện sản phẩm</label>

                  <div className="flex items-center gap-3">
                    <label className={`btn btn-outline btn-sm rounded-xl text-xs gap-2 ${isUploading ? 'loading' : ''}`}>
                      <Upload className="w-4 h-4" />
                      {isUploading ? 'Đang tải...' : 'Tải ảnh đại diện'}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                        disabled={isUploading}
                      />
                    </label>
                    <span className="text-[11px] text-base-content/50">Ảnh hiển thị ngoài catalog và giỏ hàng</span>
                  </div>

                  <input
                    type="text"
                    required
                    placeholder="URL ảnh 1, URL ảnh 2 (cách nhau dấu phẩy)..."
                    className="input input-bordered input-sm rounded-xl text-xs w-full"
                    value={formData.images}
                    onChange={(e) => setFormData({ ...formData, images: e.target.value })}
                  />
                </div>

                {/* Technical Specifications Section */}
                <div className="form-control sm:col-span-2 space-y-2 border-t border-base-content/10 pt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="label text-xs font-black p-0 flex items-center gap-1.5">
                        <Cpu className="w-3.5 h-3.5 text-primary" /> Bảng Thông Số Kỹ Thuật
                      </label>
                      <span className="text-[11px] text-base-content/50">Cấu hình nhanh (Số nhân, xung nhịp, VRAM...)</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleApplyPreset(formData.category)}
                        className="btn btn-ghost btn-xs rounded-lg text-primary text-[11px] font-bold hover:bg-primary/10"
                      >
                        Nạp mẫu {formData.category}
                      </button>
                      <button
                        type="button"
                        onClick={handleAddSpecRow}
                        className="btn btn-outline btn-xs rounded-lg text-[11px] font-bold gap-1"
                      >
                        <Plus className="w-3 h-3" /> Thêm dòng
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                    {specsList.length === 0 ? (
                      <div className="p-3 text-center bg-base-100 rounded-xl text-xs text-base-content/40 border border-dashed border-base-content/20">
                        Chưa có thông số. Bấm "Nạp mẫu" để điền nhanh các trường thông dụng.
                      </div>
                    ) : (
                      specsList.map((row, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <input
                            type="text"
                            placeholder="Tên thông số"
                            className="input input-bordered input-xs rounded-lg text-xs w-2/5"
                            value={row.label || ''}
                            onChange={(e) => handleSpecChange(idx, 'label', e.target.value)}
                          />
                          <input
                            type="text"
                            placeholder="Giá trị"
                            className="input input-bordered input-xs rounded-lg text-xs flex-1"
                            value={row.value || ''}
                            onChange={(e) => handleSpecChange(idx, 'value', e.target.value)}
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveSpecRow(idx)}
                            className="btn btn-ghost btn-xs btn-square text-error hover:bg-error/10"
                          >
                            ✕
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* TINYMCE WYSIWYG EDITOR - MODERN DARK SAAS THEME */}
                <div className="form-control sm:col-span-2 space-y-2 border-t border-base-content/10 pt-4">
                  <div>
                    <label className="label text-xs font-black p-0 flex items-center gap-1.5">
                      <FileEdit className="w-3.5 h-3.5 text-primary" /> Bài Viết & Đánh Giá Chi Tiết
                    </label>
                    <span className="text-[11px] text-base-content/50">
                      Soạn thảo trực quan. Bấm vào ảnh để kéo góc đổi kích thước hoặc chọn Canh trái/Canh phải để chữ tự động bao quanh ảnh.
                    </span>
                  </div>

                  <div className="rounded-2xl overflow-hidden border border-base-content/10 shadow-sm tinymce-custom-wrapper">
                    <Editor
                      tinymceScriptSrc="https://cdnjs.cloudflare.com/ajax/libs/tinymce/6.8.3/tinymce.min.js"
                      value={formData.description}
                      onEditorChange={(content) =>
                        setFormData((prev) => ({ ...prev, description: content }))
                      }
                      init={{
                        height: 440,
                        menubar: false, // Ẩn thanh menu cũ kỹ phía trên
                        plugins: [
                          'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
                          'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
                          'insertdatetime', 'media', 'table', 'wordcount',
                        ],
                        toolbar:
                          'undo redo | blocks | bold italic underline forecolor | ' +
                          'alignleft aligncenter alignright alignjustify | ' +
                          'bullist numlist | image table link | removeformat fullscreen',
                        skin: 'oxide-dark',
                        content_css: 'dark',
                        branding: false, // Xóa logo TinyMCE
                        promotion: false, // Xóa nút "Upgrade" màu cam/xanh
                        statusbar: true,
                        elementpath: false, // Ẩn thanh chỉ báo thẻ HTML (div > span...)
                        content_style: `
                          body {
                            font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
                            font-size: 14px;
                            line-height: 1.7;
                            padding: 18px 24px;
                            color: #f1f5f9;
                            background-color: #15191e;
                          }
                          h2 { font-size: 1.4rem; font-weight: 800; margin: 1.4rem 0 0.6rem; color: #ffffff; border-bottom: 1px solid rgba(255,255,255,0.08); padding-bottom: 0.4rem; }
                          h3 { font-size: 1.2rem; font-weight: 700; margin: 1.2rem 0 0.5rem; color: #38bdf8; }
                          p { margin: 0 0 1rem; color: #cbd5e1; }
                          img {
                            max-width: 100%;
                            height: auto;
                            border-radius: 12px;
                            box-shadow: 0 4px 16px rgba(0,0,0,0.4);
                            margin: 12px 0;
                            border: 1px solid rgba(255,255,255,0.1);
                          }
                          img[style*="float: left"], img[align="left"] { margin: 4px 20px 16px 0; }
                          img[style*="float: right"], img[align="right"] { margin: 4px 0 16px 20px; }
                          table { width: 100%; border-collapse: collapse; margin: 14px 0; border-radius: 8px; overflow: hidden; }
                          table th, table td { border: 1px solid rgba(255,255,255,0.12); padding: 10px 14px; font-size: 13px; }
                          table th { background-color: rgba(255,255,255,0.05); font-weight: 700; color: #fff; }
                        `,
                        images_upload_handler: (blobInfo: any) =>
                          new Promise(async (resolve, reject) => {
                            try {
                              const uploadData = new FormData();
                              uploadData.append('image', blobInfo.blob(), blobInfo.filename());
                              const res = await api.post('/upload', uploadData, {
                                headers: { 'Content-Type': 'multipart/form-data' },
                              });
                              resolve(res.data.imageUrl);
                            } catch (err: any) {
                              reject(err.response?.data?.message || 'Tải ảnh lên máy chủ thất bại');
                            }
                          }),
                        image_caption: true,
                        image_advtab: true,
                        image_dimensions: true,
                        automatic_uploads: true,
                      }}
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-base-content/10">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setEditingProduct(null);
                  }}
                  className="btn btn-ghost btn-sm rounded-xl text-xs font-bold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`btn btn-primary btn-sm rounded-xl text-xs font-bold gap-2 ${
                    isSubmitting ? 'loading' : ''
                  }`}
                >
                  <Check className="w-4 h-4" /> {editingProduct ? 'Lưu Thay Đổi' : 'Tạo Sản Phẩm'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Global CSS Overrides for TinyMCE Dark SaaS Look */}
      <style>{`
        .tinymce-custom-wrapper .tox-tinymce {
          border: 1px solid rgba(255, 255, 255, 0.1) !important;
          border-radius: 1rem !important;
          background-color: #15191e !important;
        }
        .tinymce-custom-wrapper .tox .tox-toolbar, 
        .tinymce-custom-wrapper .tox .tox-toolbar__primary {
          background-color: #191e24 !important;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08) !important;
          padding: 6px 10px !important;
        }
        .tinymce-custom-wrapper .tox .tox-statusbar {
          background-color: #191e24 !important;
          border-top: 1px solid rgba(255, 255, 255, 0.08) !important;
          color: rgba(255, 255, 255, 0.4) !important;
        }
        .tinymce-custom-wrapper .tox .tox-tbtn {
          color: #94a3b8 !important;
          border-radius: 8px !important;
          margin: 1px 2px !important;
        }
        .tinymce-custom-wrapper .tox .tox-tbtn:hover {
          background-color: rgba(255, 255, 255, 0.08) !important;
          color: #f8fafc !important;
        }
        .tinymce-custom-wrapper .tox .tox-tbtn--enabled,
        .tinymce-custom-wrapper .tox .tox-tbtn--active {
          background-color: rgba(59, 130, 246, 0.2) !important;
          color: #60a5fa !important;
        }
      `}</style>
    </div>
  );
};

export default AdminProductManager;