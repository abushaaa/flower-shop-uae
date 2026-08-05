'use client';

import { useState, useEffect } from 'react';
import { useLanguageStore, useAuthStore, useUIStore } from '@/lib/stores';
import { t } from '@/lib/i18n';
import AdminDashboard from './AdminDashboard';
import AdminProducts from './AdminProducts';
import AdminOrders from './AdminOrders';
import AdminCustomers from './AdminCustomers';
import AdminCoupons from './AdminCoupons';
import AdminCategories from './AdminCategories';
import AdminUsers from './AdminUsers';
import AdminDelivery from './AdminDelivery';
import AdminNotifications from './AdminNotifications';
import NotificationPanel from '@/components/shared/NotificationPanel';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Tag,
  FolderTree,
  LogOut,
  Menu,
  X,
  Flower2,
  BarChart3,
  Bell,
  Store,
  Truck,
  UserCog,
} from 'lucide-react';
import { toast } from 'sonner';

type AdminTab = 'dashboard' | 'products' | 'orders' | 'customers' | 'coupons' | 'categories' | 'users' | 'delivery' | 'notifications';

interface NavItem {
  key: AdminTab;
  icon: any;
  labelKey: string;
  minRole?: string; // minimum role required to see this nav item
}

const ADMIN_NAV: NavItem[] = [
  { key: 'dashboard', icon: LayoutDashboard, labelKey: 'admin.dashboard' },
  { key: 'products', icon: Package, labelKey: 'admin.products' },
  { key: 'categories', icon: FolderTree, labelKey: 'admin.categories' },
  { key: 'orders', icon: ShoppingCart, labelKey: 'admin.orders' },
  { key: 'customers', icon: Users, labelKey: 'admin.customers' },
  { key: 'coupons', icon: Tag, labelKey: 'admin.coupons' },
  { key: 'users', icon: UserCog, labelKey: 'admin.users', minRole: 'super_admin' },
  { key: 'delivery', icon: Truck, labelKey: 'admin.orders', minRole: 'admin' },
  { key: 'notifications', icon: Bell, labelKey: 'admin.orders', minRole: 'admin' },
];

const navLabels: Record<string, string> = {
  dashboard: 'Dashboard',
  products: 'Products',
  categories: 'Categories',
  orders: 'Orders',
  customers: 'Customers',
  coupons: 'Coupons',
  users: 'Users',
  delivery: 'Delivery',
  notifications: 'Notifications',
};

export default function AdminLayout() {
  const { locale } = useLanguageStore();
  const { user, logout } = useAuthStore();
  const { navigate } = useUIStore();
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    // Simulate initial data load
    const timer = setTimeout(() => setLoadingData(false), 300);
    return () => clearTimeout(timer);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('home');
    toast.success(t('common.logout', locale));
  };

  const handleNavigate = (tab: AdminTab) => {
    setActiveTab(tab);
    setSidebarOpen(false);
  };

  const getRoleLevel = (role: string | undefined) => {
    if (role === 'super_admin') return 3;
    if (role === 'admin') return 2;
    if (role === 'florist') return 1;
    return 0;
  };

  const getMinRoleLevel = (minRole?: string) => {
    if (minRole === 'super_admin') return 3;
    if (minRole === 'admin') return 2;
    if (minRole === 'florist') return 1;
    return 0;
  };

  const visibleNav = ADMIN_NAV.filter(
    (item) => getRoleLevel(user?.role) >= getMinRoleLevel(item.minRole)
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <AdminDashboard />;
      case 'products': return <AdminProducts />;
      case 'orders': return <AdminOrders />;
      case 'customers': return <AdminCustomers />;
      case 'coupons': return <AdminCoupons />;
      case 'categories': return <AdminCategories />;
      case 'users': return <AdminUsers />;
      case 'delivery': return <AdminDelivery />;
      case 'notifications': return <AdminNotifications />;
      default: return <AdminDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-[#FEFCF9] flex">
      {/* Sidebar overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:sticky top-0 h-screen w-64 bg-white border-e border-[#E8E0D8] z-50 transition-transform lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-5 border-b border-[#E8E0D8]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Flower2 className="h-6 w-6 text-[#C9A96E]" />
                <div>
                  <span className="text-lg font-bold gold-gradient">Bloom & Gift</span>
                  <p className="text-[10px] text-muted-foreground tracking-wider uppercase">Admin Panel</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setSidebarOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Nav */}
          <nav className="flex-1 py-4 overflow-y-auto">
            {visibleNav.map((item) => (
              <button
                key={item.key}
                onClick={() => handleNavigate(item.key)}
                className={`flex items-center gap-3 w-full px-5 py-3 text-sm font-medium transition-colors ${
                  activeTab === item.key
                    ? 'text-[#C9A96E] bg-[#C9A96E]/5 border-s border-[#C9A96E]'
                    : 'text-[#5C534A] hover:text-[#C9A96E] hover:bg-[#F5F0EB]'
                }`}
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                {navLabels[item.key] || t(item.labelKey, locale)}
              </button>
            ))}

            {/* Back to store link */}
            <div className="mt-4 mx-5">
              <Separator className="bg-[#E8E0D8] mb-4" />
              <button
                onClick={() => navigate('home')}
                className="flex items-center gap-3 w-full px-0 py-2 text-sm font-medium text-[#5C534A] hover:text-[#C9A96E] transition-colors"
              >
                <Store className="h-5 w-5 flex-shrink-0" />
                Back to Store
              </button>
            </div>
          </nav>

          {/* Bottom */}
          <div className="p-4 border-t border-[#E8E0D8]">
            <div className="flex items-center gap-3 mb-3 px-2">
              <div className="w-9 h-9 rounded-full bg-[#C9A96E]/10 flex items-center justify-center">
                <span className="text-[#C9A96E] font-bold text-sm">
                  {user?.name?.charAt(0) || 'A'}
                </span>
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-[#2D2926] truncate">{user?.name || 'Admin'}</p>
                <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              onClick={handleLogout}
              className="w-full justify-start gap-2 text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <LogOut className="h-4 w-4" />
              {t('common.logout', locale)}
            </Button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 min-w-0">
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-white border-b border-[#E8E0D8]">
          <div className="flex items-center justify-between px-4 sm:px-6 h-14">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </Button>
              <h1 className="text-lg font-semibold text-[#2D2926]">
                {navLabels[activeTab] || t(`admin.${activeTab}` as any, locale)}
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <NotificationPanel />
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 sm:p-6 lg:p-8">
          {loadingData ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-28 rounded-xl" />
                ))}
              </div>
              <Skeleton className="h-80 rounded-xl" />
            </div>
          ) : (
            renderContent()
          )}
        </main>
      </div>
    </div>
  );
}
