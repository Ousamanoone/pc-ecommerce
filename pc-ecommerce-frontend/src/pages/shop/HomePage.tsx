import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import type { Product } from '../../types';
import { useCart } from '../../context/CartContext';
import {
  Cpu,
  Monitor,
  Zap,
  ShoppingBag,
  ArrowRight,
  ShieldCheck,
  Truck,
  Sparkles,
  Flame,
  Newspaper,
  BookOpen,
  Tag,
  Wrench,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  FlameKindling,
} from 'lucide-react';

interface BlogArticle {
  _id: string;
  title: string;
  slug: string;
  category: 'News' | 'Guide' | 'Promotion' | 'Review';
  summary: string;
  coverImage: string;
  author: string;
  createdAt: string;
}

interface BannerSlide {
  _id: string;
  title: string;
  subtitle: string;
  badgeText: string;
  imageUrl: string;
  linkUrl: string;
  isActive: boolean;
  displayOrder: number;
}

const resolveImageUrl = (url?: string) => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return `http://localhost:5000${url.startsWith('/') ? '' : '/'}${url}`;
};

export const HomePage: React.FC = () => {
  const { addToCart } = useCart() as any;
  const navigate = useNavigate();

  const [banners, setBanners] = useState<BannerSlide[]>([]);
  const [currentSlide, setCurrentSlide] = useState<number>(0);
  const [featuredParts, setFeaturedParts] = useState<Product[]>([]);
  const [prebuiltPCs, setPrebuiltPCs] = useState<Product[]>([]);
  const [blogs, setBlogs] = useState<BlogArticle[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchHomeData = async () => {
      setLoading(true);
      try {
        // 0. Tải danh sách Banner quảng cáo đang kích hoạt
        try {
          const bannerRes = await api.get('/banners/active');
          const bannerList = Array.isArray(bannerRes.data)
            ? bannerRes.data
            : bannerRes.data?.banners || [];
          setBanners(bannerList);
        } catch (bannerErr) {
          console.error('Failed to load active banners:', bannerErr);
        }

        // 1. Tải linh kiện nổi bật
        const partsRes = await api.get('/products', { params: { limit: 8 } });
        setFeaturedParts(partsRes.data.products || []);

        // 2. Tải danh sách PC Build sẵn
        const prebuiltRes = await api.get('/products', {
          params: { category: 'Pre-built', limit: 4 },
        });
        if (prebuiltRes.data.products && prebuiltRes.data.products.length > 0) {
          setPrebuiltPCs(prebuiltRes.data.products);
        } else {
          setPrebuiltPCs(partsRes.data.products?.slice(0, 4) || []);
        }

        // 3. Tải tin tức & bài viết công nghệ mới nhất
        const blogRes = await api.get('/blogs', { params: { limit: 3 } });
        setBlogs(blogRes.data || []);
      } catch (err) {
        console.error('Failed to load homepage feeds:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  // Tự động chuyển slide banner mỗi 5 giây
  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [banners.length]);

  const handleQuickBuy = (product: Product) => {
    if (typeof addToCart === 'function') {
      addToCart(product, 1);
      navigate('/cart');
    }
  };

  const activeBanner = banners[currentSlide];

  return (
    <div className="space-y-16 py-4">
      {/* 1. HERO BANNER CAROUSEL & VALUE PROPOSITIONS */}
      <section className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-base-300 via-base-200 to-base-300 border border-base-content/10 shadow-2xl">
        {banners.length > 0 && activeBanner ? (
          <div className="relative min-h-[380px] sm:min-h-[440px] flex items-center p-8 sm:p-14">
            {/* Ảnh nền Banner */}
            <img
              src={resolveImageUrl(activeBanner.imageUrl)}
              alt={activeBanner.title}
              className="absolute inset-0 w-full h-full object-cover transition-all duration-700"
            />
            {/* Lớp phủ tối giúp nổi bật chữ */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/60 to-black/25" />

            {/* Nội dung Banner */}
            <div className="max-w-2xl space-y-5 relative z-10 text-white">
              {activeBanner.badgeText && (
                <div className="inline-flex items-center gap-2 bg-primary/25 border border-primary/40 backdrop-blur-md px-3.5 py-1.5 rounded-full">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <span className="font-bold text-xs text-primary-content uppercase tracking-wider">
                    {activeBanner.badgeText}
                  </span>
                </div>
              )}

              <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight text-white">
                {activeBanner.title}
              </h1>

              {activeBanner.subtitle && (
                <p className="text-sm sm:text-base text-white/80 leading-relaxed">
                  {activeBanner.subtitle}
                </p>
              )}

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link
                  to={activeBanner.linkUrl || '/products'}
                  className="btn btn-primary btn-md rounded-2xl font-black text-xs gap-2 shadow-lg shadow-primary/25"
                >
                  Explore Campaign <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/builder"
                  className="btn btn-ghost btn-md rounded-2xl font-bold text-xs text-white border border-white/20 hover:bg-white/10 gap-2"
                >
                  <Wrench className="w-4 h-4" /> Launch PC Builder
                </Link>
              </div>
            </div>

            {/* Nút chuyển qua lại nếu có nhiều hơn 1 banner */}
            {banners.length > 1 && (
              <>
                <button
                  onClick={() =>
                    setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length)
                  }
                  className="btn btn-circle btn-sm bg-black/50 hover:bg-black/80 border-white/10 text-white absolute left-4 top-1/2 -translate-y-1/2 z-20"
                  title="Previous slide"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setCurrentSlide((prev) => (prev + 1) % banners.length)}
                  className="btn btn-circle btn-sm bg-black/50 hover:bg-black/80 border-white/10 text-white absolute right-4 top-1/2 -translate-y-1/2 z-20"
                  title="Next slide"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>

                {/* Chấm tròn chỉ báo vị trí slide */}
                <div className="absolute bottom-5 right-8 z-20 flex items-center gap-2">
                  {banners.map((b, idx) => (
                    <button
                      key={b._id}
                      onClick={() => setCurrentSlide(idx)}
                      className={`h-2 rounded-full transition-all ${
                        idx === currentSlide ? 'w-7 bg-primary' : 'w-2 bg-white/40 hover:bg-white/70'
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        ) : (
          /* Fallback mặc định khi chưa có Banner nào được bật */
          <div className="p-8 sm:p-14">
            <div className="max-w-2xl space-y-5 relative z-10">
              <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 px-3.5 py-1.5 rounded-full">
                <Sparkles
                  className="w-4 h-4 text-primary animate-spin"
                  style={{ animationDuration: '3s' }}
                />
                <span className="font-bold text-xs text-primary uppercase tracking-wider">
                  Next-Gen Architecture Live
                </span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-black text-base-content tracking-tight leading-none">
                High-Performance Hardware & Custom Battlestations
              </h1>

              <p className="text-sm sm:text-base text-base-content/70 leading-relaxed">
                Configure custom workstations with zero compatibility errors, or choose pre-tested, bench-tuned gaming rigs backed by comprehensive 36-month local warranty.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link
                  to="/builder"
                  className="btn btn-primary btn-md rounded-2xl font-black text-xs gap-2 shadow-lg shadow-primary/25"
                >
                  <Wrench className="w-4 h-4" /> Launch PC Builder
                </Link>
                <a
                  href="#prebuilts"
                  className="btn btn-ghost btn-md rounded-2xl font-bold text-xs border border-base-content/15 gap-2"
                >
                  <Flame className="w-4 h-4 text-warning" /> Explore Pre-builts
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Value badges bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 px-8 sm:px-14 py-6 bg-base-200/90 backdrop-blur-md border-t border-base-content/10 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-base-content">36-Month Warranty</p>
              <p className="text-[11px] text-base-content/50">Official vendor assurance</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-success/10 text-success flex items-center justify-center shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-base-content">Same-Day Express</p>
              <p className="text-[11px] text-base-content/50">Safe insured dispatch</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-warning/10 text-warning flex items-center justify-center shrink-0">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-base-content">Stress-Tested Rigs</p>
              <p className="text-[11px] text-base-content/50">24H AIDA64 bench run</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-info/10 text-info flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-base-content">Napas247 VietQR</p>
              <p className="text-[11px] text-base-content/50">Zero-fee wire clearance</p>
            </div>
          </div>
        </div>
      </section>

      {/* 2. DEDICATED PRE-BUILT PC SECTION */}
      <section id="prebuilts" className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-base-content/10 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="badge badge-warning badge-sm font-black uppercase text-[9px] text-black">
                Ready-to-Ship
              </span>
              <span className="text-xs font-bold text-base-content/50 uppercase tracking-widest">
                Turnkey Solutions
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-base-content tracking-tight mt-1 flex items-center gap-2">
              <FlameKindling className="w-7 h-7 text-warning" /> Flagship Pre-Built Battlestations
            </h2>
            <p className="text-xs text-base-content/60 mt-0.5">
              Factory assembled, cable-managed, and pre-installed with Windows 11 Pro. Plug and play out of the box.
            </p>
          </div>

          <Link
            to="/products?category=Pre-built"
            className="btn btn-ghost btn-sm rounded-xl text-xs font-bold gap-1 border border-base-content/10"
          >
            View All Turnkey PCs <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {prebuiltPCs.map((pc) => {
            const effPrice = pc.discountPrice || pc.price;

            return (
              <div
                key={pc._id}
                className="bg-base-200 border border-base-content/10 rounded-3xl p-5 flex flex-col justify-between hover:border-warning/50 hover:shadow-xl transition-all group"
              >
                <div className="space-y-3">
                  <div className="relative w-full h-48 bg-base-100 rounded-2xl p-4 flex items-center justify-center border border-base-content/5 overflow-hidden">
                    <img
                      src={resolveImageUrl(pc.images?.[0]) || 'https://via.placeholder.com/200'}
                      alt={pc.name}
                      className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
                    />
                    <span className="badge badge-neutral badge-xs font-mono font-bold absolute top-3 left-3 text-[9px]">
                      READY TO SHIP
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-warning uppercase tracking-wider block">
                      {pc.brand || 'GearStore Custom'}
                    </span>
                    <Link
                      to={`/product/${pc.slug}`}
                      className="font-black text-sm text-base-content hover:text-primary transition-colors line-clamp-1 mt-0.5"
                    >
                      {pc.name}
                    </Link>

                    <div className="mt-2.5 p-2.5 bg-base-100 rounded-xl border border-base-content/5 space-y-1 text-[11px] text-base-content/70 font-medium">
                      <div className="flex items-center gap-1.5 truncate">
                        <Cpu className="w-3 h-3 text-primary shrink-0" />
                        <span className="truncate">{pc.specs?.cpu || 'Core i7 / Ryzen 7 Octa-Core'}</span>
                      </div>
                      <div className="flex items-center gap-1.5 truncate">
                        <Monitor className="w-3 h-3 text-warning shrink-0" />
                        <span className="truncate">{pc.specs?.gpu || 'GeForce RTX 4070 Ti / 4080 Super'}</span>
                      </div>
                      <div className="flex items-center gap-1.5 truncate">
                        <Zap className="w-3 h-3 text-success shrink-0" />
                        <span className="truncate">{pc.wattage || 750}W 80+ Gold Certified PSU</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-base-content/10 flex items-center justify-between gap-2">
                  <div>
                    <span className="text-[10px] text-base-content/50 block">Complete Setup</span>
                    <span className="font-mono font-black text-lg text-primary">${effPrice}</span>
                  </div>

                  <button
                    onClick={() => handleQuickBuy(pc)}
                    className="btn btn-warning btn-sm rounded-xl font-black text-xs gap-1.5 text-black shadow-md shadow-warning/20"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" /> Buy Now
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. HARDWARE CATALOG TEASER */}
      <section className="space-y-6">
        <div className="flex items-end justify-between border-b border-base-content/10 pb-4">
          <div>
            <span className="text-xs font-bold text-primary uppercase tracking-widest block">
              Certified Inventory
            </span>
            <h2 className="text-2xl font-black text-base-content tracking-tight mt-1">
              Popular DIY Components
            </h2>
          </div>
          <Link to="/products" className="text-xs font-bold text-primary hover:underline flex items-center gap-1">
            Browse All 220+ Parts <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {featuredParts.slice(0, 8).map((product) => (
            <div
              key={product._id}
              className="bg-base-200 border border-base-content/10 rounded-2xl p-3 flex flex-col justify-between hover:border-primary/40 transition-all group"
            >
              <div className="relative w-full h-32 bg-base-100 rounded-xl p-2 flex items-center justify-center">
                <img
                  src={resolveImageUrl(product.images?.[0]) || 'https://via.placeholder.com/100'}
                  alt={product.name}
                  className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform"
                />
                <span className="badge badge-primary badge-xs font-bold text-[8px] absolute top-2 left-2 uppercase">
                  {product.category}
                </span>
              </div>
              <div className="mt-2 space-y-1">
                <Link
                  to={`/product/${product.slug}`}
                  className="font-bold text-xs text-base-content line-clamp-1 hover:text-primary transition-colors"
                >
                  {product.name}
                </Link>
                <div className="flex items-center justify-between">
                  <span className="font-mono font-black text-xs text-primary">
                    ${product.discountPrice || product.price}
                  </span>
                  <button
                    onClick={() => addToCart(product, 1)}
                    className="btn btn-ghost btn-xs btn-circle text-primary hover:bg-primary/10"
                    title="Add to cart"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. TECH NEWS, BENCHMARKS & HARDWARE REVIEWS (BLOG FEED) */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-base-content/10 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="badge badge-primary badge-sm font-bold uppercase text-[9px]">
                Editorial Desk
              </span>
              <span className="text-xs font-bold text-base-content/50 uppercase tracking-widest">
                Hardware Intelligence
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-base-content tracking-tight mt-1 flex items-center gap-2">
              <Newspaper className="w-7 h-7 text-primary" /> Tech News, Guides & Announcements
            </h2>
            <p className="text-xs text-base-content/60 mt-0.5">
              Deep dives on CPU architectures, GPU game benchmarks, driver releases, and exclusive seasonal promotions.
            </p>
          </div>

          <Link
            to="/blogs"
            className="btn btn-ghost btn-sm rounded-xl text-xs font-bold gap-1 border border-base-content/10"
          >
            All Publications <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {blogs.length === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-base-200 border border-base-content/10 rounded-3xl p-5 space-y-3">
              <div className="w-full h-40 bg-base-100 rounded-2xl flex items-center justify-center text-base-content/30 border border-base-content/5">
                <Newspaper className="w-10 h-10" />
              </div>
              <span className="badge badge-primary badge-xs font-bold text-[9px] uppercase">News</span>
              <h3 className="font-black text-sm text-base-content">
                Next-Gen RTX Blackwell Architectural Deep Dive: What PC Builders Should Expect
              </h3>
              <p className="text-xs text-base-content/60 line-clamp-2">
                We analyze ray-tracing silicon efficiency, PCIe 5.0 bandwidth demands, and estimated wattage curves.
              </p>
            </div>

            <div className="bg-base-200 border border-base-content/10 rounded-3xl p-5 space-y-3">
              <div className="w-full h-40 bg-base-100 rounded-2xl flex items-center justify-center text-base-content/30 border border-base-content/5">
                <BookOpen className="w-10 h-10" />
              </div>
              <span className="badge badge-success badge-xs font-bold text-[9px] uppercase text-white">Guide</span>
              <h3 className="font-black text-sm text-base-content">
                DDR4 vs DDR5 Gaming Benchmarks: Is Upgrading Worth It in 2026?
              </h3>
              <p className="text-xs text-base-content/60 line-clamp-2">
                Frame-time comparisons across 15 AAA titles on both Intel and AMD flagship desktop platforms.
              </p>
            </div>

            <div className="bg-base-200 border border-base-content/10 rounded-3xl p-5 space-y-3">
              <div className="w-full h-40 bg-base-100 rounded-2xl flex items-center justify-center text-base-content/30 border border-base-content/5">
                <Tag className="w-10 h-10" />
              </div>
              <span className="badge badge-warning badge-xs font-bold text-[9px] uppercase text-black">Promotion</span>
              <h3 className="font-black text-sm text-base-content">
                VietQR Spring Campaign: Instant 5% Cashback on All Custom Liquid-Cooled Rigs
              </h3>
              <p className="text-xs text-base-content/60 line-clamp-2">
                Settling via Napas247 instant transfer qualifies you for automated hardware voucher coupons.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {blogs.map((article) => (
              <div
                key={article._id}
                className="bg-base-200 border border-base-content/10 rounded-3xl p-5 flex flex-col justify-between hover:border-primary/40 hover:shadow-lg transition-all group"
              >
                <div className="space-y-3">
                  <div className="w-full h-44 bg-base-100 rounded-2xl overflow-hidden border border-base-content/5">
                    <img
                      src={
                        resolveImageUrl(article.coverImage) ||
                        'https://via.placeholder.com/400x220?text=Hardware+News'
                      }
                      alt={article.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="badge badge-primary badge-xs font-bold text-[9px] uppercase">
                      {article.category}
                    </span>
                    <span className="text-[10px] text-base-content/40 font-mono">
                      {new Date(article.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <Link
                    to={`/blog/${article.slug}`}
                    className="font-black text-sm text-base-content group-hover:text-primary transition-colors line-clamp-2 leading-snug"
                  >
                    {article.title}
                  </Link>

                  <p className="text-xs text-base-content/65 line-clamp-3 leading-relaxed">
                    {article.summary}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-base-content/10 flex items-center justify-between text-xs">
                  <span className="text-[10px] font-bold text-base-content/50">
                    By {article.author}
                  </span>
                  <Link
                    to={`/blog/${article.slug}`}
                    className="font-bold text-primary hover:underline flex items-center gap-1 text-[11px]"
                  >
                    Read Article <ChevronRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 5. HARDWARE PROMO BULLETIN / NEWSLETTER */}
      <section className="bg-base-200 border border-base-content/10 rounded-3xl p-8 sm:p-12 text-center space-y-4 max-w-3xl mx-auto shadow-inner">
        <span className="badge badge-primary badge-xs font-bold uppercase text-[9px]">
          VIP Dispatch
        </span>
        <h2 className="text-2xl sm:text-3xl font-black text-base-content">
          Never Miss a Flash Hardware Drop or Driver Alert
        </h2>
        <p className="text-xs text-base-content/60 max-w-md mx-auto leading-relaxed">
          Subscribe to our tech bulletin for early access to limited GPU allocations, firmware updates, and member-exclusive vouchers.
        </p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            alert('Subscribed to GearStore VIP Hardware Alerts!');
          }}
          className="flex gap-2 max-w-md mx-auto pt-2"
        >
          <input
            type="email"
            required
            placeholder="Enter your email address..."
            className="input input-bordered input-sm rounded-xl flex-1 text-xs bg-base-100"
          />
          <button type="submit" className="btn btn-primary btn-sm rounded-xl text-xs font-bold px-5">
            Subscribe
          </button>
        </form>
      </section>
    </div>
  );
};

export default HomePage;