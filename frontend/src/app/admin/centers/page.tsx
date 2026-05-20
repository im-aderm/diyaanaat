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
import { Building2, Plus, UserPlus } from 'lucide-react';

export default function CentersPage() {
  const [centers, setCenters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', code: '', address: '', phone: '', email: '' });
  const [adminMode, setAdminMode] = useState<'existing' | 'new'>('existing');
  const [existingAdminIds, setExistingAdminIds] = useState<string[]>([]);
  const [newAdmin, setNewAdmin] = useState({ email: '', name: '', password: '' });
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchCenters = useCallback(async () => {
    setLoading(true);
    try { setCenters(await api.get<any[]>('/centers') || []); } finally { setLoading(false); }
  }, []);

  const fetchUsers = useCallback(async () => {
    try { const result = await api.get<{ data: any[] }>('/users'); setUsers((result as any).data || result || []); } catch {}
  }, []);

  useEffect(() => { fetchCenters(); fetchUsers(); }, [fetchCenters, fetchUsers]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault(); setFormLoading(true);
    try {
      const payload: any = { ...form };
      if (adminMode === 'existing' && existingAdminIds.length) {
        payload.adminIds = existingAdminIds;
      } else if (adminMode === 'new' && newAdmin.email && newAdmin.name && newAdmin.password) {
        payload.adminEmail = newAdmin.email;
        payload.adminName = newAdmin.name;
        payload.adminPassword = newAdmin.password;
      }
      await api.post('/centers', payload);
      setShowForm(false);
      setForm({ name: '', code: '', address: '', phone: '', email: '' });
      setExistingAdminIds([]);
      setNewAdmin({ email: '', name: '', password: '' });
      fetchCenters();
    } catch (err: any) {
      setError(err.message || 'Failed to create center');
    } finally { setFormLoading(false); }
  };

  const toggleExistingAdmin = (id: string) => {
    setExistingAdminIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  };

  const columns = [
    { key: 'name', header: 'Name' }, { key: 'code', header: 'Code' }, { key: 'address', header: 'Address' },
    { key: 'isActive', header: 'Status', render: (c: any) => c.isActive ? <Badge variant="success">Active</Badge> : <Badge variant="danger">Inactive</Badge> },
    { key: '_count', header: 'Admins', render: (c: any) => c._count?.userCenters || 0 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-on-surface">Centers</h1><p className="text-on-surface-variant text-sm">Manage distribution centers</p></div>
        <Button onClick={() => setShowForm(true)}><Plus className="w-4 h-4 mr-2" />Add Center</Button>
      </div>
      <Card>{loading ? <div className="flex justify-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div> : <Table columns={columns} data={centers} />}</Card>

      <Modal open={showForm} onClose={() => setShowForm(false)} title="Create Center">
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Input label="Center Name *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            <Input label="Code *" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} required placeholder="e.g., ABJ" />
          </div>
          <Input label="Address *" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} required />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            <Input label="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>

          <div className="border-t border-outline-variant pt-4">
            <p className="text-sm font-semibold text-on-surface mb-3 flex items-center gap-2"><UserPlus className="w-4 h-4 text-primary" />Assign Admin</p>

            <div className="flex gap-2 mb-3">
              <button type="button" onClick={() => setAdminMode('existing')} className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium border transition-all ${adminMode === 'existing' ? 'border-primary bg-primary-container/20 text-primary' : 'border-outline-variant text-on-surface-variant'}`}>Existing Admin</button>
              <button type="button" onClick={() => setAdminMode('new')} className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium border transition-all ${adminMode === 'new' ? 'border-primary bg-primary-container/20 text-primary' : 'border-outline-variant text-on-surface-variant'}`}>Create New</button>
            </div>

            {adminMode === 'existing' && (
              <div className="max-h-40 overflow-y-auto border border-outline-variant rounded-lg divide-y divide-outline-variant">
                {users.filter((u: any) => u.role === 'CENTER_ADMIN' && u.isActive).map((u: any) => (
                  <label key={u.id} className="flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-surface-container transition-colors">
                    <input type="checkbox" checked={existingAdminIds.includes(u.id)} onChange={() => toggleExistingAdmin(u.id)} className="rounded border-outline-variant text-primary focus:ring-primary" />
                    <div className="flex-1 min-w-0"><p className="text-sm font-medium truncate">{u.fullName}</p><p className="text-xs text-on-surface-variant truncate">{u.email}</p></div>
                  </label>
                ))}
                {users.filter((u: any) => u.role === 'CENTER_ADMIN' && u.isActive).length === 0 && <p className="p-3 text-xs text-on-surface-variant text-center">No existing center admins found</p>}
              </div>
            )}

            {adminMode === 'new' && (
              <div className="space-y-3 bg-surface-container-low rounded-lg p-3 border border-outline-variant">
                <Input label="Admin Name *" value={newAdmin.name} onChange={(e) => setNewAdmin({ ...newAdmin, name: e.target.value })} />
                <Input label="Admin Email *" value={newAdmin.email} onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })} type="email" />
                <Input label="Admin Password *" value={newAdmin.password} onChange={(e) => setNewAdmin({ ...newAdmin, password: e.target.value })} type="password" minLength={8} />
              </div>
            )}
          </div>

          <Button type="submit" loading={formLoading} className="w-full">Create Center</Button>
          {error && <div className="bg-error-container text-on-error-container text-sm p-3 rounded-lg mt-3">{error}</div>}
        </form>
      </Modal>
    </div>
  );
}
