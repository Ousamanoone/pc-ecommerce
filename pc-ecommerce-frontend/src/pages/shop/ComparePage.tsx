import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../../services/api';
import type { Product } from '../../types';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import {
  Scale,
  Plus,
  Trash2,
  ShoppingBag,
  Heart,
  Check,
  X,
  Search,
  Star,
  Sparkles,
  ArrowRight,
  Layers,
  Cpu,
  RotateCcw,
} from 'lucide-react';

const MAX_COMPARE_ITEMS = 4;

export const ComparePage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { addToCart } = useCart() as any;
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();

  const [comparedProducts, setComparedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [highlightDifferences, setHighlightDifferences] = useState<boolean>(false);

  // Modal State for adding items
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [modalSearchQuery, setModalSearchQuery] = useState<string>('');
  const [catalogItems, setCatalogItems] = useState<Product[]>([]);
  const [modalLoading, setModalLoading] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Load initial products from URL params e.g. ?item=rtx-4090 or ?items=rtx-4090,rx-7900-xtx
  useEffect(() => {
    const itemParam = searchParams.get('item');
    const itemsParam = searchParams.get('items');
    const slugsToFetch = itemsParam
      ? itemsParam.split(',').map((s) => s.trim()).filter(Boolean)
      : itemParam
      ? [itemParam.trim()]
      : [];

    if (slugsToFetch.length === 0) {
      setLoading(false);
      return;
    }

    setLoading(true);
    Promise.all(
      slugsToFetch.slice(0, MAX_COMPARE_ITEMS).map((slug) =>
        api
          .get<{ product: Product }>(`/products/${slug}`)
          .then((res) => (res.data as any).product || res.data)
          .catch(() => null)
      )
    )
      .then((results) => {
        const validItems = results.filter(Boolean) as Product[];
        setComparedProducts(validItems);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [searchParams]);

  // Sync URL when comparedProducts change
  const updateUrlParams = (items: Product[]) => {
    const updated = new URLSearchParams();
    if (items.length > 0) {
      updated.set('items', items.map((i) => i.slug).join(','));
    }
    setSearchParams(updated);
  };

  // Open modal and fetch products catalog
  const handleOpenAddModal = () => {
    setIsModalOpen(true);
    setModalLoading(true);
    api
      .get<{ products: Product[] }>('/products?limit=50')
      .then((res) => {
        setCatalogItems(res.data.products || []);
      })
      .catch((err) => {
        console.error('Failed to load components for comparison:', err);
      })
      .finally(() => {
        setModalLoading(false);
      });
  };

  const handleAddProductToCompare = (product: Product) => {
    if (comparedProducts.some((p) => p._id === product._id)) {
      showToast(`"${product.name}" is already in the comparison table.`);
      return;
    }

    if (comparedProducts.length >= MAX_COMPARE_ITEMS) {
      showToast(`You can compare up to ${MAX_COMPARE_ITEMS} components at a time.`);
      return;
    }

    const updated = [...comparedProducts, product];
    setComparedProducts(updated);
    updateUrlParams(updated);
    setIsModalOpen(false);
    setModalSearchQuery('');
    showToast(`Added "${product.name}" to comparison.`);
  };

  const handleRemoveProduct = (productId: string) => {
    const updated = comparedProducts.filter((p) => p._id !== productId);
    setComparedProducts(updated);
    updateUrlParams(updated);
  };

  const handleClearAll = () => {
    setComparedProducts([]);
    updateUrlParams([]);
    showToast('Comparison table cleared.');
  };

  const handleAddToCart = (product: Product) => {
    if (typeof addToCart === 'function') {
      addToCart(product, 1);
      showToast(`Added "${product.name}" to shopping cart.`);
    }
  };

  const handleToggleWishlist = (product: Product) => {
    if (isInWishlist(product._id)) {
      removeFromWishlist(product._id);
      showToast('Removed from your wishlist.');
    } else {
      addToWishlist(product);
      showToast('Saved to your wishlist.');
    }
  };

  // Extract all unique spec labels from the selected products
  const allSpecLabels = Array.from(
    new Set(
      comparedProducts.flatMap((p) => (p.specs || []).map((s) => s.label.trim()))
    )
  );

  // Check if all products have different values for a given spec row
  const isRowDifferent = (specLabel: string) => {
    if (comparedProducts.length <= 1) return false;
    const values = comparedProducts.map((p) => {
      const found = p.specs?.find((s) => s.label.trim().toLowerCase() === specLabel.toLowerCase());
      return found ? found.value.trim().toLowerCase() : 'n/a';
    });
    return new Set(values).size > 1;
  };

  const filteredModalProducts = catalogItems.filter(
    (p) =>
      p.name.toLowerCase().includes(modalSearchQuery.toLowerCase()) ||
      p.brand.toLowerCase().includes(modalSearchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(modalSearchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 py-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="toast toast-top toast-end z-50">
          <div className="alert alert-success shadow-xl rounded-2xl text-xs font-bold text-white">
            <Check className="w-4 h-4" /> {toastMessage}
          </div>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-base-content/10 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-base-content flex items-center gap-2.5">
            <Scale className="w-7 h-7 text-primary" /> Hardware Comparison Matrix
          </h1>
          <p className="text-xs text-base-content/60 mt-1">
            Analyze architectural parameters, clock rates, thermal bounds, and market pricing side-by-side.
          </p>
        </div>

        {comparedProducts.length > 0 && (
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer bg-base-200 px-3 py-1.5 rounded-2xl border border-base-content/10 text-xs font-bold">
              <input
                type="checkbox"
                checked={highlightDifferences}
                onChange={(e) => setHighlightDifferences(e.target.checked)}
                className="checkbox checkbox-primary checkbox-xs rounded-md"
              />
              <span>Highlight Differences</span>
            </label>

            <button
              onClick={handleClearAll}
              className="btn btn-ghost btn-sm rounded-xl text-xs font-bold text-error hover:bg-error/10"
            >
              Clear All
            </button>
          </div>
        )}
      </div>

      {/* Main Comparison Area */}
      {loading ? (
        <div className="py-24 text-center">
          <span className="loading loading-spinner loading-lg text-primary"></span>
        </div>
      ) : comparedProducts.length === 0 ? (
        /* Empty State */
        <div className="py-24 text-center space-y-5 max-w-md mx-auto bg-base-200/40 border border-dashed border-base-content/15 rounded-3xl p-8">
          <div className="w-16 h-16 rounded-3xl bg-base-100 text-base-content/40 flex items-center justify-center mx-auto shadow-inner border border-base-content/5">
            <Scale className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h2 className="text-2xl font-black text-base-content">No Components Selected</h2>
            <p className="text-xs text-base-content/60">
              Select 2 to 4 components to compare clock speeds, VRAM, and price-to-performance metrics.
            </p>
          </div>
          <div className="pt-2 flex justify-center gap-2">
            <button
              onClick={handleOpenAddModal}
              className="btn btn-primary btn-sm rounded-xl text-xs font-bold gap-2 shadow-md shadow-primary/20"
            >
              <Plus className="w-4 h-4" /> Add First Component
            </button>
            <Link to="/products" className="btn btn-ghost btn-sm rounded-xl text-xs font-bold">
              Browse Catalog
            </Link>
          </div>
        </div>
      ) : (
        /* Comparison Table Grid */
        <div className="overflow-x-auto">
          <div className="min-w-[750px] space-y-4">
            {/* Top Cards: Product Overview & Actions */}
            <div className="grid grid-cols-5 gap-4">
              {/* Left Row Header Indicator */}
              <div className="col-span-1 p-4 bg-base-200/50 rounded-3xl border border-base-content/10 flex flex-col justify-between">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-base-content/50 uppercase tracking-wider block">
                    Slot Status
                  </span>
                  <p className="font-black text-sm text-base-content">
                    {comparedProducts.length} of {MAX_COMPARE_ITEMS} Equipped
                  </p>
                </div>

                {comparedProducts.length < MAX_COMPARE_ITEMS && (
                  <button
                    onClick={handleOpenAddModal}
                    className="btn btn-outline btn-primary btn-sm rounded-2xl font-bold text-xs gap-1.5 w-full border-dashed"
                  >
                    <Plus className="w-4 h-4" /> Add Rival Item
                  </button>
                )}
              </div>

              {/* Product Cards Columns */}
              {comparedProducts.map((product) => {
                const effectivePrice = product.discountPrice || product.price;
                const hasDiscount = Boolean(product.discountPrice && product.discountPrice < product.price);
                const inWishlist = isInWishlist(product._id);

                return (
                  <div
                    key={product._id}
                    className="col-span-1 bg-base-200 border border-base-content/10 rounded-3xl p-4 flex flex-col justify-between space-y-4 shadow-sm relative group hover:border-primary/40 transition-all"
                  >
                    <button
                      onClick={() => handleRemoveProduct(product._id)}
                      className="btn btn-ghost btn-xs btn-circle absolute top-3 right-3 text-base-content/40 hover:text-error"
                      title="Remove from comparison"
                    >
                      <X className="w-4 h-4" />
                    </button>

                    <div className="space-y-3">
                      <span className="badge badge-primary badge-xs font-bold uppercase text-[9px]">
                        {product.category}
                      </span>

                      {/* Thumbnail */}
                      <Link
                        to={`/product/${product.slug}`}
                        className="h-32 bg-base-100 rounded-2xl p-3 flex items-center justify-center border border-base-content/5 block"
                      >
                        <img
                          src={product.images?.[0] || 'https://via.placeholder.com/150'}
                          alt={product.name}
                          className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
                        />
                      </Link>

                      <div>
                        <span className="text-[10px] font-bold text-base-content/50 uppercase tracking-wider block">
                          {product.brand}
                        </span>
                        <Link
                          to={`/product/${product.slug}`}
                          className="font-bold text-xs text-base-content hover:text-primary transition-colors block line-clamp-2 mt-0.5"
                        >
                          {product.name}
                        </Link>
                      </div>

                      {/* Price Row */}
                      <div className="flex items-baseline gap-2 pt-1">
                        <span className="text-xl font-black text-primary font-mono">
                          ${effectivePrice}
                        </span>
                        {hasDiscount && (
                          <span className="text-xs line-through text-base-content/40 font-bold">
                            ${product.price}
                          </span>
                        )}
                      </div>

                      {/* Stock Badge */}
                      <div>
                        <span
                          className={`badge font-bold text-[9px] uppercase ${
                            product.stock > 0 ? 'badge-success badge-outline' : 'badge-error'
                          }`}
                        >
                          {product.stock > 0 ? `In Stock (${product.stock})` : 'Out of Stock'}
                        </span>
                      </div>
                    </div>

                    {/* Quick Purchase Actions */}
                    <div className="space-y-2 pt-2 border-t border-base-content/10">
                      <button
                        onClick={() => handleAddToCart(product)}
                        disabled={product.stock <= 0}
                        className="btn btn-primary btn-sm rounded-xl font-bold text-xs w-full gap-1.5 shadow-sm"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" /> Add to Cart
                      </button>
                      <button
                        onClick={() => handleToggleWishlist(product)}
                        className={`btn btn-ghost btn-xs rounded-xl font-bold text-xs w-full gap-1.5 border border-base-content/10 ${
                          inWishlist ? 'text-error' : 'text-base-content/70'
                        }`}
                      >
                        <Heart className={`w-3.5 h-3.5 ${inWishlist ? 'fill-current' : ''}`} />
                        {inWishlist ? 'Saved in Wishlist' : 'Save to Wishlist'}
                      </button>
                    </div>
                  </div>
                );
              })}

              {/* Placeholder Empty Slots if less than 4 */}
              {Array.from({ length: MAX_COMPARE_ITEMS - comparedProducts.length }).map((_, idx) => (
                <div
                  key={idx}
                  onClick={handleOpenAddModal}
                  className="col-span-1 border-2 border-dashed border-base-content/15 rounded-3xl p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:border-primary/50 hover:bg-base-200/30 transition-all space-y-2 min-h-[300px]"
                >
                  <div className="w-10 h-10 rounded-2xl bg-base-200 flex items-center justify-center text-base-content/40">
                    <Plus className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold text-base-content/60">Add Rival Component</span>
                  <span className="text-[10px] text-base-content/40">Slot Available</span>
                </div>
              ))}
            </div>

            {/* SPECS COMPARISON MATRIX SECTION */}
            <div className="bg-base-200/60 border border-base-content/10 rounded-3xl overflow-hidden shadow-sm">
              <div className="p-4 bg-base-200 border-b border-base-content/10 flex items-center gap-2">
                <Cpu className="w-4 h-4 text-primary" />
                <h3 className="text-xs font-black uppercase tracking-wider text-base-content">
                  Architectural & Specification Breakdown
                </h3>
              </div>

              <div className="divide-y divide-base-content/5 text-xs">
                {/* Standard Base Rows: Category */}
                <div className="grid grid-cols-5 py-3 px-4 items-center">
                  <span className="col-span-1 font-bold text-base-content/60">Category</span>
                  {comparedProducts.map((p) => (
                    <span key={p._id} className="col-span-1 font-semibold text-base-content">
                      {p.category}
                    </span>
                  ))}
                </div>

                {/* Standard Base Rows: Manufacturer */}
                <div className="grid grid-cols-5 py-3 px-4 items-center">
                  <span className="col-span-1 font-bold text-base-content/60">Manufacturer</span>
                  {comparedProducts.map((p) => (
                    <span key={p._id} className="col-span-1 font-semibold text-base-content uppercase">
                      {p.brand}
                    </span>
                  ))}
                </div>

                {/* Standard Base Rows: Customer Score */}
                <div className="grid grid-cols-5 py-3 px-4 items-center">
                  <span className="col-span-1 font-bold text-base-content/60">Rating & Reviews</span>
                  {comparedProducts.map((p) => (
                    <div key={p._id} className="col-span-1 flex items-center gap-1.5 text-warning">
                      <Star className="w-3.5 h-3.5 fill-warning" />
                      <span className="font-mono font-bold text-base-content">
                        {(p as any).rating > 0 ? (p as any).rating.toFixed(1) : 'New'}
                      </span>
                      <span className="text-[10px] text-base-content/40">
                        ({(p as any).numReviews || 0})
                      </span>
                    </div>
                  ))}
                </div>

                {/* Dynamic Spec Rows */}
                {allSpecLabels.length === 0 ? (
                  <div className="p-6 text-center text-xs text-base-content/50 italic">
                    No technical specifications populated for these components yet.
                  </div>
                ) : (
                  allSpecLabels.map((label) => {
                    const differs = isRowDifferent(label);

                    return (
                      <div
                        key={label}
                        className={`grid grid-cols-5 py-3 px-4 items-center transition-colors ${
                          highlightDifferences && differs
                            ? 'bg-primary/10 font-bold'
                            : 'hover:bg-base-100/40'
                        }`}
                      >
                        <div className="col-span-1 flex items-center gap-1.5">
                          <span className="font-bold text-base-content/70">{label}</span>
                          {highlightDifferences && differs && (
                            <span className="badge badge-warning badge-xs text-[8px] font-bold">
                              DIFF
                            </span>
                          )}
                        </div>

                        {comparedProducts.map((p) => {
                          const specItem = p.specs?.find(
                            (s) => s.label.trim().toLowerCase() === label.toLowerCase()
                          );

                          return (
                            <span
                              key={p._id}
                              className={`col-span-1 font-mono ${
                                specItem ? 'text-base-content' : 'text-base-content/30'
                              }`}
                            >
                              {specItem ? specItem.value : '—'}
                            </span>
                          );
                        })}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ADD COMPONENT MODAL PICKER */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-base-200 border border-base-content/10 rounded-3xl p-6 sm:p-7 w-full max-w-xl shadow-2xl space-y-4 my-6">
            <div className="flex items-center justify-between border-b border-base-content/10 pb-3">
              <div>
                <h3 className="font-black text-base text-base-content flex items-center gap-2">
                  <Plus className="w-5 h-5 text-primary" /> Select Component to Compare
                </h3>
                <p className="text-xs text-base-content/50">
                  Search across graphics cards, processors, displays, and gear
                </p>
              </div>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setModalSearchQuery('');
                }}
                className="btn btn-ghost btn-xs btn-circle"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Search */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search component by model, manufacturer, or category..."
                value={modalSearchQuery}
                onChange={(e) => setModalSearchQuery(e.target.value)}
                className="input input-bordered input-sm rounded-xl w-full text-xs pl-9"
              />
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40" />
            </div>

            {/* Catalog Items List */}
            <div className="max-h-80 overflow-y-auto space-y-2 pr-1 scrollbar-thin">
              {modalLoading ? (
                <div className="text-center py-12">
                  <span className="loading loading-spinner loading-md text-primary"></span>
                </div>
              ) : filteredModalProducts.length === 0 ? (
                <div className="text-center py-10 text-xs text-base-content/50">
                  No components found matching your search.
                </div>
              ) : (
                filteredModalProducts.map((prod) => {
                  const alreadyAdded = comparedProducts.some((p) => p._id === prod._id);

                  return (
                    <div
                      key={prod._id}
                      className={`p-3 bg-base-100 border border-base-content/5 rounded-2xl flex items-center justify-between gap-4 transition-all ${
                        alreadyAdded ? 'opacity-50 cursor-not-allowed' : 'hover:border-primary'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-12 h-12 rounded-xl bg-base-200 p-1 flex items-center justify-center shrink-0">
                          <img
                            src={prod.images?.[0] || 'https://via.placeholder.com/60'}
                            alt={prod.name}
                            className="max-h-full max-w-full object-contain"
                          />
                        </div>
                        <div className="min-w-0">
                          <span className="font-bold text-xs truncate block text-base-content">
                            {prod.name}
                          </span>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="badge badge-ghost badge-xs text-[9px] uppercase font-bold">
                              {prod.category}
                            </span>
                            <span className="text-[10px] text-base-content/50 uppercase font-semibold">
                              {prod.brand}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <span className="font-black text-sm text-primary font-mono">
                          ${prod.discountPrice || prod.price}
                        </span>
                        <button
                          onClick={() => handleAddProductToCompare(prod)}
                          disabled={alreadyAdded}
                          className="btn btn-primary btn-xs rounded-xl font-bold gap-1"
                        >
                          {alreadyAdded ? 'Equipped' : '+ Compare'}
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ComparePage;