'use client';

import { useLanguageStore, useCartStore, useUIStore } from '@/lib/stores';
import { t } from '@/lib/i18n';
import { Product, Locale } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Heart, ShoppingBag, Star, Truck, Eye } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

interface ProductCardProps {
  product: Product;
  locale?: Locale;
}

export default function ProductCard({ product, locale: propLocale }: ProductCardProps) {
  const storeLocale = useLanguageStore((s) => s.locale);
  const locale = propLocale || storeLocale;
  const { addItem } = useCartStore();
  const { selectProduct, navigate, setQuickViewProduct } = useUIStore();

  const images = product.images ? JSON.parse(product.images) : [];
  const fallbackImg = `https://picsum.photos/seed/${product.slug}/400/400`;
  const mainImage = images[0] || fallbackImg;

  const discount = product.salePrice
    ? Math.round(((product.price - product.salePrice) / product.price) * 100)
    : 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addItem(product);
    toast.success(t('product.addedToCart', locale));
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.stopPropagation();
    setQuickViewProduct(product);
  };

  const handleClick = () => {
    selectProduct(product.id);
    navigate('product-detail');
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
      className="luxury-card bg-white rounded-2xl overflow-hidden group cursor-pointer"
      onClick={handleClick}
    >
      {/* Image */}
      <div className="relative aspect-square product-image-zoom bg-cream">
        <img
          src={mainImage}
          alt={locale === 'ar' ? product.nameAr : product.nameEn}
          className="w-full h-full object-cover"
          loading="lazy"
          onError={(e) => { (e.target as HTMLImageElement).src = fallbackImg; }}
        />

        {/* Badges top-left */}
        <div className="absolute top-3 start-3 flex flex-col gap-1.5 z-10">
          {discount > 0 && (
            <Badge className="bg-destructive text-white text-xs font-bold rounded-full px-2.5">
              -{discount}%
            </Badge>
          )}
          {product.isNewArrival && (
            <Badge className="bg-gold text-white text-xs font-bold rounded-full px-2.5">
              {t('common.new', locale)}
            </Badge>
          )}
          {product.isBestSeller && (
            <Badge className="bg-charcoal text-white text-xs font-bold rounded-full px-2.5">
              ★ {t('common.bestSeller', locale)}
            </Badge>
          )}
        </div>

        {/* Wishlist icon top-right */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleQuickView}
          className="absolute end-3 top-3 w-9 h-9 rounded-full bg-white shadow-md flex items-center justify-center hover:bg-cream transition-colors z-10"
        >
          <Heart className="h-4 w-4 text-charcoal" />
        </motion.button>

        {/* Add to cart button */}
        <div className="absolute bottom-0 start-0 end-0 p-3 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
          <Button
            onClick={handleAddToCart}
            className="w-full btn-luxury rounded-xl h-10 text-sm"
          >
            <ShoppingBag className="h-4 w-4 me-2" />
            {t('common.addToCart', locale)}
          </Button>
        </div>

        {/* Same day delivery badge */}
        {product.sameDayDelivery && (
          <div className="absolute bottom-3 start-3 flex items-center gap-1 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1 group-hover:opacity-0 transition-opacity">
            <Truck className="h-3 w-3 text-sage" />
            <span className="text-[10px] font-medium text-charcoal-light">
              {t('common.sameDayDelivery', locale)}
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="font-medium text-charcoal text-sm mb-1.5 line-clamp-2 leading-snug min-h-[2.5rem]">
          {locale === 'ar' ? product.nameAr : product.nameEn}
        </h3>

        {/* Rating */}
        <div className="flex items-center gap-1 mb-2">
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-3 w-3 ${
                  i < Math.floor(product.rating)
                    ? 'text-gold fill-gold'
                    : 'text-gray-200'
                }`}
              />
            ))}
          </div>
          <span className="text-[11px] text-muted-foreground">
            ({product.reviewCount})
          </span>
        </div>

        {/* Price */}
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold text-gold">
            AED {product.salePrice || product.price}
          </span>
          {product.salePrice && (
            <span className="text-sm text-muted-foreground line-through">
              AED {product.price}
            </span>
          )}
        </div>

        {product.stock <= 5 && product.stock > 0 && (
          <p className="text-xs text-destructive mt-1">
            {t('common.limitedStock', locale, { count: product.stock })}
          </p>
        )}
      </div>
    </motion.div>
  );
}
