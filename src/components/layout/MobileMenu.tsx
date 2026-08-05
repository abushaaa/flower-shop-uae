'use client';

import { useState } from 'react';
import { useLanguageStore, useAuthStore, useUIStore } from '@/lib/stores';
import { t } from '@/lib/i18n';
import LanguageSwitcher from '@/components/shared/LanguageSwitcher';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  X,
  Flower2,
  User,
  LogIn,
  ShoppingBag,
  Heart,
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

const NAV_ITEMS = [
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

export default function MobileMenu() {
  const { locale } = useLanguageStore();
  const { isAuthenticated } = useAuthStore();
  const { navigate, setMobileMenuOpen, isMobileMenuOpen } = useUIStore();
  const [expanded, setExpanded] = useState<string | null>(null);

  const handleClose = () => {
    setMobileMenuOpen(false);
    setExpanded(null);
  };

  return (
    <AnimatePresence>
      {isMobileMenuOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50"
            onClick={handleClose}
          />

          {/* Menu panel */}
          <motion.div
            initial={{ x: locale === 'ar' ? '100%' : '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: locale === 'ar' ? '100%' : '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 bottom-0 start-0 w-[85%] max-w-sm bg-white z-50 flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div className="flex items-center gap-2">
                <Flower2 className="h-6 w-6 text-gold" />
                <span className="text-xl font-bold gold-gradient">Bloom & Gift</span>
              </div>
              <Button variant="ghost" size="icon" onClick={handleClose}>
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto py-2">
              {NAV_ITEMS.map((item) => (
                <div key={item.key}>
                  <button
                    onClick={() => {
                      navigate('products');
                      handleClose();
                    }}
                    className="flex items-center gap-3 w-full px-5 py-3 text-charcoal-light hover:text-gold hover:bg-cream transition-colors"
                  >
                    <item.icon className="h-5 w-5 flex-shrink-0" />
                    <span className="font-medium">{t(`nav.${item.key}`, locale)}</span>
                  </button>

                  {item.subKeys && expanded === item.key && (
                    <div className="bg-cream/50 ps-12">
                      {item.subKeys.map((sub) => (
                        <button
                          key={sub}
                          onClick={() => { navigate('products'); handleClose(); }}
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
                  onClick={() => { navigate(isAuthenticated ? 'account' : 'login'); handleClose(); }}
                  className="flex items-center gap-3 w-full py-3 text-charcoal-light hover:text-gold hover:bg-cream transition-colors"
                >
                  <User className="h-5 w-5" />
                  <span className="font-medium">
                    {isAuthenticated ? t('common.account', locale) : t('common.login', locale)}
                  </span>
                </button>
                <button
                  onClick={() => { navigate('products'); handleClose(); }}
                  className="flex items-center gap-3 w-full py-3 text-charcoal-light hover:text-gold hover:bg-cream transition-colors"
                >
                  <Heart className="h-5 w-5" />
                  <span className="font-medium">{t('common.wishlist', locale)}</span>
                </button>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-border">
              <div className="flex items-center justify-center">
                <LanguageSwitcher />
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
