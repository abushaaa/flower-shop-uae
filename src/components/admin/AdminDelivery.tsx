'use client';

import { useState } from 'react';
import { useLanguageStore } from '@/lib/stores';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
  Truck,
  Clock,
  CheckCircle,
  XCircle,
  MapPin,
  Package,
  ArrowRight,
  Phone,
  User,
  Calendar,
  RefreshCw,
} from 'lucide-react';
import { toast } from 'sonner';

interface DeliveryTask {
  id: string;
  orderNumber: string;
  recipientName: string;
  recipientPhone: string;
  deliveryCity: string;
  deliveryAddress: string;
  provider: string;
  courierName: string;
  status: 'pending_pickup' | 'picked_up' | 'out_for_delivery' | 'delivered' | 'failed';
  timeline: { status: string; time: string; note?: string }[];
  updatedAt: string;
}

const MOCK_DELIVERIES: DeliveryTask[] = [
  {
    id: 'd1', orderNumber: 'BG-1058', recipientName: 'Sarah M.', recipientPhone: '+971501234567',
    deliveryCity: 'Dubai', deliveryAddress: 'Marina Walk, Bldg 42, Apt 5',
    provider: 'Careem', courierName: 'Ali H.',
    status: 'pending_pickup',
    timeline: [
      { status: 'Order Ready', time: '2024-12-24 09:00 AM', note: 'Package ready at shop' },
    ],
    updatedAt: '2024-12-24T09:00:00Z',
  },
  {
    id: 'd2', orderNumber: 'BG-1056', recipientName: 'Ahmed K.', recipientPhone: '+971509876543',
    deliveryCity: 'Abu Dhabi', deliveryAddress: 'Al Reem Island, Gate Tower, Floor 12',
    provider: 'Jeebly', courierName: 'Mohammed S.',
    status: 'picked_up',
    timeline: [
      { status: 'Order Ready', time: '2024-12-24 08:00 AM', note: 'Package ready' },
      { status: 'Picked Up', time: '2024-12-24 08:45 AM', note: 'Courier picked up' },
    ],
    updatedAt: '2024-12-24T08:45:00Z',
  },
  {
    id: 'd3', orderNumber: 'BG-1054', recipientName: 'Fatima R.', recipientPhone: '+971505551234',
    deliveryCity: 'Dubai', deliveryAddress: 'JBR, Beach View Tower, Apt 1802',
    provider: 'Careem', courierName: 'Khalid M.',
    status: 'out_for_delivery',
    timeline: [
      { status: 'Order Ready', time: '2024-12-24 07:30 AM' },
      { status: 'Picked Up', time: '2024-12-24 08:00 AM' },
      { status: 'Out for Delivery', time: '2024-12-24 09:15 AM', note: 'On the way to customer' },
    ],
    updatedAt: '2024-12-24T09:15:00Z',
  },
  {
    id: 'd4', orderNumber: 'BG-1050', recipientName: 'Omar S.', recipientPhone: '+971507779988',
    deliveryCity: 'Sharjah', deliveryAddress: 'Al Qasba, Bldg 5, Shop 12',
    provider: 'Custom', courierName: 'Hassan A.',
    status: 'delivered',
    timeline: [
      { status: 'Order Ready', time: '2024-12-23 02:00 PM' },
      { status: 'Picked Up', time: '2024-12-23 02:30 PM' },
      { status: 'Out for Delivery', time: '2024-12-23 03:00 PM' },
      { status: 'Delivered', time: '2024-12-23 03:45 PM', note: 'Handed to recipient' },
    ],
    updatedAt: '2024-12-24T15:45:00Z',
  },
  {
    id: 'd5', orderNumber: 'BG-1048', recipientName: 'Layla H.', recipientPhone: '+971503344556',
    deliveryCity: 'Dubai', deliveryAddress: 'Downtown, Burj Residences, Apt 3104',
    provider: 'Careem', courierName: 'Youssef T.',
    status: 'failed',
    timeline: [
      { status: 'Order Ready', time: '2024-12-24 06:00 AM' },
      { status: 'Picked Up', time: '2024-12-24 06:30 AM' },
      { status: 'Out for Delivery', time: '2024-12-24 07:00 AM' },
      { status: 'Failed', time: '2024-12-24 07:45 AM', note: 'No answer, will retry' },
    ],
    updatedAt: '2024-12-24T07:45:00Z',
  },
];

const statusColorMap: Record<string, string> = {
  pending_pickup: 'bg-yellow-100 text-yellow-700',
  picked_up: 'bg-indigo-100 text-indigo-700',
  out_for_delivery: 'bg-orange-100 text-orange-700',
  delivered: 'bg-green-100 text-green-700',
  failed: 'bg-red-100 text-red-700',
};

