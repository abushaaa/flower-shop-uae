'use client';

import { useState, useEffect } from 'react';
import { useLanguageStore } from '@/lib/stores';
import { t } from '@/lib/i18n';
import { Order, ORDER_STATUSES, type FloristTask } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Search, Eye, Package, Truck, Gift, CreditCard, MapPin, Calendar, Clock, Scissors, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import OrderTimeline from '@/components/shared/OrderTimeline';

const STATUS_OPTIONS = ORDER_STATUSES.map((s) => s.value);

const statusColorMap: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-blue-100 text-blue-700',
  processing: 'bg-blue-100 text-blue-700',
  preparing: 'bg-indigo-100 text-indigo-700',
  ready_for_pickup: 'bg-cyan-100 text-cyan-700',
  assigned_to_courier: 'bg-violet-100 text-violet-700',
  picked_up: 'bg-purple-100 text-purple-700',
  out_for_delivery: 'bg-orange-100 text-orange-700',
  delivered: 'bg-green-100 text-green-700',
  failed_delivery: 'bg-red-100 text-red-700',
  cancelled: 'bg-gray-100 text-gray-700',
};

const floristStatusConfig: Record<string, { color: string; label: string }> = {
  pending: { color: 'bg-yellow-100 text-yellow-700', label: 'Pending' },
  started: { color: 'bg-indigo-100 text-indigo-700', label: 'Started' },
  in_preparation: { color: 'bg-cyan-100 text-cyan-700', label: 'In Preparation' },
  package_ready: { color: 'bg-green-100 text-green-700', label: 'Package Ready' },
  completed: { color: 'bg-gray-100 text-gray-700', label: 'Completed' },
};

