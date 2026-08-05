'use client';

import { useLanguageStore } from '@/lib/stores';
import { t } from '@/lib/i18n';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send, Flower2 } from 'lucide-react';

export default function NewsletterSection() {
  const { locale } = useLanguageStore();

  return (
    <section className="py-16 sm:py-24 bg-cream relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 start-0 w-32 h-32 bg-gold/10 rounded-full -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 end-0 w-48 h-48 bg-gold/5 rounded-full translate-x-1/3 translate-y-1/3" />

      <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-gold/10 flex items-center justify-center">
          <Flower2 className="h-8 w-8 text-gold" />
        </div>
        <h2 className="text-2xl sm:text-4xl font-bold text-charcoal mb-3">
          {t('home.newsletterTitle', locale)}
        </h2>
        <p className="text-charcoal-light/70 mb-8 max-w-md mx-auto">
          {t('home.newsletterSubtitle', locale)}
        </p>
        <div className="flex gap-3 max-w-md mx-auto">
          <Input
            placeholder={t('home.enterEmail', locale)}
            className="bg-white border-border rounded-full focus-visible:ring-gold h-12"
          />
          <Button className="btn-luxury rounded-full px-6 h-12 whitespace-nowrap">
            <Send className="h-4 w-4 me-2" />
            {t('home.subscribe', locale)}
          </Button>
        </div>
      </div>
    </section>
  );
}
