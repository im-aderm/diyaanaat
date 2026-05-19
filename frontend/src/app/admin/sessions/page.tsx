'use client';

import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import Card from '@/components/ui/Card';
import Table from '@/components/ui/Table';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import { CalendarRange, Plus } from 'lucide-react';

export default function SessionsPage() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ gregorianYear: new Date().getFullYear(), hijriYear: 1448, name: '', registrationOpenDate: '', registrationCloseDate: '', distributionStartDate: '', distributionEndDate: '' });
  const [formLoading, setFormLoading] = useState(false);

  const fetchSessions = useCallback(async () => {
    setLoading(true);
    try { const data = await api.get<any[]>('/sessions'); setSessions(data || []); } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchSessions(); }, [fetchSessions]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault(); setFormLoading(true);
    try { await api.post('/sessions', form); setShowForm(false); fetchSessions(); } finally { setFormLoading(false); }
  };

  const handleStatusChange = async (id: string, status: string) => { await api.patch(`/sessions/${id}/status`, { status }); fetchSessions(); };

  const sBadge = (s: string) => {
    switch (s) { case 'REGISTRATION_OPEN': return <Badge variant="success">Registration Open</Badge>; case 'REGISTRATION_CLOSED': return <Badge variant="warning">Closed</Badge>; case 'DISTRIBUTION_ACTIVE': return <Badge variant="info">Distribution Active</Badge>; case 'ARCHIVED': return <Badge variant="neutral">Archived</Badge>; default: return <Badge>{s}</Badge>; }
  };

  const columns = [
    { key: 'name', header: 'Session' }, { key: 'gregorianYear', header: 'Year (G)' }, { key: 'hijriYear', header: 'Year (H)' },
    { key: 'status', header: 'Status', render: (s: any) => sBadge(s.status) },
    { key: 'actions', header: 'Actions', render: (s: any) => (
      <div className="flex gap-2">
        {s.status === 'DRAFT' && <Button size="sm" variant="outline" onClick={() => handleStatusChange(s.id, 'REGISTRATION_OPEN')}>Open</Button>}
        {s.status === 'REGISTRATION_OPEN' && <Button size="sm" variant="outline" onClick={() => handleStatusChange(s.id, 'REGISTRATION_CLOSED')}>Close Reg</Button>}
        {s.status === 'REGISTRATION_CLOSED' && <Button size="sm" variant="outline" onClick={() => handleStatusChange(s.id, 'DISTRIBUTION_ACTIVE')}>Start Dist</Button>}
        {s.status === 'DISTRIBUTION_ACTIVE' && <Button size="sm" variant="outline" onClick={() => handleStatusChange(s.id, 'ARCHIVED')}>Archive</Button>}
      </div>
    )},
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between"><div><h1 className="text-2xl font-bold text-on-surface">Sessions</h1><p className="text-on-surface-variant text-sm">Manage yearly Qurbani sessions</p></div><Button onClick={() => setShowForm(true)}><Plus className="w-4 h-4 mr-2" />Create Session</Button></div>
      <Card>{loading ? <div className="flex justify-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div> : <Table columns={columns} data={sessions} />}</Card>
      <Modal open={showForm} onClose={() => setShowForm(false)} title="Create Session">
        <form onSubmit={handleCreate} className="space-y-4">
          <Input label="Session Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required placeholder="Qurbani 2026 / 1448 AH" />
          <div className="grid grid-cols-2 gap-4"><Input label="Gregorian Year" type="number" value={form.gregorianYear} onChange={(e) => setForm({ ...form, gregorianYear: parseInt(e.target.value) })} required /><Input label="Hijri Year" type="number" value={form.hijriYear} onChange={(e) => setForm({ ...form, hijriYear: parseInt(e.target.value) })} required /></div>
          <Input label="Registration Open Date" type="date" value={form.registrationOpenDate} onChange={(e) => setForm({ ...form, registrationOpenDate: e.target.value })} required />
          <Input label="Registration Close Date" type="date" value={form.registrationCloseDate} onChange={(e) => setForm({ ...form, registrationCloseDate: e.target.value })} required />
          <Input label="Distribution Start Date" type="date" value={form.distributionStartDate} onChange={(e) => setForm({ ...form, distributionStartDate: e.target.value })} required />
          <Input label="Distribution End Date" type="date" value={form.distributionEndDate} onChange={(e) => setForm({ ...form, distributionEndDate: e.target.value })} required />
          <Button type="submit" loading={formLoading} className="w-full">Create Session</Button>
        </form>
      </Modal>
    </div>
  );
}
