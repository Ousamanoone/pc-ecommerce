import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import type { Product } from '../../types';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useWishlist } from '../../context/WishlistContext';
import {
  ShoppingBag,
  Zap,
  Truck,
  ShieldCheck,
  RotateCcw,
  Check,
  Cpu,
  Scale,
  FileText,
  Star,
  MessageSquare,
  Send,
  Heart,
  Calendar,
  AlertCircle,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

export const ProductDetailsPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart() as any;
  const { user } = useAuth();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();

  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'article' | 'specs' | 'reviews'>('article');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Review Form States
  const [reviewRating, setReviewRating] = useState<number>(5);
  const [reviewComment, setReviewComment] = useState<string>('');
  const [submittingReview, setSubmittingReview] = useState<boolean>(false);
  const [reviewError, setReviewError] = useState<string | null>(null);

  const fetchProduct = () => {
    if (!slug) return;
    setLoading(true);
    api
      .get<{ product: Product }>(`/products/${slug}`)
      .then((res) => {
        const item = (res.data as any).product || res.data;
        setProduct(item);
        if (item.images && item.images.length > 0) {
          setSelectedImage(item.images[0]);
        }

        // Fetch related products based on ID
        if (item._id) {
          api
            .get<Product[]>(`/products/${item._id}/related`)
            .then((relatedRes) => {
              setRelatedProducts(relatedRes.data || []);
            })
            .catch(() => setRelatedProducts([]));
        }
      })
      .catch((err) => {
        console.error('Failed to load component details:', err);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchProduct();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [slug]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleAddToCart = (itemToAdd = product, qty = quantity) => {
    if (!itemToAdd) return;
    if (typeof addToCart === 'function') {
      addToCart(itemToAdd, qty);
      showToast(`Added ${qty}x "${itemToAdd.name}" to shopping cart.`);
    }
  };

  const handleBuyNow = () => {
    handleAddToCart();
    navigate('/cart');
  };

  const handleToggleWishlist = (itemToToggle = product) => {
    if (!itemToToggle) return;
    if (isInWishlist(itemToToggle._id)) {
      removeFromWishlist(itemToToggle._id);
      showToast(`Removed "${itemToToggle.name}" from your wishlist.`);
    } else {
      addToWishlist(itemToToggle);
      showToast(`Saved "${itemToToggle.name}" to your wishlist.`);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;

    if (!user) {
      navigate('/admin/login');
      return;
    }

    if (!reviewComment.trim()) {
      setReviewError('Please write a brief comment regarding your experience.');
      return;
    }

    setSubmittingReview(true);
    setReviewError(null);

    try {
      await api.post(`/products/${product._id}/reviews`, {
        rating: reviewRating,
        comment: reviewComment,
      });
      showToast('Thank you! Your customer review has been published.');
      setReviewComment('');
      setReviewRating(5);
      fetchProduct();
    } catch (err: any) {
      setReviewError(err.response?.data?.message || 'Failed to submit review.');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-32">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="py-24 text-center space-y-4">
        <h2 className="text-2xl font-black">Hardware Component Not Found</h2>
        <p className="text-xs text-base-content/60">This hardware listing does not exist or has been discontinued.</p>
        <Link to="/products" className="btn btn-primary btn-sm rounded-xl text-xs font-bold">
          Return to Catalog
        </Link>
      </div>
    );
  }

  const effectivePrice = product.discountPrice || product.price;
  const hasDiscount = Boolean(product.discountPrice && product.discountPrice < product.price);
  const reviewsList = (product as any).reviews || [];
  const averageRating = (product as any).rating || 0;
  const numReviews = (product as any).numReviews || reviewsList.length;
  const inWishlist = isInWishlist(product._id);

  return (
    <div className="space-y-12 py-6">
      {toastMessage && (
        <div className="toast toast-top toast-end z-50">
          <div className="alert alert-success shadow-xl rounded-2xl text-xs font-bold text-white">
            <Check className="w-4 h-4" /> {toastMessage}
          </div>
        </div>
      )}

      {/* Top Main Section: Gallery & Purchasing */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Gallery */}
        <div className="lg:col-span-6 space-y-4">
          <div className="h-96 sm:h-[450px] bg-base-200/60 border border-base-content/10 rounded-3xl p-6 flex items-center justify-center relative overflow-hidden shadow-sm">
            <img
              src={selectedImage || product.images?.[0] || 'https://via.placeholder.com/400'}
              alt={product.name}
              className="max-h-full max-w-full object-contain hover:scale-105 transition-transform duration-500"
            />
            {hasDiscount && (
              <span className="badge badge-error font-black text-white absolute top-4 left-4 text-xs px-2.5 py-3 rounded-xl shadow-md">
                SAVE ${product.price - (product.discountPrice || 0)}
              </span>
            )}
            <button
              onClick={() => handleToggleWishlist(product)}
              className={`btn btn-circle btn-sm absolute top-4 right-4 shadow-md transition-all ${
                inWishlist ? 'bg-error text-white hover:bg-error/90' : 'bg-base-100 text-base-content/60 hover:text-error'
              }`}
              title={inWishlist ? 'Remove from wishlist' : 'Save to wishlist'}
            >
              <Heart className={`w-4 h-4 ${inWishlist ? 'fill-current' : ''}`} />
            </button>
          </div>

          {product.images && product.images.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-thin">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(img)}
                  className={`w-18 h-18 rounded-2xl bg-base-200/80 p-1.5 shrink-0 border-2 transition-all flex items-center justify-center ${
                    selectedImage === img
                      ? 'border-primary shadow-md shadow-primary/20 scale-105'
                      : 'border-transparent hover:border-base-content/20'
                  }`}
                >
                  <img src={img} alt="thumbnail" className="max-h-full max-w-full object-contain" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Info Column */}
        <div className="lg:col-span-6 space-y-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="badge badge-primary badge-sm font-bold uppercase text-[10px]">
                {product.category}
              </span>
              <span className="text-xs font-bold text-base-content/60 uppercase tracking-wider">
                {product.brand}
              </span>

              <div className="flex items-center gap-1.5 ml-auto text-xs">
                <div className="flex items-center text-warning">
                  <Star className="w-4 h-4 fill-warning" />
                  <span className="font-black ml-1 text-base-content">
                    {averageRating > 0 ? averageRating.toFixed(1) : 'New'}
                  </span>
                </div>
                <span className="text-base-content/40 font-mono">({numReviews} reviews)</span>
              </div>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-base-content leading-tight">
              {product.name}
            </h1>
          </div>

          {/* Pricing Box */}
          <div className="p-5 bg-base-200/60 rounded-3xl border border-base-content/10 flex items-baseline gap-4">
            <span className="text-3xl font-black text-primary">${effectivePrice}</span>
            {hasDiscount && (
              <span className="text-sm line-through text-base-content/40 font-bold">
                ${product.price}
              </span>
            )}
            <span
              className={`badge ml-auto font-bold text-[10px] ${
                product.stock > 0 ? 'badge-success badge-outline' : 'badge-error'
              }`}
            >
              {product.stock > 0 ? `In Stock (${product.stock} units)` : 'Out of Stock'}
            </span>
          </div>

          {/* Quick Technical Highlights */}
          {product.specs && product.specs.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {product.specs.slice(0, 3).map((sp, idx) => (
                <div key={idx} className="p-3 bg-base-200/40 rounded-2xl border border-base-content/5">
                  <span className="text-[10px] font-bold text-base-content/50 uppercase block truncate">
                    {sp.label}
                  </span>
                  <span className="font-mono font-bold text-xs text-base-content truncate block mt-0.5">
                    {sp.value}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Quantity and Actions */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-4">
              <span className="text-xs font-bold text-base-content/70">Quantity:</span>
              <div className="flex items-center gap-2 bg-base-200 border border-base-content/10 rounded-2xl p-1">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="btn btn-ghost btn-xs btn-square"
                >
                  -
                </button>
                <span className="w-8 text-center text-xs font-black">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  className="btn btn-ghost btn-xs btn-square"
                >
                  +
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => handleAddToCart()}
                disabled={product.stock <= 0}
                className="btn btn-primary flex-1 rounded-2xl font-black text-xs gap-2 shadow-lg shadow-primary/20 h-12"
              >
                <ShoppingBag className="w-4 h-4" /> Add to Cart
              </button>
              <button
                onClick={handleBuyNow}
                disabled={product.stock <= 0}
                className="btn btn-secondary flex-1 rounded-2xl font-black text-xs gap-2 h-12 shadow-lg shadow-secondary/20"
              >
                <Zap className="w-4 h-4" /> Buy Now
              </button>
            </div>

            <div className="flex items-center gap-2">
              <Link
                to={`/compare?item=${product.slug}`}
                className="btn btn-ghost btn-sm rounded-xl flex-1 text-xs font-bold gap-2 text-base-content/70 border border-base-content/10"
              >
                <Scale className="w-4 h-4 text-primary" /> Compare with rival hardware
              </Link>
              <button
                onClick={() => handleToggleWishlist(product)}
                className={`btn btn-sm rounded-xl text-xs font-bold gap-1.5 ${
                  inWishlist
                    ? 'btn-error text-white'
                    : 'btn-ghost text-base-content/70 border border-base-content/10'
                }`}
              >
                <Heart className={`w-3.5 h-3.5 ${inWishlist ? 'fill-current' : ''}`} />
                <span>{inWishlist ? 'Saved' : 'Wishlist'}</span>
              </button>
            </div>
          </div>

          {/* Guarantees */}
          <div className="grid grid-cols-3 gap-2 pt-4 border-t border-base-content/10 text-[11px] text-base-content/70">
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-primary shrink-0" />
              <span>Complimentary 2H Courier</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-success shrink-0" />
              <span>3-Year Warranty</span>
            </div>
            <div className="flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-warning shrink-0" />
              <span>7-Day Replacement</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs: Article, Specs, and Customer Reviews */}
      <div className="space-y-6 pt-6">
        <div className="flex items-center gap-2 border-b border-base-content/10 pb-2 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab('article')}
            className={`btn btn-sm rounded-2xl font-black text-xs gap-2 ${
              activeTab === 'article' ? 'btn-primary' : 'btn-ghost'
            }`}
          >
            <FileText className="w-4 h-4" /> Architectural Review & Overview
          </button>
          <button
            onClick={() => setActiveTab('specs')}
            className={`btn btn-sm rounded-2xl font-black text-xs gap-2 ${
              activeTab === 'specs' ? 'btn-primary' : 'btn-ghost'
            }`}
          >
            <Cpu className="w-4 h-4" /> Technical Specifications ({product.specs?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`btn btn-sm rounded-2xl font-black text-xs gap-2 ${
              activeTab === 'reviews' ? 'btn-primary' : 'btn-ghost'
            }`}
          >
            <MessageSquare className="w-4 h-4" /> Customer Reviews ({numReviews})
          </button>
        </div>

        {/* Tab 1: HTML Article Content */}
        {activeTab === 'article' && (
          <div className="bg-base-200/50 border border-base-content/10 rounded-3xl p-6 sm:p-12 max-w-4xl mx-auto shadow-sm">
            {product.description ? (
              <div
                className="tinymce-rendered-content text-sm leading-relaxed text-base-content/90 clear-both space-y-4"
                dangerouslySetInnerHTML={{ __html: product.description }}
              />
            ) : (
              <p className="text-xs text-base-content/50 italic text-center py-8">
                No editorial hardware review written for this product yet.
              </p>
            )}
            <div className="clear-both"></div>
          </div>
        )}

        {/* Tab 2: Technical Specifications */}
        {activeTab === 'specs' && (
          <div className="bg-base-200/50 border border-base-content/10 rounded-3xl p-6 sm:p-8 space-y-4 max-w-4xl mx-auto shadow-sm">
            <h3 className="text-base font-black text-base-content flex items-center gap-2">
              <Cpu className="w-5 h-5 text-primary" /> Full Technical Specification Sheet
            </h3>

            {product.specs && product.specs.length > 0 ? (
              <div className="overflow-hidden rounded-2xl border border-base-content/10 bg-base-100">
                <table className="table w-full text-xs">
                  <tbody>
                    {product.specs.map((item, idx) => (
                      <tr
                        key={idx}
                        className={`border-b border-base-content/5 ${
                          idx % 2 === 0 ? 'bg-base-200/30' : 'bg-base-100'
                        }`}
                      >
                        <td className="w-1/3 font-bold text-base-content/70 py-3.5 px-5">
                          {item.label}
                        </td>
                        <td className="font-semibold text-base-content py-3.5 px-5 font-mono">
                          {item.value}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-8 text-center text-xs text-base-content/50 bg-base-100 rounded-2xl border border-dashed border-base-content/10">
                Architectural values will be uploaded by the engineering team shortly.
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Customer Reviews & Ratings */}
        {activeTab === 'reviews' && (
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="bg-base-200/60 border border-base-content/10 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm">
              <div className="flex items-center gap-5 text-center sm:text-left">
                <div className="space-y-1">
                  <span className="text-4xl sm:text-5xl font-black text-base-content font-mono">
                    {averageRating > 0 ? averageRating.toFixed(1) : '0.0'}
                  </span>
                  <div className="flex items-center justify-center sm:justify-start text-warning">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`w-4 h-4 ${
                          s <= Math.round(averageRating)
                            ? 'fill-warning text-warning'
                            : 'text-base-content/20'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-base-content/50 font-medium block">
                    Based on {numReviews} customer ratings
                  </span>
                </div>
              </div>

              <div className="text-xs text-base-content/70 space-y-1 text-center sm:text-right">
                <p className="font-bold text-base-content">Authentic Community Feedback</p>
                <p className="text-[11px] text-base-content/50">
                  Verified hardware benchmarks and real-world temperature metrics from verified owners.
                </p>
              </div>
            </div>

            <div className="bg-base-200/60 border border-base-content/10 rounded-3xl p-6 sm:p-8 space-y-4 shadow-sm">
              <h3 className="text-base font-black text-base-content flex items-center gap-2">
                <Star className="w-4 h-4 text-warning" /> Write a Customer Review
              </h3>

              {user ? (
                <form onSubmit={handleSubmitReview} className="space-y-4">
                  {reviewError && (
                    <div className="alert alert-error rounded-2xl text-xs font-semibold flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" /> {reviewError}
                    </div>
                  )}

                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-base-content/70">Your Rating:</span>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          type="button"
                          key={star}
                          onClick={() => setReviewRating(star)}
                          className="btn btn-ghost btn-xs btn-square hover:bg-transparent"
                        >
                          <Star
                            className={`w-5 h-5 transition-transform hover:scale-110 ${
                              star <= reviewRating
                                ? 'fill-warning text-warning'
                                : 'text-base-content/30'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                    <span className="text-xs font-bold font-mono text-warning">
                      {reviewRating} of 5 Stars
                    </span>
                  </div>

                  <div className="form-control">
                    <textarea
                      required
                      rows={3}
                      placeholder="Share your thermal performance, clock speeds, coil whine, or build compatibility notes..."
                      className="textarea textarea-bordered text-xs rounded-2xl w-full leading-relaxed bg-base-100"
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                    />
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={submittingReview || !reviewComment.trim()}
                      className={`btn btn-primary btn-sm rounded-xl font-bold text-xs gap-2 ${
                        submittingReview ? 'loading' : ''
                      }`}
                    >
                      <Send className="w-3.5 h-3.5" /> Submit Review
                    </button>
                  </div>
                </form>
              ) : (
                <div className="p-6 bg-base-100 rounded-2xl border border-dashed border-base-content/10 text-center space-y-2">
                  <p className="text-xs text-base-content/60">
                    You must be logged in with a registered customer account to post a review.
                  </p>
                  <Link
                    to="/admin/login"
                    className="btn btn-primary btn-xs rounded-xl font-bold text-xs gap-1.5"
                  >
                    Sign In to Review
                  </Link>
                </div>
              )}
            </div>

            {/* Reviews List */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-base-content/60">
                User Reviews ({reviewsList.length})
              </h4>

              {reviewsList.length === 0 ? (
                <div className="py-12 text-center text-xs text-base-content/50 bg-base-200/40 rounded-3xl border border-dashed border-base-content/10 space-y-1">
                  <MessageSquare className="w-6 h-6 mx-auto text-base-content/20 mb-1" />
                  <p className="font-bold">No Reviews Yet</p>
                  <p className="text-[11px]">Be the first customer to review this component build.</p>
                </div>
              ) : (
                reviewsList.map((rev: any, idx: number) => (
                  <div
                    key={idx}
                    className="bg-base-200/50 border border-base-content/10 rounded-2xl p-5 space-y-3 shadow-xs"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-xs">
                          {rev.name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div>
                          <span className="font-bold text-xs text-base-content block">
                            {rev.name}
                          </span>
                          <span className="text-[10px] text-base-content/40 flex items-center gap-1 font-mono">
                            <Calendar className="w-3 h-3" />
                            {new Date(rev.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center text-warning">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            className={`w-3.5 h-3.5 ${
                              s <= rev.rating
                                ? 'fill-warning text-warning'
                                : 'text-base-content/20'
                            }`}
                          />
                        ))}
                      </div>
                    </div>

                    <p className="text-xs text-base-content/80 leading-relaxed pl-10">
                      {rev.comment}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* RECOMMENDED & RELATED HARDWARE SECTION */}
      {relatedProducts.length > 0 && (
        <div className="space-y-6 pt-10 border-t border-base-content/10">
          <div className="flex items-center justify-between">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-black uppercase tracking-wider mb-1">
                <Sparkles className="w-3.5 h-3.5" /> Smart Recommendations
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-base-content">
                Related Hardware & Recommended Alternatives
              </h3>
            </div>
            <Link
              to={`/products?category=${product.category}`}
              className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
            >
              Explore all {product.category} models <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((rel) => {
              const relPrice = rel.discountPrice || rel.price;
              const relDiscount = Boolean(rel.discountPrice && rel.discountPrice < rel.price);

              return (
                <div
                  key={rel._id}
                  className="bg-base-200/60 border border-base-content/10 rounded-3xl p-5 flex flex-col justify-between space-y-4 hover:border-primary/40 transition-all group shadow-xs"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="badge badge-primary badge-xs font-bold uppercase text-[9px]">
                        {rel.category}
                      </span>
                      <span className="text-[10px] text-base-content/50 uppercase font-semibold">
                        {rel.brand}
                      </span>
                    </div>

                    <Link
                      to={`/product/${rel.slug}`}
                      className="h-36 rounded-2xl bg-base-100 p-3 flex items-center justify-center border border-base-content/5 block overflow-hidden"
                    >
                      <img
                        src={rel.images?.[0] || 'https://via.placeholder.com/150'}
                        alt={rel.name}
                        className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
                      />
                    </Link>

                    <div>
                      <Link
                        to={`/product/${rel.slug}`}
                        className="font-bold text-xs text-base-content hover:text-primary transition-colors block line-clamp-2"
                      >
                        {rel.name}
                      </Link>

                      <div className="flex items-baseline gap-2 mt-2">
                        <span className="text-lg font-black text-primary font-mono">
                          ${relPrice}
                        </span>
                        {relDiscount && (
                          <span className="text-xs line-through text-base-content/40 font-bold">
                            ${rel.price}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-base-content/10">
                    <button
                      onClick={() => handleAddToCart(rel, 1)}
                      disabled={rel.stock <= 0}
                      className="btn btn-primary btn-xs rounded-xl font-bold text-xs w-full gap-1.5 shadow-sm"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" /> Add to Cart
                    </button>

                    <Link
                      to={`/compare?items=${product.slug},${rel.slug}`}
                      className="btn btn-ghost btn-xs rounded-xl font-bold text-[11px] w-full gap-1 border border-base-content/10 text-base-content/70 hover:border-primary"
                    >
                      <Scale className="w-3 h-3 text-primary" /> Compare Side-by-Side
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Styled Embed for TinyMCE Floated Elements */}
      <style>{`
        .tinymce-rendered-content img {
          max-width: 100%;
          height: auto;
          border-radius: 12px;
          margin: 10px 0;
        }
        .tinymce-rendered-content img[style*="float: left"],
        .tinymce-rendered-content img[align="left"] {
          float: left !important;
          margin: 4px 20px 16px 0 !important;
        }
        .tinymce-rendered-content img[style*="float: right"],
        .tinymce-rendered-content img[align="right"] {
          float: right !important;
          margin: 4px 0 16px 20px !important;
        }
        .tinymce-rendered-content h2 {
          font-size: 1.5rem;
          font-weight: 800;
          margin-top: 1.5rem;
          margin-bottom: 0.75rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          padding-bottom: 0.5rem;
        }
        .tinymce-rendered-content h3 {
          font-size: 1.25rem;
          font-weight: 700;
          margin-top: 1.25rem;
          margin-bottom: 0.5rem;
          color: hsl(var(--p));
        }
        .tinymce-rendered-content ul {
          list-style-type: disc;
          padding-left: 1.5rem;
          margin: 0.75rem 0;
        }
        .tinymce-rendered-content ol {
          list-style-type: decimal;
          padding-left: 1.5rem;
          margin: 0.75rem 0;
        }
        .tinymce-rendered-content table {
          width: 100%;
          border-collapse: collapse;
          margin: 1rem 0;
        }
        .tinymce-rendered-content table td,
        .tinymce-rendered-content table th {
          border: 1px solid rgba(255, 255, 255, 0.15);
          padding: 8px 12px;
        }
      `}</style>
    </div>
  );
};

export default ProductDetailsPage;