import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Locale, CartItem, Product, NotificationItem } from '@/lib/types';
import { ROLE_PERMISSIONS } from '@/lib/types';

// Language Store
interface LanguageStore {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  toggleLocale: () => void;
}

export const useLanguageStore = create<LanguageStore>()(
  persist(
    (set) => ({
      locale: 'en',
      setLocale: (locale) => set({ locale }),
      toggleLocale: () =>
        set((state) => ({ locale: state.locale === 'en' ? 'ar' : 'en' })),
    }),
    { name: 'bloom-gift-locale' }
  )
);

// Cart Store
interface CartStore {
  items: CartItem[];
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getTotal: () => number;
  getSubtotal: () => number;
  getDiscount: () => number;
  getItemCount: () => number;
  giftWrap: boolean;
  setGiftWrap: (value: boolean) => void;
  greetingCard: string;
  setGreetingCard: (message: string) => void;
  couponCode: string;
  couponDiscount: number;
  applyCoupon: (code: string, discount: number) => void;
  removeCoupon: () => void;
  deliveryFee: number;
  setDeliveryFee: (fee: number) => void;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      giftWrap: false,
      greetingCard: '',
      couponCode: '',
      couponDiscount: 0,
      deliveryFee: 25,

      addItem: (product, quantity = 1) => {
        const items = get().items;
        const existing = items.find((i) => i.productId === product.id);
        if (existing) {
          set({
            items: items.map((i) =>
              i.productId === product.id
                ? { ...i, quantity: i.quantity + quantity }
                : i
            ),
          });
        } else {
          set({ items: [...items, { productId: product.id, product, quantity }] });
        }
      },

      removeItem: (productId) => {
        set({ items: get().items.filter((i) => i.productId !== productId) });
      },

      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }
        set({
          items: get().items.map((i) =>
            i.productId === productId ? { ...i, quantity } : i
          ),
        });
      },

      clearCart: () =>
        set({
          items: [],
          giftWrap: false,
          greetingCard: '',
          couponCode: '',
          couponDiscount: 0,
        }),

      getSubtotal: () =>
        get().items.reduce((sum, i) => sum + i.product.price * i.quantity, 0),

      getDiscount: () => get().couponDiscount,

      getTotal: () => {
        const subtotal = get().getSubtotal();
        const discount = get().getDiscount();
        const giftWrapCost = get().giftWrap ? 15 : 0;
        return subtotal - discount + giftWrapCost + get().deliveryFee;
      },

      getItemCount: () =>
        get().items.reduce((sum, i) => sum + i.quantity, 0),

      setGiftWrap: (value) => set({ giftWrap: value }),
      setGreetingCard: (message) => set({ greetingCard: message }),

      applyCoupon: (code, discount) =>
        set({ couponCode: code, couponDiscount: discount }),
      removeCoupon: () => set({ couponCode: '', couponDiscount: 0 }),
      setDeliveryFee: (fee) => set({ deliveryFee: fee }),
    }),
    { name: 'bloom-gift-cart' }
  )
);

// Auth Store
interface AuthStore {
  user: {
    id: string;
    name: string | null;
    email: string;
    phone: string | null;
    role: string;
    token: string;
  } | null;
  isAuthenticated: boolean;
  login: (user: AuthStore['user']) => void;
  logout: () => void;
  updateProfile: (data: Partial<NonNullable<AuthStore['user']>>) => void;
  hasPermission: (permission: string) => boolean;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,

      login: (user) => set({ user, isAuthenticated: true }),

      logout: () => set({ user: null, isAuthenticated: false }),

      updateProfile: (data) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...data } : null,
        })),

      hasPermission: (permission: string) => {
        const { user } = get();
        if (!user) return false;
        if (user.role === 'super_admin') return true;
        const permissions = ROLE_PERMISSIONS[user.role] || [];
        return permissions.includes(permission);
      },
    }),
    { name: 'bloom-gift-auth' }
  )
);

// Notification Store
interface NotificationStore {
  notifications: NotificationItem[];
  unreadCount: number;
  setNotifications: (notifications: NotificationItem[]) => void;
  addNotification: (notification: NotificationItem) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearAll: () => void;
}

export const useNotificationStore = create<NotificationStore>((set, get) => ({
  notifications: [],
  unreadCount: 0,

  setNotifications: (notifications) =>
    set({
      notifications,
      unreadCount: notifications.filter((n) => !n.isRead).length,
    }),

  addNotification: (notification) =>
    set((state) => {
      const updated = [notification, ...state.notifications];
      return {
        notifications: updated,
        unreadCount: updated.filter((n) => !n.isRead).length,
      };
    }),

  markAsRead: (id) =>
    set((state) => {
      const updated = state.notifications.map((n) =>
        n.id === id ? { ...n, isRead: true } : n
      );
      return {
        notifications: updated,
        unreadCount: updated.filter((n) => !n.isRead).length,
      };
    }),

  markAllAsRead: () =>
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
      unreadCount: 0,
    })),

  clearAll: () => set({ notifications: [], unreadCount: 0 }),
}));

// UI Store - manages current view/page
interface UIStore {
  currentView: string;
  previousView: string;
  navigate: (view: string) => void;
  goBack: () => void;
  selectedProductId: string | null;
  selectProduct: (id: string | null) => void;
  selectedCategory: string | null;
  selectCategory: (slug: string | null) => void;
  isSearchOpen: boolean;
  setSearchOpen: (open: boolean) => void;
  isCartOpen: boolean;
  setCartOpen: (open: boolean) => void;
  isMobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
  quickViewProduct: Product | null;
  setQuickViewProduct: (product: Product | null) => void;
}

export const useUIStore = create<UIStore>((set) => ({
  currentView: 'home',
  previousView: 'home',
  navigate: (view) =>
    set((state) => ({ currentView: view, previousView: state.currentView })),
  goBack: () =>
    set((state) => ({
      currentView: state.previousView,
      previousView: 'home',
    })),
  selectedProductId: null,
  selectProduct: (id) => set({ selectedProductId: id }),
  selectedCategory: null,
  selectCategory: (slug) => set({ selectedCategory: slug }),
  isSearchOpen: false,
  setSearchOpen: (open) => set({ isSearchOpen: open }),
  isCartOpen: false,
  setCartOpen: (open) => set({ isCartOpen: open }),
  isMobileMenuOpen: false,
  setMobileMenuOpen: (open) => set({ isMobileMenuOpen: open }),
  quickViewProduct: null,
  setQuickViewProduct: (product) => set({ quickViewProduct: product }),
}));
