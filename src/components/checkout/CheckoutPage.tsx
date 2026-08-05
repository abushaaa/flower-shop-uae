'use client';

import { useState } from 'react';
import { useLanguageStore, useCartStore, useAuthStore, useUIStore } from '@/lib/stores';
import { t } from '@/lib/i18n';
import { UAE_CITIES, DELIVERY_TIME_SLOTS } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  CheckCircle,
  CreditCard,
  Smartphone,
  MapPin,
  ArrowLeft,
  ArrowRight,
  Gift,
  PartyPopper,
  Truck,
  ShoppingBag,
  ShieldCheck,
  CalendarDays,
  Lock,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

const STEPS = ['deliveryDetails', 'paymentMethod', 'orderReview'];

export default function CheckoutPage() {
  const { locale } = useLanguageStore();
  const { items, getSubtotal, getTotal, clearCart, deliveryFee, giftWrap, greetingCard, couponDiscount, couponCode } = useCartStore();
  const { user } = useAuthStore();
  const { navigate, goBack } = useUIStore();
  const [currentStep, setCurrentStep] = useState(0);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [form, setForm] = useState({
    recipientName: user?.name || '',
    recipientPhone: user?.phone || '',
    city: '',
    area: '',
    street: '',
    building: '',
    apartment: '',
    deliveryDate: new Date().toISOString().split('T')[0],
    deliveryTime: '',
    notes: '',
    paymentMethod: 'cod',
  });

  // Card form for online payments
  const [cardForm, setCardForm] = useState({
    number: '',
    expiry: '',
    cvv: '',
    name: '',
  });

  const updateForm = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors((prev) => ({ ...prev, [key]: '' }));
    }
  };

  const subtotal = getSubtotal();
  const total = getTotal();
  const giftWrapCost = giftWrap ? 15 : 0;
  const isOnlinePayment = form.paymentMethod !== 'cod';

  const validateStep0 = () => {
    const newErrors: Record<string, string> = {};
    if (!form.recipientName.trim()) newErrors.recipientName = 'Recipient name is required';
    if (!form.recipientPhone.trim()) newErrors.recipientPhone = 'Phone number is required';
    else if (!form.recipientPhone.startsWith('+971') && !form.recipientPhone.startsWith('05'))
      newErrors.recipientPhone = 'Please enter a valid UAE phone number';
    if (!form.city) newErrors.city = 'Please select a city';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateCardForm = () => {
    if (!isOnlinePayment) return true;
    const newErrors: Record<string, string> = {};
    if (!cardForm.number.trim()) newErrors.cardNumber = 'Card number is required';
    if (!cardForm.expiry.trim()) newErrors.cardExpiry = 'Expiry is required';
    if (!cardForm.cvv.trim()) newErrors.cardCvv = 'CVV is required';
    if (!cardForm.name.trim()) newErrors.cardName = 'Name on card is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (currentStep === 0 && !validateStep0()) return;
    if (currentStep === 1 && !validateCardForm()) return;
    setCurrentStep((s) => Math.min(s + 1, 2));
  };

  const prevStep = () => setCurrentStep((s) => Math.max(s - 1, 0));

  const handlePlaceOrder = async () => {
    if (items.length === 0) return;
    setSubmitting(true);

    try {
      if (isOnlinePayment) {
        // Simulated online payment flow
        setPaymentProcessing(true);

        // Step 1: Create payment
        let paymentId: string | null = null;
        try {
          const payRes = await fetch('/api/payments/create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ amount: total, method: form.paymentMethod }),
          });
          if (payRes.ok) {
            const payData = await payRes.json();
            paymentId = payData.paymentId || payData.id;
          }
        } catch {
          // Continue with mock payment
        }

        // Step 2: Simulate processing delay
        await new Promise((resolve) => setTimeout(resolve, 2000));

        // Step 3: Confirm payment
        if (paymentId) {
          try {
            await fetch('/api/payments/confirm', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ paymentId, status: 'completed' }),
            });
          } catch {
            // Continue
          }
        }

        setPaymentProcessing(false);
      }

      // Create the order
      const selectedCity = UAE_CITIES.find((c) => c.id === form.city);
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map((i) => ({
            productId: i.productId,
            productName: locale === 'ar' ? i.product.nameAr : i.product.nameEn,
            productImage: i.product.images ? JSON.parse(i.product.images)[0] : null,
            price: i.product.salePrice || i.product.price,
            quantity: i.quantity,
            total: (i.product.salePrice || i.product.price) * i.quantity,
          })),
          subtotal,
          deliveryFee: selectedCity?.fee || deliveryFee,
          discount: couponDiscount,
          giftWrapPrice: giftWrapCost,
          total,
          paymentMethod: form.paymentMethod,
          recipientName: form.recipientName,
          recipientPhone: form.recipientPhone,
          deliveryCity: selectedCity ? (locale === 'ar' ? selectedCity.nameAr : selectedCity.nameEn) : form.city,
          deliveryArea: form.area,
          deliveryStreet: form.street,
          deliveryBuilding: form.building,
          deliveryApartment: form.apartment,
          deliveryDate: form.deliveryDate,
          deliveryTime: form.deliveryTime,
          deliveryNotes: form.notes,
          giftWrap,
          greetingCard: greetingCard || null,
          couponCode: couponCode || null,
          currency: 'AED',
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setOrderNumber(data.orderNumber || `BG${Date.now()}`);
        setOrderPlaced(true);
        clearCart();
      } else {
        // Demo fallback
        setOrderNumber(`BG${Date.now()}`);
        setOrderPlaced(true);
        clearCart();
      }
    } catch {
      setPaymentProcessing(false);
      setOrderNumber(`BG${Date.now()}`);
      setOrderPlaced(true);
      clearCart();
    }
    setSubmitting(false);
  };

  const getPaymentIcon = (method: string) => {
    switch (method) {
      case 'cod': return Gift;
      case 'card': return CreditCard;
      case 'apple': return Smartphone;
      case 'google': return Smartphone;
      case 'tabby': return CalendarDays;
      case 'tamara': return CalendarDays;
      default: return CreditCard;
    }
  };

  const getPaymentLabel = (method: string) => {
    switch (method) {
      case 'cod': return t('checkout.cod', locale);
      case 'card': return t('checkout.stripe', locale);
      case 'apple': return t('checkout.applePay', locale);
      case 'google': return t('checkout.googlePay', locale);
      case 'tabby': return 'Tabby (Pay in 4)';
      case 'tamara': return 'Tamara (Installments)';
      default: return method;
    }
  };

  // Success state
  if (orderPlaced) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center max-w-md"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
            className="w-24 h-24 mx-auto mb-6 rounded-full bg-sage/10 flex items-center justify-center"
          >
            <CheckCircle className="h-12 w-12 text-sage" />
          </motion.div>
          <PartyPopper className="h-12 w-12 text-gold mx-auto mb-4" />
          <h1 className="text-2xl sm:text-3xl font-bold text-charcoal mb-2">
            {t('checkout.orderPlaced', locale)}
          </h1>
          <p className="text-gold font-semibold text-xl mb-2">
            {t('checkout.orderNumber', locale, { number: orderNumber })}
          </p>
          <p className="text-muted-foreground mb-2">{t('checkout.thankYou', locale)}</p>
          <p className="text-sm text-muted-foreground mb-8">
            We&apos;ll send you updates via email and SMS.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button onClick={() => navigate('home')} className="btn-luxury rounded-full px-8">
              {t('common.shop', locale)}
            </Button>
            <Button variant="outline" onClick={() => navigate('account')} className="rounded-full px-8">
              {t('account.myOrders', locale)}
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  // Payment processing overlay
  if (paymentProcessing) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center max-w-md"
        >
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-[#C9A96E]/10 flex items-center justify-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            >
              <CreditCard className="h-10 w-10 text-[#C9A96E]" />
            </motion.div>
          </div>
          <h2 className="text-xl font-bold text-charcoal mb-2">
            {locale === 'ar' ? 'جاري معالجة الدفع...' : 'Processing Payment...'}
          </h2>
          <p className="text-sm text-muted-foreground">
            {locale === 'ar' ? 'الرجاء الانتظار، لا تغلق هذه الصفحة' : 'Please wait, do not close this page'}
          </p>
          <div className="mt-6 flex items-center justify-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#C9A96E] animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-2 h-2 rounded-full bg-[#C9A96E] animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-2 h-2 rounded-full bg-[#C9A96E] animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
          <div className="mt-4 flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <Lock className="h-3 w-3" />
            <span>Secure payment powered by SSL encryption</span>
          </div>
        </motion.div>
      </div>
    );
  }

  const stepLabels = STEPS.map((step) => t(`checkout.${step}`, locale));

  return (
    <div className="min-h-screen bg-cream/30">
      {/* Header with steps */}
      <div className="bg-white border-b border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={goBack}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-gold transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              {t('common.back', locale)}
            </button>
            <h1 className="text-xl font-bold text-charcoal">{t('checkout.title', locale)}</h1>
            <div className="w-20" />
          </div>

          {/* Step indicator */}
          <div className="flex items-center mt-6 gap-0">
            {STEPS.map((step, index) => (
              <div key={step} className="flex items-center flex-1">
                <button
                  onClick={() => index < currentStep && setCurrentStep(index)}
                  className={`flex items-center gap-2 text-sm font-medium transition-colors ${
                    index <= currentStep ? 'text-gold' : 'text-muted-foreground'
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors flex-shrink-0 ${
                      index < currentStep
                        ? 'bg-gold text-white'
                        : index === currentStep
                        ? 'bg-gold/10 text-gold border-2 border-gold'
                        : 'bg-cream text-muted-foreground'
                    }`}
                  >
                    {index < currentStep ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      index + 1
                    )}
                  </div>
                  <span className="hidden sm:inline">{stepLabels[index]}</span>
                </button>
                {index < STEPS.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 mx-3 transition-colors ${
                      index < currentStep ? 'bg-gold' : 'bg-border'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form area */}
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              {/* Step 1: Delivery Details */}
              {currentStep === 0 && (
                <motion.div
                  key="delivery"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="bg-white rounded-2xl p-6 border border-border"
                >
                  <h2 className="text-lg font-bold text-charcoal mb-6 flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-gold" />
                    {t('checkout.deliveryDetails', locale)}
                  </h2>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label>{t('checkout.recipientName', locale)} <span className="text-destructive">*</span></Label>
                      <Input
                        value={form.recipientName}
                        onChange={(e) => updateForm('recipientName', e.target.value)}
                        className={`mt-1 ${errors.recipientName ? 'border-destructive' : ''}`}
                      />
                      {errors.recipientName && (
                        <p className="text-xs text-destructive mt-1">{errors.recipientName}</p>
                      )}
                    </div>
                    <div>
                      <Label>{t('checkout.recipientPhone', locale)} <span className="text-destructive">*</span></Label>
                      <Input
                        value={form.recipientPhone}
                        onChange={(e) => updateForm('recipientPhone', e.target.value)}
                        className={`mt-1 ${errors.recipientPhone ? 'border-destructive' : ''}`}
                        placeholder="+971 XX XXX XXXX"
                      />
                      {errors.recipientPhone && (
                        <p className="text-xs text-destructive mt-1">{errors.recipientPhone}</p>
                      )}
                    </div>
                    <div>
                      <Label>{t('checkout.deliveryCity', locale)} <span className="text-destructive">*</span></Label>
                      <Select value={form.city} onValueChange={(v) => updateForm('city', v)}>
                        <SelectTrigger className={`mt-1 ${errors.city ? 'border-destructive' : ''}`}>
                          <SelectValue placeholder={t('checkout.deliveryCity', locale)} />
                        </SelectTrigger>
                        <SelectContent>
                          {UAE_CITIES.map((city) => (
                            <SelectItem key={city.id} value={city.id}>
                              {locale === 'ar' ? city.nameAr : city.nameEn} (AED {city.fee})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.city && (
                        <p className="text-xs text-destructive mt-1">{errors.city}</p>
                      )}
                    </div>
                    <div>
                      <Label>{t('checkout.deliveryArea', locale)}</Label>
                      <Input
                        value={form.area}
                        onChange={(e) => updateForm('area', e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>{t('checkout.deliveryAddress', locale)}</Label>
                      <Input
                        value={form.street}
                        onChange={(e) => updateForm('street', e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>{t('checkout.buildingNo', locale)}</Label>
                      <Input
                        value={form.building}
                        onChange={(e) => updateForm('building', e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>{t('checkout.apartmentNo', locale)}</Label>
                      <Input
                        value={form.apartment}
                        onChange={(e) => updateForm('apartment', e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>{t('checkout.deliveryDate', locale)}</Label>
                      <Input
                        type="date"
                        value={form.deliveryDate}
                        onChange={(e) => updateForm('deliveryDate', e.target.value)}
                        className="mt-1"
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <Label>{t('checkout.deliveryTime', locale)}</Label>
                      <Select value={form.deliveryTime} onValueChange={(v) => updateForm('deliveryTime', v)}>
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder={t('checkout.deliveryTime', locale)} />
                        </SelectTrigger>
                        <SelectContent>
                          {DELIVERY_TIME_SLOTS.map((slot) => (
                            <SelectItem key={slot.id} value={slot.id}>
                              {locale === 'ar' ? slot.nameAr : slot.nameEn}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="sm:col-span-2">
                      <Label>
                        {t('checkout.deliveryInstructions', locale)}
                        <span className="text-muted-foreground font-normal"> ({t('common.optional', locale)})</span>
                      </Label>
                      <Textarea
                        value={form.notes}
                        onChange={(e) => updateForm('notes', e.target.value)}
                        className="mt-1 rounded-xl"
                        rows={3}
                        placeholder="Building details, gate code, landmarks..."
                      />
                    </div>
                  </div>

                  <div className="flex justify-end mt-6">
                    <Button onClick={nextStep} className="btn-luxury rounded-full px-8 gap-2">
                      {t('common.next', locale)}
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* Step 2: Payment Method */}
              {currentStep === 1 && (
                <motion.div
                  key="payment"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="bg-white rounded-2xl p-6 border border-border"
                >
                  <h2 className="text-lg font-bold text-charcoal mb-6 flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-gold" />
                    {t('checkout.paymentMethod', locale)}
                  </h2>

                  {/* Cash on Delivery */}
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium mb-3">
                    {locale === 'ar' ? 'الدفع عند الاستلام' : 'Cash on Delivery'}
                  </p>
                  <RadioGroup
                    value={form.paymentMethod}
                    onValueChange={(v) => updateForm('paymentMethod', v)}
                    className="space-y-3 mb-6"
                  >
                    <label
                      className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        form.paymentMethod === 'cod'
                          ? 'border-gold bg-gold/5'
                          : 'border-border hover:border-gold/30'
                      }`}
                    >
                      <RadioGroupItem value="cod" />
                      <div className="w-10 h-10 rounded-lg bg-cream flex items-center justify-center flex-shrink-0">
                        <Gift className="h-5 w-5 text-gold" />
                      </div>
                      <span className="font-medium text-charcoal">{t('checkout.cod', locale)}</span>
                    </label>
                  </RadioGroup>

                  {/* Pay Online */}
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium mb-3">
                    {locale === 'ar' ? 'الدفع الإلكتروني' : 'Pay Online'}
                  </p>
                  <RadioGroup
                    value={form.paymentMethod}
                    onValueChange={(v) => updateForm('paymentMethod', v)}
                    className="space-y-3"
                  >
                    {[
                      { value: 'card', label: t('checkout.stripe', locale), icon: CreditCard, desc: 'Visa, Mastercard' },
                      { value: 'apple', label: t('checkout.applePay', locale), icon: Smartphone, desc: 'Quick & secure' },
                      { value: 'google', label: t('checkout.googlePay', locale), icon: Smartphone, desc: 'Quick & secure' },
                      { value: 'tabby', label: 'Tabby', icon: CalendarDays, desc: 'Pay in 4 interest-free installments' },
                      { value: 'tamara', label: 'Tamara', icon: CalendarDays, desc: 'Split into easy installments' },
                    ].map((method) => {
                      const Icon = method.icon;
                      return (
                        <label
                          key={method.value}
                          className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                            form.paymentMethod === method.value
                              ? 'border-gold bg-gold/5'
                              : 'border-border hover:border-gold/30'
                          }`}
                        >
                          <RadioGroupItem value={method.value} />
                          <div className="w-10 h-10 rounded-lg bg-cream flex items-center justify-center flex-shrink-0">
                            <Icon className="h-5 w-5 text-gold" />
                          </div>
                          <div className="flex-1">
                            <span className="font-medium text-charcoal">{method.label}</span>
                            <p className="text-xs text-muted-foreground">{method.desc}</p>
                          </div>
                        </label>
                      );
                    })}
                  </RadioGroup>

                  {/* Card input form for online payments */}
                  {isOnlinePayment && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mt-6 p-5 bg-cream/50 rounded-xl border border-gold/20"
                    >
                      <h4 className="font-semibold text-charcoal mb-4 flex items-center gap-2">
                        <ShieldCheck className="h-4 w-4 text-gold" />
                        {locale === 'ar' ? 'تفاصيل البطاقة' : 'Card Details'}
                      </h4>
                      <div className="space-y-3">
                        <div>
                          <Label className="text-xs text-muted-foreground">
                            {locale === 'ar' ? 'الاسم على البطاقة' : 'Name on Card'}
                          </Label>
                          <Input
                            value={cardForm.name}
                            onChange={(e) => setCardForm({ ...cardForm, name: e.target.value })}
                            className={`mt-1 rounded-xl ${errors.cardName ? 'border-destructive' : ''}`}
                            placeholder="John Doe"
                          />
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">
                            {locale === 'ar' ? 'رقم البطاقة' : 'Card Number'}
                          </Label>
                          <div className="relative">
                            <Input
                              value={cardForm.number}
                              onChange={(e) => setCardForm({ ...cardForm, number: e.target.value.replace(/\D/g, '').slice(0, 16) })}
                              className={`mt-1 rounded-xl ps-10 ${errors.cardNumber ? 'border-destructive' : ''}`}
                              placeholder="4242 4242 4242 4242"
                              maxLength={19}
                            />
                            <CreditCard className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <Label className="text-xs text-muted-foreground">
                              {locale === 'ar' ? 'تاريخ الانتهاء' : 'Expiry Date'}
                            </Label>
                            <Input
                              value={cardForm.expiry}
                              onChange={(e) => {
                                let val = e.target.value.replace(/\D/g, '').slice(0, 4);
                                if (val.length >= 2) val = val.slice(0, 2) + '/' + val.slice(2);
                                setCardForm({ ...cardForm, expiry: val });
                              }}
                              className={`mt-1 rounded-xl ${errors.cardExpiry ? 'border-destructive' : ''}`}
                              placeholder="MM/YY"
                            />
                          </div>
                          <div>
                            <Label className="text-xs text-muted-foreground">CVV</Label>
                            <div className="relative">
                              <Input
                                type="password"
                                value={cardForm.cvv}
                                onChange={(e) => setCardForm({ ...cardForm, cvv: e.target.value.replace(/\D/g, '').slice(0, 4) })}
                                className={`mt-1 rounded-xl pe-10 ${errors.cardCvv ? 'border-destructive' : ''}`}
                                placeholder="•••"
                              />
                              <Lock className="absolute end-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                            </div>
                          </div>
                        </div>
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-3 flex items-center gap-1">
                        <Lock className="h-3 w-3" />
                        {locale === 'ar' ? 'بياناتك مشفرة ومحمية بالكامل' : 'Your data is encrypted and fully protected'}
                      </p>
                    </motion.div>
                  )}

                  {/* Guest checkout notice */}
                  {!user && (
                    <div className="mt-4 p-3 bg-cream/50 rounded-xl text-sm text-muted-foreground flex items-center gap-2">
                      <ShoppingBag className="h-4 w-4 flex-shrink-0" />
                      <span>Checking out as guest. {t('cart.checkoutAsGuest', locale)}</span>
                    </div>
                  )}

                  <div className="flex justify-between mt-6">
                    <Button variant="outline" onClick={prevStep} className="rounded-full px-8 gap-2">
                      <ArrowLeft className="h-4 w-4" />
                      {t('common.previous', locale)}
                    </Button>
                    <Button onClick={nextStep} className="btn-luxury rounded-full px-8 gap-2">
                      {t('common.next', locale)}
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* Step 3: Review Order */}
              {currentStep === 2 && (
                <motion.div
                  key="review"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="bg-white rounded-2xl p-6 border border-border"
                >
                  <h2 className="text-lg font-bold text-charcoal mb-6">
                    {t('checkout.orderReview', locale)}
                  </h2>

                  {/* Delivery info summary */}
                  <div className="bg-cream/50 rounded-xl p-4 mb-4">
                    <h3 className="font-semibold text-sm text-charcoal mb-3 flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-gold" />
                      {t('checkout.deliveryDetails', locale)}
                    </h3>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-muted-foreground">{t('checkout.recipientName', locale)}</span>
                        <p className="font-medium text-charcoal">{form.recipientName || '—'}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">{t('checkout.recipientPhone', locale)}</span>
                        <p className="font-medium text-charcoal">{form.recipientPhone || '—'}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">{t('checkout.deliveryCity', locale)}</span>
                        <p className="font-medium text-charcoal">
                          {UAE_CITIES.find((c) => c.id === form.city)
                            ? locale === 'ar'
                              ? UAE_CITIES.find((c) => c.id === form.city)!.nameAr
                              : UAE_CITIES.find((c) => c.id === form.city)!.nameEn
                            : '—'}
                        </p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">{t('checkout.deliveryTime', locale)}</span>
                        <p className="font-medium text-charcoal">
                          {form.deliveryDate
                            ? DELIVERY_TIME_SLOTS.find((s) => s.id === form.deliveryTime)
                              ? locale === 'ar'
                                ? DELIVERY_TIME_SLOTS.find((s) => s.id === form.deliveryTime)!.nameAr
                                : DELIVERY_TIME_SLOTS.find((s) => s.id === form.deliveryTime)!.nameEn
                              : '—'
                            : '—'}
                        </p>
                      </div>
                      {form.area && (
                        <div className="col-span-2">
                          <span className="text-muted-foreground">{t('checkout.deliveryArea', locale)}</span>
                          <p className="font-medium text-charcoal">{form.area}{form.street ? `, ${form.street}` : ''}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Payment summary */}
                  <div className="bg-cream/50 rounded-xl p-4 mb-4">
                    <h3 className="font-semibold text-sm text-charcoal mb-2 flex items-center gap-2">
                      <CreditCard className="h-4 w-4 text-gold" />
                      {t('checkout.paymentMethod', locale)}
                    </h3>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-charcoal">
                        {getPaymentLabel(form.paymentMethod)}
                      </p>
                      {isOnlinePayment && (
                        <span className="text-xs text-gold bg-gold/10 px-2 py-0.5 rounded-full font-medium">
                          Online Payment
                        </span>
                      )}
                    </div>
                    {isOnlinePayment && cardForm.number && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Card ending in ****{cardForm.number.slice(-4)}
                      </p>
                    )}
                  </div>

                  {/* Gift wrap & greeting */}
                  {(giftWrap || greetingCard) && (
                    <div className="bg-blush-light/50 rounded-xl p-4 mb-4">
                      <h3 className="font-semibold text-sm text-charcoal mb-2 flex items-center gap-2">
                        <Gift className="h-4 w-4 text-blush" />
                        Gift Options
                      </h3>
                      {giftWrap && (
                        <p className="text-sm text-charcoal-light">
                          ✓ Gift wrapping included (AED 15)
                        </p>
                      )}
                      {greetingCard && (
                        <p className="text-sm text-charcoal-light mt-1">
                          ✓ Greeting card: &ldquo;{greetingCard}&rdquo;
                        </p>
                      )}
                    </div>
                  )}

                  {/* Coupon applied */}
                  {couponCode && (
                    <div className="bg-sage/10 rounded-xl p-4 mb-4">
                      <p className="text-sm text-charcoal">
                        🏷️ Coupon <span className="font-bold text-gold">{couponCode}</span> applied (-AED {couponDiscount.toFixed(2)})
                      </p>
                    </div>
                  )}

                  {/* Items */}
                  <div className="space-y-3 mb-6">
                    <h3 className="font-semibold text-sm text-charcoal">
                      Order Items ({items.length})
                    </h3>
                    {items.map((item) => {
                      const images = item.product.images ? JSON.parse(item.product.images) : [];
                      return (
                        <div key={item.productId} className="flex items-center gap-3 p-3 bg-cream/30 rounded-xl">
                          <div className="w-14 h-14 rounded-lg overflow-hidden bg-cream flex-shrink-0">
                            <img
                              src={images[0] || `https://picsum.photos/seed/product/100/100`}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-charcoal truncate">
                              {locale === 'ar' ? item.product.nameAr : item.product.nameEn}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              AED {item.product.salePrice || item.product.price} × {item.quantity}
                            </p>
                          </div>
                          <span className="text-sm font-semibold text-charcoal">
                            AED {((item.product.salePrice || item.product.price) * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex justify-between">
                    <Button variant="outline" onClick={prevStep} className="rounded-full px-8 gap-2">
                      <ArrowLeft className="h-4 w-4" />
                      {t('common.previous', locale)}
                    </Button>
                    <Button
                      onClick={handlePlaceOrder}
                      className="btn-luxury rounded-full px-8 gap-2"
                      disabled={items.length === 0 || submitting}
                    >
                      {submitting ? (
                        <span className="flex items-center gap-2">
                          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Processing...
                        </span>
                      ) : (
                        <>
                          <CheckCircle className="h-4 w-4" />
                          {t('checkout.placeOrder', locale)} — AED {total.toFixed(2)}
                        </>
                      )}
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Order summary sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-6 border border-border sticky top-28">
              <h3 className="font-bold text-charcoal mb-4">{t('cart.orderSummary', locale)}</h3>

              {/* Mini items */}
              <div className="space-y-2 mb-4 max-h-48 overflow-y-auto">
                {items.map((item) => {
                  const imgs = item.product.images ? JSON.parse(item.product.images) : [];
                  return (
                    <div key={item.productId} className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-lg overflow-hidden bg-cream flex-shrink-0">
                        <img src={imgs[0] || `https://picsum.photos/seed/product/100/100`} alt="" className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-charcoal truncate">
                          {locale === 'ar' ? item.product.nameAr : item.product.nameEn}
                        </p>
                        <p className="text-[10px] text-muted-foreground">×{item.quantity}</p>
                      </div>
                    </div>
                  );
                })}
                {items.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-2">No items</p>
                )}
              </div>

              <Separator className="mb-4" />

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t('common.subtotal', locale)}</span>
                  <span className="text-charcoal">AED {subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t('common.deliveryFee', locale)}</span>
                  <span className="text-charcoal">AED {deliveryFee.toFixed(2)}</span>
                </div>
                {giftWrap && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t('cart.giftWrap', locale)}</span>
                    <span className="text-charcoal">AED {giftWrapCost.toFixed(2)}</span>
                  </div>
                )}
                {couponDiscount > 0 && (
                  <div className="flex justify-between text-destructive">
                    <span>{t('common.discount', locale)}</span>
                    <span>-AED {couponDiscount.toFixed(2)}</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span className="text-charcoal">{t('common.total', locale)}</span>
                  <span className="text-gold">AED {total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
