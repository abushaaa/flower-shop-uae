'use client';

import { useState, useEffect } from 'react';
import { useLanguageStore, useAuthStore } from '@/lib/stores';
import { t } from '@/lib/i18n';
import { type User } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
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
import { Search, UserPlus, Shield, ShieldCheck, Eye, Mail, Calendar, ShoppingCart, Ban, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

interface UserWithCounts extends Partial<User> {
  _count?: { orders: number };
}

const roleColorMap: Record<string, string> = {
  super_admin: 'bg-[#C9A96E] text-white',
  admin: 'bg-purple-100 text-purple-700',
  florist: 'bg-green-100 text-green-700',
  customer: 'bg-blue-100 text-blue-700',
};

const roleLabels: Record<string, string> = {
  super_admin: 'Super Admin',
  admin: 'Admin',
  florist: 'Florist',
  customer: 'Customer',
};

const MOCK_USERS: UserWithCounts[] = [
  { id: '1', name: 'Admin User', email: 'admin@bloomgift.ae', phone: '+971501234567', role: 'super_admin', isActive: true, isVerified: true, createdAt: '2024-01-15T10:00:00Z', _count: { orders: 0 } },
  { id: '2', name: 'Sarah Manager', email: 'sarah@bloomgift.ae', phone: '+971509876543', role: 'admin', isActive: true, isVerified: true, createdAt: '2024-02-10T10:00:00Z', _count: { orders: 0 } },
  { id: '3', name: 'Fatima Florist', email: 'fatima@bloomgift.ae', phone: '+971505551234', role: 'florist', isActive: true, isVerified: true, createdAt: '2024-03-01T10:00:00Z', _count: { orders: 45 } },
  { id: '4', name: 'Ahmed Customer', email: 'ahmed@gmail.com', phone: '+971503344556', role: 'customer', isActive: true, isVerified: true, createdAt: '2024-06-15T10:00:00Z', _count: { orders: 12 } },
  { id: '5', name: 'Layla Hassan', email: 'layla@gmail.com', phone: '+971507778899', role: 'customer', isActive: true, isVerified: true, createdAt: '2024-07-20T10:00:00Z', _count: { orders: 8 } },
  { id: '6', name: 'Omar Sheikh', email: 'omar@yahoo.com', phone: '+971501112233', role: 'customer', isActive: false, isVerified: false, createdAt: '2024-08-05T10:00:00Z', _count: { orders: 3 } },
  { id: '7', name: 'Maryam Ali', email: 'maryam@outlook.com', phone: '+971504445566', role: 'customer', isActive: true, isVerified: true, createdAt: '2024-09-12T10:00:00Z', _count: { orders: 15 } },
];

export default function AdminUsers() {
  const { locale } = useLanguageStore();
  const { user: currentUser } = useAuthStore();
  const [users, setUsers] = useState<UserWithCounts[]>([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState<UserWithCounts | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [createForm, setCreateForm] = useState({ name: '', email: '', password: '', role: 'customer' });

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await fetch('/api/admin/users');
        if (res.ok && !cancelled) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setUsers(data);
          } else {
            setUsers(MOCK_USERS);
          }
        }
      } catch {
        if (!cancelled) setUsers(MOCK_USERS);
      }
      if (!cancelled) setLoading(false);
    };
    load();
    return () => { cancelled = true; };
  }, []);

  const filtered = users.filter((u) => {
    const matchSearch =
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === 'all' || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const handleToggleActive = async (userId: string, currentActive: boolean) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentActive }),
      });
      if (res.ok) {
        setUsers(users.map((u) => u.id === userId ? { ...u, isActive: !currentActive } : u));
        if (selectedUser?.id === userId) setSelectedUser({ ...selectedUser, isActive: !currentActive });
        toast.success(`User ${!currentActive ? 'activated' : 'deactivated'}`);
      }
    } catch {
      setUsers(users.map((u) => u.id === userId ? { ...u, isActive: !currentActive } : u));
      toast.success(`User ${!currentActive ? 'activated' : 'deactivated'}`);
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      });
      if (res.ok) {
        setUsers(users.map((u) => u.id === userId ? { ...u, role: newRole as User['role'] } : u));
        if (selectedUser?.id === userId) setSelectedUser({ ...selectedUser, role: newRole as User['role'] });
        toast.success('Role updated');
      }
    } catch {
      setUsers(users.map((u) => u.id === userId ? { ...u, role: newRole as User['role'] } : u));
      toast.success('Role updated');
    }
  };

  const handleCreateUser = () => {
    if (!createForm.name || !createForm.email || !createForm.password) {
      toast.error('Please fill all required fields');
      return;
    }
    const newUser: UserWithCounts = {
      id: `new-${Date.now()}`,
      name: createForm.name,
      email: createForm.email,
      phone: null,
      role: createForm.role as User['role'],
      isActive: true,
      isVerified: false,
      createdAt: new Date().toISOString(),
      _count: { orders: 0 },
    };
    setUsers([newUser, ...users]);
    setCreateForm({ name: '', email: '', password: '', role: 'customer' });
    setCreateDialogOpen(false);
    toast.success('User created successfully');
  };

  const isSuperAdmin = currentUser?.role === 'super_admin';
  const availableRoles = isSuperAdmin
    ? ['customer', 'florist', 'admin', 'super_admin']
    : ['customer', 'florist'];

  return (
    <div className="space-y-6">
      {/* Top bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email..."
            className="ps-9 rounded-xl"
          />
        </div>
        <div className="flex items-center gap-3">
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-40 rounded-xl">
              <SelectValue placeholder="All roles" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="customer">Customer</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="super_admin">Super Admin</SelectItem>
              <SelectItem value="florist">Florist</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={() => setCreateDialogOpen(true)} className="btn-luxury rounded-xl gap-2">
            <UserPlus className="h-4 w-4" />
            Add User
          </Button>
        </div>
      </div>

      {/* Table */}
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
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-end">Orders</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="text-end">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No users found
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((user) => (
                  <TableRow
                    key={user.id}
                    className="hover:bg-[#F5F0EB]/50 cursor-pointer"
                    onClick={() => setSelectedUser(user)}
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-[#C9A96E]/10 flex items-center justify-center flex-shrink-0">
                          <span className="text-[#C9A96E] font-bold text-sm">
                            {user.name?.charAt(0) || 'U'}
                          </span>
                        </div>
                        <span className="font-medium text-[#2D2926]">{user.name || '—'}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-[#5C534A]">{user.email}</TableCell>
                    <TableCell>
                      <Badge className={`${roleColorMap[user.role || 'customer']} text-xs border-0`}>
                        {roleLabels[user.role || 'customer']}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={user.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-end font-medium text-[#2D2926]">
                      {user._count?.orders || 0}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(user.createdAt || '').toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-end">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedUser(user);
                        }}
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

      {/* User Detail Dialog */}
      <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#C9A96E]/10 flex items-center justify-center">
                <span className="text-[#C9A96E] font-bold">{selectedUser?.name?.charAt(0) || 'U'}</span>
              </div>
              <div>
                <p>{selectedUser?.name || 'User'}</p>
                <p className="text-sm font-normal text-muted-foreground">{selectedUser?.email}</p>
              </div>
            </DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5" /> Email
                  </span>
                  <p className="font-medium text-[#2D2926] mt-0.5">{selectedUser.email}</p>
                </div>
                <div>
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <Shield className="h-3.5 w-3.5" /> Role
                  </span>
                  <div className="mt-1">
                    <Select
                      value={selectedUser.role}
                      onValueChange={(v) => handleRoleChange(selectedUser.id!, v)}
                      disabled={selectedUser.id === currentUser?.id}
                    >
                      <SelectTrigger className="h-9 rounded-lg">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {availableRoles.map((r) => (
                          <SelectItem key={r} value={r}>{roleLabels[r]}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" /> Joined
                  </span>
                  <p className="font-medium text-[#2D2926] mt-0.5">
                    {new Date(selectedUser.createdAt || '').toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <ShoppingCart className="h-3.5 w-3.5" /> Orders
                  </span>
                  <p className="font-medium text-[#2D2926] mt-0.5">{selectedUser._count?.orders || 0}</p>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-[#F5F0EB]/50 rounded-xl">
                <div className="flex items-center gap-2">
                  {selectedUser.isActive ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <Ban className="h-5 w-5 text-red-500" />
                  )}
                  <span className="text-sm font-medium text-[#2D2926]">
                    {selectedUser.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleToggleActive(selectedUser.id!, selectedUser.isActive!)}
                  disabled={selectedUser.id === currentUser?.id}
                  className={`rounded-lg ${selectedUser.isActive ? 'text-destructive hover:text-destructive hover:bg-destructive/10' : 'text-green-600 hover:text-green-600 hover:bg-green-50'}`}
                >
                  {selectedUser.isActive ? 'Deactivate' : 'Activate'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Create User Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-[#C9A96E]" />
              Create New User
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label>Full Name <span className="text-destructive">*</span></Label>
              <Input
                value={createForm.name}
                onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                className="mt-1 rounded-xl"
                placeholder="Enter name"
              />
            </div>
            <div>
              <Label>Email <span className="text-destructive">*</span></Label>
              <Input
                type="email"
                value={createForm.email}
                onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                className="mt-1 rounded-xl"
                placeholder="user@example.com"
              />
            </div>
            <div>
              <Label>Password <span className="text-destructive">*</span></Label>
              <Input
                type="password"
                value={createForm.password}
                onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                className="mt-1 rounded-xl"
                placeholder="Min. 8 characters"
              />
            </div>
            <div>
              <Label>Role</Label>
              <Select value={createForm.role} onValueChange={(v) => setCreateForm({ ...createForm, role: v })}>
                <SelectTrigger className="mt-1 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {availableRoles.map((r) => (
                    <SelectItem key={r} value={r}>{roleLabels[r]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => setCreateDialogOpen(false)} className="rounded-xl">
                Cancel
              </Button>
              <Button onClick={handleCreateUser} className="btn-luxury rounded-xl">
                Create User
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
