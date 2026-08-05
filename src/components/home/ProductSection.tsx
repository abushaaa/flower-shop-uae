'use client';

import { useState, useEffect, useRef } from 'react';
import { useLanguageStore, useUIStore } from '@/lib/stores';
import { t } from '@/lib/i18n';
import { Product, Locale } from '@/lib/types';
import ProductCard from '@/components/products/ProductCard';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowRight, ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';

interface ProductSectionProps {
  titleKey: string;
  products: Product[];
  locale?: Locale;
  loading?: boolean;
}

export default function ProductSection({
  titleKey,
  products,
  locale: propLocale,
  loading = false,
}: ProductSectionProps) {
  const storeLocale = useLanguageStore((s) => s.locale);
  const locale = propLocale || storeLocale;
  const { navigate } = useUIStore();
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleScroll = (dir: 'left' | 'right') => {
    const container = scrollRef.current;
    if (!container) return;
    const scrollAmount = container.clientWidth * 0.8;
    container.scrollBy({
      left: dir === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  if (!loading && products.length === 0) return null;

  const Arrow = locale === 'ar' ? ArrowLeft : ArrowRight;

  return (
    <section className="py-10 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Title row */}
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-charcoal">
            {t(titleKey, locale)}
          </h2>
          <Button
            variant="ghost"
            onClick={() => navigate('products')}
            className="text-gold hover:text-gold/80 gap-1 group"
          >
            {t('common.viewAll', locale)}
            <Arrow className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>

        {/* Products */}
        <div className="relative">
          {/* Scroll buttons (desktop) */}
          <button
            onClick={() => handleScroll('left')}
            className="absolute start-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center hover:bg-cream transition-colors hidden lg:flex"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          <div
            ref={scrollRef}
            className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory lg:grid lg:grid-cols-4 lg:overflow-visible lg:pb-0"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {loading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={i}
                    className="min-w-[260px] lg:min-w-0 snap-start"
                  >
                    <Skeleton className="aspect-square rounded-2xl w-full" />
                    <Skeleton className="mt-3 h-4 w-3/4 rounded" />
                    <Skeleton className="mt-2 h-4 w-1/2 rounded" />
                  </div>
                ))
              : products.slice(0, 8).map((product) => (
                  <div
                    key={product.id}
                    className="min-w-[260px] lg:min-w-0 snap-start"
                  >
                    <ProductCard product={product} locale={locale} />
                  </div>
                ))}
          </div>

          <button
            onClick={() => handleScroll('right')}
            className="absolute end-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center hover:bg-cream transition-colors hidden lg:flex"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    </section>
  );
}
