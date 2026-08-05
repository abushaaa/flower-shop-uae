'use client';

import { useState, useEffect } from 'react';
import { useLanguageStore, useCartStore, useUIStore, useAuthStore } from '@/lib/stores';
import { t } from '@/lib/i18n';
import { Product, Review } from '@/lib/types';
import ProductCard from './ProductCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Star, Heart, ShoppingBag, Share2, Truck, ShieldCheck, Minus, Plus, ArrowLeft, Calendar, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export default function ProductDetail() {
  const { locale } = useLanguageStore();
  const { addItem } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const { selectedProductId, goBack, navigate } = useUIStore();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [reviewForm, setReviewForm] = useState({ rating: 5, title: '', comment: '' });
  const [showReviewForm, setShowReviewForm] = useState(false);

  useEffect(() => {
    if (!selectedProductId) return;
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/products/${selectedProductId}`);
        if (res.ok) {
          const data = await res.json();
          setProduct(data);
        }
      } catch {
        setProduct(null);
      }
      setLoading(false);
      setQuantity(1);
      setSelectedImage(0);
    };
    fetchProduct();
  }, [selectedProductId]);

  useEffect(() => {
    if (!product?.categoryId) return;
    const fetchRelated = async () => {
      try {
        const params = new URLSearchParams();
        params.set('categoryId', product.categoryId);
        params.set('limit', '4');
        params.set('exclude', product.id);
        const res = await fetch(`/api/products?${params.toString()}`);
        if (res.ok) {
          const data = await res.json();
          setRelatedProducts(
            (data.products || [])
              .filter((p: Product) => p.id !== product.id)
              .slice(0, 4)
          );
        }
      } catch {
        /* ignore */
      }
    };
    fetchRelated();
  }, [product?.categoryId, product?.id]);

  const images = product?.images ? JSON.parse(product.images) : [];
  const mainImage = images[0] || `/placeholder-product.jpg`;

  const discount =
    product && product.salePrice
      ? Math.round(((product.price - product.salePrice) / product.price) * 100)
      : 0;

  const handleAddToCart = () => {
    if (!product) return;
    addItem(product, quantity);
    toast.success(t('product.addedToCart', locale));
  };

  const handleBuyNow = () => {
    if (!product) return;
    addItem(product, quantity);
    navigate('checkout');
  };

  const handleToggleWishlist = () => {
    setIsWishlisted(!isWishlisted);
    toast.success(isWishlisted ? 'Removed from wishlist' : 'Added to wishlist');
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: locale === 'ar' ? product?.nameAr : product?.nameEn,
          url: window.location.href,
        });
      } catch {
        /* user cancelled */
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
  };

  const handleSubmitReview = () => {
    toast.success('Review submitted for approval!');
    setShowReviewForm(false);
    setReviewForm({ rating: 5, title: '', comment: '' });
  };

  const stockStatus = (stock: number) => {
    if (stock === 0) return { text: t('common.outOfStock', locale), color: 'bg-red-100 text-red-700' };
    if (stock <= 5) return { text: t('common.limitedStock', locale, { count: stock }), color: 'bg-orange-100 text-orange-700' };
    return { text: t('common.inStock', locale), color: 'bg-green-100 text-green-700' };
  };

  // Loading skeleton
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <Skeleton className="aspect-square rounded-2xl" />
          <div className="space-y-4">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-6 w-1/4" />
            <Skeleton className="h-10 w-1/3" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground text-lg">{t('common.noResults', locale)}</p>
        <Button onClick={goBack} className="mt-4 btn-luxury rounded-full">
          {t('common.back', locale)}
        </Button>
      </div>
    );
  }

  const stock = stockStatus(product.stock);

  const renderStars = (rating: number, size: string = 'h-4 w-4') => (
    <div className="flex">
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          className={`${size} ${
            i < Math.floor(rating)
              ? 'text-gold fill-gold'
              : i < rating
              ? 'text-gold fill-gold/50'
              : 'text-gray-200'
          }`}
        />
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Breadcrumbs */}
      <div className="bg-cream/50 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <nav className="flex items-center gap-2 text-sm text-muted-foreground">
            <button
              onClick={() => navigate('home')}
              className="hover:text-gold transition-colors"
            >
              {t('common.home', locale)}
            </button>
            <span className="text-border">/</span>
            <button
              onClick={() => navigate('products')}
              className="hover:text-gold transition-colors"
            >
              {t('common.allProducts', locale)}
            </button>
            <span className="text-border">/</span>
            <span className="text-charcoal font-medium line-clamp-1 max-w-[200px]">
              {locale === 'ar' ? product.nameAr : product.nameEn}
            </span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back button mobile */}
        <Button
          variant="ghost"
          onClick={goBack}
          className="mb-4 lg:hidden gap-2 text-charcoal-light"
        >
          <ArrowLeft className="h-4 w-4" />
          {t('common.back', locale)}
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Image gallery */}
          <div className="space-y-4">
            <motion.div
              key={selectedImage}
              initial={{ opacity: 0.8 }}
              animate={{ opacity: 1 }}
              className="aspect-square rounded-2xl overflow-hidden bg-cream relative group"
            >
              <img
                src={images[selectedImage] || mainImage}
                alt={locale === 'ar' ? product.nameAr : product.nameEn}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                onError={(e) => { (e.target as HTMLImageElement).src = mainImage; }}
              />
              {discount > 0 && (
                <Badge className="absolute top-4 start-4 bg-destructive text-white font-bold rounded-full">
                  -{discount}%
                </Badge>
              )}
              {product.isNewArrival && (
                <Badge className="absolute top-4 end-4 bg-gold text-white font-bold rounded-full">
                  {t('common.new', locale)}
                </Badge>
              )}
            </motion.div>
            {images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {images.map((img: string, i: number) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`w-20 h-20 rounded-xl overflow-hidden border-2 flex-shrink-0 transition-all ${
                      i === selectedImage
                        ? 'border-gold shadow-sm'
                        : 'border-border hover:border-gold/50 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).src = mainImage; }} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product info */}
          <div className="flex flex-col">
            {/* Badges */}
            <div className="flex flex-wrap gap-2 mb-3">
              {product.isNewArrival && (
                <Badge className="bg-gold text-white">{t('common.new', locale)}</Badge>
              )}
              {product.isBestSeller && (
                <Badge variant="secondary" className="bg-charcoal text-white">
                  ★ {t('common.bestSeller', locale)}
                </Badge>
              )}
              {product.isFeatured && (
                <Badge variant="outline" className="border-gold text-gold">
                  {t('common.featured', locale)}
                </Badge>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold text-charcoal mb-2 leading-tight">
              {locale === 'ar' ? product.nameAr : product.nameEn}
            </h1>

            {/* Rating */}
            <div className="flex items-center gap-3 mb-4">
              {renderStars(product.rating)}
              <span className="text-sm text-muted-foreground">
                {product.rating} ({product.reviewCount} {t('common.reviews', locale)})
              </span>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3 mb-6">
              <span className="text-3xl font-bold text-gold">
                AED {product.salePrice || product.price}
              </span>
              {product.salePrice && (
                <>
                  <span className="text-xl text-muted-foreground line-through">
                    AED {product.price}
                  </span>
                  <Badge className="bg-destructive/10 text-destructive border-0">
                    {t('common.save', locale, { percent: discount })}
                  </Badge>
                </>
              )}
            </div>

            {/* Stock + delivery badges */}
            <div className="flex flex-wrap items-center gap-2 mb-6">
              <Badge variant="outline" className={stock.color}>
                {product.stock > 0 && <span className="w-1.5 h-1.5 rounded-full bg-current me-1.5" />}
                {stock.text}
              </Badge>
              {product.sameDayDelivery && (
                <Badge variant="outline" className="border-sage text-sage">
                  <Truck className="h-3 w-3 me-1" />
                  {t('common.sameDayDelivery', locale)}
                </Badge>
              )}
            </div>

            <Separator className="mb-6" />

            {/* Quantity selector */}
            <div className="flex items-center gap-4 mb-6">
              <Label className="text-sm font-medium text-charcoal">
                {t('common.quantity', locale)}
              </Label>
              <div className="flex items-center border border-border rounded-xl overflow-hidden">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                  className="w-10 h-10 flex items-center justify-center hover:bg-cream transition-colors disabled:opacity-40"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="w-12 h-10 flex items-center justify-center font-semibold text-charcoal border-x border-border">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(Math.min(Math.min(product.stock, 10), quantity + 1))}
                  disabled={quantity >= Math.min(product.stock, 10)}
                  className="w-10 h-10 flex items-center justify-center hover:bg-cream transition-colors disabled:opacity-40"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              <span className="text-xs text-muted-foreground">
                (max 10)
              </span>
            </div>

            {/* Action buttons */}
            <div className="flex gap-3 mb-6">
              <Button
                onClick={handleAddToCart}
                className="flex-1 btn-luxury rounded-xl h-12 text-base"
                disabled={product.stock === 0}
              >
                <ShoppingBag className="h-5 w-5 me-2" />
                {t('common.addToCart', locale)}
              </Button>
              <Button
                variant="outline"
                onClick={handleBuyNow}
                className="flex-1 rounded-xl h-12 text-base border-gold text-gold hover:bg-gold/10"
                disabled={product.stock === 0}
              >
                {t('common.buyNow', locale)}
              </Button>
            </div>

            {/* Wishlist + Share */}
            <div className="flex items-center gap-4 mb-6">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleToggleWishlist}
                className={`gap-2 ${isWishlisted ? 'text-destructive' : 'text-charcoal-light'}`}
              >
                <Heart className={`h-4 w-4 ${isWishlisted ? 'fill-destructive' : ''}`} />
                {t('common.wishlist', locale)}
              </Button>
              <Button variant="ghost" size="sm" onClick={handleShare} className="gap-2 text-charcoal-light">
                <Share2 className="h-4 w-4" />
                {t('common.share', locale)}
              </Button>
            </div>

            <Separator className="mb-6" />

            {/* Product meta */}
            <div className="grid grid-cols-2 gap-3 text-sm mb-6">
              <div className="flex items-start gap-2">
                <span className="text-muted-foreground">{t('product.sku', locale)}:</span>
                <span className="font-medium text-charcoal">{product.sku}</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-muted-foreground">{t('product.category', locale)}:</span>
                <span className="font-medium text-charcoal">
                  {product.category
                    ? locale === 'ar'
                      ? product.category.nameAr
                      : product.category.nameEn
                    : '—'}
                </span>
              </div>
              {product.tags && product.tags !== '[]' && (
                <div className="col-span-2 flex items-start gap-2">
                  <span className="text-muted-foreground">{t('product.tags', locale)}:</span>
                  <div className="flex flex-wrap gap-1">
                    {JSON.parse(product.tags).map((tag: string, i: number) => (
                      <Badge key={i} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Delivery info */}
            <div className="bg-cream/50 rounded-xl p-4 space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <Truck className="h-5 w-5 text-gold flex-shrink-0" />
                <div>
                  <p className="font-medium text-charcoal">{t('product.deliveryInfo', locale)}</p>
                  <p className="text-muted-foreground text-xs">
                    {product.sameDayDelivery
                      ? t('common.sameDayDelivery', locale)
                      : '2-3 business days delivery across UAE'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <MapPin className="h-5 w-5 text-gold flex-shrink-0" />
                <div>
                  <p className="font-medium text-charcoal">All 7 Emirates</p>
                  <p className="text-muted-foreground text-xs">
                    Dubai, Abu Dhabi, Sharjah, and more
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <ShieldCheck className="h-5 w-5 text-gold flex-shrink-0" />
                <div>
                  <p className="font-medium text-charcoal">100% Freshness Guarantee</p>
                  <p className="text-muted-foreground text-xs">
                    Photo of the arrangement before delivery
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Description & Reviews tabs */}
        <div className="mt-12">
          <Tabs defaultValue="description">
            <TabsList className="w-full justify-start border-b border-border bg-transparent rounded-none h-auto p-0">
              <TabsTrigger
                value="description"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-gold data-[state=active]:text-gold data-[state=active]:shadow-none px-4 pb-3 pt-0 text-charcoal-light"
              >
                {t('product.description', locale)}
              </TabsTrigger>
              <TabsTrigger
                value="reviews"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-gold data-[state=active]:text-gold data-[state=active]:shadow-none px-4 pb-3 pt-0 text-charcoal-light"
              >
                {t('product.reviews', locale)} ({product.reviewCount})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="description" className="pt-6">
              <div className="max-w-3xl">
                <p className="text-charcoal-light leading-relaxed whitespace-pre-line">
                  {locale === 'ar' ? product.descriptionAr : product.descriptionEn}
                </p>
              </div>
            </TabsContent>

            <TabsContent value="reviews" className="pt-6">
              {/* Average rating display */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 mb-8 p-6 bg-cream/50 rounded-2xl">
                <div className="text-center">
                  <div className="text-4xl font-bold text-charcoal">{product.rating}</div>
                  <div className="mt-1">{renderStars(product.rating, 'h-5 w-5')}</div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {product.reviewCount} {t('common.reviews', locale)}
                  </p>
                </div>
                <Separator orientation="vertical" className="hidden sm:block h-16" />
                <div className="flex-1">
                  {[5, 4, 3, 2, 1].map((stars) => (
                    <div key={stars} className="flex items-center gap-2 mb-1">
                      <span className="text-sm text-muted-foreground w-6">{stars}</span>
                      <Star className="h-3 w-3 text-gold fill-gold" />
                      <div className="flex-1 h-2 bg-border rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gold rounded-full"
                          style={{ width: `${stars === 5 ? 60 : stars === 4 ? 25 : stars === 3 ? 10 : stars === 2 ? 3 : 2}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Write review button */}
              {isAuthenticated && (
                <div className="mb-8">
                  {!showReviewForm ? (
                    <Button
                      variant="outline"
                      onClick={() => setShowReviewForm(true)}
                      className="rounded-xl border-gold text-gold hover:bg-gold/10 gap-2"
                    >
                      <Star className="h-4 w-4" />
                      {t('product.writeReview', locale)}
                    </Button>
                  ) : (
                    <div className="bg-white rounded-2xl p-6 border border-border max-w-lg">
                      <h3 className="font-bold text-charcoal mb-4">{t('product.writeReview', locale)}</h3>
                      <div className="space-y-4">
                        <div>
                          <Label>Rating</Label>
                          <div className="flex gap-1 mt-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button key={star} onClick={() => setReviewForm({ ...reviewForm, rating: star })}>
                                <Star
                                  className={`h-6 w-6 transition-colors ${
                                    star <= reviewForm.rating
                                      ? 'text-gold fill-gold'
                                      : 'text-gray-200 hover:text-gold/50'
                                  }`}
                                />
                              </button>
                            ))}
                          </div>
                        </div>
                        <div>
                          <Label>Review Title</Label>
                          <Input
                            value={reviewForm.title}
                            onChange={(e) => setReviewForm({ ...reviewForm, title: e.target.value })}
                            className="mt-1 rounded-xl"
                            placeholder="Summarize your experience"
                          />
                        </div>
                        <div>
                          <Label>Your Review</Label>
                          <Textarea
                            value={reviewForm.comment}
                            onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                            className="mt-1 rounded-xl"
                            rows={4}
                            placeholder="Tell us about the product..."
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button onClick={handleSubmitReview} className="btn-luxury rounded-xl">
                            {t('common.submit', locale)}
                          </Button>
                          <Button variant="outline" onClick={() => setShowReviewForm(false)} className="rounded-xl">
                            {t('common.cancel', locale)}
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Reviews list */}
              {product.reviews && product.reviews.length > 0 ? (
                <div className="space-y-4 max-w-2xl">
                  {product.reviews.map((review) => (
                    <div key={review.id} className="bg-white rounded-xl p-5 border border-border">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gold/10 flex items-center justify-center">
                            <span className="text-gold font-bold text-sm">
                              {review.user?.name?.charAt(0) || 'U'}
                            </span>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-charcoal">
                              {review.user?.name || 'Anonymous'}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(review.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        {renderStars(review.rating, 'h-3.5 w-3.5')}
                      </div>
                      {review.title && (
                        <h4 className="font-semibold text-charcoal text-sm mb-1">{review.title}</h4>
                      )}
                      {review.comment && (
                        <p className="text-sm text-charcoal-light leading-relaxed">{review.comment}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Star className="h-12 w-12 text-gold/20 mx-auto mb-4" />
                  <p className="text-muted-foreground">{t('product.noReviews', locale)}</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* Related products */}
        {relatedProducts.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-charcoal mb-6">
              {t('product.relatedProducts', locale)}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
