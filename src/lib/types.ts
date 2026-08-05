export interface User {
  id: string;
  name: string | null;
  email: string;
  phone: string | null;
  role: 'customer' | 'admin' | 'super_admin' | 'florist';
  avatar: string | null;
  isVerified: boolean;
  isActive: boolean;
  lastLoginAt: string | null;
  addresses: Address[];
  createdAt: string;
  updatedAt: string;
}

export interface Address {
  id: string;
  userId: string;
  label: string | null;
  fullName: string;
  phone: string;
  city: string;
  area: string | null;
  street: string | null;
  building: string | null;
  apartment: string | null;
  notes: string | null;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  nameEn: string;
  nameAr: string;
  slug: string;
  description: string | null;
  image: string | null;
  parentId: string | null;
  isActive: boolean;
  sortOrder: number;
  children?: Category[];
  products?: Product[];
  _count?: { products: number };
}

export interface Product {
  id: string;
  nameEn: string;
  nameAr: string;
  slug: string;
  descriptionEn: string | null;
  descriptionAr: string | null;
  sku: string;
  price: number;
  salePrice: number | null;
  costPrice: number | null;
  images: string;
  categoryId: string;
  category?: Category;
  tags: string;
  occasion: string | null;
  color: string | null;
  stock: number;
  isFeatured: boolean;
  isNewArrival: boolean;
  isBestSeller: boolean;
  isActive: boolean;
  sameDayDelivery: boolean;
  rating: number;
  reviewCount: number;
  reviews?: Review[];
  wishlist?: Wishlist[];
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  id: string;
  productId: string;
  userId: string;
  user?: Partial<User>;
  rating: number;
  title: string | null;
  comment: string | null;
  isApproved: boolean;
  createdAt: string;
}

export interface Wishlist {
  id: string;
  userId: string;
  productId: string;
  product?: Product;
  createdAt: string;
}

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'preparing'
  | 'ready_for_pickup'
  | 'assigned_to_courier'
  | 'picked_up'
  | 'out_for_delivery'
  | 'delivered'
  | 'failed_delivery'
  | 'cancelled';

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export type PaymentMethod = 'cod' | 'stripe' | 'apple_pay' | 'google_pay' | 'tabby' | 'tamara' | 'checkout' | 'paytabs';

export interface Order {
  id: string;
  orderNumber: string;
  userId: string | null;
  user?: Partial<User>;
  items: OrderItem[];
  status: OrderStatus;
  paymentMethod: string;
  paymentStatus: PaymentStatus;
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
  currency: string;
  recipientName: string;
  recipientPhone: string;
  deliveryCity: string;
  deliveryArea: string | null;
  deliveryStreet: string | null;
  deliveryBuilding: string | null;
  deliveryApartment: string | null;
  deliveryNotes: string | null;
  deliveryDate: string | null;
  deliveryTime: string | null;
  giftWrap: boolean;
  giftWrapPrice: number;
  greetingCard: string | null;
  couponId: string | null;
  couponCode: string | null;
  paymentId?: string | null;
  deliveryTracking?: DeliveryTracking[];
  floristTask?: FloristTask | null;
  payment?: Payment | null;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  productName: string;
  productImage: string | null;
  price: number;
  quantity: number;
  total: number;
  createdAt: string;
}

export interface CartItem {
  productId: string;
  product: Product;
  quantity: number;
}

