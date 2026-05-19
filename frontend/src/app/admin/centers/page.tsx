'use client';

import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import Card from '@/components/ui/Card';
import Table from '@/components/ui/Table';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import { Building2, Plus } from 'lucide-react';

export default function CentersPage() {
  const [centers, setCenters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', code: '', address: '', phone: '', email: '' });
  const [formLoading, setFormLoading] = useState(false);

  const fetchCenters = useCallback(async () => {
    setLoading(true);
    try { const data = await api.get<any[]>('/centers'); setCenters(data || []); } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchCenters(); }, [fetchCenters]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault(); setFormLoading(true);
    try { await api.post('/centers', form); setShowForm(false); setForm({ name: '', code: '', address: '', phone: '', email: '' }); fetchCenters(); } finally { setFormLoading(false); }
  };

  const columns = [
    { key: 'name', header: 'Name' },
    { key: 'code', header: 'Code' },
    { key: 'address', header: 'Address' },
    { key: 'isActive', header: 'Status', render: (c: any) => c.isActive ? <Badge variant="success">Active</Badge> : <Badge variant="danger">Inactive</Badge> },
    { key: '_count', header: 'Beneficiaries', render: (c: any) => c._count?.beneficiaries || 0 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between"><div><h1 className="text-2xl font-bold text-on-surface">Centers</h1><p className="text-on-surface-variant text-sm">Manage distribution centers</p></div><Button onClick={() => setShowForm(true)}><Plus className="w-4 h-4 mr-2" />Add Center</Button></div>
      <Card>{loading ? <div className="flex justify-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div> : <Table columns={columns} data={centers} />}</Card>
      <Modal open={showForm} onClose={() => setShowForm(false)} title="Create Center">
        <form onSubmit={handleCreate} className="space-y-4">
          <Input label="Center Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <Input label="Center Code" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} required placeholder="ABJ" />
          <Input label="Address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} required />
          <Input label="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <Input label="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <Button type="submit" loading={formLoading} className="w-full">Create Center</Button>
        </form>
      </Modal>
    </div>
  );
}
