'use client';

import { useState, useEffect } from 'react';
import { useLanguageStore } from '@/lib/stores';
import { t } from '@/lib/i18n';
import { Category } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
import { Plus, Edit, Trash2, FolderTree, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminCategories() {
  const { locale } = useLanguageStore();
  const [categories, setCategories] = useState<Category[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deletingProductCount, setDeletingProductCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    nameEn: '',
    nameAr: '',
    slug: '',
    description: '',
    parentId: '',
    sortOrder: '0',
    isActive: true,
  });

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await fetch('/api/admin/categories');
        if (res.ok && !cancelled) {
          const data = await res.json();
          setCategories(Array.isArray(data) ? data : data.categories || []);
        }
      } catch {
        if (!cancelled) setCategories([]);
      }
      if (!cancelled) setLoading(false);
    };
    load();
    return () => { cancelled = true; };
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({ nameEn: '', nameAr: '', slug: '', description: '', parentId: '', sortOrder: '0', isActive: true });
    setDialogOpen(true);
  };

  const openEdit = (cat: Category) => {
    setEditing(cat);
    setForm({
      nameEn: cat.nameEn,
      nameAr: cat.nameAr,
      slug: cat.slug,
      description: cat.description || '',
      parentId: cat.parentId || '',
      sortOrder: String(cat.sortOrder),
      isActive: cat.isActive,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      const payload = {
        ...form,
        sortOrder: Number(form.sortOrder) || 0,
        parentId: form.parentId || null,
      };

      if (editing) {
        const res = await fetch(`/api/admin/categories/${editing.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          toast.success('Category updated!');
          fetch('/api/admin/categories').then(r => r.ok && r.json()).then(d => {
            if (d) setCategories(Array.isArray(d) ? d : d.categories || []);
          });
        }
      } else {
        const res = await fetch('/api/admin/categories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          toast.success('Category created!');
          fetch('/api/admin/categories').then(r => r.ok && r.json()).then(d => {
            if (d) setCategories(Array.isArray(d) ? d : d.categories || []);
          });
        }
      }
    } catch {
      toast.error('Failed to save category');
    }
    setDialogOpen(false);
  };

  const handleDeleteClick = (cat: Category) => {
    setDeletingId(cat.id);
    setDeletingProductCount(cat._count?.products || 0);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      const res = await fetch(`/api/admin/categories/${deletingId}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Category deleted!');
        setCategories(categories.filter((c) => c.id !== deletingId));
      } else {
        toast.error('Cannot delete category with existing products');
      }
    } catch {
      toast.error('Failed to delete category');
    }
    setDeleteDialogOpen(false);
    setDeletingId(null);
  };

  const sorted = [...categories].sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button onClick={openCreate} className="btn-luxury rounded-xl gap-2">
          <Plus className="h-4 w-4" />
          {t('admin.addCategory', locale)}
        </Button>
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
                <TableHead>Category</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead className="text-center">Products</TableHead>
                <TableHead className="text-center">Sort</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-end">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sorted.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No categories yet
                  </TableCell>
                </TableRow>
              ) : (
                sorted.map((cat) => (
                  <TableRow key={cat.id} className="hover:bg-[#F5F0EB]/50">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-[#F5F0EB] flex items-center justify-center flex-shrink-0">
                          {cat.image ? (
                            <img src={cat.image} alt="" className="w-full h-full object-cover rounded-lg" />
                          ) : (
                            <FolderTree className="h-4 w-4 text-muted-foreground" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-[#2D2926] text-sm">{cat.nameEn}</p>
                          <p className="text-xs text-muted-foreground">{cat.nameAr}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground font-mono">{cat.slug}</TableCell>
                    <TableCell className="text-sm font-medium text-center">
                      {cat._count?.products || 0}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground text-center">{cat.sortOrder}</TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={cat.isActive ? 'bg-green-100 text-green-700' : ''}
                      >
                        {cat.isActive ? t('admin.active', locale) : t('admin.inactive', locale)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-end">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => openEdit(cat)}
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive"
                          onClick={() => handleDeleteClick(cat)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
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
              {editing ? t('admin.editCategory', locale) : t('admin.addCategory', locale)}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label>Name (English) *</Label>
              <Input
                value={form.nameEn}
                onChange={(e) => setForm({ ...form, nameEn: e.target.value })}
                className="mt-1 rounded-xl"
              />
            </div>
            <div>
              <Label>Name (Arabic) *</Label>
              <Input
                value={form.nameAr}
                onChange={(e) => setForm({ ...form, nameAr: e.target.value })}
                className="mt-1 rounded-xl"
                dir="rtl"
              />
            </div>
            <div>
              <Label>Slug *</Label>
              <Input
                value={form.slug}
                onChange={(e) =>
                  setForm({
                    ...form,
                    slug: e.target.value.toLowerCase().replace(/\s+/g, '-'),
                  })
                }
                className="mt-1 rounded-xl"
                placeholder="e.g., flowers"
              />
              <p className="text-xs text-muted-foreground mt-1">Used in URLs. Lowercase, hyphens only.</p>
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="mt-1 rounded-xl"
                rows={2}
                placeholder="Brief description of the category"
              />
            </div>
            <div>
              <Label>Parent Category</Label>
              <Select value={form.parentId} onValueChange={(v) => setForm({ ...form, parentId: v })}>
                <SelectTrigger className="mt-1 rounded-xl">
                  <SelectValue placeholder="None (Top Level)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None (Top Level)</SelectItem>
                  {categories
                    .filter((c) => c.id !== editing?.id)
                    .map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {locale === 'ar' ? c.nameAr : c.nameEn}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Sort Order</Label>
              <Input
                type="number"
                value={form.sortOrder}
                onChange={(e) => setForm({ ...form, sortOrder: e.target.value })}
                className="mt-1 rounded-xl"
                min="0"
              />
              <p className="text-xs text-muted-foreground mt-1">Lower numbers appear first</p>
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
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Delete Category
            </AlertDialogTitle>
            <AlertDialogDescription>
              {deletingProductCount > 0 ? (
                <>
                  This category has <strong>{deletingProductCount} product(s)</strong> associated with it.
                  You must reassign or delete these products before deleting this category.
                </>
              ) : (
                'Are you sure you want to delete this category? This action cannot be undone.'
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deletingProductCount > 0}
              className="bg-destructive text-white rounded-xl hover:bg-destructive/90 disabled:opacity-50"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
