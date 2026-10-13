import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import socket from '../services/socket';
import {
  Bell,
  CheckCircle2,
  PackageCheck,
  CreditCard,
  AlertCircle,
  Check,
  ExternalLink,
} from 'lucide-react';

interface NotificationItem {
  _id: string;
  recipient?: string;
  roleTarget: string;
  title: string;
  message: string;
  type: 'ORDER_CREATED' | 'PAYMENT_CONFIRMED' | 'STATUS_UPDATED' | 'STOCK_ALERT';
  link: string;
  isRead: boolean;
  createdAt: string;
}

export const NotificationBell: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = async () => {
    // Chỉ gọi API khi đã đăng nhập và có token
    const token = localStorage.getItem('token') || (user as any)?.token;
    if (!user || !token) return;

    try {
      const res = await api.get<NotificationItem[]>('/notifications');
      setNotifications(res.data || []);
    } catch (err: any) {
      // Nếu hết hạn token (401), xử lý êm không bắn lỗi đỏ làm bẩn console
      if (err?.response?.status === 401) {
        setNotifications([]);
      } else {
        console.error('Failed to load notifications:', err);
      }
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
    }

    // Lắng nghe sự kiện socket realtime
    const handleNewNotification = (newNotif: NotificationItem) => {
      const isForMe =
        (newNotif.roleTarget === 'ADMIN' && (user?.role === 'admin' || user?.role === 'staff')) ||
        (newNotif.recipient && newNotif.recipient === user?._id) ||
        newNotif.roleTarget === 'ALL';

      if (isForMe) {
        setNotifications((prev) => [newNotif, ...prev]);
      }
    };

    socket.on('newNotification', handleNewNotification);

    return () => {
      socket.off('newNotification', handleNewNotification);
    };
  }, [user?._id, user?.role]);

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleMarkAsRead = async (id: string, link: string) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
      setIsOpen(false);
      if (link) navigate(link);
    } catch (err) {
      console.error('Failed to mark read:', err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  if (!user) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Nút Chuông */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="btn btn-ghost btn-circle btn-sm text-base-content/80 hover:text-primary relative"
        title="Notifications"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="badge badge-error badge-xs font-black text-[9px] text-white absolute -top-1 -right-1 min-w-4.5 h-4.5 p-0 flex items-center justify-center rounded-full animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Menu thả xuống */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-3xl bg-base-100 border border-base-content/10 shadow-2xl z-50 overflow-hidden">
          {/* Header */}
          <div className="p-4 border-b border-base-content/10 flex items-center justify-between bg-base-200/50">
            <div>
              <h3 className="font-black text-xs text-base-content uppercase tracking-wider">
                Notifications
              </h3>
              <p className="text-[10px] text-base-content/50">
                {unreadCount} unread alert{unreadCount !== 1 ? 's' : ''}
              </p>
            </div>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                className="text-[11px] text-primary hover:underline font-bold flex items-center gap-1"
              >
                <Check className="w-3 h-3" /> Mark all read
              </button>
            )}
          </div>

          {/* List Content */}
          <div className="max-h-80 overflow-y-auto divide-y divide-base-content/5">
            {notifications.length === 0 ? (
              <div className="py-12 text-center text-xs text-base-content/40 space-y-1">
                <Bell className="w-8 h-8 mx-auto text-base-content/20" />
                <p className="font-semibold">No notifications yet</p>
              </div>
            ) : (
              notifications.map((item) => (
                <div
                  key={item._id}
                  onClick={() => handleMarkAsRead(item._id, item.link)}
                  className={`p-3.5 flex items-start gap-3 cursor-pointer hover:bg-base-200/60 transition-colors ${
                    !item.isRead ? 'bg-primary/5' : ''
                  }`}
                >
                  <div className="shrink-0 mt-0.5">
                    {item.type === 'ORDER_CREATED' && (
                      <div className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                        <PackageCheck className="w-4 h-4" />
                      </div>
                    )}
                    {item.type === 'PAYMENT_CONFIRMED' && (
                      <div className="w-7 h-7 rounded-lg bg-success/10 text-success flex items-center justify-center">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                    )}
                    {item.type === 'STATUS_UPDATED' && (
                      <div className="w-7 h-7 rounded-lg bg-warning/10 text-warning flex items-center justify-center">
                        <CreditCard className="w-4 h-4" />
                      </div>
                    )}
                    {item.type === 'STOCK_ALERT' && (
                      <div className="w-7 h-7 rounded-lg bg-error/10 text-error flex items-center justify-center">
                        <AlertCircle className="w-4 h-4" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0 text-xs">
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-bold text-base-content truncate">
                        {item.title}
                      </span>
                      <span className="text-[9px] text-base-content/40 font-mono shrink-0">
                        {new Date(item.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <p className="text-[11px] text-base-content/70 mt-0.5 line-clamp-2 leading-relaxed">
                      {item.message}
                    </p>
                  </div>

                  {!item.isRead && (
                    <span className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1.5" />
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;