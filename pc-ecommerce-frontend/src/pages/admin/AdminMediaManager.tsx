import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import {
  FolderOpen,
  Upload,
  Copy,
  Trash2,
  Check,
  Search,
  FileImage,
  ExternalLink,
  HardDrive,
} from 'lucide-react';

interface MediaItem {
  name: string;
  url: string;
  size: number;
  createdAt: string;
}

export const AdminMediaManager: React.FC = () => {
  const [mediaList, setMediaList] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [uploading, setUploading] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const fetchMediaList = async () => {
    setLoading(true);
    try {
      const res = await api.get<MediaItem[]>('/media');
      setMediaList(res.data || []);
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to retrieve media files.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMediaList();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    const uploadData = new FormData();

    // Upload first selected image
    uploadData.append('image', files[0]);

    try {
      await api.post('/upload', uploadData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      showToast(`Asset "${files[0].name}" uploaded successfully.`);
      fetchMediaList();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Upload failed.');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleCopyUrl = (relativeUrl: string) => {
    const fullUrl = window.location.origin + relativeUrl;
    navigator.clipboard.writeText(fullUrl);
    setCopiedUrl(relativeUrl);
    showToast('Direct asset URL copied to clipboard.');
    setTimeout(() => setCopiedUrl(null), 2500);
  };

  const handleDeleteFile = async (filename: string) => {
    if (!window.confirm(`Permanently remove file "${filename}"?`)) return;

    try {
      await api.delete(`/media/${filename}`);
      showToast(`Asset "${filename}" deleted.`);
      setMediaList((prev) => prev.filter((m) => m.name !== filename));
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to delete asset.');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const filteredMedia = mediaList.filter((m) =>
    m.name.toLowerCase().includes(searchQuery.toLowerCase().trim())
  );

  const totalStorageBytes = mediaList.reduce((acc, item) => acc + item.size, 0);

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
            <FolderOpen className="w-6 h-6 text-primary" /> Media Storage & Asset Library
          </h1>
          <p className="text-xs text-base-content/60">
            Manage product photography, promotional banner assets, and rich media files.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchMediaList}
            className="btn btn-ghost btn-sm rounded-xl text-xs font-bold border border-base-content/10"
          >
            Refresh Assets
          </button>

          <label
            className={`btn btn-primary btn-sm rounded-xl text-xs font-bold gap-1.5 shadow-md shadow-primary/20 ${
              uploading ? 'loading' : ''
            }`}
          >
            <Upload className="w-4 h-4" />
            {uploading ? 'Uploading...' : 'Upload Media Asset'}
            <input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
              disabled={uploading}
            />
          </label>
        </div>
      </div>

      {/* Storage Metrics & Search Filter */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-base-200 p-3 rounded-2xl border border-base-content/10">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <Search className="w-4 h-4 text-base-content/40 ml-1" />
          <input
            type="text"
            placeholder="Search assets by file name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent border-none outline-none text-xs w-full placeholder:text-base-content/40"
          />
        </div>

        <div className="flex items-center gap-3 text-xs text-base-content/60 font-mono px-2">
          <span className="flex items-center gap-1.5">
            <HardDrive className="w-3.5 h-3.5 text-primary" />
            Total: {mediaList.length} files ({formatFileSize(totalStorageBytes)})
          </span>
        </div>
      </div>

      {/* Media Grid */}
      {loading ? (
        <div className="py-20 text-center">
          <span className="loading loading-spinner loading-lg text-primary"></span>
        </div>
      ) : filteredMedia.length === 0 ? (
        <div className="py-16 text-center space-y-4 bg-base-200 border border-dashed border-base-content/10 rounded-3xl max-w-md mx-auto">
          <FileImage className="w-12 h-12 text-base-content/30 mx-auto" />
          <div className="space-y-1">
            <h3 className="text-base font-bold">No Media Assets Found</h3>
            <p className="text-xs text-base-content/50">
              Upload hardware component pictures or hero promotional slides to store them on the server.
            </p>
          </div>
          <label className="btn btn-primary btn-sm rounded-xl text-xs font-bold">
            Upload File
            <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
          </label>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {filteredMedia.map((file) => (
            <div
              key={file.name}
              className="bg-base-200 border border-base-content/10 rounded-2xl p-2.5 flex flex-col justify-between space-y-2 shadow-xs hover:border-primary/40 transition-all group relative"
            >
              {/* Thumbnail Container */}
              <div className="h-32 rounded-xl bg-base-100 p-2 flex items-center justify-center border border-base-content/5 overflow-hidden relative">
                <img
                  src={file.url}
                  alt={file.name}
                  className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
                />

                {/* Hover overlay with Open in new tab */}
                <a
                  href={file.url}
                  target="_blank"
                  rel="noreferrer"
                  className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white"
                  title="View Full Resolution"
                >
                  <ExternalLink className="w-5 h-5" />
                </a>
              </div>

              {/* File Details */}
              <div className="space-y-0.5 min-w-0">
                <p className="font-bold text-[11px] text-base-content truncate" title={file.name}>
                  {file.name}
                </p>
                <div className="flex items-center justify-between text-[10px] text-base-content/50 font-mono">
                  <span>{formatFileSize(file.size)}</span>
                  <span>{new Date(file.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="pt-2 border-t border-base-content/10 flex items-center gap-1.5">
                <button
                  onClick={() => handleCopyUrl(file.url)}
                  className="btn btn-ghost btn-xs rounded-lg text-[10px] font-bold flex-1 gap-1 border border-base-content/10 hover:border-primary"
                >
                  {copiedUrl === file.url ? (
                    <Check className="w-3 h-3 text-success" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                  <span>{copiedUrl === file.url ? 'Copied' : 'Copy URL'}</span>
                </button>

                <button
                  onClick={() => handleDeleteFile(file.name)}
                  className="btn btn-ghost btn-xs btn-square text-error hover:bg-error/10"
                  title="Delete asset"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminMediaManager;