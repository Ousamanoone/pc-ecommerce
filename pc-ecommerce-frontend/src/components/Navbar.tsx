import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import api from "../services/api";
import type { Product } from "../types";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useWishlist } from "../context/WishlistContext";
import { useTheme } from "../context/ThemeContext";
import NotificationBell from "./NotificationBell";
import {
  Package,
  Search,
  X,
  ShoppingBag,
  Heart,
  Sun,
  Moon,
  Zap,
  Scale,
  Tag,
  Truck,
  User,
  LogOut,
  ExternalLink,
  ChevronRight,
  Menu,
} from "lucide-react";

export const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { cartCount } = useCart() as any;
  const { user, logout } = useAuth();
  const { wishlist } = useWishlist() as any;
  const { theme, toggleTheme } = useTheme();

  // Search States
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [totalResults, setTotalResults] = useState(0);
  const [isSearching, setIsSearching] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const wishlistCount = Array.isArray(wishlist)
    ? wishlist.length
    : wishlist?.items?.length || 0;

  // Debounced live search
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
        const res = await api.get("/products", {
          params: { search: searchTerm.trim(), limit: 6 },
        });
        setSearchResults(res.data.products || []);
        setTotalResults(res.data.totalProducts || 0);
        setIsDropdownOpen(true);
      } catch (err) {
        console.error("Live search error:", err);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchTerm]);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close dropdown on route change
  useEffect(() => {
    setIsDropdownOpen(false);
    setSearchTerm("");
  }, [location.pathname]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;
    setIsDropdownOpen(false);
    navigate(`/products?search=${encodeURIComponent(searchTerm.trim())}`);
  };

  const handleSelectProduct = (slug: string) => {
    setIsDropdownOpen(false);
    setSearchTerm("");
    navigate(`/product/${slug}`);
  };

  const navLinks = [
    { label: "Catalog", path: "/products" },
    { label: "PC Builder", path: "/builder", badge: "HOT" },
    { label: "Compare", path: "/compare" },
    { label: "Deals", path: "/vouchers", badge: "VOUCHER" },
    { label: "Track Order", path: "/track-order" },
  ];

  return (
    <header className="sticky top-0 z-40 bg-base-100/90 backdrop-blur-md border-b border-base-content/10 print:hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-16 flex items-center justify-between gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 shrink-0">
            <div className="w-9 h-9 rounded-2xl bg-primary text-primary-content flex items-center justify-center font-black shadow-md shadow-primary/20">
              <Package className="w-5 h-5" />
            </div>
            <span className="font-black tracking-wider text-base sm:text-lg text-base-content hidden sm:inline">
              GEARSTORE
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    isActive
                      ? "bg-base-200 text-primary"
                      : "text-base-content/70 hover:text-base-content hover:bg-base-200/50"
                  }`}
                >
                  <span>{item.label}</span>
                  {item.badge && (
                    <span
                      className={`badge badge-xs font-black text-[9px] ${
                        item.badge === "HOT"
                          ? "badge-error text-white"
                          : "badge-primary"
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Live Search Input & Dropdown */}
          <div ref={searchRef} className="relative flex-1 max-w-md">
            <form onSubmit={handleSearchSubmit} className="relative w-full">
              <input
                type="text"
                placeholder="Search graphics cards, CPUs, DDR5..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onFocus={() => {
                  if (searchResults.length > 0) setIsDropdownOpen(true);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Escape") setIsDropdownOpen(false);
                }}
                className="input input-bordered input-sm rounded-2xl w-full text-xs pl-9 pr-8 bg-base-200/60 focus:bg-base-100 transition-all border-base-content/10"
              />
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40" />

              {isSearching ? (
                <span className="loading loading-spinner loading-xs absolute right-3 top-1/2 -translate-y-1/2 text-primary"></span>
              ) : searchTerm ? (
                <button
                  type="button"
                  onClick={() => {
                    setSearchTerm("");
                    setIsDropdownOpen(false);
                  }}
                  className="btn btn-ghost btn-xs btn-circle absolute right-1.5 top-1/2 -translate-y-1/2 text-base-content/40 hover:text-base-content"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              ) : null}
            </form>

            {/* Autocomplete Dropdown Panel */}
            {isDropdownOpen && (
              <div className="absolute left-0 right-0 top-full mt-2 bg-base-200 border border-base-content/10 rounded-3xl shadow-2xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="p-3 border-b border-base-content/5 flex items-center justify-between text-[11px] text-base-content/50">
                  <span className="font-bold uppercase tracking-wider">
                    Quick Suggestions
                  </span>
                  <span>{totalResults} products found</span>
                </div>

                {searchResults.length === 0 ? (
                  <div className="py-8 text-center space-y-1">
                    <p className="text-xs font-bold text-base-content/70">
                      No hardware found
                    </p>
                    <p className="text-[11px] text-base-content/40">
                      Try searching "RTX", "i7", "DDR5", or "Corsair"
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-base-content/5 max-h-96 overflow-y-auto scrollbar-thin">
                    {searchResults.map((item) => {
                      const effPrice = item.discountPrice || item.price;
                      return (
                        <div
                          key={item._id}
                          onClick={() => handleSelectProduct(item.slug)}
                          className="p-3 hover:bg-base-100 cursor-pointer transition-colors flex items-center justify-between gap-3 group"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-11 h-11 rounded-xl bg-base-100 p-1 flex items-center justify-center shrink-0 border border-base-content/5 group-hover:border-primary/30">
                              <img
                                src={
                                  item.images?.[0] ||
                                  "https://via.placeholder.com/60"
                                }
                                alt={item.name}
                                className="max-h-full max-w-full object-contain"
                              />
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-xs text-base-content truncate group-hover:text-primary transition-colors">
                                {item.name}
                              </p>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <span className="badge badge-primary badge-xs font-bold uppercase text-[9px]">
                                  {item.category}
                                </span>
                                <span className="text-[10px] text-base-content/50 uppercase font-semibold">
                                  {item.brand}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="text-right shrink-0">
                            <span className="font-mono font-black text-xs text-primary block">
                              ${effPrice}
                            </span>
                            <span
                              className={`text-[9px] font-bold ${
                                item.stock > 0 ? "text-success" : "text-error"
                              }`}
                            >
                              {item.stock > 0 ? "In Stock" : "Out"}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {totalResults > 6 && (
                  <button
                    onClick={handleSearchSubmit}
                    className="w-full p-2.5 bg-base-100/60 hover:bg-primary hover:text-primary-content text-center text-xs font-bold text-primary transition-colors flex items-center justify-center gap-1 border-t border-base-content/5"
                  >
                    <span>View all {totalResults} matching results</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Right Action Icons */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="btn btn-ghost btn-xs sm:btn-sm btn-circle text-base-content/70 hover:text-base-content"
              title="Toggle theme"
            >
              {theme === "dark" ? (
                <Sun className="w-4 h-4 text-warning" />
              ) : (
                <Moon className="w-4 h-4" />
              )}
            </button>

            {/* Wishlist */}
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

            {/* Cart */}
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
            <div className="flex items-center gap-2">
              <NotificationBell />
              {/* Link giỏ hàng, Wishlist, User profile... */}
            </div>

            {/* User Dropdown */}
            {user ? (
              <div className="dropdown dropdown-end">
                <div
                  tabIndex={0}
                  role="button"
                  className="btn btn-ghost btn-xs sm:btn-sm rounded-xl font-black text-xs gap-1.5"
                >
                  <div className="w-6 h-6 rounded-lg bg-primary text-primary-content flex items-center justify-center font-bold text-xs">
                    {user.name?.charAt(0).toUpperCase() || "U"}
                  </div>
                  <span className="hidden md:inline max-w-[90px] truncate">
                    {user.name}
                  </span>
                </div>
                <ul
                  tabIndex={0}
                  className="dropdown-content menu p-2 shadow-2xl bg-base-200 border border-base-content/10 rounded-2xl w-52 text-xs space-y-1 z-50 mt-2"
                >
                  <li className="menu-title text-[10px] text-base-content/50 uppercase font-black px-3 py-1">
                    Signed in as {user.email}
                  </li>
                  <li>
                    <Link to="/profile">
                      <User className="w-3.5 h-3.5 text-primary" /> Profile &
                      Orders
                    </Link>
                  </li>
                  {(user.role === "admin" || user.role === "staff") && (
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
                className="btn btn-primary btn-xs sm:btn-sm rounded-xl font-bold text-xs gap-1.5 shadow-sm"
              >
                <User className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sign In</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
