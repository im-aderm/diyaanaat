'use client';

import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import Card from '@/components/ui/Card';
import Table from '@/components/ui/Table';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Pagination from '@/components/ui/Pagination';
import Modal from '@/components/ui/Modal';
import { Beef, Plus } from 'lucide-react';

interface Cow { id: string; tagNumber: string; status: string; estimatedYield: number | null; purchaseCost: number | null; purchaseDate: string | null; healthStatus: string | null; center: { id: string; name: string }; supplier: { id: string; name: string }; session: { id: string; name: string }; }

const cowBadge = (status: string) => {
  switch (status) { case 'PURCHASED': return <Badge variant="info">Purchased</Badge>; case 'ASSIGNED': return <Badge variant="warning">Assigned</Badge>; case 'SLAUGHTERED': return <Badge variant="success">Slaughtered</Badge>; case 'DISTRIBUTED': return <Badge variant="success">Distributed</Badge>; default: return <Badge>{status}</Badge>; }
};

export default function InventoryPage() {
  const [data, setData] = useState<Cow[]>([]); const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1); const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ centerId: '', supplierId: '', sessionId: '', tagNumber: '', purchaseDate: '', purchaseCost: '', estimatedYield: '', healthStatus: '', notes: '' });
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState('');
  const [centers, setCenters] = useState<any[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const pageSize = 20;

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ skip: String((page - 1) * pageSize), take: String(pageSize) });
      if (statusFilter) params.set('status', statusFilter);
      const result = await api.get<{ data: Cow[]; total: number }>(`/cows?${params}`);
      setData(result.data || []); setTotal(result.total || 0);
    } finally { setLoading(false); }
  }, [page, statusFilter]);

  const fetchDropdowns = useCallback(async () => {
    try {
      const [c, s, sup] = await Promise.all([
        api.get<any[]>('/centers'),
        api.get<any[]>('/sessions'),
        api.get<{ data: any[] }>('/suppliers'),
      ]);
      setCenters(c || []);
      setSessions(s || []);
      setSuppliers((sup as any).data || sup || []);
    } catch {}
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);
  useEffect(() => { fetchDropdowns(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault(); setFormLoading(true);
    try {
      const payload: any = {
        centerId: form.centerId,
        supplierId: form.supplierId,
        sessionId: form.sessionId,
        tagNumber: form.tagNumber || undefined,
        purchaseDate: form.purchaseDate || undefined,
        purchaseCost: form.purchaseCost ? parseFloat(form.purchaseCost) : undefined,
        estimatedYield: form.estimatedYield ? parseInt(form.estimatedYield) : undefined,
        healthStatus: form.healthStatus || undefined,
        notes: form.notes || undefined,
      };
      await api.post('/cows', payload);
      setShowForm(false); fetchData();
    } catch (err: any) {
      setError(err.message || 'Failed to create cow');
    } finally { setFormLoading(false); }
  };

  const columns = [
    { key: 'tagNumber', header: 'Tag', render: (c: Cow) => c.tagNumber || '\u2014' },
    { key: 'status', header: 'Status', render: (c: Cow) => cowBadge(c.status) },
    { key: 'supplier', header: 'Supplier', render: (c: Cow) => c.supplier?.name || '\u2014' },
    { key: 'center', header: 'Center', render: (c: Cow) => c.center?.name || '\u2014' },
    { key: 'estimatedYield', header: 'Yield', render: (c: Cow) => c.estimatedYield || '\u2014' },
    { key: 'purchaseCost', header: 'Cost', render: (c: Cow) => c.purchaseCost ? `\u20A6${c.purchaseCost}` : '\u2014' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between"><div><h1 className="text-2xl font-bold text-on-surface">Cow Inventory</h1><p className="text-on-surface-variant text-sm">Manage cow inventory and track status</p></div><Button onClick={() => setShowForm(true)}><Plus className="w-4 h-4 mr-2" />Add Cow</Button></div>
      <Card>
        <div className="flex gap-4 mb-4">
          <Select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            options={[{ value: '', label: 'All Statuses' }, { value: 'PURCHASED', label: 'Purchased' }, { value: 'ASSIGNED', label: 'Assigned' }, { value: 'SLAUGHTERED', label: 'Slaughtered' }, { value: 'DISTRIBUTED', label: 'Distributed' }]} />
        </div>
        {loading ? <div className="flex justify-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div> : (
          <><Table columns={columns} data={data} /><Pagination page={page} total={total} pageSize={pageSize} onPageChange={setPage} /></>
        )}
      </Card>

      <Modal open={showForm} onClose={() => setShowForm(false)} title="Add New Cow">
        <form onSubmit={handleCreate} className="space-y-4">
          <Select label="Center *" value={form.centerId} onChange={(e) => setForm({ ...form, centerId: e.target.value })} required
            options={[{ value: '', label: 'Select center...' }, ...centers.map((c: any) => ({ value: c.id, label: `${c.name} (${c.code})` }))]} />

          <Select label="Session *" value={form.sessionId} onChange={(e) => setForm({ ...form, sessionId: e.target.value })} required
            options={[{ value: '', label: 'Select session...' }, ...sessions.map((s: any) => ({ value: s.id, label: `${s.name} (${s.gregorianYear})` }))]} />

          <Select label="Supplier *" value={form.supplierId} onChange={(e) => setForm({ ...form, supplierId: e.target.value })} required
            options={[{ value: '', label: 'Select supplier...' }, ...suppliers.map((s: any) => ({ value: s.id, label: `${s.name} — ${s.center?.name || ''}` }))]} />

          <Input label="Tag Number" value={form.tagNumber} onChange={(e) => setForm({ ...form, tagNumber: e.target.value })} placeholder="Optional — auto-generated if left empty" />

          <Input label="Purchase Date" type="date" value={form.purchaseDate} onChange={(e) => setForm({ ...form, purchaseDate: e.target.value })} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Purchase Cost (\u20A6)" type="number" value={form.purchaseCost} onChange={(e) => setForm({ ...form, purchaseCost: e.target.value })} />
            <Input label="Est. Yield (portions)" type="number" value={form.estimatedYield} onChange={(e) => setForm({ ...form, estimatedYield: e.target.value })} />
          </div>
          <Input label="Health Status" value={form.healthStatus} onChange={(e) => setForm({ ...form, healthStatus: e.target.value })} placeholder="e.g., Healthy" />
          <Input label="Notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Any additional notes" />

          <Button type="submit" loading={formLoading} className="w-full"><Plus className="w-4 h-4 mr-2" />Add Cow</Button>
          {error && <div className="bg-error-container text-on-error-container text-sm p-3 rounded-lg mt-3">{error}</div>}
        </form>
      </Modal>
    </div>
  );
}
