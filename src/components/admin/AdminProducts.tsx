'use client';

import { useState, useEffect } from 'react';
import { useLanguageStore } from '@/lib/stores';
import { t } from '@/lib/i18n';
import { Product, Category } from '@/lib/types';
import { OCCASIONS } from '@/lib/types';
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
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Package,
} from 'lucide-react';
import { toast } from 'sonner';

const EMPTY_FORM = {
  nameEn: '', nameAr: '', descriptionEn: '', descriptionAr: '',
  sku: '', price: '', salePrice: '', categoryId: '',
  stock: '', tags: '', occasion: '', color: '',
  isFeatured: false, isNewArrival: false, isBestSeller: false,
  sameDayDelivery: false, isActive: true, images: '',
};

export default function AdminProducts() {
  const { locale } = useLanguageStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await fetch('/api/admin/products');
        if (res.ok && !cancelled) {
          const data = await res.json();
          setProducts(Array.isArray(data) ? data : data.products || []);
        }
      } catch {
        if (!cancelled) setProducts([]);
      }
      if (!cancelled) setLoading(false);
    };
    load();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await fetch('/api/categories');
        if (res.ok && !cancelled) {
          const data = await res.json();
          setCategories(Array.isArray(data) ? data : data.categories || []);
        }
      } catch {
        if (!cancelled) setCategories([]);
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);

  const filtered = products.filter(
    (p) =>
      p.nameEn.toLowerCase().includes(search.toLowerCase()) ||
      p.nameAr.includes(search) ||
      p.sku.toLowerCase().includes(search.toLowerCase())
  );

  const openCreate = () => {
    setEditingProduct(null);
    setForm(EMPTY_FORM);
    setDialogOpen(true);
  };

  const openEdit = (product: Product) => {
    setEditingProduct(product);
    setForm({
      nameEn: product.nameEn,
      nameAr: product.nameAr,
      descriptionEn: product.descriptionEn || '',
      descriptionAr: product.descriptionAr || '',
      sku: product.sku,
      price: String(product.price),
      salePrice: product.salePrice ? String(product.salePrice) : '',
      categoryId: product.categoryId,
      stock: String(product.stock),
      tags: product.tags && product.tags !== '[]' ? JSON.parse(product.tags).join(', ') : '',
      occasion: product.occasion || '',
      color: product.color || '',
      isFeatured: product.isFeatured,
      isNewArrival: product.isNewArrival,
      isBestSeller: product.isBestSeller,
      sameDayDelivery: product.sameDayDelivery,
      isActive: product.isActive,
      images: product.images && product.images !== '[]' ? JSON.parse(product.images).join(', ') : '',
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      const payload = {
        ...form,
        price: Number(form.price) || 0,
        salePrice: form.salePrice ? Number(form.salePrice) : null,
        stock: Number(form.stock) || 0,
        tags: form.tags ? JSON.stringify(form.tags.split(',').map((t) => t.trim()).filter(Boolean)) : '[]',
        images: form.images ? JSON.stringify(form.images.split(',').map((u) => u.trim()).filter(Boolean)) : '[]',
      };

      if (editingProduct) {
        const res = await fetch(`/api/admin/products/${editingProduct.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          toast.success('Product updated!');
          // Re-fetch products
          fetch('/api/admin/products').then(r => r.ok && r.json()).then(d => {
            if (d) setProducts(Array.isArray(d) ? d : d.products || []);
          });
        }
      } else {
        const res = await fetch('/api/admin/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          toast.success('Product created!');
          fetch('/api/admin/products').then(r => r.ok && r.json()).then(d => {
            if (d) setProducts(Array.isArray(d) ? d : d.products || []);
          });
        }
      }
    } catch {
      toast.error('Failed to save product');
    }
    setDialogOpen(false);
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      const res = await fetch(`/api/admin/products/${deletingId}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Product deleted!');
        setProducts(products.filter((p) => p.id !== deletingId));
      }
    } catch {
      toast.error('Failed to delete product');
    }
    setDeleteDialogOpen(false);
    setDeletingId(null);
  };

  const updateForm = (key: string, value: any) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products..."
            className="ps-9 rounded-xl"
          />
        </div>
        <Button onClick={openCreate} className="btn-luxury rounded-xl gap-2">
          <Plus className="h-4 w-4" />
          {t('admin.addProduct', locale)}
        </Button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-16 rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-[#E8E0D8] shadow-sm overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Product</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-end">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No products found
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((product) => {
                  const imgs = product.images ? JSON.parse(product.images) : [];
                  const cat = categories.find((c) => c.id === product.categoryId);
                  return (
                    <TableRow key={product.id} className="hover:bg-[#F5F0EB]/50">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg overflow-hidden bg-[#F5F0EB] flex-shrink-0">
                            <img
                              src={imgs[0] || `https://picsum.photos/seed/${product.slug}/80/80`}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <p className="font-medium text-[#2D2926] text-sm">{product.nameEn}</p>
                            <p className="text-xs text-muted-foreground">{product.nameAr}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground font-mono">{product.sku}</TableCell>
                      <TableCell className="text-sm text-[#5C534A]">
                        {cat ? (locale === 'ar' ? cat.nameAr : cat.nameEn) : '—'}
                      </TableCell>
                      <TableCell>
                        <div>
                          <span className="font-semibold text-[#2D2926]">AED {product.salePrice || product.price}</span>
                          {product.salePrice && (
                            <span className="text-xs text-muted-foreground line-through ms-2">
                              AED {product.price}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className={`text-sm font-medium ${product.stock < 10 ? 'text-destructive' : 'text-[#2D2926]'}`}>
                          {product.stock}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {product.isActive ? (
                            <Badge className="bg-green-100 text-green-700 text-[10px]">Active</Badge>
                          ) : (
                            <Badge variant="secondary" className="text-[10px]">Inactive</Badge>
                          )}
                          {product.isFeatured && <Badge className="bg-[#C9A96E] text-white text-[10px]">Featured</Badge>}
                          {product.isNewArrival && <Badge variant="secondary" className="text-[10px]">New</Badge>}
                          {product.isBestSeller && <Badge variant="outline" className="text-[10px]">Best Seller</Badge>}
                        </div>
                      </TableCell>
                      <TableCell className="text-end">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(product)}>
                            <Edit className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive"
                            onClick={() => { setDeletingId(product.id); setDeleteDialogOpen(true); }}
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
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingProduct ? t('admin.editProduct', locale) : t('admin.addProduct', locale)}
            </DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
            <div>
              <Label>Name (English)</Label>
              <Input value={form.nameEn} onChange={(e) => updateForm('nameEn', e.target.value)} className="mt-1 rounded-xl" />
            </div>
            <div>
              <Label>Name (Arabic)</Label>
              <Input value={form.nameAr} onChange={(e) => updateForm('nameAr', e.target.value)} className="mt-1 rounded-xl" dir="rtl" />
            </div>
            <div className="sm:col-span-2">
              <Label>Description (English)</Label>
              <Textarea value={form.descriptionEn} onChange={(e) => updateForm('descriptionEn', e.target.value)} className="mt-1 rounded-xl" rows={2} />
            </div>
            <div className="sm:col-span-2">
              <Label>Description (Arabic)</Label>
              <Textarea value={form.descriptionAr} onChange={(e) => updateForm('descriptionAr', e.target.value)} className="mt-1 rounded-xl" rows={2} dir="rtl" />
            </div>
            <div>
              <Label>SKU</Label>
              <Input value={form.sku} onChange={(e) => updateForm('sku', e.target.value)} className="mt-1 rounded-xl" />
            </div>
            <div>
              <Label>Category</Label>
              <Select value={form.categoryId} onValueChange={(v) => updateForm('categoryId', v)}>
                <SelectTrigger className="mt-1 rounded-xl"><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{locale === 'ar' ? c.nameAr : c.nameEn}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Price (AED)</Label>
              <Input type="number" value={form.price} onChange={(e) => updateForm('price', e.target.value)} className="mt-1 rounded-xl" min="0" />
            </div>
            <div>
              <Label>Sale Price (AED)</Label>
              <Input type="number" value={form.salePrice} onChange={(e) => updateForm('salePrice', e.target.value)} className="mt-1 rounded-xl" placeholder="Optional" min="0" />
            </div>
            <div>
              <Label>Stock</Label>
              <Input type="number" value={form.stock} onChange={(e) => updateForm('stock', e.target.value)} className="mt-1 rounded-xl" min="0" />
            </div>
            <div>
              <Label>Occasion</Label>
              <Select value={form.occasion} onValueChange={(v) => updateForm('occasion', v)}>
                <SelectTrigger className="mt-1 rounded-xl"><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  {OCCASIONS.map((o) => (
                    <SelectItem key={o.id} value={o.id}>{locale === 'ar' ? o.nameAr : o.nameEn}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Color</Label>
              <Input value={form.color} onChange={(e) => updateForm('color', e.target.value)} className="mt-1 rounded-xl" placeholder="e.g., red, pink" />
            </div>
            <div>
              <Label>Tags (comma separated)</Label>
              <Input value={form.tags} onChange={(e) => updateForm('tags', e.target.value)} className="mt-1 rounded-xl" placeholder="luxury, roses, red" />
            </div>
            <div className="sm:col-span-2">
              <Label>Image URLs (comma separated)</Label>
              <Input value={form.images} onChange={(e) => updateForm('images', e.target.value)} className="mt-1 rounded-xl" placeholder="https://..." />
            </div>

            <div className="sm:col-span-2 flex flex-wrap gap-6">
              {[
                { key: 'isFeatured', label: 'Featured' },
                { key: 'isNewArrival', label: 'New Arrival' },
                { key: 'isBestSeller', label: 'Best Seller' },
                { key: 'sameDayDelivery', label: 'Same Day Delivery' },
                { key: 'isActive', label: 'Active' },
              ].map((toggle) => (
                <label key={toggle.key} className="flex items-center gap-2 text-sm cursor-pointer">
                  <Switch
                    checked={form[toggle.key as keyof typeof form] as boolean}
                    onCheckedChange={(v) => updateForm(toggle.key, v)}
                  />
                  {toggle.label}
                </label>
              ))}
            </div>
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
            <AlertDialogTitle>Delete Product</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this product? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-white rounded-xl hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
