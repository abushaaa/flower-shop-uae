'use client';

import { useState, useEffect, useCallback } from 'react';
import { useLanguageStore, useUIStore } from '@/lib/stores';
import { t } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const HERO_SLIDES = [
  {
    image: 'https://picsum.photos/seed/bloom-hero-1/1920/800',
    titleKey: 'home.heroTitle',
    subtitleKey: 'home.heroSubtitle',
    cta1Key: 'home.shopNow',
    cta2Key: 'home.sendGift',
  },
  {
    image: 'https://picsum.photos/seed/bloom-hero-2/1920/800',
    titleKey: 'home.luxuryFlowers',
    subtitleKey: 'home.deliveryInfo',
    cta1Key: 'home.viewCollection',
    cta2Key: 'home.sendGift',
  },
  {
    image: 'https://picsum.photos/seed/bloom-hero-3/1920/800',
    titleKey: 'home.birthdayCollection',
    subtitleKey: 'home.deliveryBanner',
    cta1Key: 'home.shopNow',
    cta2Key: 'home.sendGift',
  },
];

export default function HeroSlider() {
  const { locale } = useLanguageStore();
  const { navigate } = useUIStore();
  const [current, setCurrent] = useState(0);

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % HERO_SLIDES.length);
  }, []);

  const prev = useCallback(() => {
    setCurrent(
      (prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length
    );
  }, []);

  useEffect(() => {
    const interval = setInterval(next, 5000);
    return () => clearInterval(interval);
  }, [next]);

  const slide = HERO_SLIDES[current];

  return (
    <div className="relative h-[60vh] sm:h-[70vh] lg:h-[80vh] overflow-hidden">
      {/* Background slides with fade */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`bg-${current}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          className="absolute inset-0"
        >
          <img
            src={slide.image}
            alt=""
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
        </motion.div>
      </AnimatePresence>

      {/* Text content */}
      <div className="absolute inset-0 flex items-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={`text-${current}`}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="max-w-lg"
            >
              <h1 className="text-3xl sm:text-4xl lg:text-6xl font-bold text-white mb-4 leading-tight">
                {t(slide.titleKey, locale)}
              </h1>
              <p className="text-white/80 text-base sm:text-lg mb-8 leading-relaxed">
                {t(slide.subtitleKey, locale)}
              </p>
              <div className="flex flex-wrap gap-3">
                <Button
                  onClick={() => navigate('products')}
                  className="btn-luxury rounded-full px-8 py-6 text-base"
                >
                  {t(slide.cta1Key, locale)}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate('products')}
                  className="rounded-full px-8 py-6 text-base border-white/40 text-white hover:bg-white/10 hover:text-white bg-transparent"
                >
                  {t(slide.cta2Key, locale)}
                </Button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Navigation arrows */}
      <button
        onClick={prev}
        className="absolute start-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/30 transition-colors hidden sm:flex"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        onClick={next}
        className="absolute end-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/30 transition-colors hidden sm:flex"
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      {/* Navigation dots */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
        {HERO_SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`h-2 rounded-full transition-all duration-300 ${
              i === current
                ? 'w-8 bg-gold'
                : 'w-2 bg-white/40 hover:bg-white/60'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