export interface Coupon {
  id: string;
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  minOrder: number;
  maxUses: number | null;
  usedCount: number;
  isActive: boolean;
  expiresAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Banner {
  id: string;
  titleEn: string;
  titleAr: string;
  subtitleEn: string | null;
  subtitleAr: string | null;
  image: string;
  link: string | null;
  position: 'hero' | 'homepage' | 'sidebar';
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  id: string;
  orderId: string;
  method: string;
  status: string;
  amount: number;
  currency: string;
  transactionId: string | null;
  gatewayResponse: string;
  paidAt: string | null;
  failedAt: string | null;
  refundedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DeliveryTracking {
  id: string;
  orderId: string;
  status: string;
  note: string | null;
  performedBy: string | null;
  performedByRole: string | null;
  courierName: string | null;
  courierPhone: string | null;
  providerName: string | null;
  providerTrackId: string | null;
  timestamp: string;
}

export interface FloristTask {
  id: string;
  orderId: string;
  assignedToId: string | null;
  status: 'pending' | 'started' | 'in_preparation' | 'package_ready' | 'completed';
  priority: 'normal' | 'urgent';
  notes: string | null;
  startedAt: string | null;
  preparedAt: string | null;
  packageReadyAt: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationItem {
  id: string;
  userId: string;
  type: string;
  title: string;
  titleAr: string | null;
  message: string;
  messageAr: string | null;
  orderId: string | null;
  isRead: boolean;
  channel: string;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  userId: string | null;
  action: string;
  entityType: string | null;
  entityId: string | null;
  details: string;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
}

export type Locale = 'en' | 'ar';

export interface DeliveryCity {
  id: string;
  nameEn: string;
  nameAr: string;
  fee: number;
}

export const UAE_CITIES: DeliveryCity[] = [
  { id: 'dubai', nameEn: 'Dubai', nameAr: 'دبي', fee: 25 },
  { id: 'abu_dhabi', nameEn: 'Abu Dhabi', nameAr: 'أبو ظبي', fee: 30 },
  { id: 'sharjah', nameEn: 'Sharjah', nameAr: 'الشارقة', fee: 25 },
  { id: 'ajman', nameEn: 'Ajman', nameAr: 'عجمان', fee: 30 },
  { id: 'al_ain', nameEn: 'Al Ain', nameAr: 'العين', fee: 40 },
  { id: 'rak', nameEn: 'Ras Al Khaimah', nameAr: 'رأس الخيمة', fee: 40 },
  { id: 'fujairah', nameEn: 'Fujairah', nameAr: 'الفجيرة', fee: 50 },
  { id: 'uaq', nameEn: 'Umm Al Quwain', nameAr: 'أم القيوين', fee: 40 },
];

export const OCCASIONS = [
  { id: 'birthday', nameEn: 'Birthday', nameAr: 'عيد ميلاد' },
  { id: 'anniversary', nameEn: 'Anniversary', nameAr: 'ذكرى سنوية' },
  { id: 'congratulations', nameEn: 'Congratulations', nameAr: 'تهنئة' },
  { id: 'thank_you', nameEn: 'Thank You', nameAr: 'شكراً لك' },
  { id: 'baby_arrival', nameEn: 'Baby Arrival', nameAr: 'مولود جديد' },
  { id: 'wedding', nameEn: 'Wedding', nameAr: 'زفاف' },
  { id: 'valentine', nameEn: "Valentine's Day", nameAr: 'عيد الحب' },
  { id: 'mother_day', nameEn: "Mother's Day", nameAr: 'عيد الأم' },
  { id: 'eid', nameEn: 'Eid', nameAr: 'العيد' },
  { id: 'get_well', nameEn: 'Get Well Soon', nameAr: 'شفى الله' },
  { id: 'sympathy', nameEn: 'Sympathy', nameAr: 'تعزية' },
  { id: 'new_year', nameEn: 'New Year', nameAr: 'السنة الجديدة' },
];

export const DELIVERY_TIME_SLOTS = [
  { id: 'morning', nameEn: 'Morning (9AM - 12PM)', nameAr: 'صباحاً (9ص - 12م)' },
  { id: 'afternoon', nameEn: 'Afternoon (12PM - 4PM)', nameAr: 'ظهراً (12م - 4م)' },
  { id: 'evening', nameEn: 'Evening (4PM - 8PM)', nameAr: 'مساءً (4م - 8م)' },
  { id: 'night', nameEn: 'Night (8PM - 10PM)', nameAr: 'ليلاً (8م - 10م)' },
];

export const ORDER_STATUSES: { value: OrderStatus; labelEn: string; labelAr: string; color: string }[] = [
  { value: 'pending', labelEn: 'Pending', labelAr: 'قيد الانتظار', color: 'bg-yellow-100 text-yellow-700' },
  { value: 'confirmed', labelEn: 'Confirmed', labelAr: 'مؤكد', color: 'bg-blue-100 text-blue-700' },
  { value: 'preparing', labelEn: 'Preparing', labelAr: 'قيد التحضير', color: 'bg-indigo-100 text-indigo-700' },
  { value: 'ready_for_pickup', labelEn: 'Ready for Pickup', labelAr: 'جاهز للتسليم', color: 'bg-cyan-100 text-cyan-700' },
  { value: 'assigned_to_courier', labelEn: 'Assigned to Courier', labelAr: 'تم تعيين المندوب', color: 'bg-violet-100 text-violet-700' },
  { value: 'picked_up', labelEn: 'Picked Up', labelAr: 'تم الاستلام', color: 'bg-purple-100 text-purple-700' },
  { value: 'out_for_delivery', labelEn: 'Out for Delivery', labelAr: 'في الطريق', color: 'bg-orange-100 text-orange-700' },
  { value: 'delivered', labelEn: 'Delivered', labelAr: 'تم التوصيل', color: 'bg-green-100 text-green-700' },
  { value: 'failed_delivery', labelEn: 'Failed Delivery', labelAr: 'فشل التوصيل', color: 'bg-red-100 text-red-700' },
  { value: 'cancelled', labelEn: 'Cancelled', labelAr: 'ملغي', color: 'bg-gray-100 text-gray-700' },
];

// Order timeline steps visible to the customer
export const ORDER_TIMELINE_STEPS: { status: OrderStatus; labelEn: string; labelAr: string; icon: string }[] = [
  { status: 'confirmed', labelEn: 'Order Confirmed', labelAr: 'تم تأكيد الطلب', icon: 'check-circle' },
  { status: 'preparing', labelEn: 'Preparing Bouquet', labelAr: 'تحضير الباقة', icon: 'scissors' },
  { status: 'ready_for_pickup', labelEn: 'Ready', labelAr: 'جاهز', icon: 'package' },
  { status: 'out_for_delivery', labelEn: 'Out for Delivery', labelAr: 'في الطريق للتوصيل', icon: 'truck' },
  { status: 'delivered', labelEn: 'Delivered', labelAr: 'تم التوصيل', icon: 'check-check' },
];

export const ROLE_PERMISSIONS: Record<string, string[]> = {
  super_admin: [
    'users.manage', 'users.create', 'users.edit', 'users.delete', 'users.assign_roles', 'users.activate',
    'products.manage', 'products.create', 'products.edit', 'products.delete',
    'categories.manage', 'categories.create', 'categories.edit', 'categories.delete',
    'orders.manage', 'orders.view_all', 'orders.update_status',
    'customers.view', 'customers.manage',
    'coupons.manage', 'coupons.create', 'coupons.edit', 'coupons.delete',
    'reports.view', 'reports.export', 'reports.filter',
    'florist.manage', 'florist.assign', 'florist.view',
    'delivery.manage', 'delivery.view', 'delivery.assign',
    'notifications.manage',
    'settings.manage',
  ],
  admin: [
    'products.manage', 'products.create', 'products.edit', 'products.delete',
    'categories.manage', 'categories.create', 'categories.edit', 'categories.delete',
    'orders.manage', 'orders.view_all', 'orders.update_status',
    'customers.view',
    'coupons.manage', 'coupons.create', 'coupons.edit', 'coupons.delete',
    'reports.view',
    'florist.manage', 'florist.assign',
    'delivery.manage', 'delivery.view',
    'notifications.manage',
  ],
  florist: [
    'orders.view_assigned',
    'florist_tasks.view', 'florist_tasks.update',
    'delivery.view',
  ],
  customer: [
    'orders.view_own',
    'account.manage',
    'wishlist.manage',
    'addresses.manage',
    'reviews.create',
  ],
};
