'use client';

import { useState, useEffect } from 'react';
import { useLanguageStore } from '@/lib/stores';
import { type NotificationItem } from '@/lib/types';
import { useNotificationStore } from '@/lib/stores';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Bell, Plus, Package, CreditCard, Truck, Settings, Send, Eye, CheckCheck, Clock } from 'lucide-react';
import { toast } from 'sonner';

const typeIconMap: Record<string, any> = {
  order: Package,
  payment: CreditCard,
  delivery: Truck,
  system: Settings,
};
const typeColorMap: Record<string, string> = {
  order: 'bg-blue-50 text-blue-500',
  payment: 'bg-green-50 text-green-500',
  delivery: 'bg-purple-50 text-purple-500',
  system: 'bg-orange-50 text-orange-500',
};

const MOCK_NOTIFICATIONS: NotificationItem[] = [
  { id: 'n1', userId: 'u1', type: 'order', title: 'New Order Received', titleAr: 'طلب جديد', message: 'Order #BG-1061 has been placed by Sarah M.', messageAr: 'تم تقديم الطلب #BG-1061 من قبل سارة', orderId: 'o1', isRead: false, channel: 'in_app', createdAt: '2024-12-24T09:30:00Z' },
  { id: 'n2', userId: 'u1', type: 'payment', title: 'Payment Received', titleAr: 'تم استلام الدفعة', message: 'AED 450 payment received for order #BG-1060.', messageAr: 'تم استلام دفعة 450 درهم للطلب #BG-1060', orderId: 'o2', isRead: false, channel: 'in_app', createdAt: '2024-12-24T09:15:00Z' },
  { id: 'n3', userId: 'u1', type: 'delivery', title: 'Delivery Failed', titleAr: 'فشل التوصيل', message: 'Delivery for order #BG-1048 failed. Customer not available.', messageAr: 'فشل توصيل الطلب #BG-1048. العميل غير متوفر.', orderId: 'o5', isRead: false, channel: 'in_app', createdAt: '2024-12-24T07:45:00Z' },
  { id: 'n4', userId: 'u1', type: 'order', title: 'Order Delivered', titleAr: 'تم التوصيل', message: 'Order #BG-1050 has been delivered successfully.', messageAr: 'تم توصيل الطلب #BG-1050 بنجاح.', orderId: 'o4', isRead: true, channel: 'in_app', createdAt: '2024-12-23T15:45:00Z' },
  { id: 'n5', userId: 'u1', type: 'system', title: 'Low Stock Alert', titleAr: 'تنبيه المخزون', message: 'Pink Peony Bouquet stock is below 5 units.', messageAr: 'مخزون باقة البيوني الوردي أقل من 5 وحدات.', orderId: null, isRead: true, channel: 'in_app', createdAt: '2024-12-23T10:00:00Z' },
  { id: 'n6', userId: 'u1', type: 'payment', title: 'Refund Processed', titleAr: 'تم معالجة الاسترداد', message: 'AED 320 refund processed for order #BG-1045.', messageAr: 'تم معالجة استرداد 320 درهم للطلب #BG-1045.', orderId: null, isRead: true, channel: 'in_app', createdAt: '2024-12-22T14:30:00Z' },
  { id: 'n7', userId: 'u1', type: 'delivery', title: 'Courier Assigned', titleAr: 'تم تعيين المندوب', message: 'Courier Ali H. assigned to order #BG-1058.', messageAr: 'تم تعيين المندوب علي ح. للطلب #BG-1058.', orderId: 'o1', isRead: true, channel: 'in_app', createdAt: '2024-12-22T12:00:00Z' },
  { id: 'n8', userId: 'u1', type: 'system', title: 'Daily Report Ready', titleAr: 'التقرير اليومي جاهز', message: 'Your daily sales report for Dec 22 is ready.', messageAr: 'تقرير المبيعات اليومي لـ 22 ديسمبر جاهز.', orderId: null, isRead: true, channel: 'in_app', createdAt: '2024-12-22T09:00:00Z' },
];