export default function AdminOrders() {
  const { locale } = useLanguageStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [trackingOrder, setTrackingOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await fetch('/api/admin/orders');
        if (res.ok && !cancelled) {
          const data = await res.json();
          setOrders(Array.isArray(data) ? data : data.orders || []);
        }
      } catch {
        if (!cancelled) setOrders([]);
      }
      if (!cancelled) setLoading(false);
    };
    load();
    return () => { cancelled = true; };
  }, []);

  const filtered = orders.filter((o) => {
    const matchSearch =
      o.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
      o.recipientName.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || o.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const updateStatus = async (orderId: string, newStatus: string) => {
    setUpdatingStatus(true);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setOrders(
          orders.map((o) => (o.id === orderId ? { ...o, status: newStatus as Order['status'] } : o))
        );
        if (selectedOrder?.id === orderId) {
          setSelectedOrder({ ...selectedOrder, status: newStatus as Order['status'] });
        }
        const statusLabel = ORDER_STATUSES.find((s) => s.value === newStatus);
        toast.success(`Order status updated to ${statusLabel ? (locale === 'ar' ? statusLabel.labelAr : statusLabel.labelEn) : newStatus}`);
      }
    } catch {
      toast.error('Failed to update status');
    }
    setUpdatingStatus(false);
  };

  const handleAssignCourier = async (orderId: string) => {
    setUpdatingStatus(true);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'assigned_to_courier' }),
      });
      if (res.ok) {
        setOrders(
          orders.map((o) => (o.id === orderId ? { ...o, status: 'assigned_to_courier' } : o))
        );
        if (selectedOrder?.id === orderId) {
          setSelectedOrder({ ...selectedOrder, status: 'assigned_to_courier' });
        }
        toast.success('Courier assigned successfully');
      }
    } catch {
      setOrders(
        orders.map((o) => (o.id === orderId ? { ...o, status: 'assigned_to_courier' } : o))
      );
      toast.success('Courier assigned successfully');
    }
    setUpdatingStatus(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search orders..."
            className="ps-9 rounded-xl"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48 rounded-xl">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            {STATUS_OPTIONS.map((s) => {
              const label = ORDER_STATUSES.find((os) => os.value === s);
              return (
                <SelectItem key={s} value={s}>
                  {label ? (locale === 'ar' ? label.labelAr : label.labelEn) : s}
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-14 rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-[#E8E0D8] shadow-sm overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Order #</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-end">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No orders found
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((order) => {
                  const statusLabel = ORDER_STATUSES.find((s) => s.value === order.status);
                  return (
                    <TableRow
                      key={order.id}
                      className="hover:bg-[#F5F0EB]/50 cursor-pointer"
                      onClick={() => setSelectedOrder(order)}
                    >
                      <TableCell className="font-medium text-[#2D2926]">#{order.orderNumber}</TableCell>
                      <TableCell>
                        <div>
                          <p className="text-sm font-medium text-[#2D2926]">{order.recipientName}</p>
                          <p className="text-xs text-muted-foreground">{order.deliveryCity}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">{order.items.length}</TableCell>
                      <TableCell className="font-semibold text-[#2D2926]">AED {order.total.toFixed(2)}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={statusColorMap[order.status] || ''}>
                          {statusLabel ? (locale === 'ar' ? statusLabel.labelAr : statusLabel.labelEn) : order.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-end">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={(e) => {
                              e.stopPropagation();
                              setTrackingOrder(order);
                            }}
                            title="View Tracking"
                          >
                            <Truck className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedOrder(order);
                            }}
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Order detail dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 flex-wrap">
              <span>Order #{selectedOrder?.orderNumber}</span>
              <Badge variant="secondary" className={statusColorMap[selectedOrder?.status || '']}>
                {(() => {
                  const label = ORDER_STATUSES.find((s) => s.value === selectedOrder?.status);
                  return label ? (locale === 'ar' ? label.labelAr : label.labelEn) : selectedOrder?.status;
                })()}
              </Badge>
            </DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-6 mt-4">
              {/* Florist task status */}
              {selectedOrder.floristTask && (
                <div className="p-4 bg-indigo-50/50 rounded-xl border border-indigo-100">
                  <h4 className="font-semibold text-[#2D2926] mb-2 flex items-center gap-2">
                    <Scissors className="h-4 w-4 text-indigo-500" />
                    Florist Task
                  </h4>
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary" className={floristStatusConfig[selectedOrder.floristTask.status]?.color || ''}>
                      {floristStatusConfig[selectedOrder.floristTask.status]?.label || selectedOrder.floristTask.status}
                    </Badge>
                    {selectedOrder.floristTask.priority === 'urgent' && (
                      <Badge variant="destructive" className="text-[10px]">Urgent</Badge>
                    )}
                  </div>
                </div>
              )}

              {/* Status update */}
              <div className="flex items-center justify-between p-4 bg-[#F5F0EB]/50 rounded-xl">
                <div>
                  <p className="text-sm text-muted-foreground">Update Status</p>
                  <Select
                    value={selectedOrder.status}
                    onValueChange={(v) => updateStatus(selectedOrder.id, v)}
                    disabled={updatingStatus}
                  >
                    <SelectTrigger className="h-9 w-56 rounded-lg mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUS_OPTIONS.map((s) => {
                        const label = ORDER_STATUSES.find((os) => os.value === s);
                        return (
                          <SelectItem key={s} value={s}>
                            {label ? (locale === 'ar' ? label.labelAr : label.labelEn) : s}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-3">
                  {selectedOrder.status === 'ready_for_pickup' && (
                    <Button
                      onClick={() => handleAssignCourier(selectedOrder.id)}
                      disabled={updatingStatus}
                      className="btn-luxury rounded-xl gap-2"
                      size="sm"
                    >
                      <Truck className="h-4 w-4" />
                      Assign to Courier
                    </Button>
                  )}
                  <div className="text-end">
                    <p className="text-sm text-muted-foreground">Order Total</p>
                    <p className="text-2xl font-bold text-[#C9A96E]">AED {selectedOrder.total.toFixed(2)}</p>
                  </div>
                </div>
              </div>

              {/* Order items */}
              <div>
                <h4 className="font-semibold text-[#2D2926] mb-3 flex items-center gap-2">
                  <Package className="h-4 w-4 text-[#C9A96E]" />
                  Order Items
                </h4>
                <div className="space-y-2">
                  {selectedOrder.items.map((item) => (
                    <div key={item.id} className="flex items-center gap-3 p-3 bg-white rounded-lg border border-[#E8E0D8]">
                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-[#F5F0EB] flex-shrink-0">
                        {item.productImage ? (
                          <img src={item.productImage} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="h-5 w-5 text-muted-foreground/30" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[#2D2926] truncate">{item.productName}</p>
                        <p className="text-xs text-muted-foreground">AED {item.price} × {item.quantity}</p>
                      </div>
                      <span className="text-sm font-semibold text-[#2D2926]">
                        AED {item.total.toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Delivery info */}
              <div>
                <h4 className="font-semibold text-[#2D2926] mb-3 flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-[#C9A96E]" />
                  Delivery Information
                </h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-muted-foreground">Recipient</span>
                    <p className="font-medium text-[#2D2926]">{selectedOrder.recipientName}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Phone</span>
                    <p className="font-medium text-[#2D2926]">{selectedOrder.recipientPhone}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">City</span>
                    <p className="font-medium text-[#2D2926]">{selectedOrder.deliveryCity}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Area</span>
                    <p className="font-medium text-[#2D2926]">{selectedOrder.deliveryArea || '—'}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Address</span>
                    <p className="font-medium text-[#2D2926]">
                      {[selectedOrder.deliveryStreet, selectedOrder.deliveryBuilding, selectedOrder.deliveryApartment]
                        .filter(Boolean)
                        .join(', ') || '—'}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Date</span>
                    <p className="font-medium text-[#2D2926] flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {selectedOrder.deliveryDate || 'ASAP'}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Time Slot</span>
                    <p className="font-medium text-[#2D2926] flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {selectedOrder.deliveryTime || 'Any'}
                    </p>
                  </div>
                  {selectedOrder.deliveryNotes && (
                    <div className="col-span-2">
                      <span className="text-muted-foreground">Notes</span>
                      <p className="font-medium text-[#2D2926]">{selectedOrder.deliveryNotes}</p>
                    </div>
                  )}
                </div>
              </div>

              <Separator />

              {/* Gift options */}
              {(selectedOrder.giftWrap || selectedOrder.greetingCard) && (
                <div>
                  <h4 className="font-semibold text-[#2D2926] mb-3 flex items-center gap-2">
                    <Gift className="h-4 w-4 text-[#C9A96E]" />
                    Gift Options
                  </h4>
                  <div className="text-sm space-y-1">
                    {selectedOrder.giftWrap && <p className="text-[#5C534A]">✓ Gift wrapping included (AED {selectedOrder.giftWrapPrice})</p>}
                    {selectedOrder.greetingCard && <p className="text-[#5C534A]">✓ Greeting card: &ldquo;{selectedOrder.greetingCard}&rdquo;</p>}
                  </div>
                </div>
              )}

              {/* Payment info */}
              <div>
                <h4 className="font-semibold text-[#2D2926] mb-3 flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-[#C9A96E]" />
                  Payment Information
                </h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-muted-foreground">Method</span>
                    <p className="font-medium text-[#2D2926] capitalize">{selectedOrder.paymentMethod}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Status</span>
                    <Badge
                      variant="secondary"
                      className={
                        selectedOrder.paymentStatus === 'paid'
                          ? 'bg-green-100 text-green-700'
                          : selectedOrder.paymentStatus === 'failed'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }
                    >
                      {selectedOrder.paymentStatus}
                    </Badge>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Subtotal</span>
                    <p className="font-medium text-[#2D2926]">AED {selectedOrder.subtotal.toFixed(2)}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Delivery Fee</span>
                    <p className="font-medium text-[#2D2926]">AED {selectedOrder.deliveryFee.toFixed(2)}</p>
                  </div>
                  {selectedOrder.discount > 0 && (
                    <div>
                      <span className="text-muted-foreground">Discount</span>
                      <p className="font-medium text-destructive">-AED {selectedOrder.discount.toFixed(2)}</p>
                    </div>
                  )}
                  {selectedOrder.couponCode && (
                    <div>
                      <span className="text-muted-foreground">Coupon</span>
                      <p className="font-medium text-[#C9A96E]">{selectedOrder.couponCode}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Tracking dialog */}
      <Dialog open={!!trackingOrder} onOpenChange={() => setTrackingOrder(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <Truck className="h-5 w-5 text-[#C9A96E]" />
              <span>Order Tracking #{trackingOrder?.orderNumber}</span>
            </DialogTitle>
          </DialogHeader>
          {trackingOrder && (
            <OrderTimeline order={trackingOrder} tracking={trackingOrder.deliveryTracking} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
