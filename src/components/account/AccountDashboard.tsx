'use client';

import { useState, useEffect } from 'react';
import { useLanguageStore, useAuthStore, useCartStore, useUIStore } from '@/lib/stores';
import { t } from '@/lib/i18n';
import { Order, Product, ORDER_STATUSES, DeliveryTracking, NotificationItem } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Package,
  Heart,
  MapPin,
  User,
  LogOut,
  Eye,
  RotateCcw,
  Trash2,
  ShoppingBag,
  Plus,
  Edit,
  Check,
  Clock,
  Truck,
  CreditCard,
  Bell,
  CheckCheck,
} from 'lucide-react';
import { toast } from 'sonner';
import OrderTimeline from '@/components/shared/OrderTimeline';

export default function AccountDashboard() {
  const { locale } = useLanguageStore();
  const { user, isAuthenticated, logout, updateProfile } = useAuthStore();
  const { addItem } = useCartStore();
  const { navigate } = useUIStore();
  const [activeTab, setActiveTab] = useState('orders');

  // Data states
  const [orders, setOrders] = useState<Order[]>([]);
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [userNotifications, setUserNotifications] = useState<NotificationItem[]>(() => [
    { id: 'un1', userId: user?.id || '', type: 'order', title: 'Order Confirmed', titleAr: 'تم تأكيد الطلب', message: 'Your order #BG-1061 has been confirmed.', messageAr: 'تم تأكيد طلبك #BG-1061', orderId: null, isRead: false, channel: 'in_app', createdAt: new Date(Date.now() - 3600000).toISOString() },
    { id: 'un2', userId: user?.id || '', type: 'delivery', title: 'Out for Delivery', titleAr: 'في الطريق للتوصيل', message: 'Your order #BG-1060 is out for delivery.', messageAr: 'طلبك #BG-1060 في الطريق للتوصيل', orderId: null, isRead: true, channel: 'in_app', createdAt: new Date(Date.now() - 86400000).toISOString() },
    { id: 'un3', userId: user?.id || '', type: 'payment', title: 'Payment Received', titleAr: 'تم استلام الدفعة', message: 'Payment for order #BG-1058 received.', messageAr: 'تم استلام دفعة الطلب #BG-1058', orderId: null, isRead: true, channel: 'in_app', createdAt: new Date(Date.now() - 172800000).toISOString() },
  ]);

  // Order tracking dialog
  const [trackingOrder, setTrackingOrder] = useState<Order | null>(null);

  // Address form
  const [addressModalOpen, setAddressModalOpen] = useState(false);
  const [editAddressId, setEditAddressId] = useState<string | null>(null);
  const [addressForm, setAddressForm] = useState({
    label: '', fullName: '', phone: '', city: '', area: '',
    street: '', building: '', apartment: '', notes: '', isDefault: false,
  });
  const [addresses, setAddresses] = useState<any[]>([]);

  // Profile form
  const [profileName, setProfileName] = useState(user?.name || '');
  const [profilePhone, setProfilePhone] = useState(user?.phone || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('login');
    }
  }, [isAuthenticated, navigate]);

  // Fetch data
  useEffect(() => {
    if (!user?.id) return;
    let cancelled = false;
    const fetchData = async () => {
      setLoading(true);
      try {
        const ordersRes = await fetch(`/api/orders?userId=${user.id}`);
        if (ordersRes.ok && !cancelled) {
          const data = await ordersRes.json();
          setOrders(Array.isArray(data) ? data : data.orders || []);
        }
      } catch {
        if (!cancelled) setOrders([]);
      }
      if (!cancelled) setLoading(false);
    };
    fetchData();
    return () => { cancelled = true; };
  }, [user?.id]);

  // Mock wishlist
  const mockWishlist: Product[] = [
    {
      id: 'w1', nameEn: 'Royal Red Rose Bouquet', nameAr: 'باقة الورد الأحمر الملكي',
      slug: 'royal-red-roses', sku: 'BLOOM-W1', price: 299, salePrice: null,
      descriptionEn: null, descriptionAr: null, images: '["https://picsum.photos/seed/wishlist1/400/400"]',
      categoryId: 'flowers', stock: 50, isFeatured: true, isNewArrival: false,
      isBestSeller: true, isActive: true, sameDayDelivery: true, rating: 4.8,
      reviewCount: 45, tags: '[]', occasion: null, color: null,
      costPrice: null, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    },
    {
      id: 'w2', nameEn: 'Luxury Gift Box Premium', nameAr: 'صندوق هدايا فاخر',
      slug: 'luxury-gift-box', sku: 'BLOOM-W2', price: 450, salePrice: 399,
      descriptionEn: null, descriptionAr: null, images: '["https://picsum.photos/seed/wishlist2/400/400"]',
      categoryId: 'gifts', stock: 25, isFeatured: true, isNewArrival: true,
      isBestSeller: false, isActive: true, sameDayDelivery: true, rating: 4.9,
      reviewCount: 32, tags: '[]', occasion: null, color: null,
      costPrice: null, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    },
  ];
  const wishlistItems = wishlist.length > 0 ? wishlist : mockWishlist;

  const handleLogout = () => {
    logout();
    navigate('home');
    toast.success(t('common.logout', locale));
  };

  const handleSaveProfile = () => {
    updateProfile({ name: profileName, phone: profilePhone });
    toast.success('Profile updated!');
  };

  const handleChangePassword = () => {
    if (newPassword !== confirmNewPassword) {
      toast.error('Passwords do not match');
      return;
    }
    toast.success('Password changed!');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmNewPassword('');
  };

  const handleReorder = (order: Order) => {
    order.items.forEach((item) => {
      addItem({
        id: item.productId,
        nameEn: item.productName,
        nameAr: item.productName,
        slug: '',
        sku: '',
        price: item.price,
        salePrice: null,
        costPrice: null,
        images: item.productImage ? JSON.stringify([item.productImage]) : '[]',
        categoryId: '',
        stock: 999,
        isFeatured: false,
        isNewArrival: false,
        isBestSeller: false,
        isActive: true,
        sameDayDelivery: true,
        rating: 0,
        reviewCount: 0,
        tags: '[]',
        occasion: null,
        color: null,
        descriptionEn: null,
        descriptionAr: null,
        createdAt: '',
        updatedAt: '',
      } as Product, item.quantity);
    });
    toast.success('Items added to cart!');
  };

  const handleRemoveWishlist = (id: string) => {
    setWishlist(wishlistItems.filter((p) => p.id !== id));
    toast.success('Removed from wishlist');
  };

  const handleAddAddress = () => {
    setEditAddressId(null);
    setAddressForm({
      label: '', fullName: user?.name || '', phone: user?.phone || '',
      city: '', area: '', street: '', building: '', apartment: '', notes: '', isDefault: false,
    });
    setAddressModalOpen(true);
  };

  const handleSaveAddress = () => {
    toast.success(editAddressId ? 'Address updated!' : 'Address added!');
    setAddressModalOpen(false);
  };

  const getStatusConfig = (status: string) => {
    const found = ORDER_STATUSES.find((s) => s.value === status);
    if (found) {
      return {
        color: found.color,
        label: locale === 'ar' ? found.labelAr : found.labelEn,
        icon: status === 'delivered' ? Check : status === 'out_for_delivery' ? Truck : status === 'cancelled' ? Trash2 : Clock,
      };
    }
    return { color: 'bg-gray-100 text-gray-700', label: status, icon: Clock };
  };

  const markNotificationRead = (id: string) => {
    setUserNotifications(userNotifications.map((n) => n.id === id ? { ...n, isRead: true } : n));
  };

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-cream/30">
      {/* Header */}
      <div className="bg-white border-b border-border">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-gold/10 flex items-center justify-center">
                <span className="text-gold text-xl font-bold">
                  {user?.name?.charAt(0) || 'U'}
                </span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-charcoal">{user?.name || 'User'}</h1>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={handleLogout}
              className="gap-2 text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <LogOut className="h-4 w-4" />
              {t('common.logout', locale)}
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full justify-start border-b border-border bg-transparent rounded-none h-auto p-0 gap-0 overflow-x-auto">
            {[
              { value: 'orders', icon: Package, label: t('account.myOrders', locale) },
              { value: 'wishlist', icon: Heart, label: t('account.wishlist', locale) },
              { value: 'addresses', icon: MapPin, label: t('account.savedAddresses', locale) },
              { value: 'notifications', icon: Bell, label: locale === 'ar' ? 'الإشعارات' : 'Notifications' },
              { value: 'profile', icon: User, label: t('account.profile', locale) },
            ].map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-gold data-[state=active]:text-gold data-[state=active]:shadow-none px-4 pb-3 pt-0 text-charcoal-light flex items-center gap-2 whitespace-nowrap"
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* Orders tab */}
          <TabsContent value="orders" className="mt-6">
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-24 rounded-2xl" />
                ))}
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-cream flex items-center justify-center">
                  <Package className="h-10 w-10 text-muted-foreground/30" />
                </div>
                <p className="text-muted-foreground text-lg mb-2">{t('account.noOrders', locale)}</p>
                <Button onClick={() => navigate('products')} className="btn-luxury rounded-full mt-4">
                  <ShoppingBag className="h-4 w-4 me-2" />
                  {t('common.shop', locale)}
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => {
                  const config = getStatusConfig(order.status);
                  const StatusIcon = config.icon;
                  return (
                    <div
                      key={order.id}
                      className="bg-white rounded-2xl p-5 border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4 luxury-card"
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-cream flex items-center justify-center flex-shrink-0">
                          <StatusIcon className="h-5 w-5 text-gold" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className="font-semibold text-charcoal">#{order.orderNumber}</span>
                            <Badge variant="secondary" className={config.color}>
                              {config.label}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {order.items.length} {locale === 'ar' ? 'عناصر' : 'items'} · {new Date(order.createdAt).toLocaleDateString()}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {t('checkout.paymentMethod', locale)}: {order.paymentMethod === 'cod' ? (locale === 'ar' ? 'الدفع عند الاستلام' : 'Cash on Delivery') : order.paymentMethod}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 sm:gap-6">
                        <span className="text-lg font-bold text-gold">AED {order.total.toFixed(2)}</span>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="gap-1 h-8 rounded-lg"
                            onClick={() => setTrackingOrder(order)}
                            title={locale === 'ar' ? 'تتبع الطلب' : 'Track Order'}
                          >
                            <Truck className="h-3 w-3" />
                            <span className="hidden sm:inline">{locale === 'ar' ? 'Track' : 'Track'}</span>
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="gap-1 h-8 rounded-lg"
                            onClick={() => handleReorder(order)}
                          >
                            <RotateCcw className="h-3 w-3" />
                            {t('account.reorder', locale)}
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* Wishlist tab */}
          <TabsContent value="wishlist" className="mt-6">
            {wishlistItems.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-cream flex items-center justify-center">
                  <Heart className="h-10 w-10 text-muted-foreground/30" />
                </div>
                <p className="text-muted-foreground text-lg mb-2">{t('account.noWishlist', locale)}</p>
                <Button onClick={() => navigate('products')} className="btn-luxury rounded-full mt-4">
                  <ShoppingBag className="h-4 w-4 me-2" />
                  {t('common.shop', locale)}
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {wishlistItems.map((item) => {
                  const imgs = item.images ? JSON.parse(item.images) : [];
                  return (
                    <div key={item.id} className="bg-white rounded-2xl p-4 border border-border flex gap-4 luxury-card">
                      <div className="w-20 h-20 rounded-xl overflow-hidden bg-cream flex-shrink-0">
                        <img
                          src={imgs[0] || `https://picsum.photos/seed/${item.slug}/160/160`}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-charcoal text-sm line-clamp-2 mb-1">
                          {locale === 'ar' ? item.nameAr : item.nameEn}
                        </h4>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-gold font-semibold text-sm">
                            AED {item.salePrice || item.price}
                          </span>
                          {item.salePrice && (
                            <span className="text-xs text-muted-foreground line-through">
                              AED {item.price}
                            </span>
                          )}
                        </div>
                        <Button
                          size="sm"
                          onClick={() => {
                            addItem(item);
                            toast.success(t('product.addedToCart', locale));
                          }}
                          className="btn-luxury rounded-full text-xs h-7"
                        >
                          <ShoppingBag className="h-3 w-3 me-1" />
                          {t('common.addToCart', locale)}
                        </Button>
                      </div>
                      <button
                        onClick={() => handleRemoveWishlist(item.id)}
                        className="text-muted-foreground hover:text-destructive self-start transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* Addresses tab */}
          <TabsContent value="addresses" className="mt-6">
            <div className="flex justify-end mb-4">
              <Button onClick={handleAddAddress} className="btn-luxury rounded-xl gap-2">
                <Plus className="h-4 w-4" />
                Add New Address
              </Button>
            </div>
            {addresses.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-cream flex items-center justify-center">
                  <MapPin className="h-10 w-10 text-muted-foreground/30" />
                </div>
                <p className="text-muted-foreground text-lg mb-2">No saved addresses yet</p>
                <p className="text-muted-foreground text-sm mb-4">Add your first delivery address for faster checkout</p>
                <Button onClick={handleAddAddress} className="btn-luxury rounded-full">
                  <Plus className="h-4 w-4 me-2" />
                  Add Address
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {addresses.map((addr: any) => (
                  <div key={addr.id} className="bg-white rounded-2xl p-4 border border-border relative">
                    {addr.isDefault && (
                      <Badge className="absolute top-3 end-3 bg-gold text-white text-[10px]">Default</Badge>
                    )}
                    <p className="font-medium text-charcoal mb-1">{addr.fullName}</p>
                    <p className="text-sm text-muted-foreground mb-3">
                      {addr.area}, {addr.city}
                      {addr.street ? `, ${addr.street}` : ''}
                      {addr.building ? `, Building ${addr.building}` : ''}
                    </p>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="gap-1 h-8 rounded-lg">
                        <Edit className="h-3 w-3" />
                        {t('common.edit', locale)}
                      </Button>
                      <Button variant="ghost" size="sm" className="gap-1 h-8 rounded-lg text-destructive">
                        <Trash2 className="h-3 w-3" />
                        {t('common.delete', locale)}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Notifications tab */}
          <TabsContent value="notifications" className="mt-6">
            {userNotifications.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-cream flex items-center justify-center">
                  <Bell className="h-10 w-10 text-muted-foreground/30" />
                </div>
                <p className="text-muted-foreground text-lg">
                  {locale === 'ar' ? 'لا توجد إشعارات' : 'No notifications'}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {userNotifications.map((notif) => (
                  <div
                    key={notif.id}
                    onClick={() => markNotificationRead(notif.id)}
                    className={`bg-white rounded-2xl p-4 border border-border cursor-pointer transition-colors hover:bg-cream/30 ${
                      !notif.isRead ? 'border-gold/30 bg-gold/5' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        notif.type === 'order' ? 'bg-blue-50 text-blue-500' :
                        notif.type === 'delivery' ? 'bg-purple-50 text-purple-500' :
                        notif.type === 'payment' ? 'bg-green-50 text-green-500' :
                        'bg-orange-50 text-orange-500'
                      }`}>
                        {notif.type === 'order' ? <Package className="h-5 w-5" /> :
                         notif.type === 'delivery' ? <Truck className="h-5 w-5" /> :
                         notif.type === 'payment' ? <CreditCard className="h-5 w-5" /> :
                         <Bell className="h-5 w-5" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <h4 className={`text-sm ${!notif.isRead ? 'font-semibold text-charcoal' : 'font-medium text-charcoal-light'}`}>
                            {locale === 'ar' && notif.titleAr ? notif.titleAr : notif.title}
                          </h4>
                          {!notif.isRead && <span className="w-2 h-2 rounded-full bg-gold flex-shrink-0" />}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {locale === 'ar' && notif.messageAr ? notif.messageAr : notif.message}
                        </p>
                        <p className="text-xs text-muted-foreground/60 mt-1">
                          {new Date(notif.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Profile tab */}
          <TabsContent value="profile" className="mt-6">
            <div className="bg-white rounded-2xl p-6 border border-border max-w-lg">
              <h3 className="font-bold text-charcoal mb-6 flex items-center gap-2">
                <User className="h-5 w-5 text-gold" />
                {t('account.profile', locale)}
              </h3>
              <div className="space-y-4">
                <div>
                  <Label>{t('auth.fullName', locale)}</Label>
                  <Input
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    className="mt-1 rounded-xl"
                  />
                </div>
                <div>
                  <Label>{t('auth.email', locale)}</Label>
                  <Input value={user?.email || ''} className="mt-1 rounded-xl" disabled />
                  <p className="text-xs text-muted-foreground mt-1">Email cannot be changed</p>
                </div>
                <div>
                  <Label>{t('auth.mobileNumber', locale)}</Label>
                  <div className="relative mt-1">
                    <span className="absolute start-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                      +971
                    </span>
                    <Input
                      value={profilePhone?.replace('+971', '') || ''}
                      onChange={(e) => setProfilePhone(e.target.value)}
                      className="rounded-xl ps-14"
                    />
                  </div>
                </div>
                <Button onClick={handleSaveProfile} className="btn-luxury rounded-full">
                  {t('common.save', locale)}
                </Button>
              </div>

              <Separator className="my-8" />

              <h3 className="font-bold text-charcoal mb-4">{t('account.changePassword', locale)}</h3>
              <div className="space-y-4">
                <div>
                  <Label>Current Password</Label>
                  <Input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="mt-1 rounded-xl"
                    placeholder="••••••••"
                  />
                </div>
                <div>
                  <Label>New Password</Label>
                  <Input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="mt-1 rounded-xl"
                    placeholder="••••••••"
                  />
                  <p className="text-xs text-muted-foreground mt-1">{t('auth.passwordMin', locale)}</p>
                </div>
                <div>
                  <Label>{t('auth.confirmPassword', locale)}</Label>
                  <Input
                    type="password"
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    className="mt-1 rounded-xl"
                    placeholder="••••••••"
                  />
                </div>
                <Button onClick={handleChangePassword} variant="outline" className="rounded-full">
                  {t('account.changePassword', locale)}
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Order Tracking Dialog */}
      <Dialog open={!!trackingOrder} onOpenChange={() => setTrackingOrder(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <Truck className="h-5 w-5 text-[#C9A96E]" />
              <span>{locale === 'ar' ? 'تتبع الطلب' : 'Track Order'}</span>
              <span className="text-muted-foreground font-normal text-sm">#{trackingOrder?.orderNumber}</span>
            </DialogTitle>
          </DialogHeader>
          {trackingOrder && (
            <div className="space-y-4 mt-2">
              <div className="bg-[#F5F0EB]/50 rounded-xl p-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{locale === 'ar' ? 'الحالة' : 'Status'}</span>
                  <Badge variant="secondary" className={getStatusConfig(trackingOrder.status).color}>
                    {getStatusConfig(trackingOrder.status).label}
                  </Badge>
                </div>
              </div>
              <OrderTimeline order={trackingOrder} tracking={trackingOrder.deliveryTracking} />
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Address Modal */}
      <Dialog open={addressModalOpen} onOpenChange={setAddressModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editAddressId ? 'Edit Address' : 'Add New Address'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label>Address Label</Label>
              <Input
                value={addressForm.label}
                onChange={(e) => setAddressForm({ ...addressForm, label: e.target.value })}
                className="mt-1 rounded-xl"
                placeholder="Home, Office, etc."
              />
            </div>
            <div>
              <Label>{t('auth.fullName', locale)}</Label>
              <Input
                value={addressForm.fullName}
                onChange={(e) => setAddressForm({ ...addressForm, fullName: e.target.value })}
                className="mt-1 rounded-xl"
              />
            </div>
            <div>
              <Label>{t('auth.mobileNumber', locale)}</Label>
              <Input
                value={addressForm.phone}
                onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                className="mt-1 rounded-xl"
                placeholder="+971 XX XXX XXXX"
              />
            </div>
            <div>
              <Label>{t('checkout.deliveryCity', locale)}</Label>
              <Select
                value={addressForm.city}
                onValueChange={(v) => setAddressForm({ ...addressForm, city: v })}
              >
                <SelectTrigger className="mt-1 rounded-xl">
                  <SelectValue placeholder="Select city" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dubai">Dubai</SelectItem>
                  <SelectItem value="abu_dhabi">Abu Dhabi</SelectItem>
                  <SelectItem value="sharjah">Sharjah</SelectItem>
                  <SelectItem value="ajman">Ajman</SelectItem>
                  <SelectItem value="al_ain">Al Ain</SelectItem>
                  <SelectItem value="rak">Ras Al Khaimah</SelectItem>
                  <SelectItem value="fujairah">Fujairah</SelectItem>
                  <SelectItem value="uaq">Umm Al Quwain</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Area / District</Label>
              <Input
                value={addressForm.area}
                onChange={(e) => setAddressForm({ ...addressForm, area: e.target.value })}
                className="mt-1 rounded-xl"
              />
            </div>
            <div>
              <Label>Street Address</Label>
              <Input
                value={addressForm.street}
                onChange={(e) => setAddressForm({ ...addressForm, street: e.target.value })}
                className="mt-1 rounded-xl"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Building / Villa No.</Label>
                <Input
                  value={addressForm.building}
                  onChange={(e) => setAddressForm({ ...addressForm, building: e.target.value })}
                  className="mt-1 rounded-xl"
                />
              </div>
              <div>
                <Label>Apartment / Floor</Label>
                <Input
                  value={addressForm.apartment}
                  onChange={(e) => setAddressForm({ ...addressForm, apartment: e.target.value })}
                  className="mt-1 rounded-xl"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-4">
              <Button variant="outline" onClick={() => setAddressModalOpen(false)} className="rounded-xl">
                {t('common.cancel', locale)}
              </Button>
              <Button onClick={handleSaveAddress} className="btn-luxury rounded-xl">
                {t('common.save', locale)}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
