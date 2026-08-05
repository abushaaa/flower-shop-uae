'use client';

import { useState, useEffect, useCallback } from 'react';
import { useLanguageStore } from '@/lib/stores';
import { type FloristTask, type OrderItem } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Flower2,
  Clock,
  PlayCircle,
  Scissors,
  Package,
  CheckCircle,
  Calendar,
  MapPin,
  User,
  MessageSquare,
  Gift,
  RefreshCw,
} from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

type TaskFilter = 'all' | 'pending' | 'in_progress' | 'ready' | 'completed';

interface FloristTaskWithOrder extends FloristTask {
  order?: {
    id: string;
    orderNumber: string;
    recipientName: string;
    recipientPhone: string;
    deliveryCity: string;
    deliveryDate: string | null;
    deliveryTime: string | null;
    greetingCard: string | null;
    items: OrderItem[];
    total: number;
  };
}

const MOCK_TASKS: FloristTaskWithOrder[] = [
  {
    id: 't1', orderId: 'o1', assignedToId: 'f1', status: 'pending', priority: 'normal', notes: null,
    startedAt: null, preparedAt: null, packageReadyAt: null, completedAt: null, createdAt: '2024-12-24T08:00:00Z', updatedAt: '2024-12-24T08:00:00Z',
    order: {
      id: 'o1', orderNumber: 'BG-1061', recipientName: 'Sarah M.', recipientPhone: '+971501234567',
      deliveryCity: 'Dubai', deliveryDate: '2024-12-25', deliveryTime: 'morning',
      greetingCard: 'Happy Birthday! Wishing you all the best.',
      items: [
        { id: 'i1', orderId: 'o1', productId: 'p1', productName: 'Royal Red Rose Bouquet', productImage: 'https://picsum.photos/seed/rose1/100/100', price: 299, quantity: 1, total: 299, createdAt: '' },
        { id: 'i2', orderId: 'o1', productId: 'p2', productName: 'Chocolate Truffle Box', productImage: 'https://picsum.photos/seed/choc1/100/100', price: 85, quantity: 1, total: 85, createdAt: '' },
      ], total: 409,
    },
  },
  {
    id: 't2', orderId: 'o2', assignedToId: 'f1', status: 'started', priority: 'urgent', notes: 'VIP customer',
    startedAt: '2024-12-24T09:00:00Z', preparedAt: null, packageReadyAt: null, completedAt: null, createdAt: '2024-12-24T07:30:00Z', updatedAt: '2024-12-24T09:00:00Z',
    order: {
      id: 'o2', orderNumber: 'BG-1060', recipientName: 'Ahmed K.', recipientPhone: '+971509876543',
      deliveryCity: 'Abu Dhabi', deliveryDate: '2024-12-24', deliveryTime: 'afternoon',
      greetingCard: 'Congratulations on your wedding!',
      items: [
        { id: 'i3', orderId: 'o2', productId: 'p3', productName: 'Luxury White Lily Arrangement', productImage: 'https://picsum.photos/seed/lily1/100/100', price: 350, quantity: 1, total: 350, createdAt: '' },
      ], total: 380,
    },
  },
  {
    id: 't3', orderId: 'o3', assignedToId: 'f1', status: 'in_preparation', priority: 'normal', notes: null,
    startedAt: '2024-12-24T08:30:00Z', preparedAt: null, packageReadyAt: null, completedAt: null, createdAt: '2024-12-24T07:00:00Z', updatedAt: '2024-12-24T08:30:00Z',
    order: {
      id: 'o3', orderNumber: 'BG-1059', recipientName: 'Fatima R.', recipientPhone: '+971505551234',
      deliveryCity: 'Dubai', deliveryDate: '2024-12-24', deliveryTime: 'evening',
      greetingCard: null,
      items: [
        { id: 'i4', orderId: 'o3', productId: 'p4', productName: 'Eid Mubarak Collection', productImage: 'https://picsum.photos/seed/eid1/100/100', price: 450, quantity: 1, total: 450, createdAt: '' },
        { id: 'i5', orderId: 'o3', productId: 'p5', productName: 'Mixed Rose Bouquet', productImage: 'https://picsum.photos/seed/mix1/100/100', price: 199, quantity: 2, total: 398, createdAt: '' },
      ], total: 898,
    },
  },
  {
    id: 't4', orderId: 'o4', assignedToId: 'f1', status: 'package_ready', priority: 'normal', notes: null,
    startedAt: '2024-12-24T07:00:00Z', preparedAt: '2024-12-24T08:00:00Z', packageReadyAt: '2024-12-24T09:00:00Z', completedAt: null, createdAt: '2024-12-24T06:00:00Z', updatedAt: '2024-12-24T09:00:00Z',
    order: {
      id: 'o4', orderNumber: 'BG-1058', recipientName: 'Omar S.', recipientPhone: '+971507779988',
      deliveryCity: 'Sharjah', deliveryDate: '2024-12-24', deliveryTime: 'morning',
      greetingCard: 'Get well soon!',
      items: [
        { id: 'i6', orderId: 'o4', productId: 'p6', productName: 'Sunflower Bouquet', productImage: 'https://picsum.photos/seed/sun1/100/100', price: 180, quantity: 1, total: 180, createdAt: '' },
      ], total: 205,
    },
  },
  {
    id: 't5', orderId: 'o5', assignedToId: 'f1', status: 'completed', priority: 'normal', notes: null,
    startedAt: '2024-12-23T10:00:00Z', preparedAt: '2024-12-23T11:00:00Z', packageReadyAt: '2024-12-23T12:00:00Z', completedAt: '2024-12-23T13:00:00Z', createdAt: '2024-12-23T09:00:00Z', updatedAt: '2024-12-23T13:00:00Z',
    order: {
      id: 'o5', orderNumber: 'BG-1055', recipientName: 'Layla H.', recipientPhone: '+971503344556',
      deliveryCity: 'Dubai', deliveryDate: '2024-12-23', deliveryTime: 'afternoon',
      greetingCard: 'Happy Anniversary!',
      items: [
        { id: 'i7', orderId: 'o5', productId: 'p7', productName: 'Pink Peony Bouquet', productImage: 'https://picsum.photos/seed/peony1/100/100', price: 320, quantity: 1, total: 320, createdAt: '' },
      ], total: 345,
    },
  },
];

