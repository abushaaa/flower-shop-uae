'use client';

import { useState, useEffect } from 'react';
import { useLanguageStore, useCartStore, useUIStore } from '@/lib/stores';
import { t } from '@/lib/i18n';
import { Product, Category } from '@/lib/types';
import ProductCard from './ProductCard';
import ProductFilters, { FilterState } from './ProductFilters';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { SlidersHorizontal, X, ChevronLeft, ChevronRight, Home } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ProductGrid() {
  const { locale } = useLanguageStore();
  const { selectedCategory, navigate, goBack } = useUIStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<FilterState>({ sort: 'newest' });

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await fetch('/api/categories');
        if (res.ok && !cancelled) {
          const data = await res.json();
          setCategories(Array.isArray(data) ? data : data.categories || []);
        }
      } catch {
        if (!cancelled) setCategories([]);
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        params.set('page', String(page));
        params.set('limit', '12');
        if (filters.sort) params.set('sort', filters.sort);
        if (filters.minPrice) params.set('minPrice', filters.minPrice);
        if (filters.maxPrice) params.set('maxPrice', filters.maxPrice);
        if (filters.occasion) params.set('occasion', filters.occasion);
        if (filters.color) params.set('color', filters.color);
        if (filters.categories && filters.categories.length > 0) {
          params.set('categoryId', filters.categories[0]);
        }
        if (selectedCategory) {
          params.set('category', selectedCategory);
        }

        const res = await fetch(`/api/products?${params.toString()}`);
        if (res.ok && !cancelled) {
          const data = await res.json();
          setProducts(data.products || []);
          setTotal(data.total || 0);
        }
      } catch {
        if (!cancelled) setProducts([]);
      }
      if (!cancelled) setLoading(false);
    };
    load();
    return () => { cancelled = true; };
  }, [page, filters, selectedCategory]);

  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters);
    setPage(1);
  };

  const handleClearFilters = () => {
    setFilters({ sort: 'newest' });
    setPage(1);
  };

  const totalPages = Math.ceil(total / 12);

  // Get page numbers to show in pagination
  const getPageNumbers = () => {
    const pages: number[] = [];
    const maxVisible = 5;
    let start = Math.max(1, page - Math.floor(maxVisible / 2));
    const end = Math.min(totalPages, start + maxVisible - 1);
    start = Math.max(1, end - maxVisible + 1);
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  return (
    <div className="min-h-screen">
      {/* Breadcrumbs */}
      <div className="bg-cream/50 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <nav className="flex items-center gap-2 text-sm text-muted-foreground">
            <button
              onClick={() => navigate('home')}
              className="hover:text-gold transition-colors flex items-center gap-1"
            >
              <Home className="h-3.5 w-3.5" />
              {t('common.home', locale)}
            </button>
            <span className="text-border">/</span>
            <span className="text-charcoal font-medium">
              {selectedCategory
                ? categories.find((c) => c.slug === selectedCategory)
                    ? locale === 'ar'
                      ? categories.find((c) => c.slug === selectedCategory)!.nameAr
                      : categories.find((c) => c.slug === selectedCategory)!.nameEn
                    : t('common.allProducts', locale)
                : t('common.allProducts', locale)}
            </span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-charcoal">
              {selectedCategory
                ? categories.find((c) => c.slug === selectedCategory)
                    ? locale === 'ar'
                      ? categories.find((c) => c.slug === selectedCategory)!.nameAr
                      : categories.find((c) => c.slug === selectedCategory)!.nameEn
                    : t('common.allProducts', locale)
                : t('common.allProducts', locale)}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {t('filter.showing', locale, { count: total })}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden gap-2"
            >
              <SlidersHorizontal className="h-4 w-4" />
              {t('common.filters', locale)}
            </Button>
          </div>
        </div>

        <div className="flex gap-8">
          {/* Desktop filters sidebar */}
          <div className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-24">
              <ProductFilters
                categories={categories}
                selectedFilters={filters}
                onFilterChange={handleFilterChange}
                onClear={handleClearFilters}
              />
            </div>
          </div>

          {/* Mobile filter sheet */}
          <AnimatePresence>
            {showFilters && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-black/50 z-50 lg:hidden"
                  onClick={() => setShowFilters(false)}
                />
                <motion.div
                  initial={{ y: '100%' }}
                  animate={{ y: 0 }}
                  exit={{ y: '100%' }}
                  transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                  className="fixed inset-x-0 bottom-0 bg-white rounded-t-3xl z-50 max-h-[80vh] overflow-y-auto lg:hidden"
                >
                  <div className="flex items-center justify-between p-4 border-b border-border sticky top-0 bg-white rounded-t-3xl z-10">
                    <h3 className="font-semibold text-charcoal">
                      {t('common.filters', locale)}
                    </h3>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleClearFilters}
                        className="text-destructive text-xs"
                      >
                        {t('filter.clearAll', locale)}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setShowFilters(false)}
                      >
                        <X className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                  <div className="p-4">
                    <ProductFilters
                      categories={categories}
                      selectedFilters={filters}
                      onFilterChange={(f) => {
                        handleFilterChange(f);
                        setShowFilters(false);
                      }}
                      onClear={() => {
                        handleClearFilters();
                        setShowFilters(false);
                      }}
                      isMobile
                    />
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>

          {/* Product grid */}
          <div className="flex-1 min-w-0">
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="space-y-3">
                    <Skeleton className="aspect-square rounded-2xl" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-20">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-cream flex items-center justify-center">
                  <SlidersHorizontal className="h-8 w-8 text-muted-foreground/40" />
                </div>
                <p className="text-muted-foreground text-lg mb-2">
                  {t('common.noResults', locale)}
                </p>
                <p className="text-muted-foreground text-sm mb-4">
                  Try adjusting your filters
                </p>
                <Button
                  variant="outline"
                  onClick={handleClearFilters}
                  className="rounded-full"
                >
                  {t('filter.clearAll', locale)}
                </Button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-8">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page <= 1}
                      onClick={() => setPage(page - 1)}
                      className="rounded-xl gap-1"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      {t('common.previous', locale)}
                    </Button>

                    {getPageNumbers().map((p) => (
                      <Button
                        key={p}
                        variant={page === p ? 'default' : 'outline'}
                        onClick={() => setPage(p)}
                        className={
                          page === p
                            ? 'bg-gold hover:bg-gold text-white rounded-xl w-9 h-9 p-0'
                            : 'rounded-xl w-9 h-9 p-0'
                        }
                      >
                        {p}
                      </Button>
                    ))}

                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page >= totalPages}
                      onClick={() => setPage(page + 1)}
                      className="rounded-xl gap-1"
                    >
                      {t('common.next', locale)}
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
