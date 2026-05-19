'use client';

import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import Card from '@/components/ui/Card';
import Table from '@/components/ui/Table';
import Badge from '@/components/ui/Badge';
import Select from '@/components/ui/Select';
import Pagination from '@/components/ui/Pagination';
import { FileSearch } from 'lucide-react';

export default function AuditPage() {
  const [logs, setLogs] = useState<any[]>([]); const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1); const [filter, setFilter] = useState({ action: '', entityType: '' });
  const [loading, setLoading] = useState(true);
  const pageSize = 50;

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ skip: String((page - 1) * pageSize), take: String(pageSize) });
      if (filter.action) params.set('action', filter.action);
      if (filter.entityType) params.set('entityType', filter.entityType);
      const result = await api.get<{ data: any[]; total: number }>(`/audit?${params}`);
      setLogs(result.data || []); setTotal(result.total || 0);
    } finally { setLoading(false); }
  }, [page, filter]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  const columns = [
    { key: 'createdAt', header: 'Date', render: (l: any) => new Date(l.createdAt).toLocaleString() },
    { key: 'actor', header: 'Actor', render: (l: any) => l.actor?.fullName || l.actorId?.slice(0, 8) || 'System' },
    { key: 'action', header: 'Action' }, { key: 'entityType', header: 'Entity' },
    { key: 'entityId', header: 'Entity ID', render: (l: any) => l.entityId?.slice(0, 8) || '\u2014' },
    { key: 'success', header: 'Result', render: (l: any) => l.success ? <Badge variant="success">Success</Badge> : <Badge variant="danger">Failed</Badge> },
  ];

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-on-surface">Audit Log</h1><p className="text-on-surface-variant text-sm">System audit trail and activity log</p></div>
      <Card>
        <div className="flex gap-4 mb-4">
          <Select value={filter.action} onChange={(e) => { setFilter({ ...filter, action: e.target.value }); setPage(1); }}
            options={[{ value: '', label: 'All Actions' }, { value: 'APPROVE', label: 'Approve' }, { value: 'REJECT', label: 'Reject' }, { value: 'COLLECT', label: 'Collect' }, { value: 'LOGIN', label: 'Login' }, { value: 'CODE_VERIFY_SUCCESS', label: 'Code Verify' }]} />
          <Select value={filter.entityType} onChange={(e) => { setFilter({ ...filter, entityType: e.target.value }); setPage(1); }}
            options={[{ value: '', label: 'All Entities' }, { value: 'Beneficiary', label: 'Beneficiary' }, { value: 'Distribution', label: 'Distribution' }, { value: 'User', label: 'User' }, { value: 'Cow', label: 'Cow' }]} />
        </div>
        {loading ? <div className="flex justify-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div> : <><Table columns={columns} data={logs} /><Pagination page={page} total={total} pageSize={pageSize} onPageChange={setPage} /></>}
      </Card>
    </div>
  );
}
