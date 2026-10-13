import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../../services/api';
import type { Product } from '../../types';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import {
  Filter,
  SlidersHorizontal,
  Search,
  RotateCcw,
  ShoppingBag,
  Heart,
  Star,
  Zap,
  Check,
  Package,
  Layers,
  ChevronLeft,
  ChevronRight,
  Eye,
} from 'lucide-react';

const HARDWARE_CATEGORIES = [
  'ALL',
  'CPU',
  'GPU',
  'Mainboard',
  'RAM',
  'Storage',
  'PSU',
  'Case',
  'Cooling',
  'Monitor',
];

const HARDWARE_BRANDS = [
  'ALL',
  'ASUS',
  'MSI',
  'Gigabyte',
  'Intel',
  'AMD',
  'Corsair',
  'Kingston',
  'Samsung',
  'NZXT',
];

export const CatalogPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { addToCart } = useCart() as any;
  const { wishlist, addToWishlist, removeFromWishlist } = useWishlist() as any;

  // Filter States from URL / Defaults
  const [category, setCategory] = useState<string>(searchParams.get('category') || 'ALL');
  const [brand, setBrand] = useState<string>(searchParams.get('brand') || 'ALL');
  const [searchQuery, setSearchQuery] = useState<string>(searchParams.get('search') || '');
  const [priceRange, setPriceRange] = useState<number>(2500);
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<string>('featured');

  // Data & Pagination States
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage] = useState<number>(12);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  // Sync state when URL params change
  useEffect(() => {
    const urlCategory = searchParams.get('category');
    const urlSearch = searchParams.get('search');
    if (urlCategory) setCategory(urlCategory);
    if (urlSearch !== null) setSearchQuery(urlSearch);
  }, [searchParams]);

  // Fetch catalog hardware
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params: Record<string, any> = { limit: 250 };
      if (category !== 'ALL') params.category = category;
      if (searchQuery.trim()) params.search = searchQuery.trim();

      const res = await api.get('/products', { params });
      setProducts(res.data.products || []);
    } catch (err) {
      console.error('Failed to load hardware catalog:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
    setCurrentPage(1);
  }, [category, searchQuery]);

  // Client-side filtering & sorting
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        const effectivePrice = p.discountPrice || p.price;
        const matchesBrand = brand === 'ALL' || p.brand?.toLowerCase() === brand.toLowerCase();
        const matchesPrice = effectivePrice <= priceRange;
        const matchesStock = !inStockOnly || p.stock > 0;
        return matchesBrand && matchesPrice && matchesStock;
      })
      .sort((a, b) => {
        const priceA = a.discountPrice || a.price;
        const priceB = b.discountPrice || b.price;

        if (sortBy === 'price-asc') return priceA - priceB;
        if (sortBy === 'price-desc') return priceB - priceA;
        if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
        return 0; // Default featured
      });
  }, [products, brand, priceRange, inStockOnly, sortBy]);

  // Pagination slice
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredProducts.slice(start, start + itemsPerPage);
  }, [filteredProducts, currentPage, itemsPerPage]);

  const handleResetFilters = () => {
    setCategory('ALL');
    setBrand('ALL');
    setSearchQuery('');
    setPriceRange(2500);
    setInStockOnly(false);
    setSortBy('featured');
    setSearchParams({});
  };

  const isWishlisted = (productId: string) => {
    if (Array.isArray(wishlist)) {
      return wishlist.some((item: any) => item._id === productId || item.product === productId);
    }
    return wishlist?.items?.some((item: any) => item._id === productId || item.product === productId);
  };

  const handleToggleWishlist = (product: Product) => {
    if (isWishlisted(product._id)) {
      removeFromWishlist(product._id);
      showToast('Removed from saved wishlist.');
    } else {
      addToWishlist(product);
      showToast('Saved to your hardware wishlist.');
    }
  };

  const handleQuickAdd = (product: Product) => {
    if (typeof addToCart === 'function') {
      addToCart(product, 1);
      showToast(`Added ${product.name} to cart.`);
    }
  };

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

      {/* Catalog Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-base-content/10 pb-5">
        <div>
          <span className="badge badge-primary badge-xs font-bold uppercase text-[9px] mb-1">
            Hardware Catalog
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-base-content tracking-tight">
            Component Inventory & Specifications
          </h1>
          <p className="text-xs text-base-content/60 mt-0.5">
            Explore certified computer hardware, compare TDP wattages, and filter high-performance gear.
          </p>
        </div>

        {/* Sort & Quick Controls */}
        <div className="flex items-center gap-2.5">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="select select-bordered select-sm rounded-xl text-xs bg-base-200"
          >
            <option value="featured">Sort: Featured Picks</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="rating">Top Rated Hardware</option>
          </select>

          <button
            onClick={handleResetFilters}
            className="btn btn-ghost btn-sm rounded-xl text-xs font-bold border border-base-content/10 hover:border-primary gap-1.5"
            title="Reset active filters"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT SIDEBAR: FILTERS */}
        <aside className="lg:col-span-3 bg-base-200 border border-base-content/10 rounded-3xl p-5 space-y-6">
          <div className="flex items-center justify-between border-b border-base-content/10 pb-3">
            <h2 className="font-black text-sm text-base-content flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-primary" /> Filter Hardware
            </h2>
            <span className="badge badge-neutral font-mono font-bold text-[10px]">
              {filteredProducts.length} items
            </span>
          </div>

          {/* Search keyword inside catalog */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-base-content/70 block uppercase tracking-wider">
              Keyword Search
            </label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40" />
              <input
                type="text"
                placeholder="Model, architecture..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input input-bordered input-xs rounded-xl w-full pl-8 text-xs bg-base-100"
              />
            </div>
          </div>

          {/* Component Categories */}
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-base-content/70 block uppercase tracking-wider">
              Hardware Category
            </label>
            <div className="flex flex-wrap gap-1">
              {HARDWARE_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`btn btn-xs rounded-xl font-bold transition-all ${
                    category === cat ? 'btn-primary shadow-xs' : 'btn-ghost text-base-content/70'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Brand Selector */}
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-base-content/70 block uppercase tracking-wider">
              Manufacturer / Brand
            </label>
            <div className="flex flex-wrap gap-1">
              {HARDWARE_BRANDS.map((b) => (
                <button
                  key={b}
                  onClick={() => setBrand(b)}
                  className={`btn btn-xs rounded-xl font-bold transition-all ${
                    brand === b ? 'btn-primary shadow-xs' : 'btn-ghost text-base-content/70'
                  }`}
                >
                  {b}
                </button>
              ))}
            </div>
          </div>

          {/* Max Price Range Slider */}
          <div className="space-y-2 pt-2 border-t border-base-content/10">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-base-content/70 uppercase text-[11px]">Max Price Cap</span>
              <span className="font-mono font-black text-primary">${priceRange}</span>
            </div>
            <input
              type="range"
              min={50}
              max={3000}
              step={50}
              value={priceRange}
              onChange={(e) => setPriceRange(Number(e.target.value))}
              className="range range-primary range-xs"
            />
            <div className="flex justify-between text-[10px] text-base-content/40 font-mono">
              <span>$50</span>
              <span>$1,500</span>
              <span>$3,000</span>
            </div>
          </div>

          {/* Availability Toggle */}
          <div className="pt-2 border-t border-base-content/10">
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-xs font-bold text-base-content/80">In-Stock Only</span>
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => setInStockOnly(e.target.checked)}
                className="toggle toggle-primary toggle-sm"
              />
            </label>
          </div>
        </aside>

        {/* RIGHT MAIN: PRODUCT GRID */}
        <main className="lg:col-span-9 space-y-6">
          {loading ? (
            <div className="py-24 text-center">
              <span className="loading loading-spinner loading-lg text-primary"></span>
            </div>
          ) : paginatedProducts.length === 0 ? (
            <div className="py-24 text-center space-y-3 bg-base-200/50 rounded-3xl border border-dashed border-base-content/15 p-8">
              <Package className="w-12 h-12 text-base-content/30 mx-auto" />
              <h3 className="text-base font-bold text-base-content">No Hardware Meets Current Filters</h3>
              <p className="text-xs text-base-content/50 max-w-sm mx-auto">
                Try widening your price cap, clearing search keywords, or selecting "ALL" categories.
              </p>
              <button
                onClick={handleResetFilters}
                className="btn btn-primary btn-sm rounded-xl text-xs font-bold"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {paginatedProducts.map((product) => {
                const effPrice = product.discountPrice || product.price;
                const hasDiscount = Boolean(product.discountPrice && product.discountPrice < product.price);
                const wish = isWishlisted(product._id);

                return (
                  <div
                    key={product._id}
                    className="bg-base-200 border border-base-content/10 rounded-3xl p-4 flex flex-col justify-between hover:border-primary/40 hover:shadow-lg transition-all group"
                  >
                    <div>
                      {/* Thumbnail container */}
                      <div className="relative w-full h-44 bg-base-100 rounded-2xl p-3 flex items-center justify-center border border-base-content/5 overflow-hidden">
                        <img
                          src={product.images?.[0] || 'https://via.placeholder.com/150'}
                          alt={product.name}
                          className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
                        />

                        {/* Top Badges */}
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

                        {/* Wishlist Button */}
                        <button
                          onClick={() => handleToggleWishlist(product)}
                          className={`btn btn-xs btn-circle absolute top-2.5 right-2.5 transition-all ${
                            wish
                              ? 'btn-error text-white shadow-xs'
                              : 'btn-ghost bg-base-100/80 text-base-content/60 hover:text-error'
                          }`}
                          title="Save to wishlist"
                        >
                          <Heart className={`w-3.5 h-3.5 ${wish ? 'fill-current' : ''}`} />
                        </button>
                      </div>

                      {/* Info & Specs */}
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
                          <span className="text-[10px] text-base-content/40">
                            ({product.numReviews || 0})
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Price & Action Row */}
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

                      <div className="flex items-center gap-1">
                        <Link
                          to={`/product/${product.slug}`}
                          className="btn btn-ghost btn-xs btn-circle text-base-content/60 hover:text-base-content"
                          title="View Specs"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </Link>
                        <button
                          onClick={() => handleQuickAdd(product)}
                          disabled={product.stock <= 0}
                          className="btn btn-primary btn-xs rounded-xl font-bold px-2.5 gap-1 shadow-xs"
                          title="Add to Shopping Cart"
                        >
                          <ShoppingBag className="w-3.5 h-3.5" /> Add
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="btn btn-ghost btn-sm rounded-xl text-xs font-bold border border-base-content/10"
              >
                <ChevronLeft className="w-4 h-4" /> Previous
              </button>
              <span className="text-xs font-bold font-mono px-3 text-base-content/70">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="btn btn-ghost btn-sm rounded-xl text-xs font-bold border border-base-content/10"
              >
                Next <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default CatalogPage;