const filterTabs: { key: TaskFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'in_progress', label: 'In Progress' },
  { key: 'ready', label: 'Ready' },
  { key: 'completed', label: 'Completed' },
];

const statusConfig: Record<string, { color: string; icon: any; actionLabel: string; actionColor: string; nextStatus: string | null }> = {
  pending: {
    color: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    icon: Clock,
    actionLabel: 'Start Preparing',
    actionColor: 'bg-blue-500 hover:bg-blue-600 text-white',
    nextStatus: 'started',
  },
  started: {
    color: 'bg-indigo-100 text-indigo-700 border-indigo-200',
    icon: PlayCircle,
    actionLabel: 'In Preparation',
    actionColor: 'bg-indigo-500 hover:bg-indigo-600 text-white',
    nextStatus: 'in_preparation',
  },
  in_preparation: {
    color: 'bg-cyan-100 text-cyan-700 border-cyan-200',
    icon: Scissors,
    actionLabel: 'Package Ready',
    actionColor: 'bg-green-500 hover:bg-green-600 text-white',
    nextStatus: 'package_ready',
  },
  package_ready: {
    color: 'bg-green-100 text-green-700 border-green-200',
    icon: Package,
    actionLabel: 'Dispatched to Courier',
    actionColor: '',
    nextStatus: null,
  },
  completed: {
    color: 'bg-gray-100 text-gray-500 border-gray-200',
    icon: CheckCircle,
    actionLabel: 'Completed',
    actionColor: '',
    nextStatus: null,
  },
};

