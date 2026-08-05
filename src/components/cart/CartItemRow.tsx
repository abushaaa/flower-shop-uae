'use client';

import { useLanguageStore, useCartStore, useUIStore } from '@/lib/stores';
import { t } from '@/lib/i18n';
import { CartItem } from '@/lib/types';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CartItemRowProps {
  item: CartItem;
}

export default function CartItemRow({ item }: CartItemRowProps) {
  const { locale } = useLanguageStore();
  const { updateQuantity, removeItem } = useCartStore();
  const { selectProduct, navigate } = useUIStore();

  const images = item.product.images ? JSON.parse(item.product.images) : [];
  const image = images[0] || `https://picsum.photos/seed/${item.product.slug}/100/100`;

  return (
    <div className="flex gap-4 py-4 border-b border-border last:border-0">
      {/* Image */}
      <button
        onClick={() => { selectProduct(item.product.id); navigate('product-detail'); }}
        className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-cream flex-shrink-0"
      >
        <img
          src={image}
          alt={locale === 'ar' ? item.product.nameAr : item.product.nameEn}
          className="w-full h-full object-cover"
        />
      </button>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-charcoal text-sm line-clamp-2 mb-1">
          {locale === 'ar' ? item.product.nameAr : item.product.nameEn}
        </h4>
        <p className="text-gold font-semibold text-sm">
          AED {item.product.salePrice || item.product.price}
        </p>

        {/* Quantity controls */}
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center border border-border rounded-lg overflow-hidden">
            <button
              onClick={() => updateQuantity(item.productId, item.quantity - 1)}
              className="w-8 h-8 flex items-center justify-center hover:bg-cream transition-colors"
            >
              <Minus className="h-3 w-3" />
            </button>
            <span className="w-8 h-8 flex items-center justify-center text-sm font-medium">
              {item.quantity}
            </span>
            <button
              onClick={() => updateQuantity(item.productId, item.quantity + 1)}
              className="w-8 h-8 flex items-center justify-center hover:bg-cream transition-colors"
            >
              <Plus className="h-3 w-3" />
            </button>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-charcoal">
              AED {(item.product.salePrice || item.product.price) * item.quantity}
            </span>
            <button
              onClick={() => removeItem(item.productId)}
              className="text-muted-foreground hover:text-destructive transition-colors"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
