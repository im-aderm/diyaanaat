'use client';

import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import Card from '@/components/ui/Card';
import Table from '@/components/ui/Table';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Modal from '@/components/ui/Modal';
import Pagination from '@/components/ui/Pagination';
import { Factory, Plus } from 'lucide-react';

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<any[]>([]); const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1); const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ centerId: '', name: '', phone: '', address: '', notes: '' });
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState('');
  const [centers, setCenters] = useState<any[]>([]);
  const pageSize = 20;

  const fetchSuppliers = useCallback(async () => {
    setLoading(true);
    try { const params = new URLSearchParams({ skip: String((page - 1) * pageSize), take: String(pageSize) }); const result = await api.get<{ data: any[]; total: number }>(`/suppliers?${params}`); setSuppliers(result.data || []); setTotal(result.total || 0); } finally { setLoading(false); }
  }, [page]);

  const fetchCenters = useCallback(async () => {
    try { const c = await api.get<any[]>('/centers'); setCenters(c || []); } catch {}
  }, []);

  useEffect(() => { fetchSuppliers(); fetchCenters(); }, [fetchSuppliers, fetchCenters]);

  const handleCreate = async (e: React.FormEvent) => { e.preventDefault(); setFormLoading(true); try { await api.post('/suppliers', form); setShowForm(false); setForm({ centerId: '', name: '', phone: '', address: '', notes: '' }); fetchSuppliers(); } catch (err: any) { setError(err.message || 'Failed to create supplier'); } finally { setFormLoading(false); } };

  const columns = [
    { key: 'name', header: 'Supplier Name' }, { key: 'phone', header: 'Phone' }, { key: 'address', header: 'Address' },
    { key: 'center', header: 'Center', render: (s: any) => s.center?.name || '\u2014' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between"><div><h1 className="text-2xl font-bold text-on-surface">Suppliers</h1><p className="text-on-surface-variant text-sm">Manage cow suppliers</p></div><Button onClick={() => setShowForm(true)}><Plus className="w-4 h-4 mr-2" />Add Supplier</Button></div>
      <Card>{loading ? <div className="flex justify-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div> : <><Table columns={columns} data={suppliers} /><Pagination page={page} total={total} pageSize={pageSize} onPageChange={setPage} /></>}</Card>
      <Modal open={showForm} onClose={() => setShowForm(false)} title="Add Supplier">
        <form onSubmit={handleCreate} className="space-y-4">
          <Select label="Center *" value={form.centerId} onChange={(e) => setForm({ ...form, centerId: e.target.value })} required
            options={[{ value: '', label: 'Select center...' }, ...centers.map((c: any) => ({ value: c.id, label: `${c.name} (${c.code})` }))]} />
          <Input label="Supplier Name *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <Input label="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <Input label="Address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
          <Input label="Notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          <Button type="submit" loading={formLoading} className="w-full">Add Supplier</Button>
          {error && <div className="bg-error-container text-on-error-container text-sm p-3 rounded-lg mt-3">{error}</div>}
        </form>
      </Modal>
    </div>
  );
}
