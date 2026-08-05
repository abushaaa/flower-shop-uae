'use client';

import { useState, useEffect } from 'react';
import { useLanguageStore, useUIStore } from '@/lib/stores';
import { t } from '@/lib/i18n';
import { Category } from '@/lib/types';
import { motion } from 'framer-motion';
import { Skeleton } from '@/components/ui/skeleton';

const DEFAULT_CATEGORIES = [
  { key: 'flowers', image: 'bloom-cat-flowers' },
  { key: 'bouquets', image: 'bloom-cat-bouquets' },
  { key: 'chocolates', image: 'bloom-cat-chocolate' },
  { key: 'cakes', image: 'bloom-cat-cakes' },
  { key: 'perfumes', image: 'bloom-cat-perfume' },
  { key: 'candles', image: 'bloom-cat-candles' },
  { key: 'plants', image: 'bloom-cat-plants' },
  { key: 'giftBoxes', image: 'bloom-cat-giftbox' },
];

export default function CategoryGrid() {
  const { locale } = useLanguageStore();
  const { navigate, selectCategory } = useUIStore();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch('/api/categories');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setCategories(data);
          }
        }
      } catch {
        // fall back to defaults
      }
      setLoading(false);
    };
    fetchCategories();
  }, []);

  const handleCategoryClick = (slug: string) => {
    selectCategory(slug);
    navigate('products');
  };

  const displayCategories = categories.length > 0
    ? categories.slice(0, 8).map((cat) => ({
        key: cat.slug,
        name: locale === 'ar' ? cat.nameAr : cat.nameEn,
        image: cat.image ? undefined : `bloom-cat-${cat.slug}`,
        catImage: cat.image,
      }))
    : DEFAULT_CATEGORIES.map((c) => ({
        ...c,
        name: t(`nav.${c.key}`, locale),
      }));

  return (
    <section className="py-10 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-charcoal text-center mb-10">
          {t('home.shopByCategory', locale)}
        </h2>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i}>
                <Skeleton className="aspect-[4/3] rounded-2xl w-full" />
                <Skeleton className="mt-3 h-4 w-2/3 rounded" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {displayCategories.map((cat, index) => (
              <motion.button
                key={cat.key}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.02 }}
                onClick={() => handleCategoryClick(cat.key)}
                className="group relative overflow-hidden rounded-2xl bg-white border border-border hover:border-gold transition-all luxury-card"
              >
                <div className="aspect-[4/3] relative">
                  <img
                    src={
                      cat.catImage ||
                      `https://picsum.photos/seed/${cat.image}/400/300`
                    }
                    alt={cat.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                </div>
                <div className="absolute bottom-0 start-0 end-0 p-4">
                  <h3 className="text-white font-semibold text-base">
                    {cat.name}
                  </h3>
                </div>
              </motion.button>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
