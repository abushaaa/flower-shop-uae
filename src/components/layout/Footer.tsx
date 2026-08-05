'use client';

import { useLanguageStore, useUIStore } from '@/lib/stores';
import { t } from '@/lib/i18n';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Flower2, Facebook, Instagram, Twitter, Send, CreditCard, Smartphone, MessageCircle } from 'lucide-react';

export default function Footer() {
  const { locale } = useLanguageStore();
  const { navigate } = useUIStore();

  const quickLinkItems = [
    { key: 'home', view: 'home' as const },
    { key: 'shop', view: 'products' as const },
    { key: 'allProducts', view: 'products' as const },
    { key: 'sameDayDelivery', view: 'products' as const },
  ];

  const customerServiceItems = [
    'contactUs',
    'faq',
    'shippingPolicy',
    'returnPolicy',
    'privacyPolicy',
    'termsOfService',
  ];

  return (
    <footer className="bg-charcoal text-white/80">
      {/* Newsletter section */}
      <div className="bg-gradient-to-r from-gold/20 via-gold/10 to-gold/20 border-y border-gold/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="text-center max-w-xl mx-auto">
            <h3 className="text-2xl font-bold text-white mb-2">
              {t('home.newsletterTitle', locale)}
            </h3>
            <p className="text-white/60 text-sm mb-6">
              {t('home.newsletterSubtitle', locale)}
            </p>
            <div className="flex gap-2">
              <Input
                placeholder={t('home.enterEmail', locale)}
                className="bg-white/10 border-white/20 text-white placeholder:text-white/40 rounded-full focus-visible:ring-gold"
              />
              <Button className="btn-luxury rounded-full px-6 whitespace-nowrap">
                <Send className="h-4 w-4 me-2" />
                {t('home.subscribe', locale)}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main footer content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* About */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Flower2 className="h-6 w-6 text-gold" />
              <span className="text-xl font-bold text-white">Bloom & Gift</span>
            </div>
            <p className="text-white/50 text-sm leading-relaxed mb-4">
              {t('footer.aboutText', locale)}
            </p>
            <div className="flex gap-3">
              {[Instagram, Facebook, Twitter].map((Icon, i) => (
                <button
                  key={i}
                  className="w-9 h-9 rounded-full bg-white/10 hover:bg-gold transition-colors flex items-center justify-center"
                  aria-label="Social media"
                >
                  <Icon className="h-4 w-4" />
                </button>
              ))}
              <a
                href="https://wa.me/971501234567"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-green-500 transition-colors flex items-center justify-center"
                aria-label="WhatsApp"
              >
                <MessageCircle className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">
              {t('footer.quickLinks', locale)}
            </h4>
            <ul className="space-y-2.5">
              {quickLinkItems.map((item) => (
                <li key={item.key}>
                  <button
                    onClick={() => navigate(item.view)}
                    className="text-white/50 hover:text-gold transition-colors text-sm"
                  >
                    {t(`common.${item.key}`, locale)}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">
              {t('footer.customerService', locale)}
            </h4>
            <ul className="space-y-2.5">
              {customerServiceItems.map((key) => (
                <li key={key}>
                  <button className="text-white/50 hover:text-gold transition-colors text-sm">
                    {t(`footer.${key}`, locale)}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact / Follow Us */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">
              {t('footer.followUs', locale)}
            </h4>
            <ul className="space-y-3 text-sm text-white/50">
              <li className="flex items-center gap-2">
                <span>📍</span>
                <span>Dubai, UAE</span>
              </li>
              <li className="flex items-center gap-2">
                <span>📞</span>
                <span>+971 50 123 4567</span>
              </li>
              <li className="flex items-center gap-2">
                <span>✉️</span>
                <span>hello@bloomgift.ae</span>
              </li>
              <li className="flex items-center gap-2">
                <span>🕐</span>
                <span>9AM - 10PM Daily</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-white/40 text-sm">
              {t('footer.copyright', locale)}
            </p>
            <div className="flex items-center gap-3 flex-wrap justify-center">
              <span className="text-xs text-white/50 mb-1 sm:mb-0">
                {t('footer.paymentMethods', locale)}:
              </span>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-md">
                <CreditCard className="h-4 w-4 text-white/60" />
                <span className="text-xs text-white/60">Visa</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-md">
                <CreditCard className="h-4 w-4 text-white/60" />
                <span className="text-xs text-white/60">Mastercard</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-md">
                <Smartphone className="h-4 w-4 text-white/60" />
                <span className="text-xs text-white/60">Apple Pay</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-md">
                <span className="text-xs text-white/60">💵</span>
                <span className="text-xs text-white/60">COD</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
