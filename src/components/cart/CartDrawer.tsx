'use client';

import { useState } from 'react';
import { useLanguageStore, useCartStore, useUIStore } from '@/lib/stores';
import { t } from '@/lib/i18n';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import CartItemRow from './CartItemRow';
import { ShoppingBag, Gift, Tag, ArrowRight, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function CartDrawer() {
  const { locale } = useLanguageStore();
  const {
    items,
    getSubtotal,
    getTotal,
    getItemCount,
    giftWrap,
    setGiftWrap,
    greetingCard,
    setGreetingCard,
    couponDiscount,
    removeCoupon,
    deliveryFee,
  } = useCartStore();
  const { isCartOpen, setCartOpen, navigate } = useUIStore();

  const [promoInput, setPromoInput] = useState('');
  const [promoLoading, setPromoLoading] = useState(false);

  const subtotal = getSubtotal();
  const total = getTotal();
  const itemCount = getItemCount();
  const freeDeliveryThreshold = 200;
  const remainingForFree = Math.max(0, freeDeliveryThreshold - subtotal);
  const giftWrapCost = giftWrap ? 15 : 0;

  const handleApplyCoupon = async () => {
    if (!promoInput.trim()) return;

    setPromoLoading(true);
    try {
      const res = await fetch('/api/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: promoInput.trim(), subtotal }),
      });

      if (res.ok) {
        const data = await res.json();
        useCartStore.getState().applyCoupon(promoInput.trim(), data.discount);
        toast.success(t('cart.codeApplied', locale));
        setPromoInput('');
      } else {
        const data = await res.json();
        toast.error(data.error || t('cart.invalidCode', locale));
      }
    } catch {
      toast.error(t('cart.invalidCode', locale));
    }
    setPromoLoading(false);
  };

  const handleRemoveCoupon = () => {
    removeCoupon();
    setPromoInput('');
  };

  return (
    <Sheet open={isCartOpen} onOpenChange={setCartOpen}>
      <SheetContent
        side={locale === 'ar' ? 'left' : 'right'}
        className="w-full sm:max-w-md flex flex-col p-0"
      >
        {/* Header */}
        <SheetHeader className="p-6 pb-4 border-b border-border">
          <div className="flex items-center justify-between">
            <SheetTitle className="flex items-center gap-2 text-xl font-bold">
              <ShoppingBag className="h-5 w-5 text-gold" />
              {t('cart.myCart', locale)}
              <span className="text-sm font-normal text-muted-foreground">
                ({itemCount})
              </span>
            </SheetTitle>
          </div>
        </SheetHeader>

        {items.length === 0 ? (
          /* Empty cart */
          <div className="flex-1 flex flex-col items-center justify-center p-6">
            <ShoppingBag className="h-16 w-16 text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground mb-4">
              {t('cart.cartEmpty', locale)}
            </p>
            <Button
              onClick={() => {
                setCartOpen(false);
                navigate('products');
              }}
              className="btn-luxury rounded-full"
            >
              {t('cart.continueShopping', locale)}
            </Button>
          </div>
        ) : (
          <>
            {/* Free delivery progress */}
            {remainingForFree > 0 && (
              <div className="px-6 py-3 bg-cream/50">
                <p className="text-xs text-muted-foreground">
                  {t('cart.freeDeliveryMsg', locale, { amount: remainingForFree })}
                </p>
                <div className="mt-1.5 h-1.5 bg-border rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gold rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(100, (subtotal / freeDeliveryThreshold) * 100)}%`,
                    }}
                  />
                </div>
              </div>
            )}

            {/* Cart items */}
            <div className="flex-1 overflow-y-auto px-6">
              {items.map((item) => (
                <CartItemRow key={item.productId} item={item} />
              ))}
            </div>

            {/* Gift wrap toggle */}
            <div className="px-6 py-3 bg-cream/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Gift className="h-4 w-4 text-gold" />
                  <span className="text-sm font-medium text-charcoal">
                    {t('cart.giftWrap', locale)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    {t('cart.giftWrapPrice', locale)}
                  </span>
                  <Switch checked={giftWrap} onCheckedChange={setGiftWrap} />
                </div>
              </div>

              {/* Greeting card */}
              {giftWrap && (
                <div className="mt-3">
                  <Textarea
                    value={greetingCard}
                    onChange={(e) => setGreetingCard(e.target.value)}
                    placeholder={t('cart.greetingCardMessage', locale)}
                    className="min-h-[60px] text-sm resize-none"
                  />
                </div>
              )}
            </div>

            {/* Promo code */}
            <div className="px-6 py-3 border-t border-border">
              {couponDiscount > 0 ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="bg-gold/10 text-gold border-gold/20">
                      {useCartStore.getState().couponCode}
                    </Badge>
                    <span className="text-sm text-destructive font-medium">
                      -AED {couponDiscount.toFixed(2)}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleRemoveCoupon}
                    className="text-xs text-muted-foreground h-auto p-0"
                  >
                    {t('cart.remove', locale)}
                  </Button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    <Tag className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      value={promoInput}
                      onChange={(e) => setPromoInput(e.target.value)}
                      placeholder={t('cart.promoCode', locale)}
                      className="ps-9 h-10 text-sm"
                      onKeyDown={(e) => e.key === 'Enter' && handleApplyCoupon()}
                    />
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleApplyCoupon}
                    disabled={promoLoading || !promoInput.trim()}
                    className="h-10"
                  >
                    {promoLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      t('cart.applyCode', locale)
                    )}
                  </Button>
                </div>
              )}
            </div>

            {/* Order summary */}
            <div className="px-6 py-4 border-t border-border bg-cream/30 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  {t('common.subtotal', locale)}
                </span>
                <span className="text-charcoal">AED {subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  {t('common.deliveryFee', locale)}
                </span>
                <span className="text-charcoal">
                  AED {remainingForFree <= 0 ? 0 : deliveryFee.toFixed(2)}
                </span>
              </div>
              {giftWrap && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    {t('cart.giftWrap', locale)}
                  </span>
                  <span className="text-charcoal">AED {giftWrapCost.toFixed(2)}</span>
                </div>
              )}
              {couponDiscount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-destructive">
                    {t('common.discount', locale)}
                  </span>
                  <span className="text-destructive">
                    -AED {couponDiscount.toFixed(2)}
                  </span>
                </div>
              )}
              <Separator className="my-2" />
              <div className="flex justify-between text-lg font-bold">
                <span className="text-charcoal">{t('common.total', locale)}</span>
                <span className="text-gold">
                  AED{' '}
                  {(
                    subtotal +
                    (remainingForFree <= 0 ? 0 : deliveryFee) +
                    giftWrapCost -
                    couponDiscount
                  ).toFixed(2)}
                </span>
              </div>
            </div>

            {/* Checkout button */}
            <div className="p-6 border-t border-border">
              <Button
                onClick={() => {
                  setCartOpen(false);
                  navigate('checkout');
                }}
                className="w-full btn-luxury rounded-xl h-12 text-base"
              >
                {t('common.checkout', locale)}
                <ArrowRight className="h-4 w-4 ms-2" />
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
