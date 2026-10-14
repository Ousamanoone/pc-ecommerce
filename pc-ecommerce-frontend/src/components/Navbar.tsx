import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import api from '../services/api';
import type { Product } from '../types';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import { useTheme, DAISYUI_THEMES } from '../context/ThemeContext';
import NotificationBell from './NotificationBell';
import {
  Package,
  Search,
  X,
  ShoppingBag,
  Heart,
  Palette,
  Check,
  User,
  LogOut,
  ExternalLink,
  ChevronRight,
  Menu,
  MessageCircle,
  Phone,
} from 'lucide-react';

const FacebookIcon = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
  </svg>
);

export const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { cartCount } = useCart() as any;
  const { user, logout } = useAuth();
  const { wishlist } = useWishlist() as any;
  const { theme, setTheme, previewTheme, socialSettings } = useTheme();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [totalResults, setTotalResults] = useState(0);
  const [isSearching, setIsSearching] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const wishlistCount = Array.isArray(wishlist)
    ? wishlist.length
    : wishlist?.items?.length || 0;

  useEffect(() => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      setTotalResults(0);
      setIsDropdownOpen(false);
      return;
    }

    setIsSearching(true);
    const delayDebounce = setTimeout(async () => {
      try {
        const res = await api.get('/products', {
          params: { search: searchTerm.trim(), limit: 6 },
        });
        setSearchResults(res.data.products || []);
        setTotalResults(res.data.totalProducts || 0);
        setIsDropdownOpen(true);
      } catch (err) {
        console.error('Live search error:', err);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchTerm]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    setIsDropdownOpen(false);
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;
    setIsDropdownOpen(false);
    setMobileMenuOpen(false);
    navigate(`/products?search=${encodeURIComponent(searchTerm.trim())}`);
  };

  const handleSelectProduct = (slug: string) => {
    setIsDropdownOpen(false);
    setSearchTerm('');
    navigate(`/product/${slug}`);
  };

  const navLinks = [
    { label: 'Catalog', path: '/products' },
    { label: 'PC Builder', path: '/builder', badge: 'HOT' },
    { label: 'Compare', path: '/compare' },
    { label: 'Deals', path: '/vouchers', badge: 'VOUCHER' },
    { label: 'Track Order', path: '/track-order' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-base-100/95 backdrop-blur-md border-b border-base-content/10 print:hidden">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="h-16 flex items-center justify-between gap-2 sm:gap-4">
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="btn btn-ghost btn-sm btn-circle lg:hidden text-base-content"
              aria-label="Open Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <Link to="/" className="flex items-center gap-2 shrink-0">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-2xl bg-primary text-primary-content flex items-center justify-center font-black shadow-md shadow-primary/20">
                <Package className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <span className="font-black tracking-wider text-sm sm:text-lg text-base-content">
                GEARSTORE
              </span>
            </Link>
          </div>

          <nav className="hidden lg:flex items-center gap-1 shrink-0">
            {navLinks.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-base-200 text-primary'
                      : 'text-base-content/70 hover:text-base-content hover:bg-base-200/50'
                  }`}
                >
                  <span>{item.label}</span>
                  {item.badge && (
                    <span
                      className={`badge badge-xs font-black text-[9px] ${
                        item.badge === 'HOT' ? 'badge-error text-white' : 'badge-primary'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          <div ref={searchRef} className="relative flex-1 max-w-md hidden md:block">
            <form onSubmit={handleSearchSubmit} className="relative w-full">
              <input
                type="text"
                placeholder="Search graphics cards, CPUs, DDR5..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onFocus={() => {
                  if (searchResults.length > 0) setIsDropdownOpen(true);
                }}
                className="input input-bordered input-sm rounded-2xl w-full text-xs pl-9 pr-8 bg-base-200/60 focus:bg-base-100 border-base-content/10"
              />
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40" />
              {isSearching ? (
                <span className="loading loading-spinner loading-xs absolute right-3 top-1/2 -translate-y-1/2 text-primary"></span>
              ) : searchTerm ? (
                <button
                  type="button"
                  onClick={() => {
                    setSearchTerm('');
                    setIsDropdownOpen(false);
                  }}
                  className="btn btn-ghost btn-xs btn-circle absolute right-1.5 top-1/2 -translate-y-1/2"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              ) : null}
            </form>

            {isDropdownOpen && (
              <div className="absolute left-0 right-0 top-full mt-2 bg-base-200 border border-base-content/10 rounded-3xl shadow-2xl overflow-hidden z-50">
                <div className="p-3 border-b border-base-content/5 flex items-center justify-between text-[11px] text-base-content/50">
                  <span className="font-bold uppercase">Quick Suggestions</span>
                  <span>{totalResults} products found</span>
                </div>
                {searchResults.length === 0 ? (
                  <div className="py-6 text-center text-xs text-base-content/60">
                    No hardware found
                  </div>
                ) : (
                  <div className="divide-y divide-base-content/5 max-h-80 overflow-y-auto">
                    {searchResults.map((item) => (
                      <div
                        key={item._id}
                        onClick={() => handleSelectProduct(item.slug)}
                        className="p-3 hover:bg-base-100 cursor-pointer flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <img
                            src={item.images?.[0] || 'https://via.placeholder.com/60'}
                            alt={item.name}
                            className="w-10 h-10 rounded-lg object-contain bg-base-100 p-1 shrink-0"
                          />
                          <div className="min-w-0">
                            <p className="font-bold text-xs truncate">{item.name}</p>
                            <span className="text-[10px] text-base-content/50 uppercase">
                              {item.brand}
                            </span>
                          </div>
                        </div>
                        <span className="font-mono font-black text-xs text-primary shrink-0">
                          ${item.discountPrice || item.price}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
            {socialSettings.facebookUrl && (
              <a
                href={socialSettings.facebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-ghost btn-xs sm:btn-sm btn-circle text-[#1877F2] hover:bg-[#1877F2]/10 hidden sm:inline-flex"
                title="Visit Facebook Fanpage"
              >
                <FacebookIcon className="w-4 h-4" />
              </a>
            )}

            {/* MENU CHỌN 32 THEME DAISYUI KHI RÊ CHUỘT */}
            <div
              className="dropdown dropdown-hover dropdown-end"
              onMouseLeave={() => previewTheme(null)}
            >
              <div
                tabIndex={0}
                role="button"
                className="btn btn-ghost btn-xs sm:btn-sm rounded-xl gap-1 text-xs font-bold px-2"
                title="Hover to switch DaisyUI Theme"
              >
                <Palette className="w-4 h-4 text-primary" />
                <span className="hidden xl:inline capitalize text-[11px]">{theme}</span>
              </div>

              <div tabIndex={0} className="dropdown-content z-50 pt-2 w-64 sm:w-72">
                <div className="bg-base-200 border border-base-content/15 rounded-2xl shadow-2xl p-3 space-y-2">
                  <div className="flex items-center justify-between px-1 pb-1 border-b border-base-content/10">
                    <span className="text-[11px] font-black uppercase tracking-wider text-base-content/60">
                      DaisyUI Themes ({DAISYUI_THEMES.length})
                    </span>
                    <span className="badge badge-primary badge-xs font-mono">{theme}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-1.5 max-h-72 overflow-y-auto pr-1">
                    {DAISYUI_THEMES.map((tName) => {
                      const isCurrent = theme === tName;
                      return (
                        <button
                          key={tName}
                          type="button"
                          onMouseEnter={() => previewTheme(tName)}
                          onClick={() => setTheme(tName)}
                          data-theme={tName}
                          className={`flex items-center justify-between px-2.5 py-2 rounded-xl text-left text-xs font-bold transition-all bg-base-100 text-base-content border ${
                            isCurrent
                              ? 'border-primary ring-2 ring-primary/30'
                              : 'border-base-content/10 hover:border-primary/50'
                          }`}
                        >
                          <span className="capitalize truncate text-[11px]">{tName}</span>
                          <div className="flex items-center gap-1 shrink-0">
                            <span className="w-2 h-2 rounded-full bg-primary"></span>
                            <span className="w-2 h-2 rounded-full bg-secondary"></span>
                            <span className="w-2 h-2 rounded-full bg-accent"></span>
                            {isCurrent && <Check className="w-3 h-3 text-primary ml-0.5" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            <Link
              to="/wishlist"
              className="btn btn-ghost btn-xs sm:btn-sm btn-circle relative text-base-content/70 hover:text-error"
              title="Saved Wishlist"
            >
              <Heart className="w-4 h-4" />
              {wishlistCount > 0 && (
                <span className="badge badge-error badge-xs font-bold text-white absolute -top-0.5 -right-0.5">
                  {wishlistCount}
                </span>
              )}
            </Link>

            <Link
              to="/cart"
              className="btn btn-ghost btn-xs sm:btn-sm btn-circle relative text-base-content/70 hover:text-primary"
              title="Shopping Cart"
            >
              <ShoppingBag className="w-4 h-4" />
              {cartCount > 0 && (
                <span className="badge badge-primary badge-xs font-bold text-primary-content absolute -top-0.5 -right-0.5">
                  {cartCount}
                </span>
              )}
            </Link>

            <NotificationBell />

            {user ? (
              <div className="dropdown dropdown-end">
                <div
                  tabIndex={0}
                  role="button"
                  className="btn btn-ghost btn-xs sm:btn-sm rounded-xl font-black text-xs gap-1.5 px-1.5 sm:px-2.5"
                >
                  <div className="w-6 h-6 rounded-lg bg-primary text-primary-content flex items-center justify-center font-bold text-xs">
                    {user.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <span className="hidden md:inline max-w-[85px] truncate">
                    {user.name}
                  </span>
                </div>
                <ul
                  tabIndex={0}
                  className="dropdown-content menu p-2 shadow-2xl bg-base-200 border border-base-content/10 rounded-2xl w-56 text-xs space-y-1 z-50 mt-2"
                >
                  <li className="menu-title text-[10px] text-base-content/50 uppercase font-black px-3 py-1 truncate">
                    {user.email}
                  </li>
                  <li>
                    <Link to="/profile">
                      <User className="w-3.5 h-3.5 text-primary" /> Profile & Orders
                    </Link>
                  </li>
                  {(user.role === 'admin' || user.role === 'staff') && (
                    <li>
                      <Link to="/admin" className="text-primary font-bold">
                        <ExternalLink className="w-3.5 h-3.5" /> Admin Console
                      </Link>
                    </li>
                  )}
                  <div className="divider my-1"></div>
                  <li>
                    <button onClick={logout} className="text-error font-bold">
                      <LogOut className="w-3.5 h-3.5" /> Sign Out
                    </button>
                  </li>
                </ul>
              </div>
            ) : (
              <Link
                to="/admin/login"
                className="btn btn-primary btn-xs sm:btn-sm rounded-xl font-bold text-xs gap-1 shadow-sm px-2.5"
              >
                <User className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sign In</span>
              </Link>
            )}
          </div>
        </div>

        {/* Ô TÌM KIẾM TRÊN ĐIỆN THOẠI */}
        <div className="pb-2.5 md:hidden">
          <form onSubmit={handleSearchSubmit} className="relative w-full">
            <input
              type="text"
              placeholder="Search GPUs, CPUs, Pre-built PCs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input input-bordered input-sm rounded-xl w-full text-xs pl-9 pr-8 bg-base-200/70"
            />
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40" />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="btn btn-ghost btn-xs btn-circle absolute right-1.5 top-1/2 -translate-y-1/2"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </form>
        </div>
      </div>

      {/* MENU NGĂN KÉO TRÊN ĐIỆN THOẠI */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-base-200 border-b border-base-content/10 px-4 py-4 space-y-3">
          <div className="grid grid-cols-1 gap-1">
            {navLinks.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold ${
                    isActive
                      ? 'bg-primary text-primary-content'
                      : 'text-base-content hover:bg-base-300'
                  }`}
                >
                  <span>{item.label}</span>
                  {item.badge ? (
                    <span className="badge badge-xs font-black">{item.badge}</span>
                  ) : (
                    <ChevronRight className="w-4 h-4 opacity-50" />
                  )}
                </Link>
              );
            })}
          </div>

          <div className="pt-3 border-t border-base-content/10 flex flex-wrap items-center gap-2">
            {socialSettings.facebookUrl && (
              <a
                href={socialSettings.facebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-xs rounded-lg bg-[#1877F2] text-white border-none gap-1.5"
              >
                <FacebookIcon className="w-3.5 h-3.5" /> Fanpage
              </a>
            )}
            {socialSettings.messengerUrl && (
              <a
                href={socialSettings.messengerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-xs rounded-lg bg-[#0084FF] text-white border-none gap-1.5"
              >
                <MessageCircle className="w-3.5 h-3.5" /> Messenger
              </a>
            )}
            {socialSettings.zaloUrl && (
              <a
                href={socialSettings.zaloUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-xs rounded-lg bg-[#0068FF] text-white border-none gap-1.5"
              >
                Zalo
              </a>
            )}
            {socialSettings.hotline && (
              <a
                href={`tel:${socialSettings.hotline}`}
                className="btn btn-xs btn-outline rounded-lg gap-1"
              >
                <Phone className="w-3 h-3" /> {socialSettings.hotline}
              </a>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;