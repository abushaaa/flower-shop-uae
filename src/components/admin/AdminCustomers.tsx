'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
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
import { Search, Eye, Mail, Phone, Calendar, ShoppingBag } from 'lucide-react';

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  orders: number;
  totalSpent: number;
  joinedAt: string;
  role: string;
}

export default function AdminCustomers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await fetch('/api/admin/customers');
        if (res.ok && !cancelled) {
          const data = await res.json();
          setCustomers(Array.isArray(data) ? data : data.customers || []);
        }
      } catch {
        if (!cancelled) setCustomers([]);
      }
      if (!cancelled) setLoading(false);
    };
    load();
    return () => { cancelled = true; };
  }, []);

  const filtered = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      (c.phone && c.phone.includes(search))
  );

  return (
    <div className="space-y-6">
      <div className="relative max-w-sm">
        <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or email..."
          className="ps-9 rounded-xl"
        />
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
                <TableHead>Customer</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Orders</TableHead>
                <TableHead>Total Spent</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="text-end">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No customers found
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((customer) => (
                  <TableRow key={customer.id} className="hover:bg-[#F5F0EB]/50">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-[#C9A96E]/10 flex items-center justify-center flex-shrink-0">
                          <span className="text-[#C9A96E] font-bold text-sm">
                            {customer.name.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-[#2D2926] text-sm">{customer.name}</p>
                          <p className="text-xs text-muted-foreground">{customer.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{customer.phone || '—'}</TableCell>
                    <TableCell className="text-sm font-medium text-[#2D2926]">{customer.orders}</TableCell>
                    <TableCell className="text-sm font-semibold text-[#C9A96E]">
                      AED {customer.totalSpent.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(customer.joinedAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-end">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => setSelectedCustomer(customer)}
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Customer detail dialog */}
      <Dialog open={!!selectedCustomer} onOpenChange={() => setSelectedCustomer(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Customer Details</DialogTitle>
          </DialogHeader>
          {selectedCustomer && (
            <div className="space-y-4 mt-4">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-[#C9A96E]/10 flex items-center justify-center mx-auto mb-3">
                  <span className="text-[#C9A96E] text-xl font-bold">
                    {selectedCustomer.name.charAt(0)}
                  </span>
                </div>
                <h3 className="font-bold text-[#2D2926]">{selectedCustomer.name}</h3>
                <p className="text-sm text-muted-foreground">{selectedCustomer.email}</p>
                <Badge
                  variant="secondary"
                  className={
                    selectedCustomer.role === 'admin'
                      ? 'bg-[#C9A96E]/10 text-[#C9A96E]'
                      : 'bg-[#F5F0EB] text-[#5C534A]'
                  }
                >
                  {selectedCustomer.role}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="p-3 bg-[#F5F0EB]/50 rounded-xl">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <ShoppingBag className="h-4 w-4 text-[#C9A96E]" />
                  </div>
                  <p className="text-2xl font-bold text-[#2D2926]">{selectedCustomer.orders}</p>
                  <p className="text-xs text-muted-foreground">Total Orders</p>
                </div>
                <div className="p-3 bg-[#F5F0EB]/50 rounded-xl">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <span className="text-[#C9A96E] text-sm font-bold">AED</span>
                  </div>
                  <p className="text-2xl font-bold text-[#C9A96E]">
                    {selectedCustomer.totalSpent.toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground">Total Spent</p>
                </div>
              </div>

              <div className="text-sm space-y-3 bg-[#F5F0EB]/30 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Email:</span>
                  <span className="font-medium text-[#2D2926]">{selectedCustomer.email}</span>
                </div>
                {selectedCustomer.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Phone:</span>
                    <span className="font-medium text-[#2D2926]">{selectedCustomer.phone}</span>
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Joined:</span>
                  <span className="font-medium text-[#2D2926]">
                    {new Date(selectedCustomer.joinedAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </span>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
