import React, { useState, useEffect, useMemo } from 'react';
import api from '../../services/api';
import {
  Newspaper,
  Plus,
  Trash2,
  Check,
  Search,
  X,
  Eye,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  MessageSquare,
} from 'lucide-react';

interface Blog {
  _id: string;
  title: string;
  slug: string;
  category: 'News' | 'Guide' | 'Promotion' | 'Review';
  summary: string;
  content: string;
  coverImage: string;
  author: string;
  status: 'draft' | 'pending' | 'published' | 'rejected';
  moderationNote?: string;
  createdAt: string;
}

export const AdminBlogManager: React.FC = () => {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'ALL' | 'pending' | 'published' | 'rejected'>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [reviewingBlog, setReviewingBlog] = useState<Blog | null>(null);
  const [moderationFeedback, setModerationFeedback] = useState<string>('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    category: 'News',
    coverImage: '',
    summary: '',
    content: '',
    tags: '',
    status: 'published',
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const fetchBlogs = async () => {
    setLoading(true);
    try {
      const res = await api.get<Blog[]>('/blogs');
      setBlogs(res.data || []);
    } catch (err) {
      console.error('Failed to load articles:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.summary || !formData.content) {
      showToast('Please fill all mandatory article fields.');
      return;
    }

    try {
      await api.post('/blogs', formData);
      setIsCreateModalOpen(false);
      setFormData({
        title: '',
        category: 'News',
        coverImage: '',
        summary: '',
        content: '',
        tags: '',
        status: 'published',
      });
      fetchBlogs();
      showToast('Article submitted successfully.');
    } catch (err) {
      console.error('Failed to publish article:', err);
      showToast('Failed to create article.');
    }
  };

  const handleModerate = async (id: string, newStatus: 'published' | 'rejected') => {
    try {
      const res = await api.put<Blog>(`/blogs/${id}/moderate`, {
        status: newStatus,
        moderationNote: moderationFeedback,
      });

      setBlogs((prev) => prev.map((b) => (b._id === id ? res.data : b)));
      setReviewingBlog(null);
      setModerationFeedback('');
      showToast(newStatus === 'published' ? 'Article approved & published live.' : 'Article rejected.');
    } catch (err) {
      console.error('Moderation error:', err);
      showToast('Moderation action failed.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Permanently remove this article?')) return;
    try {
      await api.delete(`/blogs/${id}`);
      setBlogs((prev) => prev.filter((b) => b._id !== id));
      if (reviewingBlog?._id === id) setReviewingBlog(null);
      showToast('Article deleted.');
    } catch (err) {
      console.error('Failed to delete blog:', err);
    }
  };

  // Metrics
  const metrics = useMemo(() => {
    return {
      total: blogs.length,
      pending: blogs.filter((b) => b.status === 'pending').length,
      published: blogs.filter((b) => b.status === 'published').length,
      rejected: blogs.filter((b) => b.status === 'rejected').length,
    };
  }, [blogs]);

  const filteredBlogs = useMemo(() => {
    return blogs.filter((b) => {
      const matchesTab = activeTab === 'ALL' || b.status === activeTab;
      const matchesSearch =
        b.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.author.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesTab && matchesSearch;
    });
  }, [blogs, activeTab, searchTerm]);

  return (
    <div className="space-y-6">
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="toast toast-top toast-end z-50">
          <div className="alert alert-success shadow-xl rounded-2xl text-xs font-bold text-white">
            <Check className="w-4 h-4" /> {toastMessage}
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-base-content/10 pb-5">
        <div>
          <span className="badge badge-primary badge-xs font-bold uppercase text-[9px] mb-1">
            Editorial Desk & Quality Control
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-base-content flex items-center gap-2">
            <Newspaper className="w-6 h-6 text-primary" /> Articles & Editorial Review
          </h1>
          <p className="text-xs text-base-content/60 mt-0.5">
            Audit submitted tech reviews, moderate guides, and release official store announcements.
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="btn btn-primary btn-sm rounded-xl font-bold text-xs gap-1.5 shadow-md shadow-primary/20"
        >
          <Plus className="w-4 h-4" /> Compose Article
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          onClick={() => setActiveTab('ALL')}
          className={`p-4 bg-base-200 border rounded-2xl cursor-pointer transition-all ${activeTab === 'ALL' ? 'border-primary shadow-sm' : 'border-base-content/10'
            }`}
        >
          <span className="text-[10px] font-bold text-base-content/50 uppercase block">Total Articles</span>
          <span className="text-xl font-black text-base-content font-mono">{metrics.total}</span>
        </div>

        <div
          onClick={() => setActiveTab('pending')}
          className={`p-4 bg-base-200 border rounded-2xl cursor-pointer transition-all ${activeTab === 'pending' ? 'border-warning shadow-sm' : 'border-base-content/10'
            }`}
        >
          <span className="text-[10px] font-bold text-warning uppercase block flex items-center gap-1">
            <Clock className="w-3 h-3" /> Pending Review
          </span>
          <span className="text-xl font-black text-warning font-mono">{metrics.pending}</span>
        </div>

        <div
          onClick={() => setActiveTab('published')}
          className={`p-4 bg-base-200 border rounded-2xl cursor-pointer transition-all ${activeTab === 'published' ? 'border-success shadow-sm' : 'border-base-content/10'
            }`}
        >
          <span className="text-[10px] font-bold text-success uppercase block flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Published Live
          </span>
          <span className="text-xl font-black text-success font-mono">{metrics.published}</span>
        </div>

        <div
          onClick={() => setActiveTab('rejected')}
          className={`p-4 bg-base-200 border rounded-2xl cursor-pointer transition-all ${activeTab === 'rejected' ? 'border-error shadow-sm' : 'border-base-content/10'
            }`}
        >
          <span className="text-[10px] font-bold text-error uppercase block flex items-center gap-1">
            <XCircle className="w-3 h-3" /> Needs Revision
          </span>
          <span className="text-xl font-black text-error font-mono">{metrics.rejected}</span>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3 bg-base-200 p-3 rounded-2xl border border-base-content/10">
        <div className="flex items-center gap-1 overflow-x-auto w-full md:w-auto">
          {(['ALL', 'pending', 'published', 'rejected'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`btn btn-xs rounded-xl font-bold capitalize ${activeTab === tab ? 'btn-primary shadow-xs' : 'btn-ghost text-base-content/70'
                }`}
            >
              {tab === 'ALL' ? 'All Publications' : tab}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40" />
          <input
            type="text"
            placeholder="Search headline or author..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input input-bordered input-xs rounded-xl w-full pl-9 text-xs bg-base-100"
          />
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="py-20 text-center">
          <span className="loading loading-spinner loading-lg text-primary"></span>
        </div>
      ) : filteredBlogs.length === 0 ? (
        <div className="py-20 text-center space-y-2 bg-base-200/50 rounded-3xl border border-dashed border-base-content/15 p-8">
          <Newspaper className="w-10 h-10 text-base-content/30 mx-auto" />
          <p className="font-bold text-sm text-base-content">No articles in this moderation queue</p>
          <p className="text-xs text-base-content/50">Switch tabs or compose a new piece of content.</p>
        </div>
      ) : (
        <div className="bg-base-200 border border-base-content/10 rounded-3xl overflow-hidden shadow-xs">
          <table className="table table-sm text-xs">
            <thead className="bg-base-300/50 text-[11px] uppercase tracking-wider text-base-content/60">
              <tr>
                <th>Headline & Excerpt</th>
                <th>Category</th>
                <th>Author</th>
                <th>Moderation Status</th>
                <th>Date</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-base-content/5">
              {filteredBlogs.map((item) => (
                <tr key={item._id} className="hover:bg-base-100/50 transition-colors">
                  <td className="py-3 max-w-sm">
                    <p className="font-bold text-base-content line-clamp-1">{item.title}</p>
                    <span className="text-[10px] text-base-content/50 line-clamp-1">
                      {item.summary}
                    </span>
                  </td>

                  <td>
                    <span className="badge badge-primary badge-xs font-bold text-[9px] uppercase">
                      {item.category}
                    </span>
                  </td>

                  <td>
                    <span className="font-semibold text-base-content">{item.author}</span>
                  </td>

                  <td>
                    {item.status === 'published' && (
                      <span className="badge badge-success text-white badge-xs font-bold text-[9px] uppercase">
                        Published
                      </span>
                    )}
                    {item.status === 'pending' && (
                      <span className="badge badge-warning text-black badge-xs font-bold text-[9px] uppercase">
                        Pending
                      </span>
                    )}
                    {item.status === 'rejected' && (
                      <span className="badge badge-error text-white badge-xs font-bold text-[9px] uppercase">
                        Rejected
                      </span>
                    )}
                  </td>

                  <td className="text-base-content/50 font-mono text-[11px]">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </td>

                  <td className="text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => {
                          setReviewingBlog(item);
                          setModerationFeedback(item.moderationNote || '');
                        }}
                        className="btn btn-ghost btn-xs btn-circle text-primary hover:bg-primary/10"
                        title="Inspect & Moderate"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(item._id)}
                        className="btn btn-ghost btn-xs btn-circle text-error hover:bg-error/10"
                        title="Delete article"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* MODERATION INSPECTION MODAL */}
      {reviewingBlog && (
        <div className="modal modal-open z-50">
          <div className="modal-box max-w-3xl rounded-3xl bg-base-100 border border-base-content/10 p-6 space-y-5 shadow-2xl relative max-h-[85vh] flex flex-col">
            <div className="flex items-start justify-between border-b border-base-content/10 pb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="badge badge-primary badge-xs font-bold uppercase text-[9px]">
                    {reviewingBlog.category}
                  </span>
                  <span className="text-[11px] text-base-content/50">
                    By {reviewingBlog.author} • {new Date(reviewingBlog.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <h3 className="text-xl font-black text-base-content leading-tight">
                  {reviewingBlog.title}
                </h3>
              </div>
              <button
                onClick={() => setReviewingBlog(null)}
                className="btn btn-ghost btn-xs btn-circle text-base-content/50 hover:text-base-content"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable Article Body */}
            <div className="flex-1 overflow-y-auto space-y-4 text-xs pr-1">
              {reviewingBlog.coverImage && (
                <img
                  src={reviewingBlog.coverImage}
                  alt={reviewingBlog.title}
                  className="w-full h-48 object-cover rounded-2xl border border-base-content/5"
                />
              )}

              <div className="p-3 bg-base-200/50 rounded-2xl border border-base-content/5">
                <span className="font-bold text-[10px] uppercase text-base-content/50 block mb-1">
                  Summary Teaser
                </span>
                <p className="text-base-content/80 italic">{reviewingBlog.summary}</p>
              </div>

              <div>
                <span className="font-bold text-[10px] uppercase text-base-content/50 block mb-1">
                  Article Content
                </span>
                <p className="whitespace-pre-line leading-relaxed text-base-content/80 text-justify">
                  {reviewingBlog.content}
                </p>
              </div>

              {/* Feedback note input */}
              <div className="space-y-1.5 pt-3 border-t border-base-content/10">
                <label className="font-bold text-base-content/70 flex items-center gap-1">
                  <MessageSquare className="w-3.5 h-3.5 text-primary" /> Moderator Notes & Feedback
                </label>
                <input
                  type="text"
                  placeholder="Optional review remarks or reason for rejection..."
                  value={moderationFeedback}
                  onChange={(e) => setModerationFeedback(e.target.value)}
                  className="input input-bordered input-sm rounded-xl w-full text-xs bg-base-200"
                />
              </div>
            </div>

            {/* Modal Bottom Moderation Actions */}
            <div className="pt-3 border-t border-base-content/10 flex items-center justify-between">
              <button
                onClick={() => handleDelete(reviewingBlog._id)}
                className="btn btn-ghost btn-sm text-error rounded-xl font-bold text-xs"
              >
                Delete
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleModerate(reviewingBlog._id, 'rejected')}
                  className="btn btn-error btn-sm rounded-xl text-xs font-bold text-white gap-1"
                >
                  <XCircle className="w-4 h-4" /> Reject & Request Edits
                </button>
                <button
                  onClick={() => handleModerate(reviewingBlog._id, 'published')}
                  className="btn btn-success btn-sm rounded-xl text-xs font-bold text-white gap-1"
                >
                  <CheckCircle2 className="w-4 h-4" /> Approve & Publish Live
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CREATE ARTICLE MODAL */}
      {isCreateModalOpen && (
        <div className="modal modal-open z-50">
          <div className="modal-box max-w-2xl rounded-3xl bg-base-100 border border-base-content/10 p-6 space-y-4 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-base-content/10 pb-3">
              <h3 className="font-black text-lg text-base-content">Compose Editorial Article</h3>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="btn btn-ghost btn-xs btn-circle text-base-content/50 hover:text-base-content"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-base-content/70 mb-1">Article Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. GeForce RTX 5080 Benchmark & Power Scaling"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="input input-bordered input-sm rounded-xl w-full text-xs bg-base-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-base-content/70 mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="select select-bordered select-sm rounded-xl w-full text-xs bg-base-200"
                  >
                    <option value="News">News</option>
                    <option value="Guide">Guide</option>
                    <option value="Review">Review</option>
                    <option value="Promotion">Promotion</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-base-content/70 mb-1">Cover Image URL</label>
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/..."
                    value={formData.coverImage}
                    onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
                    className="input input-bordered input-sm rounded-xl w-full text-xs bg-base-200"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-base-content/70 mb-1">Summary (Short Excerpt) *</label>
                <textarea
                  rows={2}
                  required
                  placeholder="A concise overview visible on homepage cards..."
                  value={formData.summary}
                  onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                  className="textarea textarea-bordered rounded-xl w-full text-xs bg-base-200"
                />
              </div>

              <div>
                <label className="block font-bold text-base-content/70 mb-1">Full Article Body *</label>
                <textarea
                  rows={6}
                  required
                  placeholder="Write the full hardware review, spec breakdowns, and conclusion..."
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="textarea textarea-bordered rounded-xl w-full text-xs bg-base-200 font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-base-content/70 mb-1">Tags</label>
                <input
                  type="text"
                  placeholder="RTX, NVIDIA, Benchmark, DDR5"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  className="input input-bordered input-sm rounded-xl w-full text-xs bg-base-200"
                />
              </div>

              <div className="pt-3 border-t border-base-content/10 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="btn btn-ghost btn-sm rounded-xl text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary btn-sm rounded-xl text-xs font-bold px-5"
                >
                  Publish Article
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBlogManager;