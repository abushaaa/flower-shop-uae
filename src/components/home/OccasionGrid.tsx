'use client';

import { useLanguageStore, useUIStore } from '@/lib/stores';
import { t } from '@/lib/i18n';
import { OCCASIONS } from '@/lib/types';
import { motion } from 'framer-motion';
import {
  Heart,
  Cake,
  PartyPopper,
  Handshake,
  Baby,
  Wine,
  HeartHandshake,
  Gift,
  Star,
  Flower2,
  ThumbsUp,
  Sparkles,
  GraduationCap,
} from 'lucide-react';

const OCCASION_ICONS: Record<string, any> = {
  birthday: Cake,
  anniversary: Heart,
  congratulations: PartyPopper,
  thank_you: Handshake,
  baby_arrival: Baby,
  wedding: Wine,
  valentine: HeartHandshake,
  mother_day: Gift,
  eid: Star,
  get_well: ThumbsUp,
  sympathy: Flower2,
  new_year: Sparkles,
};

export default function OccasionGrid() {
  const { locale } = useLanguageStore();
  const { navigate, selectCategory } = useUIStore();

  const handleOccasionClick = (occasionId: string) => {
    selectCategory(null);
    navigate('products');
  };

  return (
    <section className="py-10 sm:py-16 bg-cream/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-charcoal text-center mb-10">
          {t('home.shopByOccasion', locale)}
        </h2>

        {/* 2x3 mobile, 3x4 desktop */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {OCCASIONS.slice(0, 12).map((occasion, index) => {
            const Icon = OCCASION_ICONS[occasion.id] || Gift;
            return (
              <motion.button
                key={occasion.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleOccasionClick(occasion.id)}
                className="flex flex-col items-center gap-3 p-4 sm:p-6 bg-white rounded-2xl border border-border hover:border-gold hover:shadow-lg transition-all group luxury-card"
              >
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-cream flex items-center justify-center group-hover:bg-gold/10 transition-colors">
                  <Icon className="h-6 w-6 sm:h-7 sm:w-7 text-gold" />
                </div>
                <span className="text-xs sm:text-sm font-medium text-charcoal-light text-center leading-tight">
                  {locale === 'ar' ? occasion.nameAr : occasion.nameEn}
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