export default function AdminNotifications() {
  const { locale } = useLanguageStore();
  const { addNotification } = useNotificationStore();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [typeFilter, setTypeFilter] = useState('all');
  const [sendDialogOpen, setSendDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sendForm, setSendForm] = useState({
    userId: '',
    title: '',
    titleAr: '',
    message: '',
    messageAr: '',
    type: 'system',
  });

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await fetch('/api/admin/notifications');
        if (res.ok && !cancelled) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setNotifications(data);
          } else {
            setNotifications(MOCK_NOTIFICATIONS);
          }
        }
      } catch {
        if (!cancelled) setNotifications(MOCK_NOTIFICATIONS);
      }
      if (!cancelled) setLoading(false);
    };
    load();
    return () => { cancelled = true; };
  }, []);

  const filtered = typeFilter === 'all'
    ? notifications
    : notifications.filter((n) => n.type === typeFilter);

  const handleSendNotification = () => {
    if (!sendForm.title || !sendForm.message) {
      toast.error('Title and message are required');
      return;
    }
    const newNotification: NotificationItem = {
      id: `n-${Date.now()}`,
      userId: sendForm.userId || 'all',
      type: sendForm.type,
      title: sendForm.title,
      titleAr: sendForm.titleAr || null,
      message: sendForm.message,
      messageAr: sendForm.messageAr || null,
      orderId: null,
      isRead: false,
      channel: 'in_app',
      createdAt: new Date().toISOString(),
    };
    setNotifications([newNotification, ...notifications]);
    addNotification(newNotification);
    setSendForm({ userId: '', title: '', titleAr: '', message: '', messageAr: '', type: 'system' });
    setSendDialogOpen(false);
    toast.success('Notification sent');
  };

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleString(locale === 'ar' ? 'ar-AE' : 'en-US', {
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-20 rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-44 rounded-xl">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="order">Order</SelectItem>
              <SelectItem value="payment">Payment</SelectItem>
              <SelectItem value="delivery">Delivery</SelectItem>
              <SelectItem value="system">System</SelectItem>
            </SelectContent>
          </Select>
          <Badge variant="secondary" className="bg-[#C9A96E]/10 text-[#C9A96E]">
            {notifications.filter((n) => !n.isRead).length} unread
          </Badge>
        </div>
        <Button onClick={() => setSendDialogOpen(true)} className="btn-luxury rounded-xl gap-2">
          <Send className="h-4 w-4" />
          Send Notification
        </Button>
      </div>

      {/* Notifications list */}
      <div className="bg-white rounded-xl border border-[#E8E0D8] shadow-sm overflow-hidden divide-y divide-[#E8E0D8]/50">
        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <Bell className="h-10 w-10 mx-auto text-muted-foreground/20 mb-3" />
            <p className="text-muted-foreground">No notifications found</p>
          </div>
        ) : (
          filtered.map((notif) => {
            const Icon = typeIconMap[notif.type] || Bell;
            const colorClass = typeColorMap[notif.type] || 'bg-gray-50 text-gray-500';

            return (
              <div
                key={notif.id}
                className={`flex items-start gap-4 p-4 hover:bg-[#F5F0EB]/50 transition-colors ${
                  !notif.isRead ? 'bg-[#C9A96E]/5' : ''
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${colorClass}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <h4 className={`text-sm ${!notif.isRead ? 'font-semibold text-[#2D2926]' : 'font-medium text-[#5C534A]'}`}>
                      {locale === 'ar' && notif.titleAr ? notif.titleAr : notif.title}
                    </h4>
                    {!notif.isRead && (
                      <span className="w-2 h-2 rounded-full bg-[#C9A96E] flex-shrink-0" />
                    )}
                    <Badge variant="outline" className="text-[10px] px-2 py-0 border-[#E8E0D8] capitalize">
                      {notif.type}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {locale === 'ar' && notif.messageAr ? notif.messageAr : notif.message}
                  </p>
                  <div className="flex items-center gap-3 mt-1.5">
                    <span className="text-xs text-muted-foreground/60 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatTime(notif.createdAt)}
                    </span>
                    {notif.orderId && (
                      <span className="text-xs text-[#C9A96E] font-medium">
                        Order #{notif.orderId}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Send notification dialog */}
      <Dialog open={sendDialogOpen} onOpenChange={setSendDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Send className="h-5 w-5 text-[#C9A96E]" />
              Send Notification
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label>User ID (leave empty for all)</Label>
              <Input
                value={sendForm.userId}
                onChange={(e) => setSendForm({ ...sendForm, userId: e.target.value })}
                className="mt-1 rounded-xl"
                placeholder="Enter user ID or leave empty for broadcast"
              />
            </div>
            <div>
              <Label>Type</Label>
              <Select value={sendForm.type} onValueChange={(v) => setSendForm({ ...sendForm, type: v })}>
                <SelectTrigger className="mt-1 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="order">Order</SelectItem>
                  <SelectItem value="payment">Payment</SelectItem>
                  <SelectItem value="delivery">Delivery</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Title (English) <span className="text-destructive">*</span></Label>
              <Input
                value={sendForm.title}
                onChange={(e) => setSendForm({ ...sendForm, title: e.target.value })}
                className="mt-1 rounded-xl"
                placeholder="Notification title"
              />
            </div>
            <div>
              <Label>Title (Arabic)</Label>
              <Input
                value={sendForm.titleAr}
                onChange={(e) => setSendForm({ ...sendForm, titleAr: e.target.value })}
                className="mt-1 rounded-xl"
                dir="rtl"
                placeholder="عنوان الإشعار"
              />
            </div>
            <div>
              <Label>Message (English) <span className="text-destructive">*</span></Label>
              <Textarea
                value={sendForm.message}
                onChange={(e) => setSendForm({ ...sendForm, message: e.target.value })}
                className="mt-1 rounded-xl"
                rows={3}
                placeholder="Notification message"
              />
            </div>
            <div>
              <Label>Message (Arabic)</Label>
              <Textarea
                value={sendForm.messageAr}
                onChange={(e) => setSendForm({ ...sendForm, messageAr: e.target.value })}
                className="mt-1 rounded-xl"
                rows={3}
                dir="rtl"
                placeholder="رسالة الإشعار"
              />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => setSendDialogOpen(false)} className="rounded-xl">
                Cancel
              </Button>
              <Button onClick={handleSendNotification} className="btn-luxury rounded-xl gap-2">
                <Send className="h-4 w-4" />
                Send
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
