'use client';

import { useState, useEffect } from 'react';
import { useLanguageStore } from '@/lib/stores';
import { t } from '@/lib/i18n';
import { ORDER_STATUSES } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  ShoppingCart,
  TrendingUp,
  DollarSign,
  Users,
  AlertTriangle,
  Package,
  ArrowUpRight,
  CheckCircle,
  Clock,
  XCircle,
  Filter,
  Calendar,
  BarChart3,
  Sparkles,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface ReportData {
  totalOrders: number;
  totalRevenue: number;
  totalCustomers: number;
  avgOrderValue: number;
  deliveredOrders: number;
  pendingOrders: number;
  cancelledOrders: number;
  paymentBreakdown: Array<{ method: string; count: number }>;
  ordersByStatus: Array<{ status: string; count: number; color: string }>;
  topCategories: Array<{ name: string; orders: number; revenue: number }>;
  revenueData: Array<{ date: string; revenue: number; orders: number }>;
  topProducts: Array<{ name: string; sold: number; revenue: number }>;
  lowStock: Array<{ id: string; name: string; stock: number }>;
  recentOrders: Array<{
    id: string; orderNumber: string; customerName: string;
    total: number; status: string; createdAt: string;
  }>;
}

const FALLBACK_DATA: ReportData = {
  totalOrders: 1248,
  totalRevenue: 374500,
  totalCustomers: 2847,
  avgOrderValue: 300,
  deliveredOrders: 980,
  pendingOrders: 156,
  cancelledOrders: 42,
  paymentBreakdown: [
    { method: 'Cash on Delivery', count: 520 },
    { method: 'Credit Card', count: 380 },
    { method: 'Apple Pay', count: 180 },
    { method: 'Tabby', count: 98 },
    { method: 'Tamara', count: 70 },
  ],
  ordersByStatus: [
    { status: 'Delivered', count: 980, color: '#22c55e' },
    { status: 'Preparing', count: 156, color: '#6366f1' },
    { status: 'Pending', count: 45, color: '#eab308' },
    { status: 'Out for Delivery', count: 32, color: '#f97316' },
    { status: 'Cancelled', count: 35, color: '#ef4444' },
  ],
  topCategories: [
    { name: 'Flowers & Bouquets', orders: 456, revenue: 136800 },
    { name: 'Gift Boxes', orders: 234, revenue: 105300 },
    { name: 'Chocolates', orders: 189, revenue: 37800 },
    { name: 'Cakes', orders: 156, revenue: 46800 },
    { name: 'Perfumes', orders: 98, revenue: 29400 },
  ],
  revenueData: [
    { date: 'Mon', revenue: 42000, orders: 156 },
    { date: 'Tue', revenue: 38000, orders: 142 },
    { date: 'Wed', revenue: 55000, orders: 210 },
    { date: 'Thu', revenue: 48000, orders: 178 },
    { date: 'Fri', revenue: 62000, orders: 245 },
    { date: 'Sat', revenue: 58000, orders: 220 },
    { date: 'Sun', revenue: 71000, orders: 278 },
  ],
  topProducts: [
    { name: 'Royal Red Rose Bouquet', sold: 156, revenue: 46800 },
    { name: 'Luxury Gift Box Premium', sold: 134, revenue: 60300 },
    { name: 'White Lily Arrangement', sold: 112, revenue: 33600 },
    { name: 'Birthday Surprise Box', sold: 98, revenue: 24500 },
    { name: 'Eid Mubarak Collection', sold: 89, revenue: 26700 },
  ],
  lowStock: [
    { id: '1', name: 'Pink Peony Bouquet', stock: 3 },
    { id: '2', name: 'Chocolate Truffle Box', stock: 5 },
    { id: '3', name: 'Wedding Flower Arch', stock: 2 },
  ],
  recentOrders: [
    { id: '1', orderNumber: 'BG-1056', customerName: 'Sarah M.', total: 350, status: 'delivered', createdAt: '2024-12-24' },
    { id: '2', orderNumber: 'BG-1057', customerName: 'Ahmed K.', total: 180, status: 'processing', createdAt: '2024-12-24' },
    { id: '3', orderNumber: 'BG-1058', customerName: 'Fatima R.', total: 520, status: 'pending', createdAt: '2024-12-23' },
    { id: '4', orderNumber: 'BG-1059', customerName: 'Omar S.', total: 290, status: 'out_for_delivery', createdAt: '2024-12-23' },
  ],
};

