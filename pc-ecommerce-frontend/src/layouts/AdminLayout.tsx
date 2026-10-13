import React from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Newspaper } from 'lucide-react';
import {
  LayoutDashboard,
  Package,
  Image as ImageIcon,
  ShoppingCart,
  Tag,
  Users,
  FolderOpen,
  MessageSquare,
  Star,
  LogOut,
  ExternalLink,
} from 'lucide-react';

export const AdminLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const navItems = [
    { label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Hardware Inventory', path: '/admin/products', icon: Package },
    { label: 'Customer Reviews', path: '/admin/reviews', icon: Star },
    { label: 'Live Chat Hub', path: '/admin/chat', icon: MessageSquare },
    { label: 'Hero Banners', path: '/admin/banners', icon: ImageIcon },
    { label: 'Media Storage', path: '/admin/media', icon: FolderOpen },
    { label: 'Customer Orders', path: '/admin/orders', icon: ShoppingCart },
    { label: 'Vouchers & Deals', path: '/admin/coupons', icon: Tag },
    { label: 'Users & Access', path: '/admin/users', icon: Users },
    {
      label: 'Editorial & Blogs',
      path: '/admin/blogs',
      icon: Newspaper,
    },
  ];

  return (
    <div className="min-h-screen bg-base-300 flex text-base-content">
      {/* Sidebar */}
      <aside className="w-64 bg-base-200 border-r border-base-content/10 flex flex-col justify-between shrink-0 hidden md:flex">
        <div className="p-5 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-primary text-primary-content flex items-center justify-center font-black">
              G
            </div>
            <div>
              <span className="font-black tracking-wider text-base block text-base-content">
                GEARSTORE
              </span>
              <span className="badge badge-primary badge-xs font-bold uppercase text-[9px]">
                Admin Console
              </span>
            </div>
          </div>

          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all ${isActive
                      ? 'bg-primary text-primary-content shadow-md shadow-primary/20'
                      : 'text-base-content/70 hover:bg-base-100 hover:text-base-content'
                    }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="p-4 border-t border-base-content/10 space-y-3">
          <Link
            to="/"
            target="_blank"
            className="btn btn-ghost btn-sm w-full rounded-xl text-xs font-bold justify-start gap-2 text-base-content/70 hover:text-base-content"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Storefront View</span>
          </Link>

          <div className="p-3 bg-base-100/60 rounded-2xl border border-base-content/5 flex items-center justify-between">
            <div className="min-w-0">
              <p className="text-xs font-bold text-base-content truncate">{user?.name || 'Administrator'}</p>
              <p className="text-[10px] text-base-content/50 font-mono truncate">{user?.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="btn btn-ghost btn-xs btn-circle text-error hover:bg-error/10"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content View */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="md:hidden h-16 bg-base-200 border-b border-base-content/10 px-4 flex items-center justify-between">
          <span className="font-black text-sm text-primary">GEARSTORE ADMIN</span>
          <div className="flex items-center gap-2">
            <Link to="/admin/chat" className="btn btn-ghost btn-xs font-bold">Chat</Link>
            <Link to="/admin/products" className="btn btn-ghost btn-xs font-bold">Products</Link>
            <button onClick={handleLogout} className="btn btn-ghost btn-xs text-error font-bold">Sign Out</button>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-8 overflow-y-auto max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;