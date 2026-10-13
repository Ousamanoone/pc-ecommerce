import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import {
  DollarSign,
  ShoppingCart,
  Users,
  AlertTriangle,
  ArrowUpRight,
  TrendingUp,
  Package,
  Clock,
  Download,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Layers,
} from 'lucide-react';

interface LowStockItem {
  _id: string;
  name: string;
  brand: string;
  category: string;
  price: number;
  stock: number;
  images?: string[];
  slug: string;
}

interface RecentOrder {
  _id: string;
  orderCode: string;
  shippingAddress: {
    fullName: string;
    city: string;
  };
  totalPrice: number;
  paymentMethod: string;
  status: string;
  isPaid: boolean;
  createdAt: string;
}

interface CategoryDist {
  _id: string;
  count: number;
  totalStock: number;
}

interface DashboardData {
  totalRevenue: number;
  totalOrders: number;
  pendingOrders: number;
  deliveredOrders: number;
  totalUsers: number;
  criticalStockCount: number;
  lowStockProducts: LowStockItem[];
  recentOrders: RecentOrder[];
  categoryDistribution: CategoryDist[];
}

export const DashboardOverview: React.FC = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchStats = () => {
    setLoading(true);
    api
      .get<DashboardData>('/dashboard/stats')
      .then((res) => {
        setData(res.data);
      })
      .catch((err) => {
        console.error('Failed to load dashboard analytics:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchStats();
  }, []);

  // Export Sales Report to CSV File
  const handleExportCSV = () => {
    if (!data || !data.recentOrders) return;

    const headers = ['Order Code', 'Recipient', 'City', 'Total (USD)', 'Payment Method', 'Settlement', 'Status', 'Date'];
    const rows = data.recentOrders.map((o) => [
      o.orderCode,
      `"${o.shippingAddress?.fullName || 'N/A'}"`,
      `"${o.shippingAddress?.city || 'N/A'}"`,
      o.totalPrice,
      o.paymentMethod,
      o.isPaid ? 'PAID' : 'UNPAID',
      o.status,
      new Date(o.createdAt).toLocaleDateString(),
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `gearstore-sales-report-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Pending':
        return 'badge-warning';
      case 'Processing':
        return 'badge-info';
      case 'Shipped':
        return 'badge-primary';
      case 'Delivered':
        return 'badge-success';
      case 'Cancelled':
        return 'badge-error';
      default:
        return 'badge-ghost';
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  const revenue = data?.totalRevenue || 0;
  const ordersCount = data?.totalOrders || 0;
  const usersCount = data?.totalUsers || 0;
  const lowStockCount = data?.criticalStockCount || 0;

  return (
    <div className="space-y-8">
      {/* Top Banner with Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-base-content/10 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-base-content flex items-center gap-2">
            <TrendingUp className="w-7 h-7 text-primary" /> Operations & Revenue Analytics
          </h1>
          <p className="text-xs text-base-content/60 mt-1">
            Real-time telemetry on gross revenue, inventory health, courier milestones, and customer traffic.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchStats}
            className="btn btn-ghost btn-sm rounded-xl text-xs font-bold border border-base-content/10"
          >
            Refresh Metrics
          </button>
          <button
            onClick={handleExportCSV}
            className="btn btn-primary btn-sm rounded-xl text-xs font-bold gap-1.5 shadow-md shadow-primary/20"
          >
            <Download className="w-4 h-4" /> Export CSV Report
          </button>
        </div>
      </div>

      {/* 4 Primary KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Gross Revenue */}
        <div className="bg-base-200 border border-base-content/10 rounded-3xl p-5 space-y-3 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-base-content/50 uppercase tracking-wider">
              Gross Revenue
            </span>
            <div className="w-10 h-10 rounded-2xl bg-success/10 text-success flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="space-y-1">
            <span className="text-3xl font-black text-base-content font-mono block">
              ${revenue.toLocaleString()}
            </span>
            <span className="text-[11px] text-success font-semibold flex items-center gap-1">
              <ArrowUpRight className="w-3.5 h-3.5" /> All-time gross settled transactions
            </span>
          </div>
        </div>

        {/* Total Orders */}
        <div className="bg-base-200 border border-base-content/10 rounded-3xl p-5 space-y-3 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-base-content/50 uppercase tracking-wider">
              Hardware Orders
            </span>
            <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
              <ShoppingCart className="w-5 h-5" />
            </div>
          </div>
          <div className="space-y-1">
            <span className="text-3xl font-black text-base-content font-mono block">
              {ordersCount}
            </span>
            <div className="flex items-center gap-2 text-[11px]">
              <span className="text-warning font-bold">{data?.pendingOrders || 0} Pending</span>
              <span className="text-base-content/30">•</span>
              <span className="text-success font-bold">{data?.deliveredOrders || 0} Delivered</span>
            </div>
          </div>
        </div>

        {/* Total Customers */}
        <div className="bg-base-200 border border-base-content/10 rounded-3xl p-5 space-y-3 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-base-content/50 uppercase tracking-wider">
              Active User Base
            </span>
            <div className="w-10 h-10 rounded-2xl bg-info/10 text-info flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="space-y-1">
            <span className="text-3xl font-black text-base-content font-mono block">
              {usersCount}
            </span>
            <span className="text-[11px] text-base-content/50 block">
              Registered customers & staff operators
            </span>
          </div>
        </div>

        {/* Critical Low Stock Alert */}
        <div className="bg-base-200 border border-base-content/10 rounded-3xl p-5 space-y-3 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-base-content/50 uppercase tracking-wider">
              Critical Low Stock
            </span>
            <div
              className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
                lowStockCount > 0 ? 'bg-error/10 text-error animate-pulse' : 'bg-success/10 text-success'
              }`}
            >
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="space-y-1">
            <span
              className={`text-3xl font-black font-mono block ${
                lowStockCount > 0 ? 'text-error' : 'text-base-content'
              }`}
            >
              {lowStockCount}
            </span>
            <span className="text-[11px] text-base-content/50 block">
              Components below threshold (≤ 5 units left)
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: Critical Inventory Alert & Category Stock Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Widget: Critical Inventory Alerts */}
        <div className="lg:col-span-7 bg-base-200 border border-base-content/10 rounded-3xl p-6 space-y-5 shadow-xs">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-black text-base-content flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-error" /> Urgent Inventory Restock Notice
              </h2>
              <p className="text-xs text-base-content/50">
                Hardware parts requiring replenishment from distributors
              </p>
            </div>
            <Link
              to="/admin/products"
              className="btn btn-ghost btn-xs font-bold text-primary gap-1"
            >
              Inventory Manager <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {data?.lowStockProducts && data.lowStockProducts.length === 0 ? (
            <div className="p-8 text-center bg-base-100/50 rounded-2xl border border-dashed border-base-content/10 text-xs text-base-content/50 space-y-1">
              <CheckCircle2 className="w-6 h-6 mx-auto text-success mb-1" />
              <p className="font-bold text-base-content">All Component Stocks Are Optimal</p>
              <p>No hardware parts are currently running below the safety threshold of 5 units.</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {data?.lowStockProducts.map((item) => (
                <div
                  key={item._id}
                  className="p-3 bg-base-100 rounded-2xl border border-base-content/5 flex items-center justify-between gap-4 hover:border-error/40 transition-all"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-base-200 p-1 flex items-center justify-center shrink-0 border border-base-content/5">
                      <img
                        src={item.images?.[0] || 'https://via.placeholder.com/60'}
                        alt={item.name}
                        className="max-h-full max-w-full object-contain"
                      />
                    </div>
                    <div className="min-w-0">
                      <span className="font-bold text-xs text-base-content block truncate max-w-xs">
                        {item.name}
                      </span>
                      <div className="flex items-center gap-2 text-[10px] text-base-content/50 uppercase font-semibold">
                        <span>{item.brand}</span>
                        <span>•</span>
                        <span className="badge badge-ghost badge-xs text-[9px]">{item.category}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="badge badge-error font-bold text-[10px] py-2 px-2.5 shadow-sm">
                      {item.stock} left
                    </span>
                    <Link
                      to="/admin/products"
                      className="btn btn-outline btn-xs rounded-lg text-[10px] font-bold"
                    >
                      Restock
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Widget: Category Stock Distribution */}
        <div className="lg:col-span-5 bg-base-200 border border-base-content/10 rounded-3xl p-6 space-y-5 shadow-xs">
          <div>
            <h2 className="text-base font-black text-base-content flex items-center gap-2">
              <Layers className="w-4 h-4 text-primary" /> Category Component Volumes
            </h2>
            <p className="text-xs text-base-content/50">
              Breakdown of total catalog SKUs and available warehouse stock
            </p>
          </div>

          <div className="space-y-3">
            {data?.categoryDistribution && data.categoryDistribution.length === 0 ? (
              <p className="text-xs text-base-content/40 italic text-center py-6">No catalog data recorded.</p>
            ) : (
              data?.categoryDistribution.map((cat) => (
                <div key={cat._id} className="space-y-1.5 text-xs">
                  <div className="flex justify-between font-bold">
                    <span className="text-base-content">{cat._id}</span>
                    <span className="text-base-content/60 font-mono">
                      {cat.count} models ({cat.totalStock} units)
                    </span>
                  </div>
                  <progress
                    className="progress progress-primary w-full h-1.5"
                    value={cat.totalStock}
                    max={100}
                  />
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Bottom Section: Recent Transactions Feed */}
      <div className="bg-base-200 border border-base-content/10 rounded-3xl p-6 space-y-5 shadow-xs">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-black text-base-content flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" /> Latest Incoming Transactions
            </h2>
            <p className="text-xs text-base-content/50">
              Most recent customer purchases recorded across the platform
            </p>
          </div>

          <Link
            to="/admin/orders"
            className="btn btn-ghost btn-xs font-bold text-primary gap-1"
          >
            All Orders <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="table table-zebra w-full text-xs">
            <thead>
              <tr className="border-b border-base-content/10 text-base-content/60 font-bold uppercase text-[11px]">
                <th>Order Code</th>
                <th>Recipient</th>
                <th>City</th>
                <th>Settlement</th>
                <th>Fulfillment</th>
                <th>Gross Total</th>
                <th className="text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {data?.recentOrders && data.recentOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-base-content/40 italic">
                    No transactions registered yet.
                  </td>
                </tr>
              ) : (
                data?.recentOrders.map((ord) => (
                  <tr key={ord._id} className="hover:bg-base-300/40 transition-colors">
                    <td className="font-mono font-bold text-primary">
                      {ord.orderCode}
                    </td>
                    <td className="font-bold text-base-content">
                      {ord.shippingAddress?.fullName || 'Anonymous'}
                    </td>
                    <td className="text-base-content/70">
                      {ord.shippingAddress?.city || 'N/A'}
                    </td>
                    <td>
                      <span
                        className={`badge badge-xs font-bold uppercase text-[9px] ${
                          ord.isPaid ? 'badge-success text-white' : 'badge-warning'
                        }`}
                      >
                        {ord.isPaid ? 'Paid' : 'Unpaid'}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`badge font-bold text-[10px] uppercase ${getStatusBadge(
                          ord.status
                        )}`}
                      >
                        {ord.status}
                      </span>
                    </td>
                    <td className="font-mono font-black text-base-content">
                      ${ord.totalPrice}
                    </td>
                    <td className="text-right">
                      <Link
                        to="/admin/orders"
                        className="btn btn-ghost btn-xs text-primary font-bold"
                      >
                        Inspect
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;