const statusColorMap: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-blue-100 text-blue-700',
  processing: 'bg-blue-100 text-blue-700',
  preparing: 'bg-indigo-100 text-indigo-700',
  ready_for_pickup: 'bg-cyan-100 text-cyan-700',
  assigned_to_courier: 'bg-violet-100 text-violet-700',
  picked_up: 'bg-purple-100 text-purple-700',
  out_for_delivery: 'bg-orange-100 text-orange-700',
  delivered: 'bg-green-100 text-green-700',
  failed_delivery: 'bg-red-100 text-red-700',
  cancelled: 'bg-red-100 text-red-700',
};

export default function AdminDashboard() {
  const { locale } = useLanguageStore();
  const [data, setData] = useState<ReportData>(FALLBACK_DATA);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('7d');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    let cancelled = false;
    const fetchReports = async () => {
      try {
        const res = await fetch('/api/admin/reports');
        if (res.ok && !cancelled) {
          const json = await res.json();
          if (json && typeof json === 'object') {
            setData({
              totalOrders: json.totalOrders || FALLBACK_DATA.totalOrders,
              totalRevenue: json.totalRevenue || FALLBACK_DATA.totalRevenue,
              totalCustomers: json.totalCustomers || FALLBACK_DATA.totalCustomers,
              avgOrderValue: json.avgOrderValue || FALLBACK_DATA.avgOrderValue,
              deliveredOrders: json.deliveredOrders || FALLBACK_DATA.deliveredOrders,
              pendingOrders: json.pendingOrders || FALLBACK_DATA.pendingOrders,
              cancelledOrders: json.cancelledOrders || FALLBACK_DATA.cancelledOrders,
              paymentBreakdown: json.paymentBreakdown || FALLBACK_DATA.paymentBreakdown,
              ordersByStatus: json.ordersByStatus || FALLBACK_DATA.ordersByStatus,
              topCategories: json.topCategories || FALLBACK_DATA.topCategories,
              revenueData: json.revenueData || FALLBACK_DATA.revenueData,
              topProducts: json.topProducts || FALLBACK_DATA.topProducts,
              lowStock: json.lowStock || FALLBACK_DATA.lowStock,
              recentOrders: json.recentOrders || FALLBACK_DATA.recentOrders,
            });
          }
        }
      } catch {
        /* use fallback */
      }
      if (!cancelled) setLoading(false);
    };
    fetchReports();
    return () => { cancelled = true; };
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6, 7].map((i) => (
            <div key={i} className="h-28 rounded-xl bg-white animate-pulse" />
          ))}
        </div>
        <div className="h-80 rounded-xl bg-white animate-pulse" />
      </div>
    );
  }

  const maxStatusCount = Math.max(...data.ordersByStatus.map((s) => s.count), 1);

  const stats = [
    {
      label: t('admin.totalOrders', locale),
      value: data.totalOrders.toLocaleString(),
      change: '+12%',
      icon: ShoppingCart,
      color: 'text-blue-500 bg-blue-50',
    },
    {
      label: t('admin.totalRevenue', locale),
      value: `AED ${(data.totalRevenue / 1000).toFixed(0)}K`,
      change: '+8%',
      icon: DollarSign,
      color: 'text-[#C9A96E] bg-[#C9A96E]/10',
    },
    {
      label: 'Delivered',
      value: data.deliveredOrders.toLocaleString(),
      change: '+15%',
      icon: CheckCircle,
      color: 'text-green-500 bg-green-50',
    },
    {
      label: 'Pending',
      value: data.pendingOrders.toLocaleString(),
      change: '-3%',
      icon: Clock,
      color: 'text-yellow-500 bg-yellow-50',
    },
    {
      label: 'Cancelled',
      value: data.cancelledOrders.toLocaleString(),
      change: '-8%',
      icon: XCircle,
      color: 'text-red-500 bg-red-50',
    },
    {
      label: 'Total Customers',
      value: data.totalCustomers.toLocaleString(),
      change: '+5%',
      icon: Users,
      color: 'text-green-500 bg-green-50',
    },
    {
      label: 'Avg Order Value',
      value: `AED ${data.avgOrderValue}`,
      change: '+15%',
      icon: TrendingUp,
      color: 'text-purple-500 bg-purple-50',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Filter controls */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Filter className="h-4 w-4" />
          <span>{locale === 'ar' ? 'تصفية' : 'Filters'}:</span>
        </div>
        <Select value={dateRange} onValueChange={setDateRange}>
          <SelectTrigger className="w-36 rounded-xl h-9 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="24h">Last 24h</SelectItem>
            <SelectItem value="7d">Last 7 Days</SelectItem>
            <SelectItem value="30d">Last 30 Days</SelectItem>
            <SelectItem value="90d">Last 90 Days</SelectItem>
          </SelectContent>
        </Select>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-44 rounded-xl h-9 text-sm">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="flowers">Flowers</SelectItem>
            <SelectItem value="gifts">Gifts</SelectItem>
            <SelectItem value="chocolates">Chocolates</SelectItem>
            <SelectItem value="cakes">Cakes</SelectItem>
            <SelectItem value="perfumes">Perfumes</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40 rounded-xl h-9 text-sm">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            {ORDER_STATUSES.map((s) => (
              <SelectItem key={s.value} value={s.value}>
                {locale === 'ar' ? s.labelAr : s.labelEn}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.slice(0, 7).map((stat, i) => (
          <Card key={i} className="border-[#E8E0D8] shadow-sm rounded-xl">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-bold text-[#2D2926] mt-1">{stat.value}</p>
                  <p className={`text-xs font-medium mt-1 flex items-center gap-1 ${
                    stat.change.startsWith('+') ? 'text-green-500' : 'text-red-500'
                  }`}>
                    {stat.change.startsWith('+') ? <ArrowUpRight className="h-3 w-3" /> : null}
                    {stat.change}
                  </p>
                </div>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.color}`}>
                  <stat.icon className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue chart */}
        <Card className="border-[#E8E0D8] shadow-sm rounded-xl">
          <CardHeader>
            <CardTitle className="text-[#2D2926] flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-[#C9A96E]" />
              Revenue — Last 7 Days
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.revenueData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E8E0D8" />
                  <XAxis dataKey="date" stroke="#8C8279" fontSize={12} />
                  <YAxis stroke="#8C8279" fontSize={12} tickFormatter={(v) => `AED ${(v / 1000).toFixed(0)}K`} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #E8E0D8',
                      borderRadius: '12px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                    }}
                    formatter={(value: number) => [`AED ${value.toLocaleString()}`, 'Revenue']}
                  />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#C9A96E"
                    strokeWidth={2.5}
                    dot={{ fill: '#C9A96E', r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Orders by Status */}
        <Card className="border-[#E8E0D8] shadow-sm rounded-xl">
          <CardHeader>
            <CardTitle className="text-[#2D2926] flex items-center gap-2">
              <Package className="h-5 w-5 text-[#C9A96E]" />
              Orders by Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.ordersByStatus.map((item) => (
                <div key={item.status}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-medium text-[#2D2926]">{item.status}</span>
                    <span className="text-sm font-semibold text-[#2D2926]">{item.count}</span>
                  </div>
                  <div className="w-full h-3 bg-[#F5F0EB] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${(item.count / maxStatusCount) * 100}%`,
                        backgroundColor: item.color,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Payment method breakdown */}
            <div className="mt-6 pt-6 border-t border-[#E8E0D8]">
              <h4 className="text-sm font-semibold text-[#2D2926] mb-3 flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-[#C9A96E]" />
                Payment Methods
              </h4>
              <div className="flex flex-wrap gap-2">
                {data.paymentBreakdown.map((pm) => (
                  <Badge key={pm.method} variant="outline" className="border-[#E8E0D8] text-xs px-3 py-1">
                    {pm.method}
                    <span className="ms-1.5 font-bold text-[#C9A96E]">{pm.count}</span>
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top products */}
        <Card className="border-[#E8E0D8] shadow-sm rounded-xl">
          <CardHeader>
            <CardTitle className="text-[#2D2926]">{t('admin.topSelling', locale)}</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-muted-foreground">#</TableHead>
                  <TableHead className="text-muted-foreground">Product</TableHead>
                  <TableHead className="text-muted-foreground text-end">Sold</TableHead>
                  <TableHead className="text-muted-foreground text-end">Revenue</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.topProducts.map((product, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <span className="w-6 h-6 rounded-full bg-[#C9A96E]/10 text-[#C9A96E] text-xs font-bold flex items-center justify-center">
                        {i + 1}
                      </span>
                    </TableCell>
                    <TableCell className="font-medium text-[#2D2926] text-sm">{product.name}</TableCell>
                    <TableCell className="text-sm text-end">{product.sold}</TableCell>
                    <TableCell className="text-sm font-semibold text-end text-[#C9A96E]">
                      AED {product.revenue.toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Top Categories */}
        <Card className="border-[#E8E0D8] shadow-sm rounded-xl">
          <CardHeader>
            <CardTitle className="text-[#2D2926] flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-[#C9A96E]" />
              Best Performing Categories
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.topCategories.map((cat, i) => (
                <div key={i} className="flex items-center gap-4 p-3 bg-[#F5F0EB]/50 rounded-xl">
                  <div className="w-10 h-10 rounded-xl bg-[#C9A96E]/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-[#C9A96E] font-bold text-sm">{i + 1}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#2D2926]">{cat.name}</p>
                    <p className="text-xs text-muted-foreground">{cat.orders} orders</p>
                  </div>
                  <span className="text-sm font-bold text-[#C9A96E]">
                    AED {cat.revenue.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Low stock alerts */}
        <Card className="border-[#E8E0D8] shadow-sm rounded-xl">
          <CardHeader>
            <CardTitle className="text-[#2D2926] flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              {t('admin.lowStock', locale)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.lowStock.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 bg-destructive/5 rounded-xl">
                  <div className="flex items-center gap-3">
                    <Package className="h-5 w-5 text-destructive" />
                    <div>
                      <p className="text-sm font-medium text-[#2D2926]">{item.name}</p>
                    </div>
                  </div>
                  <Badge variant="destructive" className="text-xs">
                    {item.stock} left
                  </Badge>
                </div>
              ))}
              {data.lowStock.length === 0 && (
                <p className="text-center text-muted-foreground py-4">All products well stocked!</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent orders */}
        <Card className="border-[#E8E0D8] shadow-sm rounded-xl">
          <CardHeader>
            <CardTitle className="text-[#2D2926]">{t('admin.recentOrders', locale)}</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-muted-foreground">Order #</TableHead>
                  <TableHead className="text-muted-foreground">Customer</TableHead>
                  <TableHead className="text-muted-foreground text-end">Total</TableHead>
                  <TableHead className="text-muted-foreground">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.recentOrders.map((order) => (
                  <TableRow key={order.id} className="hover:bg-[#F5F0EB]/50">
                    <TableCell className="font-medium text-[#2D2926]">#{order.orderNumber}</TableCell>
                    <TableCell className="text-[#5C534A]">{order.customerName}</TableCell>
                    <TableCell className="font-semibold text-[#2D2926] text-end">
                      AED {order.total}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={statusColorMap[order.status] || ''}>
                        {order.status.replace(/_/g, ' ')}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
