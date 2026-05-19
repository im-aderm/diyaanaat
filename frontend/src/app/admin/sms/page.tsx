'use client';

import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import Card from '@/components/ui/Card';
import Table from '@/components/ui/Table';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Pagination from '@/components/ui/Pagination';
import Modal from '@/components/ui/Modal';
import { MessageSquare } from 'lucide-react';

export default function SmsPage() {
  const [logs, setLogs] = useState<any[]>([]); const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1); const [loading, setLoading] = useState(true);
  const [templates, setTemplates] = useState<any[]>([]);
  const [templateModal, setTemplateModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [templateBody, setTemplateBody] = useState('');
  const [saving, setSaving] = useState(false);
  const pageSize = 20;

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try { const params = new URLSearchParams({ skip: String((page - 1) * pageSize), take: String(pageSize) }); const result = await api.get<{ data: any[]; total: number }>(`/sms/logs?${params}`); setLogs(result.data || []); setTotal(result.total || 0); } finally { setLoading(false); }
  }, [page]);

  const fetchTemplates = useCallback(async () => { setTemplates(await api.get<any[]>('/sms/templates') || []); }, []);

  useEffect(() => { fetchLogs(); fetchTemplates(); }, [fetchLogs, fetchTemplates]);

  const handleSaveTemplate = async () => { setSaving(true); try { await api.post('/sms/templates', { name: selectedTemplate.name, body: templateBody }); setTemplateModal(false); fetchTemplates(); } finally { setSaving(false); } };

  const columns = [
    { key: 'createdAt', header: 'Date', render: (l: any) => new Date(l.createdAt).toLocaleString() },
    { key: 'phoneNumber', header: 'Phone' },
    { key: 'template', header: 'Template', render: (l: any) => <Badge variant="info">{l.template}</Badge> },
    { key: 'status', header: 'Status', render: (l: any) => l.status === 'sent' ? <Badge variant="success">Sent</Badge> : l.status === 'failed' ? <Badge variant="danger">Failed</Badge> : <Badge variant="warning">Pending</Badge> },
  ];

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-on-surface">SMS Management</h1><p className="text-on-surface-variant text-sm">Configure templates and view SMS logs</p></div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="SMS Templates">
          {templates.map((tpl) => (
            <div key={tpl.name} className="flex items-center justify-between py-3 border-b border-outline-variant last:border-0">
              <div><p className="font-medium capitalize">{tpl.name}</p><p className="text-sm text-on-surface-variant truncate max-w-xs">{tpl.body?.slice(0, 60)}...</p></div>
              <Button size="sm" variant="outline" onClick={() => { setSelectedTemplate(tpl); setTemplateBody(tpl.body); setTemplateModal(true); }}>Edit</Button>
            </div>
          ))}
        </Card>
        <Card title="SMS Logs">
          {loading ? <div className="flex justify-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div> : <><Table columns={columns} data={logs} /><Pagination page={page} total={total} pageSize={pageSize} onPageChange={setPage} /></>}
        </Card>
      </div>
      <Modal open={templateModal} onClose={() => setTemplateModal(false)} title={`Edit Template: ${selectedTemplate?.name}`}>
        <div className="space-y-4">
          <p className="text-xs text-on-surface-variant">Available placeholders: {'{{name}}'}, {'{{code}}'}, {'{{day}}'}, {'{{time}}'}, {'{{reason}}'}</p>
          <textarea value={templateBody} onChange={(e) => setTemplateBody(e.target.value)} rows={6} className="block w-full rounded-lg border border-outline-variant px-3 py-2 text-sm bg-surface focus:ring-2 focus:ring-primary focus:border-primary" />
          <Button onClick={handleSaveTemplate} loading={saving}>Save Template</Button>
        </div>
      </Modal>
    </div>
  );
}
