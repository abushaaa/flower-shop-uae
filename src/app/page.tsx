'use client';
import { useLanguageStore, useUIStore } from '@/lib/stores';
import { getDirection } from '@/lib/i18n';
import dynamic from 'next/dynamic';

const Header = dynamic(() => import('@/components/layout/Header'));
const Footer = dynamic(() => import('@/components/layout/Footer'));
const HomePage = dynamic(() => import('@/components/home/HomePage'));
const CartDrawer = dynamic(() => import('@/components/cart/CartDrawer'));
const WhatsAppButton = dynamic(() => import('@/components/shared/WhatsAppButton'));
const SearchOverlay = dynamic(() => import('@/components/shared/SearchOverlay'));
const QuickViewModal = dynamic(() => import('@/components/shared/QuickViewModal'));
const ProductGrid = dynamic(() => import('@/components/products/ProductGrid'));
const ProductDetail = dynamic(() => import('@/components/products/ProductDetail'));
const CheckoutPage = dynamic(() => import('@/components/checkout/CheckoutPage'));
const AuthPage = dynamic(() => import('@/components/auth/AuthPage'));
const AccountDashboard = dynamic(() => import('@/components/account/AccountDashboard'));
const AdminLayout = dynamic(() => import('@/components/admin/AdminLayout'));
const FloristDashboard = dynamic(() => import('@/components/florist/FloristDashboard'));

export default function Home() {
  const { locale } = useLanguageStore();
  const { currentView } = useUIStore();

  const hideFooter = currentView === 'admin' || currentView === 'login' || currentView === 'register' || currentView === 'forgot-password' || currentView === 'florist';

  return (
    <div dir={getDirection(locale)} className={`${locale === 'ar' ? 'font-arabic' : ''} min-h-screen flex flex-col`}>
      <Header />
      <main className="flex-1">
        {currentView === 'home' && <HomePage />}
        {currentView === 'products' && <ProductGrid />}
        {currentView === 'product-detail' && <ProductDetail />}
        {currentView === 'checkout' && <CheckoutPage />}
        {currentView === 'login' && <AuthPage />}
        {currentView === 'register' && <AuthPage />}
        {currentView === 'forgot-password' && <AuthPage />}
        {currentView === 'account' && <AccountDashboard />}
        {currentView === 'admin' && <AdminLayout />}
        {currentView === 'florist' && <FloristDashboard />}
      </main>
      {!hideFooter && <Footer />}
      <CartDrawer />
      <WhatsAppButton />
      <SearchOverlay />
      <QuickViewModal />
    </div>
  );
}