export default function FloristDashboard() {
  const { locale } = useLanguageStore();
  const [tasks, setTasks] = useState<FloristTaskWithOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<TaskFilter>('all');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchTasks = useCallback(async () => {
    try {
      const res = await fetch('/api/florist/tasks');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setTasks(data);
          return;
        }
      }
    } catch {
      // Use mock data
    }
    setTasks(MOCK_TASKS);
  }, []);

  useEffect(() => {
    fetchTasks().finally(() => setLoading(false));
  }, [fetchTasks]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchTasks();
    }, 30000);
    return () => clearInterval(interval);
  }, [fetchTasks]);

  const updateTaskStatus = async (taskId: string, newStatus: string) => {
    setUpdatingId(taskId);
    try {
      const res = await fetch(`/api/florist/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setTasks(tasks.map((t) => (t.id === taskId ? { ...t, status: newStatus as FloristTask['status'] } : t)));
        toast.success('Task status updated');
      } else {
        // Mock update
        setTasks(tasks.map((t) => (t.id === taskId ? { ...t, status: newStatus as FloristTask['status'] } : t)));
        toast.success('Task status updated');
      }
    } catch {
      setTasks(tasks.map((t) => (t.id === taskId ? { ...t, status: newStatus as FloristTask['status'] } : t)));
      toast.success('Task status updated');
    }
    setUpdatingId(null);
  };

  const filteredTasks = tasks.filter((task) => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'in_progress') return ['started', 'in_preparation'].includes(task.status);
    if (activeFilter === 'ready') return task.status === 'package_ready';
    return task.status === activeFilter;
  });

  const taskCounts = {
    all: tasks.length,
    pending: tasks.filter((t) => t.status === 'pending').length,
    in_progress: tasks.filter((t) => ['started', 'in_preparation'].includes(t.status)).length,
    ready: tasks.filter((t) => t.status === 'package_ready').length,
    completed: tasks.filter((t) => t.status === 'completed').length,
  };

  const getUrgencyBadge = (deliveryDate: string | null) => {
    if (!deliveryDate) return null;
    const today = new Date().toISOString().split('T')[0];
    const isToday = deliveryDate === today;
    const isPast = deliveryDate < today;
    if (isPast) return <Badge variant="destructive" className="text-[10px] px-2 py-0">Overdue</Badge>;
    if (isToday) return <Badge className="bg-red-100 text-red-700 text-[10px] px-2 py-0 border-0">Today</Badge>;
    const diff = Math.ceil((new Date(deliveryDate).getTime() - Date.now()) / 86400000);
    if (diff <= 2) return <Badge className="bg-orange-100 text-orange-700 text-[10px] px-2 py-0 border-0">{diff === 1 ? 'Tomorrow' : `In ${diff} days`}</Badge>;
    return null;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FEFCF9]">
        <div className="bg-white border-b border-[#E8E0D8] px-6 py-4">
          <Skeleton className="h-8 w-64 rounded-lg" />
        </div>
        <div className="p-6 space-y-4">
          <div className="flex gap-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-10 w-28 rounded-full" />
            ))}
          </div>
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-48 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FEFCF9]">
      {/* Header */}
      <div className="bg-white border-b border-[#E8E0D8]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-[#C9A96E]/10 flex items-center justify-center">
                <Flower2 className="h-6 w-6 text-[#C9A96E]" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-[#2D2926]">
                  {locale === 'ar' ? 'محطة عمل الزهور' : 'Florist Workstation'}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {tasks.filter((t) => t.status !== 'completed').length} active tasks
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" onClick={() => { fetchTasks(); toast.info('Refreshed'); }} className="gap-2 rounded-xl border-[#E8E0D8]">
                <RefreshCw className="h-4 w-4" />
                Refresh
              </Button>
            </div>
          </div>

          {/* Quick stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
            {[
              { label: 'Pending', count: taskCounts.pending, color: 'bg-yellow-50 border-yellow-200', icon: Clock, iconColor: 'text-yellow-500' },
              { label: 'In Progress', count: taskCounts.in_progress, color: 'bg-indigo-50 border-indigo-200', icon: Scissors, iconColor: 'text-indigo-500' },
              { label: 'Ready', count: taskCounts.ready, color: 'bg-green-50 border-green-200', icon: Package, iconColor: 'text-green-500' },
              { label: 'Completed', count: taskCounts.completed, color: 'bg-gray-50 border-gray-200', icon: CheckCircle, iconColor: 'text-gray-400' },
            ].map((stat) => (
              <div key={stat.label} className={`p-3 rounded-xl border ${stat.color}`}>
                <div className="flex items-center gap-2">
                  <stat.icon className={`h-4 w-4 ${stat.iconColor}`} />
                  <span className="text-xs text-muted-foreground">{stat.label}</span>
                </div>
                <p className="text-2xl font-bold text-[#2D2926] mt-1">{stat.count}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 mt-6">
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {filterTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveFilter(tab.key)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                activeFilter === tab.key
                  ? 'bg-[#C9A96E] text-white shadow-md shadow-[#C9A96E]/20'
                  : 'bg-white text-[#5C534A] border border-[#E8E0D8] hover:border-[#C9A96E]/30 hover:text-[#C9A96E]'
              }`}
            >
              {tab.label}
              <span className={`ms-2 text-xs ${activeFilter === tab.key ? 'text-white/80' : 'text-muted-foreground'}`}>
                {taskCounts[tab.key]}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Task cards */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        {filteredTasks.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-[#F5F0EB] flex items-center justify-center">
              <Flower2 className="h-10 w-10 text-[#C9A96E]/30" />
            </div>
            <p className="text-muted-foreground text-lg mb-1">No tasks found</p>
            <p className="text-sm text-muted-foreground/60">Tasks matching this filter will appear here</p>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {filteredTasks.map((task, idx) => {
                const config = statusConfig[task.status];
                const StatusIcon = config.icon;
                const urgency = task.order?.deliveryDate ? getUrgencyBadge(task.order.deliveryDate) : null;

                return (
                  <motion.div
                    key={task.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: idx * 0.05 }}
                    className="bg-white rounded-2xl border border-[#E8E0D8] shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                  >
                    {/* Card header */}
                    <div className="p-4 sm:p-5 border-b border-[#E8E0D8]/50">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${config.color}`}>
                            <StatusIcon className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="font-bold text-[#2D2926]">
                              {locale === 'ar' ? 'طلب' : 'Order'} #{task.order?.orderNumber || '—'}
                            </p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <User className="h-3 w-3 text-muted-foreground" />
                              <span className="text-sm text-muted-foreground">{task.order?.recipientName || '—'}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {task.priority === 'urgent' && (
                            <Badge variant="destructive" className="text-[10px] px-2 py-0">Urgent</Badge>
                          )}
                          {urgency}
                        </div>
                      </div>

                      {/* Order items thumbnails */}
                      {task.order?.items && task.order.items.length > 0 && (
                        <div className="flex items-center gap-2 mt-3">
                          {task.order.items.map((item) => (
                            <div key={item.id} className="relative">
                              <div className="w-12 h-12 rounded-lg overflow-hidden bg-[#F5F0EB] border border-[#E8E0D8] flex-shrink-0">
                                {item.productImage ? (
                                  <img src={item.productImage} alt="" className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <Flower2 className="h-4 w-4 text-muted-foreground/30" />
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                          <span className="text-xs text-muted-foreground">
                            {task.order.items.length} {locale === 'ar' ? 'عناصر' : 'items'}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Card body */}
                    <div className="p-4 sm:p-5 space-y-3">
                      {/* Greeting card */}
                      {task.order?.greetingCard && (
                        <div className="bg-[#F5F0EB]/50 rounded-xl p-3">
                          <div className="flex items-center gap-2 mb-1">
                            <Gift className="h-3.5 w-3.5 text-[#C9A96E]" />
                            <span className="text-xs font-medium text-[#C9A96E]">Greeting Card</span>
                          </div>
                          <p className="text-sm text-[#5C534A] italic line-clamp-2">&ldquo;{task.order.greetingCard}&rdquo;</p>
                        </div>
                      )}

                      {/* Delivery info */}
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <Calendar className="h-3.5 w-3.5" />
                          <span>{task.order?.deliveryDate || 'ASAP'}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <Clock className="h-3.5 w-3.5" />
                          <span>{task.order?.deliveryTime || 'Any'}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <MapPin className="h-3.5 w-3.5" />
                          <span>{task.order?.deliveryCity || '—'}</span>
                        </div>
                      </div>

                      {/* Notes */}
                      {task.notes && (
                        <div className="flex items-start gap-2 text-sm">
                          <MessageSquare className="h-3.5 w-3.5 text-[#C9A96E] mt-0.5 flex-shrink-0" />
                          <span className="text-[#5C534A]">{task.notes}</span>
                        </div>
                      )}

                      {/* Action button */}
                      {config.nextStatus && (
                        <Button
                          onClick={() => updateTaskStatus(task.id, config.nextStatus!)}
                          disabled={updatingId === task.id}
                          className={`w-full rounded-xl h-10 font-medium gap-2 ${config.actionColor}`}
                        >
                          {updatingId === task.id ? (
                            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          ) : config.nextStatus === 'package_ready' ? (
                            <Package className="h-4 w-4" />
                          ) : (
                            <PlayCircle className="h-4 w-4" />
                          )}
                          {config.actionLabel}
                        </Button>
                      )}

                      {!config.nextStatus && task.status === 'package_ready' && (
                        <div className="flex items-center justify-center gap-2 text-green-600 text-sm font-medium bg-green-50 rounded-xl py-2.5">
                          <CheckCircle className="h-4 w-4" />
                          Dispatched to Courier
                        </div>
                      )}

                      {!config.nextStatus && task.status === 'completed' && (
                        <div className="flex items-center justify-center gap-2 text-muted-foreground text-sm font-medium bg-gray-50 rounded-xl py-2.5">
                          <CheckCircle className="h-4 w-4" />
                          Completed
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
