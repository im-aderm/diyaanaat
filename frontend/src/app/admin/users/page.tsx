'use client';

import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import Card from '@/components/ui/Card';
import Table from '@/components/ui/Table';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Modal from '@/components/ui/Modal';
import Pagination from '@/components/ui/Pagination';
import { UserCog, Plus } from 'lucide-react';

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([]); const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1); const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ email: '', fullName: '', password: '', role: 'CENTER_ADMIN' });
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState('');
  const pageSize = 20;

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try { const params = new URLSearchParams({ skip: String((page - 1) * pageSize), take: String(pageSize) }); const result = await api.get<{ data: any[]; total: number }>(`/users?${params}`); setUsers(result.data || []); setTotal(result.total || 0); } finally { setLoading(false); }
  }, [page]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleCreate = async (e: React.FormEvent) => { e.preventDefault(); setFormLoading(true); try { await api.post('/users', form); setShowForm(false); setForm({ email: '', fullName: '', password: '', role: 'CENTER_ADMIN' }); fetchUsers(); } catch (err: any) { setError(err.message || 'Failed to create user'); } finally { setFormLoading(false); } };
  const handleDisable = async (id: string) => { if (!window.confirm('Disable this user?')) return; try { await api.patch(`/users/${id}/disable`); fetchUsers(); } catch (err: any) { setError(err.message || 'Failed to disable user'); } };
  const handleEnable = async (id: string) => { if (!window.confirm('Enable this user?')) return; try { await api.patch(`/users/${id}/enable`); fetchUsers(); } catch (err: any) { setError(err.message || 'Failed to enable user'); } };

  const columns = [
    { key: 'fullName', header: 'Name' }, { key: 'email', header: 'Email' },
    { key: 'role', header: 'Role', render: (u: any) => u.role === 'SUPER_ADMIN' ? <Badge variant="info">Super Admin</Badge> : <Badge>Center Admin</Badge> },
    { key: 'isActive', header: 'Status', render: (u: any) => u.isActive ? <Badge variant="success">Active</Badge> : <Badge variant="danger">Disabled</Badge> },
    { key: 'actions', header: 'Actions', render: (u: any) => (
      u.isActive ? <Button size="sm" variant="danger" onClick={() => handleDisable(u.id)}>Disable</Button> : <Button size="sm" variant="outline" onClick={() => handleEnable(u.id)}>Enable</Button>
    )},
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between"><div><h1 className="text-2xl font-bold text-on-surface">Admin Users</h1><p className="text-on-surface-variant text-sm">Manage system administrators</p></div><Button onClick={() => setShowForm(true)}><Plus className="w-4 h-4 mr-2" />Add Admin</Button></div>
      {error && <div className="bg-error-container text-on-error-container text-sm p-3 rounded-lg">{error}</div>}
      <Card>{loading ? <div className="flex justify-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div> : <><Table columns={columns} data={users} /><Pagination page={page} total={total} pageSize={pageSize} onPageChange={setPage} /></>}</Card>
      <Modal open={showForm} onClose={() => setShowForm(false)} title="Create Admin User">
        <form onSubmit={handleCreate} className="space-y-4">
          <Input label="Full Name" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} required />
          <Input label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          <Input label="Password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required minLength={8} />
          <Select label="Role" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} options={[{ value: 'CENTER_ADMIN', label: 'Center Admin' }, { value: 'SUPER_ADMIN', label: 'Super Admin' }]} />
          <Button type="submit" loading={formLoading} className="w-full">Create User</Button>
        </form>
      </Modal>
    </div>
  );
}
