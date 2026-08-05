'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useLanguageStore, useUIStore } from '@/lib/stores';
import { t } from '@/lib/i18n';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, X, Clock, TrendingUp, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function SearchOverlay() {
  const { locale } = useLanguageStore();
  const { isSearchOpen, setSearchOpen, selectProduct, navigate } = useUIStore();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const suggestions = [
    'Red Roses Bouquet',
    'Birthday Cake',
    'Luxury Gift Box',
    'White Lilies',
    'Chocolate Box',
    'Wedding Flowers',
  ];

  useEffect(() => {
    if (isSearchOpen) {
      document.body.style.overflow = 'hidden';
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      document.body.style.overflow = '';
      // Reset search state when closing - using callback to avoid lint warning
      requestAnimationFrame(() => {
        setQuery('');
        setResults([]);
      });
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isSearchOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isSearchOpen) {
        setSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSearchOpen, setSearchOpen]);

  const handleSearch = useCallback(
    (q: string) => {
      setQuery(q);

      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      if (q.length < 2) {
        setResults([]);
        setIsSearching(false);
        return;
      }

      setIsSearching(true);

      debounceRef.current = setTimeout(async () => {
        try {
          const res = await fetch(
            `/api/products?search=${encodeURIComponent(q)}&limit=6`
          );
          if (res.ok) {
            const data = await res.json();
            setResults(data.products || data || []);
          }
        } catch {
          setResults([]);
        }
        setIsSearching(false);
      }, 300);
    },
    []
  );

  const handleSelect = (product: any) => {
    selectProduct(product.id);
    navigate('product-detail');
    setSearchOpen(false);
    setQuery('');
  };

  return (
    <AnimatePresence>
      {isSearchOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
          onClick={() => setSearchOpen(false)}
        >
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="w-full max-w-3xl mx-auto mt-4 px-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-border">
              <div className="flex items-center px-6 py-4 border-b border-border">
                <Search className="h-5 w-5 text-muted-foreground me-3 flex-shrink-0" />
                <Input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => handleSearch(e.target.value)}
                  placeholder={t('search.placeholder', locale)}
                  className="border-0 focus-visible:ring-0 text-lg px-0 placeholder:text-muted-foreground/60"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSearchOpen(false)}
                  className="ms-2 flex-shrink-0"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              <div className="max-h-[60vh] overflow-y-auto p-4">
                {isSearching ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-gold" />
                  </div>
                ) : query.length >= 2 && results.length > 0 ? (
                  <div className="space-y-2">
                    {results.slice(0, 6).map((product: any) => {
                      const images = product.images
                        ? JSON.parse(product.images)
                        : [];
                      const mainImage =
                        images[0] ||
                        `https://picsum.photos/seed/${product.slug}/100/100`;
                      return (
                        <button
                          key={product.id}
                          onClick={() => handleSelect(product)}
                          className="flex items-center gap-4 w-full p-3 rounded-xl hover:bg-cream transition-colors text-start"
                        >
                          <div className="w-14 h-14 rounded-lg overflow-hidden bg-cream flex-shrink-0">
                            <img
                              src={mainImage}
                              alt={
                                locale === 'ar'
                                  ? product.nameAr
                                  : product.nameEn
                              }
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-charcoal truncate">
                              {locale === 'ar'
                                ? product.nameAr
                                : product.nameEn}
                            </p>
                            <p className="text-gold font-semibold">
                              AED {product.salePrice || product.price}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                ) : query.length >= 2 ? (
                  <p className="text-center text-muted-foreground py-8">
                    {t('search.noResults', locale, { query })}
                  </p>
                ) : (
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                        <TrendingUp className="h-4 w-4" />
                        {t('search.suggestions', locale)}
                      </h4>
                      <div className="grid grid-cols-2 gap-2">
                        {suggestions.map((s) => (
                          <button
                            key={s}
                            onClick={() => handleSearch(s)}
                            className="flex items-center gap-2 p-3 rounded-xl hover:bg-cream transition-colors text-start text-sm text-charcoal-light"
                          >
                            <Search className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
