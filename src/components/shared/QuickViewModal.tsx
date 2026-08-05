'use client';

import { useLanguageStore, useCartStore, useUIStore } from '@/lib/stores';
import { t } from '@/lib/i18n';
import { Product } from '@/lib/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, ShoppingBag, Star, Truck, Eye } from 'lucide-react';
import { toast } from 'sonner';

export default function QuickViewModal() {
  const { locale } = useLanguageStore();
  const {
    quickViewProduct,
    setQuickViewProduct,
    selectProduct,
    navigate,
  } = useUIStore();
  const { addItem } = useCartStore();

  if (!quickViewProduct) return null;

  const product = quickViewProduct;
  const images = product.images ? JSON.parse(product.images) : [];
  const mainImage =
    images[0] || `https://picsum.photos/seed/${product.slug}/600/600`;

  const discount = product.salePrice
    ? Math.round(((product.price - product.salePrice) / product.price) * 100)
    : 0;

  const handleAddToCart = () => {
    addItem(product);
    toast.success(t('product.addedToCart', locale));
  };

  const handleViewFull = () => {
    setQuickViewProduct(null);
    selectProduct(product.id);
    navigate('product-detail');
  };

  return (
    <Dialog open={!!quickViewProduct} onOpenChange={() => setQuickViewProduct(null)}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden">
        <DialogHeader className="sr-only">
          <DialogTitle>
            {locale === 'ar' ? product.nameAr : product.nameEn}
          </DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 sm:grid-cols-2">
          {/* Image */}
          <div className="aspect-square bg-cream relative">
            <img
              src={mainImage}
              alt={locale === 'ar' ? product.nameAr : product.nameEn}
              className="w-full h-full object-cover"
              onError={(e) => { (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${product.slug}/400/400`; }}
            />
            {discount > 0 && (
              <Badge className="absolute top-3 start-3 bg-destructive text-white text-xs font-bold">
                -{discount}%
              </Badge>
            )}
            {product.isNewArrival && !discount && (
              <Badge className="absolute top-3 start-3 bg-gold text-white text-xs font-bold">
                {t('common.new', locale)}
              </Badge>
            )}
            {product.isBestSeller && (
              <Badge className="absolute top-3 end-3 bg-charcoal text-white text-xs font-bold">
                ★ {t('common.bestSeller', locale)}
              </Badge>
            )}
          </div>

          {/* Info */}
          <div className="p-6 flex flex-col justify-center">
            <h2 className="text-xl font-bold text-charcoal mb-2">
              {locale === 'ar' ? product.nameAr : product.nameEn}
            </h2>

            {/* Rating */}
            <div className="flex items-center gap-2 mb-3">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i < Math.floor(product.rating)
                        ? 'text-gold fill-gold'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">
                ({product.reviewCount})
              </span>
            </div>

            {/* Price */}
            <div className="flex items-center gap-3 mb-4">
              <span className="text-2xl font-bold text-gold">
                AED {product.salePrice || product.price}
              </span>
              {product.salePrice && (
                <span className="text-lg text-muted-foreground line-through">
                  AED {product.price}
                </span>
              )}
            </div>

            {/* Same day delivery */}
            {product.sameDayDelivery && (
              <div className="flex items-center gap-2 text-sm text-sage mb-4">
                <Truck className="h-4 w-4" />
                <span>{t('common.sameDayDelivery', locale)}</span>
              </div>
            )}

            {/* Description */}
            <p className="text-sm text-charcoal-light mb-6 line-clamp-3">
              {locale === 'ar' ? product.descriptionAr : product.descriptionEn}
            </p>

            {/* Actions */}
            <div className="flex gap-3">
              <Button onClick={handleAddToCart} className="flex-1 btn-luxury">
                <ShoppingBag className="h-4 w-4 me-2" />
                {t('common.addToCart', locale)}
              </Button>
              <Button variant="outline" size="icon" className="border-border shrink-0">
                <Heart className="h-4 w-4" />
              </Button>
            </div>

            <Button
              variant="link"
              onClick={handleViewFull}
              className="mt-2 text-gold hover:text-gold/80 p-0 h-auto"
            >
              <Eye className="h-4 w-4 me-1" />
              {t('common.seeMore', locale)}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
