import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import {
  Star,
  Trash2,
  Search,
  ExternalLink,
  MessageSquare,
  AlertCircle,
  Check,
  Filter,
} from 'lucide-react';

interface ReviewItem {
  _id: string;
  productId: string;
  productName: string;
  productSlug: string;
  productImage: string;
  name: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export const AdminReviewManager: React.FC = () => {
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [ratingFilter, setRatingFilter] = useState<'ALL' | number>('ALL');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const res = await api.get<ReviewItem[]>('/products/reviews/all');
      setReviews(res.data || []);
    } catch (err) {
      console.error('Failed to fetch reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleDeleteReview = async (productId: string, reviewId: string) => {
    if (!window.confirm('Delete this user review permanently? Product ratings will be recalculated.')) return;

    try {
      await api.delete(`/products/${productId}/reviews/${reviewId}`);
      setReviews((prev) => prev.filter((r) => r._id !== reviewId));
      showToast('Review removed and product score recalculated.');
    } catch (err) {
      console.error('Failed to delete review:', err);
      showToast('Failed to delete review.');
    }
  };

  const filteredReviews = reviews.filter((r) => {
    const matchesSearch =
      r.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.comment.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.name.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRating = ratingFilter === 'ALL' || r.rating === ratingFilter;
    return matchesSearch && matchesRating;
  });

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
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
            Community Moderation
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-base-content flex items-center gap-2">
            <Star className="w-6 h-6 text-warning fill-warning" /> Customer Reviews & Ratings
          </h1>
          <p className="text-xs text-base-content/60 mt-0.5">
            Monitor verified feedback, evaluate component performance, and prune spam ratings.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-base-content/50">Total Feedback:</span>
          <span className="badge badge-neutral font-mono font-bold text-xs">
            {reviews.length} reviews
          </span>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3 bg-base-200 p-3 rounded-2xl border border-base-content/10">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-base-content/40" />
          <input
            type="text"
            placeholder="Search comment, hardware, or author..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input input-bordered input-sm rounded-xl w-full pl-9 text-xs bg-base-100"
          />
        </div>

        <div className="flex items-center gap-1.5 flex-wrap w-full md:w-auto">
          <span className="text-xs text-base-content/50 font-semibold flex items-center gap-1 mr-1">
            <Filter className="w-3.5 h-3.5" /> Stars:
          </span>
          {(['ALL', 5, 4, 3, 2, 1] as const).map((star) => (
            <button
              key={String(star)}
              onClick={() => setRatingFilter(star)}
              className={`btn btn-xs rounded-xl font-bold transition-all ${
                ratingFilter === star ? 'btn-primary' : 'btn-ghost'
              }`}
            >
              {star === 'ALL' ? 'All' : `${star} ★`}
            </button>
          ))}
        </div>
      </div>

      {/* Reviews Table */}
      {loading ? (
        <div className="py-24 text-center">
          <span className="loading loading-spinner loading-lg text-primary"></span>
        </div>
      ) : filteredReviews.length === 0 ? (
        <div className="py-20 text-center space-y-3 bg-base-200/50 rounded-3xl border border-dashed border-base-content/15 p-8">
          <MessageSquare className="w-12 h-12 text-base-content/30 mx-auto" />
          <h3 className="text-base font-bold text-base-content">No Reviews Found</h3>
          <p className="text-xs text-base-content/50">
            Customer reviews submitted from product detail pages will appear here.
          </p>
        </div>
      ) : (
        <div className="bg-base-200 border border-base-content/10 rounded-3xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="table table-sm text-xs">
              <thead className="bg-base-300/50 text-[11px] uppercase tracking-wider text-base-content/60">
                <tr>
                  <th>Product</th>
                  <th>Reviewer</th>
                  <th>Rating</th>
                  <th>Comment</th>
                  <th>Date</th>
                  <th className="text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-base-content/5">
                {filteredReviews.map((rev) => (
                  <tr key={rev._id} className="hover:bg-base-100/50 transition-colors">
                    {/* Hardware Info */}
                    <td className="py-3">
                      <div className="flex items-center gap-2.5 min-w-[200px] max-w-[280px]">
                        <img
                          src={rev.productImage || 'https://via.placeholder.com/40'}
                          alt={rev.productName}
                          className="w-9 h-9 object-contain rounded-lg bg-base-100 p-0.5 border border-base-content/5 shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="font-bold text-xs truncate text-base-content" title={rev.productName}>
                            {rev.productName}
                          </p>
                          <Link
                            to={`/product/${rev.productSlug}`}
                            target="_blank"
                            className="text-[10px] text-primary hover:underline inline-flex items-center gap-0.5"
                          >
                            <span>View Storefront</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </Link>
                        </div>
                      </div>
                    </td>

                    {/* Author */}
                    <td className="font-semibold text-base-content whitespace-nowrap">
                      {rev.name}
                    </td>

                    {/* Star Rating */}
                    <td>
                      <div className="flex items-center gap-1 text-warning">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3 h-3 ${
                              i < rev.rating ? 'fill-warning text-warning' : 'text-base-content/20'
                            }`}
                          />
                        ))}
                        <span className="font-mono font-bold text-[11px] text-base-content/70 ml-1">
                          {rev.rating}.0
                        </span>
                      </div>
                    </td>

                    {/* Comment Content */}
                    <td className="max-w-xs">
                      <p className="line-clamp-2 text-base-content/80 text-xs leading-relaxed">
                        {rev.comment}
                      </p>
                    </td>

                    {/* Date */}
                    <td className="text-base-content/50 whitespace-nowrap font-mono text-[11px]">
                      {new Date(rev.createdAt).toLocaleDateString()}
                    </td>

                    {/* Action */}
                    <td className="text-right whitespace-nowrap">
                      <button
                        onClick={() => handleDeleteReview(rev.productId, rev._id)}
                        className="btn btn-ghost btn-xs btn-circle text-error hover:bg-error/10"
                        title="Delete review"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminReviewManager;