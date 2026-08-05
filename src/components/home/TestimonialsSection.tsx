'use client';

import { useLanguageStore } from '@/lib/stores';
import { t } from '@/lib/i18n';
import { Star, Quote } from 'lucide-react';
import { motion } from 'framer-motion';

const TESTIMONIALS = [
  {
    nameEn: 'Sarah M.',
    nameAr: 'سارة م.',
    textEn:
      'Amazing quality flowers! The bouquet was even more beautiful than the picture. Same-day delivery in Dubai was a lifesaver!',
    textAr:
      'زهور بجودة رائعة! الباقة كانت أجمل من الصورة. التوصيل في نفس اليوم في دبي كان منقذاً!',
    rating: 5,
    location: 'Dubai',
  },
  {
    nameEn: 'Ahmed K.',
    nameAr: 'أحمد ك.',
    textEn:
      "Ordered a gift box for my wife's birthday. Everything was perfect — from the packaging to the chocolates. Highly recommended!",
    textAr:
      'طلبت صندوق هدايا لعيد ميلاد زوجتي. كل شيء كان مثالياً — من التغليف إلى الشوكولاتة. أنصح به بشدة!',
    rating: 5,
    location: 'Abu Dhabi',
  },
  {
    nameEn: 'Fatima R.',
    nameAr: 'فاطمة ر.',
    textEn:
      'I use Bloom & Gift for all my corporate events. Their attention to detail and premium quality never disappoints.',
    textAr:
      'أستخدم بلوم آند جفت لجميع فعالياتي المؤسسية. اهتمامهم بالتفاصيل وجودتهم الفاخرة لا تخيب أبداً.',
    rating: 5,
    location: 'Sharjah',
  },
];

export default function TestimonialsSection() {
  const { locale } = useLanguageStore();

  return (
    <section className="py-10 sm:py-16 bg-cream/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-charcoal text-center mb-10">
          {t('home.customerReviews', locale)}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-2xl p-6 sm:p-8 border border-border luxury-card"
            >
              <Quote className="h-8 w-8 text-gold/30 mb-4" />
              <p className="text-charcoal-light text-sm sm:text-base leading-relaxed mb-6">
                {locale === 'ar' ? testimonial.textAr : testimonial.textEn}
              </p>
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i < testimonial.rating
                        ? 'text-gold fill-gold'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <div className="flex items-center gap-3">
                {/* Avatar placeholder */}
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gold/20 to-gold/40 flex items-center justify-center overflow-hidden">
                  <img
                    src={`https://picsum.photos/seed/avatar-${index + 1}/80/80`}
                    alt={locale === 'ar' ? testimonial.nameAr : testimonial.nameEn}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                      const parent = (e.target as HTMLImageElement).parentElement;
                      if (parent) {
                        parent.innerHTML = `<span class="text-gold font-bold text-sm">${
                          (locale === 'ar' ? testimonial.nameAr : testimonial.nameEn).charAt(0)
                        }</span>`;
                      }
                    }}
                  />
                </div>
                <div>
                  <p className="font-semibold text-charcoal text-sm">
                    {locale === 'ar' ? testimonial.nameAr : testimonial.nameEn}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {testimonial.location}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
