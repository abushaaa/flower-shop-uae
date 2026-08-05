'use client';

import { useState, useEffect } from 'react';
import { useLanguageStore } from '@/lib/stores';
import { t } from '@/lib/i18n';
import { Coupon } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
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
import { Plus, Edit, Trash2, Tag } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminCoupons() {
  const { locale } = useLanguageStore();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Coupon | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    code: '',
    type: 'percentage' as 'percentage' | 'fixed',
    value: '',
    minOrder: '',
    maxUses: '',
    expiresAt: '',
    isActive: true,
  });

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await fetch('/api/admin/coupons');
        if (res.ok && !cancelled) {
          const data = await res.json();
          setCoupons(Array.isArray(data) ? data : data.coupons || []);
        }
      } catch {
        if (!cancelled) setCoupons([]);
      }
      if (!cancelled) setLoading(false);
    };
    load();
    return () => { cancelled = true; };
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({ code: '', type: 'percentage', value: '', minOrder: '', maxUses: '', expiresAt: '', isActive: true });
    setDialogOpen(true);
  };

  const openEdit = (coupon: Coupon) => {
    setEditing(coupon);
    setForm({
      code: coupon.code,
      type: coupon.type,
      value: String(coupon.value),
      minOrder: String(coupon.minOrder),
      maxUses: coupon.maxUses ? String(coupon.maxUses) : '',
      expiresAt: coupon.expiresAt ? coupon.expiresAt.split('T')[0] : '',
      isActive: coupon.isActive,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      const payload = {
        ...form,
        value: Number(form.value) || 0,
        minOrder: Number(form.minOrder) || 0,
        maxUses: form.maxUses ? Number(form.maxUses) : null,
        expiresAt: form.expiresAt ? new Date(form.expiresAt).toISOString() : null,
      };

      if (editing) {
        const res = await fetch(`/api/admin/coupons/${editing.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          toast.success('Coupon updated!');
          // Re-fetch coupons
          fetch('/api/admin/coupons').then(r => r.ok && r.json()).then(d => {
            if (d) setCoupons(Array.isArray(d) ? d : d.coupons || []);
          });
        }
      } else {
        const res = await fetch('/api/admin/coupons', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          toast.success('Coupon created!');
          fetch('/api/admin/coupons').then(r => r.ok && r.json()).then(d => {
            if (d) setCoupons(Array.isArray(d) ? d : d.coupons || []);
          });
        }
      }
    } catch {
      toast.error('Failed to save coupon');
    }
    setDialogOpen(false);
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      const res = await fetch(`/api/admin/coupons/${deletingId}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Coupon deleted!');
        setCoupons(coupons.filter((c) => c.id !== deletingId));
      }
    } catch {
      toast.error('Failed to delete coupon');
    }
    setDeleteDialogOpen(false);
    setDeletingId(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button onClick={openCreate} className="btn-luxury rounded-xl gap-2">
          <Plus className="h-4 w-4" />
          {t('admin.createCoupon', locale)}
        </Button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-14 rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-[#E8E0D8] shadow-sm overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Code</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Value</TableHead>
                <TableHead>{t('admin.minOrder', locale)}</TableHead>
                <TableHead>Usage</TableHead>
                <TableHead>Expires</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-end">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {coupons.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    No coupons yet
                  </TableCell>
                </TableRow>
              ) : (
                coupons.map((coupon) => {
                  const isExpired = coupon.expiresAt && new Date(coupon.expiresAt) < new Date();
                  return (
                    <TableRow key={coupon.id} className="hover:bg-[#F5F0EB]/50">
                      <TableCell>
                        <code className="px-2.5 py-1 bg-[#F5F0EB] rounded-lg text-sm font-bold text-[#C9A96E]">
                          {coupon.code}
                        </code>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="text-xs">
                          {coupon.type === 'percentage' ? t('admin.percentage', locale) : t('admin.fixedAmount', locale)}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium text-[#2D2926]">
                        {coupon.type === 'percentage' ? `${coupon.value}%` : `AED ${coupon.value}`}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">AED {coupon.minOrder}</TableCell>
                      <TableCell className="text-sm">
                        <div>
                          <span className="font-medium">{coupon.usedCount}</span>
                          {coupon.maxUses ? <span className="text-muted-foreground"> / {coupon.maxUses}</span> : <span className="text-muted-foreground"> / ∞</span>}
                        </div>
                        <div className="w-16 h-1.5 bg-[#E8E0D8] rounded-full mt-1 overflow-hidden">
                          <div
                            className="h-full bg-[#C9A96E] rounded-full"
                            style={{
                              width: `${coupon.maxUses ? Math.min(100, (coupon.usedCount / coupon.maxUses) * 100) : 0}%`,
                            }}
                          />
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {coupon.expiresAt ? new Date(coupon.expiresAt).toLocaleDateString() : 'Never'}
                        {isExpired && (
                          <Badge variant="destructive" className="ml-1 text-[10px]">Expired</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className={coupon.isActive && !isExpired ? 'bg-green-100 text-green-700' : ''}
                        >
                          {coupon.isActive && !isExpired ? t('admin.active', locale) : t('admin.inactive', locale)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-end">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => openEdit(coupon)}
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive"
                            onClick={() => {
                              setDeletingId(coupon.id);
                              setDeleteDialogOpen(true);
                            }}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
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

      {/* Create/Edit dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editing ? t('admin.editCoupon', locale) : t('admin.createCoupon', locale)}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label>Coupon Code</Label>
              <Input
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                className="mt-1 rounded-xl"
                placeholder="e.g., SUMMER20"
              />
            </div>
            <div>
              <Label>{t('admin.couponType', locale)}</Label>
              <Select
                value={form.type}
                onValueChange={(v: any) => setForm({ ...form, type: v })}
              >
                <SelectTrigger className="mt-1 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="percentage">{t('admin.percentage', locale)}</SelectItem>
                  <SelectItem value="fixed">{t('admin.fixedAmount', locale)}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Value {form.type === 'percentage' ? '(%)' : '(AED)'}</Label>
              <Input
                type="number"
                value={form.value}
                onChange={(e) => setForm({ ...form, value: e.target.value })}
                className="mt-1 rounded-xl"
                min="0"
                max={form.type === 'percentage' ? '100' : undefined}
              />
            </div>
            <div>
              <Label>{t('admin.minOrder', locale)} (AED)</Label>
              <Input
                type="number"
                value={form.minOrder}
                onChange={(e) => setForm({ ...form, minOrder: e.target.value })}
                className="mt-1 rounded-xl"
                min="0"
              />
            </div>
            <div>
              <Label>{t('admin.maxUses', locale)}</Label>
              <Input
                type="number"
                value={form.maxUses}
                onChange={(e) => setForm({ ...form, maxUses: e.target.value })}
                className="mt-1 rounded-xl"
                placeholder="Leave empty for unlimited"
                min="0"
              />
            </div>
            <div>
              <Label>{t('admin.expiryDate', locale)}</Label>
              <Input
                type="date"
                value={form.expiresAt}
                onChange={(e) => setForm({ ...form, expiresAt: e.target.value })}
                className="mt-1 rounded-xl"
              />
            </div>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <Switch
                checked={form.isActive}
                onCheckedChange={(v) => setForm({ ...form, isActive: v })}
              />
              {t('admin.active', locale)}
            </label>
          </div>
          <DialogFooter className="mt-6 gap-3">
            <Button variant="outline" onClick={() => setDialogOpen(false)} className="rounded-xl">
              {t('common.cancel', locale)}
            </Button>
            <Button onClick={handleSave} className="btn-luxury rounded-xl">
              {t('common.save', locale)}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Coupon</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this coupon? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-white rounded-xl hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
