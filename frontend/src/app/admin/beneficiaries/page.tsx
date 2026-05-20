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
import { Search } from 'lucide-react';

interface Beneficiary {
  id: string; fullName: string; phoneNumber: string; type: string;
  status: string; requestedSlots: number; approvedSlots: number | null;
  uniqueCode: string | null; distributionDay: string | null;
  distributionTime: string | null; center: { name: string };
  state: { name: string }; createdAt: string;
}

const statusBadge = (status: string) => {
  switch (status) {
    case 'APPROVED': return <Badge variant="success">Approved</Badge>;
    case 'PENDING': return <Badge variant="warning">Pending</Badge>;
    case 'REJECTED': return <Badge variant="danger">Rejected</Badge>;
    default: return <Badge>{status}</Badge>;
  }
};

export default function BeneficiariesPage() {
  const [data, setData] = useState<Beneficiary[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Beneficiary | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const pageSize = 20;

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ skip: String((page - 1) * pageSize), take: String(pageSize) });
      if (search) params.set('search', search);
      if (statusFilter) params.set('status', statusFilter);
      const result = await api.get<{ data: Beneficiary[]; total: number }>(`/beneficiaries?${params}`);
      setData(result.data || []); setTotal(result.total || 0);
    } catch (err: any) {
      setError(err.message || 'Failed to load beneficiaries');
    } finally { setLoading(false); }
  }, [page, search, statusFilter]);

  useEffect(() => { fetchData(); }, [fetchData]);

  useEffect(() => {
    const timer = setTimeout(() => setSearch(searchInput), 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const handleApprove = async (id: string, data: { approvedSlots: number; distributionDay: string; distributionTime: string }) => {
    setActionLoading(true);
    try { await api.patch(`/beneficiaries/${id}/approve`, data); setModalOpen(false); setSelected(null); fetchData(); } catch (err: any) { setError(err.message || 'Action failed'); } finally { setActionLoading(false); }
  };

  const handleReject = async (id: string, reason: string) => {
    setActionLoading(true);
    try { await api.patch(`/beneficiaries/${id}/reject`, { rejectionReason: reason }); setModalOpen(false); setSelected(null); fetchData(); } catch (err: any) { setError(err.message || 'Action failed'); } finally { setActionLoading(false); }
  };

  const columns = [
    { key: 'fullName', header: 'Name' },
    { key: 'status', header: 'Status', render: (b: Beneficiary) => statusBadge(b.status) },
    { key: 'phoneNumber', header: 'Phone' },
    { key: 'type', header: 'Type' },
    { key: 'slots', header: 'Slots', render: (b: Beneficiary) => `${b.approvedSlots || b.requestedSlots}` },
    { key: 'code', header: 'Code', render: (b: Beneficiary) => b.uniqueCode || '\u2014' },
    { key: 'center', header: 'Center', render: (b: Beneficiary) => b.center?.name || '\u2014' },
    { key: 'state', header: 'State', render: (b: Beneficiary) => b.state?.name || '\u2014' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-on-surface">Applications</h1>
        <p className="text-on-surface-variant text-sm">Manage and review beneficiary applications</p>
      </div>
      <Card>
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
            <Input placeholder="Search by name, phone, or code..." value={searchInput} onChange={(e) => { setSearchInput(e.target.value); setPage(1); }} className="pl-9" />
          </div>
          <Select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            options={[{ value: '', label: 'All Statuses' }, { value: 'PENDING', label: 'Pending' }, { value: 'APPROVED', label: 'Approved' }, { value: 'REJECTED', label: 'Rejected' }]} />
        </div>
        {error && <div className="bg-error-container text-on-error-container text-sm p-3 rounded-lg mb-4">{error}</div>}
        {loading ? <div className="flex justify-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div> : (
          <>
            <Table columns={columns} data={data} onRowClick={(b) => { setSelected(b as Beneficiary); setModalOpen(true); }} />
            <Pagination page={page} total={total} pageSize={pageSize} onPageChange={setPage} />
          </>
        )}
      </Card>

      {selected && (
        <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={selected.fullName}>
          <div className="space-y-3 text-sm">
            <p><strong>Phone:</strong> {selected.phoneNumber}</p>
            <p><strong>Type:</strong> {selected.type}</p>
            <p><strong>Status:</strong> {statusBadge(selected.status)}</p>
            <p><strong>Requested Slots:</strong> {selected.requestedSlots}</p>
            <p><strong>Center:</strong> {selected.center?.name}</p>
            <p><strong>State:</strong> {selected.state?.name}</p>
            {selected.uniqueCode && (
              <div className="bg-primary-container/20 p-3 rounded-lg">
                <p className="text-sm text-primary font-medium">Code: <strong>{selected.uniqueCode}</strong></p>
                <p className="text-sm text-on-surface-variant">Day {selected.distributionDay} at {selected.distributionTime}</p>
              </div>
            )}
            {selected.status === 'PENDING' && (
              <div className="border-t border-outline-variant pt-4 mt-4">
                <h4 className="font-semibold mb-3">Approve</h4>
                <form onSubmit={(e) => { e.preventDefault(); const f = e.target as HTMLFormElement;
                  const slotsEl = f.elements.namedItem('approvedSlots') as HTMLInputElement;
                  const dayEl = f.elements.namedItem('distributionDay') as HTMLSelectElement;
                  const timeEl = f.elements.namedItem('distributionTime') as HTMLInputElement;
                  if (!slotsEl || !dayEl || !timeEl) return;
                  const slots = parseInt(slotsEl.value) || 1;
                  handleApprove(selected.id, { approvedSlots: slots,
                    distributionDay: dayEl.value,
                    distributionTime: timeEl.value }); }} className="space-y-3">
                  <Input label="Approved Slots" name="approvedSlots" type="number" defaultValue={selected.requestedSlots} min={1} />
                  <Select label="Collection Day" name="distributionDay" options={[
                    { value: 'DAY_10', label: '10th Zulhijjah' }, { value: 'DAY_11', label: '11th Zulhijjah' }, { value: 'DAY_12', label: '12th Zulhijjah' }]} />
                  <Input label="Collection Time" name="distributionTime" placeholder="e.g., 08:00 - 12:00" />
                  <Input label="Rejection Reason" value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} placeholder="Reason for rejection..." />
                  <div className="flex gap-3">
                    <Button type="submit" loading={actionLoading}>Approve</Button>
                    <Button type="button" variant="danger" loading={actionLoading} onClick={() => { if (rejectReason.trim()) handleReject(selected.id, rejectReason); }}>Reject</Button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}
