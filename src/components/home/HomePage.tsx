'use client';

import { useState, useEffect } from 'react';
import { useLanguageStore } from '@/lib/stores';
import { Product } from '@/lib/types';
import HeroSlider from './HeroSlider';
import ProductSection from './ProductSection';
import OccasionGrid from './OccasionGrid';
import CategoryGrid from './CategoryGrid';
import TrustBanner from './TrustBanner';
import NewsletterSection from './NewsletterSection';
import TestimonialsSection from './TestimonialsSection';
import { Skeleton } from '@/components/ui/skeleton';

interface ProductSectionConfig {
  key: string;
  titleKey: string;
  query: string;
}

const PRODUCT_SECTIONS: ProductSectionConfig[] = [
  { key: 'bestSellers', titleKey: 'home.bestSellers', query: 'isBestSeller=true' },
  { key: 'newArrivals', titleKey: 'home.newArrivals', query: 'isNewArrival=true' },
  { key: 'featuredBouquets', titleKey: 'home.featuredBouquets', query: 'isFeatured=true' },
  { key: 'giftsForHer', titleKey: 'home.giftsForHer', query: 'occasion=valentine' },
  { key: 'giftsForHim', titleKey: 'home.giftsForHim', query: 'occasion=birthday' },
];

export default function HomePage() {
  const { locale } = useLanguageStore();
  const [sectionProducts, setSectionProducts] = useState<Record<string, Product[]>>({});
  const [sectionLoading, setSectionLoading] = useState<Record<string, boolean>>({});

  useEffect(() => {
    PRODUCT_SECTIONS.forEach((section) => {
      const fetchProducts = async () => {
        setSectionLoading((prev) => ({ ...prev, [section.key]: true }));
        try {
          const res = await fetch(`/api/products?${section.query}&limit=8`);
          if (res.ok) {
            const json = await res.json();
            const products = json.data?.products || json.products || [];
            setSectionProducts((prev) => ({
              ...prev,
              [section.key]: products,
            }));
          }
        } catch {
          setSectionProducts((prev) => ({ ...prev, [section.key]: [] }));
        }
        setSectionLoading((prev) => ({ ...prev, [section.key]: false }));
      };
      fetchProducts();
    });
  }, []);

  return (
    <div>
      <HeroSlider />
      <TrustBanner />

      {/* Best Sellers */}
      <ProductSection
        titleKey="home.bestSellers"
        products={sectionProducts.bestSellers || []}
        loading={sectionLoading.bestSellers || false}
      />

      <CategoryGrid />
      <OccasionGrid />

      {/* New Arrivals */}
      <ProductSection
        titleKey="home.newArrivals"
        products={sectionProducts.newArrivals || []}
        loading={sectionLoading.newArrivals || false}
      />

      {/* Featured Bouquets */}
      <ProductSection
        titleKey="home.featuredBouquets"
        products={sectionProducts.featuredBouquets || []}
        loading={sectionLoading.featuredBouquets || false}
      />

      <TestimonialsSection />

      {/* Gifts for Her */}
      <ProductSection
        titleKey="home.giftsForHer"
        products={sectionProducts.giftsForHer || []}
        loading={sectionLoading.giftsForHer || false}
      />

      <NewsletterSection />
    </div>
  );
}
