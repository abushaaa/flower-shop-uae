'use client';

import { useLanguageStore } from '@/lib/stores';
import { Button } from '@/components/ui/button';
import { Globe } from 'lucide-react';

export default function LanguageSwitcher() {
  const { locale, toggleLocale } = useLanguageStore();

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleLocale}
      className="relative flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-charcoal-light hover:text-gold hover:bg-cream transition-colors rounded-full"
    >
      <Globe className="h-4 w-4" />
      <span className={`font-semibold transition-colors ${locale === 'ar' ? 'text-gold' : 'text-charcoal-light'}`}>
        AR
      </span>
      <span className="text-muted-foreground">|</span>
      <span className={`font-semibold transition-colors ${locale === 'en' ? 'text-gold' : 'text-charcoal-light'}`}>
        EN
      </span>
    </Button>
  );
}
