'use client';

import { useState, useRef, useEffect } from 'react';
import { useLanguageStore, useNotificationStore } from '@/lib/stores';
import { t } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Bell, Package, CreditCard, Truck, AlertTriangle, Settings, CheckCheck, ChevronRight } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

const typeIconMap: Record<string, any> = {
  order: Package,
  payment: CreditCard,
  delivery: Truck,
  system: Settings,
  default: Bell,
};

const typeColorMap: Record<string, string> = {
  order: 'bg-blue-50 text-blue-500',
  payment: 'bg-green-50 text-green-500',
  delivery: 'bg-purple-50 text-purple-500',
  system: 'bg-orange-50 text-orange-500',
  default: 'bg-gray-50 text-gray-500',
};

function timeAgo(dateStr: string, locale: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = now - then;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return locale === 'ar' ? 'الآن' : 'Just now';
  if (minutes < 60) return locale === 'ar' ? `منذ ${minutes} د` : `${minutes}m ago`;
  if (hours < 24) return locale === 'ar' ? `منذ ${hours} س` : `${hours}h ago`;
  return locale === 'ar' ? `منذ ${days} ي` : `${days}d ago`;
}

export default function NotificationPanel() {
  const { locale } = useLanguageStore();
  const { notifications, unreadCount, markAllAsRead, markAsRead } = useNotificationStore();
  const [isOpen, setIsOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const recentNotifications = notifications.slice(0, 10);

  return (
    <div className="relative" ref={panelRef}>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="text-charcoal-light hover:text-gold relative"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -end-1 h-5 min-w-[20px] rounded-full bg-destructive text-white text-[10px] flex items-center justify-center p-0 border-2 border-white font-bold">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </Button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className={`absolute top-full mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-[#E8E0D8] z-50 overflow-hidden ${
              locale === 'ar' ? 'end-0' : 'end-0'
            }`}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-[#E8E0D8]">
              <h3 className="font-semibold text-[#2D2926] flex items-center gap-2">
                <Bell className="h-4 w-4 text-[#C9A96E]" />
                {locale === 'ar' ? 'الإشعارات' : 'Notifications'}
                {unreadCount > 0 && (
                  <span className="text-xs font-medium text-white bg-[#C9A96E] rounded-full px-2 py-0.5">
                    {unreadCount}
                  </span>
                )}
              </h3>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-xs text-[#C9A96E] hover:text-[#C9A96E]/80 font-medium flex items-center gap-1 transition-colors"
                >
                  <CheckCheck className="h-3 w-3" />
                  {locale === 'ar' ? 'قراءة الكل' : 'Mark all read'}
                </button>
              )}
            </div>

            {/* List */}
            <div className="max-h-96 overflow-y-auto">
              {recentNotifications.length === 0 ? (
                <div className="py-12 text-center">
                  <Bell className="h-10 w-10 mx-auto text-muted-foreground/20 mb-3" />
                  <p className="text-sm text-muted-foreground">
                    {locale === 'ar' ? 'لا توجد إشعارات' : 'No notifications yet'}
                  </p>
                </div>
              ) : (
                recentNotifications.map((notif) => {
                  const Icon = typeIconMap[notif.type] || typeIconMap.default;
                  const colorClass = typeColorMap[notif.type] || typeColorMap.default;

                  return (
                    <button
                      key={notif.id}
                      onClick={() => markAsRead(notif.id)}
                      className={`w-full text-start flex items-start gap-3 p-4 hover:bg-[#F5F0EB]/50 transition-colors border-b border-[#E8E0D8]/50 last:border-b-0 ${
                        !notif.isRead ? 'bg-[#C9A96E]/5' : ''
                      }`}
                    >
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${colorClass}`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className={`text-sm ${!notif.isRead ? 'font-semibold text-[#2D2926]' : 'font-medium text-[#5C534A]'}`}>
                            {locale === 'ar' && notif.titleAr ? notif.titleAr : notif.title}
                          </p>
                          {!notif.isRead && (
                            <span className="w-2 h-2 rounded-full bg-[#C9A96E] flex-shrink-0" />
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                          {locale === 'ar' && notif.messageAr ? notif.messageAr : notif.message}
                        </p>
                        <p className="text-[10px] text-muted-foreground/60 mt-1">
                          {timeAgo(notif.createdAt, locale)}
                        </p>
                      </div>
                    </button>
                  );
                })
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="p-3 border-t border-[#E8E0D8] bg-[#F5F0EB]/30">
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-full text-center text-xs font-medium text-[#C9A96E] hover:text-[#C9A96E]/80 flex items-center justify-center gap-1 transition-colors"
                >
                  {locale === 'ar' ? 'عرض الكل' : 'View All'}
                  <ChevronRight className={`h-3 w-3 ${locale === 'ar' ? 'rotate-180' : ''}`} />
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
