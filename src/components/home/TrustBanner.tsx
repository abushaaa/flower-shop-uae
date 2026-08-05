'use client';

import { useLanguageStore } from '@/lib/stores';
import { t } from '@/lib/i18n';
import { motion } from 'framer-motion';
import { Truck, MapPin, Award, Heart } from 'lucide-react';

const TRUST_ITEMS = [
  {
    icon: Truck,
    titleKey: 'common.sameDayDelivery',
    descEn: 'Order before 2PM for same-day delivery',
    descAr: 'اطلب قبل الساعة 2 مساءً للتوصيل في نفس اليوم',
  },
  {
    icon: MapPin,
    titleKey: 'home.deliveryInfo',
    descEn: 'We deliver across all 7 Emirates',
    descAr: 'نوصل في جميع الإمارات السبع',
  },
  {
    icon: Award,
    titleEn: 'Premium Quality',
    titleAr: 'جودة فاخرة',
    descEn: 'Fresh flowers & handcrafted gifts',
    descAr: 'زهور طازجة وهدايا مصنوعة يدوياً',
  },
  {
    icon: Heart,
    titleEn: '100% Satisfaction',
    titleAr: 'رضا ١٠٠٪',
    descEn: 'Money back guarantee on all orders',
    descAr: 'ضمان استرداد الأموال على جميع الطلبات',
  },
];

export default function TrustBanner() {
  const { locale } = useLanguageStore();

  return (
    <section className="py-10 sm:py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {TRUST_ITEMS.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="text-center p-4 sm:p-6 rounded-2xl bg-cream/50 hover:bg-cream transition-colors"
            >
              <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-gold/10 flex items-center justify-center">
                <item.icon className="h-7 w-7 text-gold" />
              </div>
              <h3 className="font-semibold text-charcoal mb-1 text-sm sm:text-base">
                {item.titleKey
                  ? t(item.titleKey, locale)
                  : locale === 'ar'
                  ? item.titleAr
                  : item.titleEn}
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground">
                {locale === 'ar' ? item.descAr : item.descEn}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
