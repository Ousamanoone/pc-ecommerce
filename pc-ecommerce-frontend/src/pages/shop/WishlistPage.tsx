import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useWishlist } from '../../context/WishlistContext';
import { useCart } from '../../context/CartContext';
import type { Product } from '../../types';
import {
  Heart,
  ShoppingBag,
  Trash2,
  Zap,
  Star,
  Check,
  Package,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';

export const WishlistPage: React.FC = () => {
  const { wishlist, removeFromWishlist, clearWishlist } = useWishlist() as any;
  const { addToCart } = useCart() as any;
  const navigate = useNavigate();

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  // Safe extraction of wishlist items regardless of context structure
  const wishlistItems: Product[] = Array.isArray(wishlist)
    ? wishlist
    : wishlist?.items || [];

  const handleMoveToCart = (product: Product) => {
    if (typeof addToCart === 'function') {
      addToCart(product, 1);
    }
    if (typeof removeFromWishlist === 'function') {
      removeFromWishlist(product._id);
    }
    showToast(`Moved ${product.name} to shopping cart.`);
  };

  const handleAddAllToCart = () => {
    const inStockItems = wishlistItems.filter((item) => item.stock > 0);
    if (inStockItems.length === 0) {
      showToast('No in-stock hardware available to add.');
      return;
    }

    inStockItems.forEach((item) => {
      if (typeof addToCart === 'function') {
        addToCart(item, 1);
      }
    });

    showToast(`Queued ${inStockItems.length} items to your shopping cart.`);
    navigate('/cart');
  };

  if (wishlistItems.length === 0) {
    return (
      <div className="py-24 text-center max-w-md mx-auto space-y-4">
        <div className="w-16 h-16 rounded-3xl bg-base-200 border border-base-content/10 flex items-center justify-center mx-auto text-base-content/30">
          <Heart className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-black text-base-content">Your Wishlist is Empty</h2>
        <p className="text-xs text-base-content/60 leading-relaxed">
          Bookmark high-performance components while browsing the catalog to monitor pricing or plan your next custom workstation.
        </p>
        <div className="flex items-center justify-center gap-3 pt-2">
          <Link to="/products" className="btn btn-primary btn-sm rounded-xl font-bold text-xs gap-1.5">
            Explore Hardware
          </Link>
          <Link to="/builder" className="btn btn-ghost btn-sm rounded-xl font-bold text-xs border border-base-content/15">
            PC Builder
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 py-4">
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="toast toast-top toast-end z-50">
          <div className="alert alert-success shadow-xl rounded-2xl text-xs font-bold text-white">
            <Check className="w-4 h-4" /> {toastMessage}
          </div>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-base-content/10 pb-5">
        <div>
          <span className="badge badge-primary badge-xs font-bold uppercase text-[9px] mb-1">
            Personal Saved Items
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-base-content flex items-center gap-2">
            <Heart className="w-6 h-6 text-error fill-error" /> Hardware Wishlist
          </h1>
          <p className="text-xs text-base-content/60 mt-0.5">
            Review your shortlisted computer parts and migrate them to your checkout cart.
          </p>
        </div>

        {/* Global Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              if (window.confirm('Clear all items from your wishlist?')) {
                if (typeof clearWishlist === 'function') clearWishlist();
              }
            }}
            className="btn btn-ghost btn-sm rounded-xl text-xs font-bold text-base-content/60 hover:text-error"
          >
            Clear All
          </button>
          <button
            onClick={handleAddAllToCart}
            className="btn btn-primary btn-sm rounded-xl text-xs font-bold gap-1.5 shadow-md shadow-primary/20"
          >
            <ShoppingBag className="w-4 h-4" /> Move All to Cart
          </button>
        </div>
      </div>

      {/* Wishlist Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {wishlistItems.map((product) => {
          const effPrice = product.discountPrice || product.price;
          const hasDiscount = Boolean(product.discountPrice && product.discountPrice < product.price);

          return (
            <div
              key={product._id}
              className="bg-base-200 border border-base-content/10 rounded-3xl p-4 flex flex-col justify-between hover:border-primary/40 hover:shadow-lg transition-all group"
            >
              <div>
                {/* Thumbnail */}
                <div className="relative w-full h-44 bg-base-100 rounded-2xl p-3 flex items-center justify-center border border-base-content/5 overflow-hidden">
                  <img
                    src={product.images?.[0] || 'https://via.placeholder.com/150'}
                    alt={product.name}
                    className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
                  />

                  {/* Badges */}
                  <div className="absolute top-2.5 left-2.5 flex flex-col gap-1">
                    <span className="badge badge-primary badge-xs font-bold uppercase text-[9px]">
                      {product.category}
                    </span>
                    {hasDiscount && (
                      <span className="badge badge-error badge-xs font-black text-white text-[9px]">
                        SALE
                      </span>
                    )}
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => removeFromWishlist(product._id)}
                    className="btn btn-ghost btn-xs btn-circle absolute top-2.5 right-2.5 text-error/70 hover:text-error hover:bg-error/10"
                    title="Remove from wishlist"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Specs Info */}
                <div className="mt-3 space-y-1.5">
                  <div className="flex items-center justify-between text-[10px] text-base-content/50">
                    <span className="font-bold uppercase tracking-wider">{product.brand}</span>
                    {product.wattage !== undefined && product.wattage > 0 && (
                      <span className="font-mono text-warning font-semibold flex items-center gap-0.5">
                        <Zap className="w-3 h-3" /> {product.wattage}W TDP
                      </span>
                    )}
                  </div>

                  <Link
                    to={`/product/${product.slug}`}
                    className="font-bold text-xs text-base-content group-hover:text-primary transition-colors line-clamp-2 leading-relaxed"
                    title={product.name}
                  >
                    {product.name}
                  </Link>

                  <div className="flex items-center gap-1 text-warning text-xs pt-0.5">
                    <Star className="w-3 h-3 fill-warning" />
                    <span className="font-mono font-bold text-[11px] text-base-content/80">
                      {product.rating ? product.rating.toFixed(1) : '5.0'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Price & Action */}
              <div className="pt-3 mt-3 border-t border-base-content/10 flex items-center justify-between gap-2">
                <div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="font-mono font-black text-base text-primary">
                      ${effPrice}
                    </span>
                    {hasDiscount && (
                      <span className="font-mono text-[11px] text-base-content/40 line-through">
                        ${product.price}
                      </span>
                    )}
                  </div>
                  <span
                    className={`text-[9px] font-bold block ${
                      product.stock > 0 ? 'text-success' : 'text-error'
                    }`}
                  >
                    {product.stock > 0 ? `${product.stock} In Stock` : 'Out of Stock'}
                  </span>
                </div>

                <button
                  onClick={() => handleMoveToCart(product)}
                  disabled={product.stock <= 0}
                  className="btn btn-primary btn-xs rounded-xl font-bold px-3 gap-1 shadow-xs"
                  title="Move to cart"
                >
                  <ShoppingBag className="w-3.5 h-3.5" /> Move to Cart
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WishlistPage;