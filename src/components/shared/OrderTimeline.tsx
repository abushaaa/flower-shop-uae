'use client';

import { useLanguageStore } from '@/lib/stores';
import { ORDER_TIMELINE_STEPS, type Order, type DeliveryTracking, type OrderStatus } from '@/lib/types';
import { Check, Package, Truck, Scissors, CheckCheck, Circle } from 'lucide-react';

interface OrderTimelineProps {
  order: Order;
  tracking?: DeliveryTracking[];
}

const stepIconMap: Record<string, any> = {
  'check-circle': Check,
  'scissors': Scissors,
  'package': Package,
  'truck': Truck,
  'check-check': CheckCheck,
};

export default function OrderTimeline({ order, tracking }: OrderTimelineProps) {
  const { locale } = useLanguageStore();

  const statusOrder: OrderStatus[] = [
    'confirmed', 'preparing', 'ready_for_pickup', 'out_for_delivery', 'delivered',
  ];

  const currentStepIndex = statusOrder.indexOf(order.status);

  const getTimestamp = (stepStatus: OrderStatus): string | null => {
    if (!tracking || tracking.length === 0) return null;
    const step = ORDER_TIMELINE_STEPS.find((s) => s.status === stepStatus);
    if (!step) return null;
    const trackEntry = tracking.find(
      (t) => t.status === stepStatus || t.status === stepStatus.replace(/_/g, ' ')
    );
    return trackEntry ? trackEntry.timestamp : null;
  };

  const formatTime = (ts: string) => {
    try {
      return new Date(ts).toLocaleString(locale === 'ar' ? 'ar-AE' : 'en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return ts;
    }
  };

  return (
    <div className="py-4">
      <div className="relative">
        {/* Vertical line */}
        <div
          className={`absolute top-4 bottom-4 w-0.5 ${
            locale === 'ar' ? 'end-[15px]' : 'start-[15px]'
          } bg-[#E8E0D8]`}
        />

        <div className="space-y-0">
          {ORDER_TIMELINE_STEPS.map((step, index) => {
            const stepIndex = statusOrder.indexOf(step.status);
            const isCompleted = currentStepIndex >= 0 && stepIndex <= currentStepIndex;
            const isCurrent = step.status === order.status;
            const isFuture = stepIndex > currentStepIndex;
            const Icon = stepIconMap[step.icon] || Circle;
            const timestamp = getTimestamp(step.status);

            return (
              <div key={step.status} className="relative flex items-start gap-4 pb-6 last:pb-0">
                {/* Dot / circle */}
                <div
                  className={`relative z-10 flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                    isCompleted
                      ? 'bg-[#C9A96E] text-white shadow-md shadow-[#C9A96E]/30'
                      : isCurrent
                      ? 'bg-white border-2 border-[#C9A96E] text-[#C9A96E] animate-pulse'
                      : 'bg-white border-2 border-dashed border-[#E8E0D8] text-[#E8E0D8]'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 pt-0.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p
                      className={`text-sm font-medium ${
                        isCompleted
                          ? 'text-[#2D2926]'
                          : isCurrent
                          ? 'text-[#C9A96E] font-semibold'
                          : 'text-[#8C8279]'
                      }`}
                    >
                      {locale === 'ar' ? step.labelAr : step.labelEn}
                    </p>
                    {isCurrent && (
                      <span className="text-[10px] font-medium text-[#C9A96E] bg-[#C9A96E]/10 px-2 py-0.5 rounded-full">
                        Current
                      </span>
                    )}
                  </div>
                  {timestamp && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {formatTime(timestamp)}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