const statusLabels: Record<string, string> = {
  pending_pickup: 'Pending Pickup',
  picked_up: 'Picked Up',
  out_for_delivery: 'Out for Delivery',
  delivered: 'Delivered',
  failed: 'Failed',
};

export default function AdminDelivery() {
  const { locale } = useLanguageStore();
  const [deliveries, setDeliveries] = useState<DeliveryTask[]>(MOCK_DELIVERIES);
  const [selectedDelivery, setSelectedDelivery] = useState<DeliveryTask | null>(null);
  const [providerFilter, setProviderFilter] = useState('all');

  const stats = {
    pendingPickup: deliveries.filter((d) => d.status === 'pending_pickup').length,
    outForDelivery: deliveries.filter((d) => d.status === 'out_for_delivery').length,
    deliveredToday: deliveries.filter((d) => d.status === 'delivered').length,
    failed: deliveries.filter((d) => d.status === 'failed').length,
  };

  const filtered = providerFilter === 'all' ? deliveries : deliveries.filter((d) => d.provider === providerFilter);

  const simulateStatusUpdate = (deliveryId: string, newStatus?: string) => {
    const statusFlow: Record<string, string> = {
      pending_pickup: 'picked_up',
      picked_up: 'out_for_delivery',
      out_for_delivery: 'delivered',
    };

    const nextStatus = newStatus || statusFlow[deliveries.find((d) => d.id === deliveryId)?.status || ''];
    if (!nextStatus) return;

    const now = new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

    setDeliveries(deliveries.map((d) => {
      if (d.id !== deliveryId) return d;
      return {
        ...d,
        status: nextStatus as DeliveryTask['status'],
        timeline: [
          ...d.timeline,
          {
            status: statusLabels[nextStatus] || nextStatus,
            time: now,
          },
        ],
        updatedAt: new Date().toISOString(),
      };
    }));
    if (selectedDelivery?.id === deliveryId) {
      const updated = deliveries.find((d) => d.id === deliveryId);
      if (updated) {
        setSelectedDelivery({
          ...updated,
          status: nextStatus as DeliveryTask['status'],
          timeline: [
            ...updated.timeline,
            { status: statusLabels[nextStatus] || nextStatus, time: now },
          ],
        });
      }
    }
    toast.success(`Status updated to ${statusLabels[nextStatus]}`);
  };

  const changeProvider = (deliveryId: string, provider: string) => {
    setDeliveries(deliveries.map((d) => d.id === deliveryId ? { ...d, provider } : d));
    if (selectedDelivery?.id === deliveryId) {
      setSelectedDelivery({ ...selectedDelivery, provider });
    }
    toast.success(`Provider changed to ${provider}`);
  };

  return (
    <div className="space-y-6">
      {/* Overview cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Pending Pickup', count: stats.pendingPickup, icon: Clock, color: 'text-yellow-500 bg-yellow-50', border: 'border-yellow-200' },
          { label: 'Out for Delivery', count: stats.outForDelivery, icon: Truck, color: 'text-orange-500 bg-orange-50', border: 'border-orange-200' },
          { label: 'Delivered Today', count: stats.deliveredToday, icon: CheckCircle, color: 'text-green-500 bg-green-50', border: 'border-green-200' },
          { label: 'Failed', count: stats.failed, icon: XCircle, color: 'text-red-500 bg-red-50', border: 'border-red-200' },
        ].map((stat) => (
          <Card key={stat.label} className={`border ${stat.border} shadow-sm rounded-xl`}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-bold text-[#2D2926] mt-1">{stat.count}</p>
                </div>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.color}`}>
                  <stat.icon className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <Select value={providerFilter} onValueChange={setProviderFilter}>
          <SelectTrigger className="w-44 rounded-xl">
            <SelectValue placeholder="All Providers" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Providers</SelectItem>
            <SelectItem value="Careem">Careem</SelectItem>
            <SelectItem value="Jeebly">Jeebly</SelectItem>
            <SelectItem value="Custom">Custom</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Deliveries table */}
      <div className="bg-white rounded-xl border border-[#E8E0D8] shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Order #</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>City</TableHead>
              <TableHead>Provider</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last Update</TableHead>
              <TableHead className="text-end">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  No deliveries found
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((delivery) => (
                <TableRow
                  key={delivery.id}
                  className="hover:bg-[#F5F0EB]/50 cursor-pointer"
                  onClick={() => setSelectedDelivery(delivery)}
                >
                  <TableCell className="font-medium text-[#2D2926]">#{delivery.orderNumber}</TableCell>
                  <TableCell>
                    <div>
                      <p className="text-sm font-medium text-[#2D2926]">{delivery.recipientName}</p>
                      <p className="text-xs text-muted-foreground">{delivery.courierName}</p>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">{delivery.deliveryCity}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs border-[#E8E0D8]">{delivery.provider}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={statusColorMap[delivery.status]}>
                      {statusLabels[delivery.status]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(delivery.updatedAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                  </TableCell>
                  <TableCell className="text-end">
                    {(delivery.status === 'pending_pickup' || delivery.status === 'picked_up' || delivery.status === 'out_for_delivery') && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="rounded-lg text-xs h-7 gap-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          simulateStatusUpdate(delivery.id);
                        }}
                      >
                        <ArrowRight className="h-3 w-3" />
                        Next Status
                      </Button>
                    )}
                    {delivery.status === 'failed' && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="rounded-lg text-xs h-7 gap-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          simulateStatusUpdate(delivery.id, 'out_for_delivery');
                        }}
                      >
                        <RefreshCw className="h-3 w-3" />
                        Retry
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Delivery Detail Dialog */}
      {selectedDelivery && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelectedDelivery(null)}>
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[85vh] overflow-y-auto p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-[#2D2926]">Order #{selectedDelivery.orderNumber}</h3>
                <Badge variant="secondary" className={statusColorMap[selectedDelivery.status] + ' mt-1'}>
                  {statusLabels[selectedDelivery.status]}
                </Badge>
              </div>
              <button onClick={() => setSelectedDelivery(null)} className="text-muted-foreground hover:text-[#2D2926] text-xl">&times;</button>
            </div>

            {/* Delivery info */}
            <div className="grid grid-cols-2 gap-3 text-sm mb-6">
              <div className="flex items-center gap-2">
                <User className="h-3.5 w-3.5 text-[#C9A96E]" />
                <span className="text-muted-foreground">Recipient</span>
                <span className="font-medium text-[#2D2926]">{selectedDelivery.recipientName}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-3.5 w-3.5 text-[#C9A96E]" />
                <span className="text-muted-foreground">Phone</span>
                <span className="font-medium text-[#2D2926]">{selectedDelivery.recipientPhone}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5 text-[#C9A96E]" />
                <span className="font-medium text-[#2D2926]">{selectedDelivery.deliveryAddress}</span>
              </div>
              <div className="flex items-center gap-2">
                <Package className="h-3.5 w-3.5 text-[#C9A96E]" />
                <span className="font-medium text-[#2D2926]">Courier: {selectedDelivery.courierName}</span>
              </div>
            </div>

            {/* Provider selector */}
            <div className="mb-6">
              <Label className="text-sm text-muted-foreground mb-1 block">Delivery Provider</Label>
              <Select value={selectedDelivery.provider} onValueChange={(v) => changeProvider(selectedDelivery.id, v)}>
                <SelectTrigger className="rounded-xl h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Careem">Careem</SelectItem>
                  <SelectItem value="Jeebly">Jeebly</SelectItem>
                  <SelectItem value="Custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Timeline */}
            <div className="mb-6">
              <h4 className="font-semibold text-[#2D2926] mb-3 flex items-center gap-2">
                <Clock className="h-4 w-4 text-[#C9A96E]" />
                Tracking Timeline
              </h4>
              <div className="relative">
                <div className="absolute start-[15px] top-2 bottom-2 w-0.5 bg-[#E8E0D8]" />
                <div className="space-y-4">
                  {selectedDelivery.timeline.map((event, idx) => (
                    <div key={idx} className="relative flex items-start gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 z-10 ${
                        idx === selectedDelivery.timeline.length - 1
                          ? 'bg-[#C9A96E] text-white'
                          : 'bg-white border-2 border-[#C9A96E] text-[#C9A96E]'
                      }`}>
                        <CheckCircle className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-[#2D2926]">{event.status}</p>
                        <p className="text-xs text-muted-foreground">{event.time}</p>
                        {event.note && <p className="text-xs text-[#5C534A] mt-0.5">{event.note}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Action buttons */}
            {(selectedDelivery.status === 'pending_pickup' || selectedDelivery.status === 'picked_up' || selectedDelivery.status === 'out_for_delivery') && (
              <Button
                onClick={() => simulateStatusUpdate(selectedDelivery.id)}
                className="btn-luxury w-full rounded-xl"
              >
                <ArrowRight className="h-4 w-4 me-2" />
                Simulate: {statusLabels[
                  selectedDelivery.status === 'pending_pickup' ? 'picked_up'
                  : selectedDelivery.status === 'picked_up' ? 'out_for_delivery'
                  : 'delivered'
                ]}
              </Button>
            )}
            {selectedDelivery.status === 'failed' && (
              <Button
                onClick={() => simulateStatusUpdate(selectedDelivery.id, 'out_for_delivery')}
                className="btn-luxury w-full rounded-xl"
              >
                <RefreshCw className="h-4 w-4 me-2" />
                Retry Delivery
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function Label({ className, children, ...props }: React.LabelHTMLAttributes<HTMLLabelElement> & { className?: string }) {
  return (
    <label className={className} {...props}>
      {children}
    </label>
  );
}
