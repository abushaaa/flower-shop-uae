'use client';

import { useState, useEffect } from 'react';
import { useLanguageStore, useCartStore, useAuthStore, useUIStore } from '@/lib/stores';
import { t } from '@/lib/i18n';
import LanguageSwitcher from '@/components/shared/LanguageSwitcher';
import NotificationPanel from '@/components/shared/NotificationPanel';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import {
  Search,
  ShoppingBag,
  Heart,
  User,
  Menu,
  Flower2,
  ChevronDown,
  LogIn,
  Gift,
  Cake,
  TreePine,
  Sparkles,
  Box,
  PartyPopper,
  Crown,
  Baby,
  Flame,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const NAV_CATEGORIES = [
  { key: 'flowers', subKeys: ['roses', 'bouquets', 'luxuryBoxes', 'flowersInVase'] },
  { key: 'chocolates' },
  { key: 'cakes' },
  { key: 'perfumes' },
  { key: 'candles' },
  { key: 'plants' },
  { key: 'balloons' },
  { key: 'teddyBears' },
  { key: 'giftBoxes' },
  { key: 'birthdayGifts' },
  { key: 'anniversaryGifts' },
  { key: 'giftsForHer' },
  { key: 'giftsForHim' },
  { key: 'premiumGifts' },
];

const MOBILE_NAV_ITEMS = [
  { key: 'flowers', icon: Flower2, subKeys: ['roses', 'bouquets', 'luxuryBoxes', 'flowersInVase'] },
  { key: 'chocolates', icon: Gift },
  { key: 'cakes', icon: Cake },
  { key: 'perfumes', icon: Sparkles },
  { key: 'candles', icon: Flame },
  { key: 'plants', icon: TreePine },
  { key: 'balloons', icon: PartyPopper },
  { key: 'teddyBears', icon: Gift },
  { key: 'giftBoxes', icon: Box },
  { key: 'birthdayGifts', icon: PartyPopper },
  { key: 'anniversaryGifts', icon: Heart },
  { key: 'giftsForHer', icon: Crown },
  { key: 'giftsForHim', icon: User },
  { key: 'babyGifts', icon: Baby },
  { key: 'premiumGifts', icon: Sparkles },
];

export default function Header() {
  const { locale } = useLanguageStore();
  const { getItemCount } = useCartStore();
  const { isAuthenticated, user } = useAuthStore();
  const { navigate, setSearchOpen, setMobileMenuOpen, isMobileMenuOpen, setCartOpen } = useUIStore();
  const [isScrolled, setIsScrolled] = useState(false);
  const [hoveredCat, setHoveredCat] = useState<string | null>(null);
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null);
  const itemCount = getItemCount();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      {/* Top announcement bar */}
      <div className="bg-gold text-white text-center py-2 text-xs sm:text-sm font-medium">
        {t('home.deliveryBanner', locale)}
      </div>

      {/* Main header */}
      <header
        className={`sticky top-0 z-40 transition-all duration-300 ${
          isScrolled ? 'glass shadow-lg border-b border-border/50' : 'bg-white'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>

            {/* Logo */}
            <button
              onClick={() => navigate('home')}
              className="flex items-center gap-2 group"
            >
              <Flower2 className="h-7 w-7 text-gold group-hover:scale-110 transition-transform" />
              <div className="flex flex-col items-start">
                <span className="text-xl lg:text-2xl font-bold gold-gradient leading-tight tracking-tight">
                  Bloom & Gift
                </span>
                <span className="text-[10px] text-muted-foreground tracking-widest uppercase hidden sm:block">
                  Luxury UAE
                </span>
              </div>
            </button>

            {/* Desktop nav */}
            <nav className="hidden lg:flex items-center gap-1">
              {NAV_CATEGORIES.slice(0, 7).map((cat) => (
                <div
                  key={cat.key}
                  className="relative"
                  onMouseEnter={() => cat.subKeys && setHoveredCat(cat.key)}
                  onMouseLeave={() => setHoveredCat(null)}
                >
                  <button
                    onClick={() => navigate('products')}
                    className="px-3 py-2 text-sm font-medium text-charcoal-light hover:text-gold transition-colors rounded-lg hover:bg-cream/50 flex items-center gap-1"
                  >
                    {t(`nav.${cat.key}`, locale)}
                    {cat.subKeys && <ChevronDown className="h-3 w-3" />}
                  </button>

                  {/* Dropdown */}
                  <AnimatePresence>
                    {cat.subKeys && hoveredCat === cat.key && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 8 }}
                        transition={{ duration: 0.15 }}
                        className="absolute top-full start-0 mt-1 w-56 bg-white rounded-xl shadow-xl border border-border/50 py-2 z-50"
                      >
                        {cat.subKeys.map((subKey) => (
                          <button
                            key={subKey}
                            onClick={() => navigate('products')}
                            className="block w-full text-start px-4 py-2.5 text-sm text-charcoal-light hover:text-gold hover:bg-cream transition-colors"
                          >
                            {t(`nav.${subKey}`, locale)}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </nav>

            {/* Right actions */}
            <div className="flex items-center gap-1 sm:gap-2">
              <LanguageSwitcher />

              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSearchOpen(true)}
                className="text-charcoal-light hover:text-gold"
              >
                <Search className="h-5 w-5" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate(isAuthenticated ? 'account' : 'login')}
                className="text-charcoal-light hover:text-gold hidden sm:flex"
              >
                <User className="h-5 w-5" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate(isAuthenticated ? 'account' : 'login')}
                className="text-charcoal-light hover:text-gold"
              >
                <Heart className="h-5 w-5" />
              </Button>

              {isAuthenticated && <NotificationPanel />}

              <Button
                variant="ghost"
                size="icon"
                onClick={() => setCartOpen(true)}
                className="text-charcoal-light hover:text-gold relative"
              >
                <ShoppingBag className="h-5 w-5" />
                {itemCount > 0 && (
                  <Badge className="absolute -top-1 -end-1 h-5 w-5 rounded-full bg-gold text-white text-[10px] flex items-center justify-center p-0 border-2 border-white">
                    {itemCount}
                  </Badge>
                )}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile menu using Sheet */}
      <Sheet open={isMobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent
          side={locale === 'ar' ? 'right' : 'left'}
          className="w-[85%] max-w-sm p-0 overflow-y-auto"
        >
          <SheetHeader className="p-4 border-b border-border">
            <SheetTitle className="flex items-center gap-2">
              <Flower2 className="h-6 w-6 text-gold" />
              <span className="text-xl font-bold gold-gradient">Bloom & Gift</span>
            </SheetTitle>
          </SheetHeader>

          <div className="py-2">
            {MOBILE_NAV_ITEMS.map((item) => (
              <div key={item.key}>
                <button
                  onClick={() => {
                    if (item.subKeys) {
                      setMobileExpanded(mobileExpanded === item.key ? null : item.key);
                    } else {
                      navigate('products');
                      setMobileMenuOpen(false);
                    }
                  }}
                  className="flex items-center gap-3 w-full px-5 py-3 text-charcoal-light hover:text-gold hover:bg-cream transition-colors"
                >
                  <item.icon className="h-5 w-5 flex-shrink-0" />
                  <span className="font-medium flex-1 text-start">
                    {t(`nav.${item.key}`, locale)}
                  </span>
                  {item.subKeys && (
                    <ChevronDown
                      className={`h-4 w-4 transition-transform ${
                        mobileExpanded === item.key ? 'rotate-180' : ''
                      }`}
                    />
                  )}
                </button>

                {item.subKeys && mobileExpanded === item.key && (
                  <div className="bg-cream/50 ps-12">
                    {item.subKeys.map((sub) => (
                      <button
                        key={sub}
                        onClick={() => {
                          navigate('products');
                          setMobileMenuOpen(false);
                        }}
                        className="block w-full text-start px-4 py-2 text-sm text-charcoal-light hover:text-gold transition-colors"
                      >
                        {t(`nav.${sub}`, locale)}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            <Separator className="my-2" />

            <div className="px-5 py-2 space-y-1">
              <button
                onClick={() => {
                  navigate(isAuthenticated ? 'account' : 'login');
                  setMobileMenuOpen(false);
                }}
                className="flex items-center gap-3 w-full py-3 text-charcoal-light hover:text-gold hover:bg-cream transition-colors"
              >
                {isAuthenticated ? (
                  <User className="h-5 w-5" />
                ) : (
                  <LogIn className="h-5 w-5" />
                )}
                <span className="font-medium">
                  {isAuthenticated
                    ? t('common.account', locale)
                    : t('common.login', locale)}
                </span>
              </button>
              <button
                onClick={() => {
                  navigate('products');
                  setMobileMenuOpen(false);
                }}
                className="flex items-center gap-3 w-full py-3 text-charcoal-light hover:text-gold hover:bg-cream transition-colors"
              >
                <Heart className="h-5 w-5" />
                <span className="font-medium">{t('common.wishlist', locale)}</span>
              </button>
            </div>
          </div>

          <div className="mt-auto p-4 border-t border-border">
            <div className="flex items-center justify-center">
              <LanguageSwitcher />
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
