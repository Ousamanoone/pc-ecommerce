import React, { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Cpu,
  Star,
  MessageSquare,
  Image,
  FolderOpen,
  ShoppingCart,
  TicketPercent,
  Users,
  FileText,
  Share2,
  ExternalLink,
  LogOut,
  Menu,
  X,
} from 'lucide-react';

export const AdminLayout: React.FC = () => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const menuItems = [
    { label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Hardware Inventory', path: '/admin/products', icon: Cpu },
    { label: 'Customer Reviews', path: '/admin/reviews', icon: Star },
    { label: 'Live Chat Hub', path: '/admin/chat', icon: MessageSquare },
    { label: 'Hero Banners', path: '/admin/banners', icon: Image },
    { label: 'Social & Fanpage', path: '/admin/settings', icon: Share2 },
    { label: 'Media Storage', path: '/admin/media', icon: FolderOpen },
    { label: 'Customer Orders', path: '/admin/orders', icon: ShoppingCart },
    { label: 'Vouchers & Deals', path: '/admin/coupons', icon: TicketPercent },
    { label: 'Users & Access', path: '/admin/users', icon: Users },
    { label: 'Editorial & Blogs', path: '/admin/blogs', icon: FileText },
  ];

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-base-100 text-base-content">
      {/* Thanh Topbar khi mở Admin bằng Điện thoại */}
      <div className="lg:hidden h-14 px-4 bg-base-200 border-b border-base-content/10 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="btn btn-ghost btn-sm btn-circle"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <span className="font-black text-sm tracking-wider">GEARSTORE ADMIN</span>
        </div>
        <Link to="/" className="btn btn-ghost btn-xs gap-1">
          <ExternalLink className="w-3.5 h-3.5" /> Storefront
        </Link>
      </div>

      {/* Lớp phủ mờ trên điện thoại */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-base-200 border-r border-base-content/10 flex flex-col justify-between p-4 transition-transform duration-200 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="space-y-6 overflow-y-auto">
          <div className="flex items-center gap-3 px-2 pt-1">
            <div className="w-9 h-9 rounded-2xl bg-primary text-primary-content flex items-center justify-center font-black">
              G
            </div>
            <div>
              <h2 className="font-black text-sm tracking-wider leading-none">GEARSTORE</h2>
              <span className="badge badge-primary badge-xs font-bold uppercase text-[9px] mt-1">
                Admin Console
              </span>
            </div>
          </div>

          <nav className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-primary text-primary-content shadow-md shadow-primary/20'
                      : 'text-base-content/70 hover:bg-base-300 hover:text-base-content'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="pt-4 border-t border-base-content/10 space-y-2">
          <Link
            to="/"
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-base-content/70 hover:bg-base-300"
          >
            <ExternalLink className="w-4 h-4" /> Storefront View
          </Link>

          <div className="p-3 bg-base-300/60 rounded-2xl flex items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="font-bold text-xs truncate">{user?.name || 'Administrator'}</p>
              <p className="text-[10px] text-base-content/50 truncate">{user?.email}</p>
            </div>
            <button
              onClick={logout}
              className="btn btn-ghost btn-xs btn-square text-error"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Nội dung chính */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-x-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;