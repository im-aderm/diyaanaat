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
import { MessageSquare, Send, Users } from 'lucide-react';

export default function SmsPage() {
  const [logs, setLogs] = useState<any[]>([]); const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1); const [loading, setLoading] = useState(true);
  const [templates, setTemplates] = useState<any[]>([]);
  const [templateModal, setTemplateModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [templateBody, setTemplateBody] = useState('');
  const [saving, setSaving] = useState(false);
  const [composeMode, setComposeMode] = useState<'manual' | 'bulk'>('bulk');
  const [composeForm, setComposeForm] = useState({ phones: '', message: '', centerId: '', sessionId: '', status: '', excludeCollected: true });
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState<any>(null);
  const [centers, setCenters] = useState<any[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const pageSize = 20;

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try { const params = new URLSearchParams({ skip: String((page - 1) * pageSize), take: String(pageSize) }); const result = await api.get<{ data: any[]; total: number }>(`/sms/logs?${params}`); setLogs(result.data || []); setTotal(result.total || 0); } finally { setLoading(false); }
  }, [page]);

  const fetchData = useCallback(async () => {
    try {
      const [t, c, s] = await Promise.all([api.get<any[]>('/sms/templates'), api.get<any[]>('/centers'), api.get<any[]>('/sessions')]);
      setTemplates(t || []); setCenters(c || []); setSessions(s || []);
    } catch {}
  }, []);

  useEffect(() => { fetchLogs(); fetchData(); }, [fetchLogs, fetchData]);

  const handleSaveTemplate = async () => { setSaving(true); try { await api.post('/sms/templates', { name: selectedTemplate.name, body: templateBody }); setTemplateModal(false); fetchData(); } finally { setSaving(false); } };

  const handleSend = async () => {
    setSending(true); setSendResult(null);
    try {
      let result;
      if (composeMode === 'manual') {
        const phones = composeForm.phones.split(',').map((p) => p.trim()).filter(Boolean);
        result = await api.post('/sms/send', { phoneNumbers: phones, message: composeForm.message });
      } else {
        result = await api.post('/sms/send-bulk', {
          message: composeForm.message,
          centerId: composeForm.centerId || undefined,
          sessionId: composeForm.sessionId || undefined,
          status: composeForm.status || undefined,
          excludeCollected: composeForm.excludeCollected,
        });
      }
      setSendResult(result);
      fetchLogs();
    } catch (e: any) { setSendResult({ error: e.message }); }
    finally { setSending(false); }
  };

  const columns = [
    { key: 'createdAt', header: 'Date', render: (l: any) => new Date(l.createdAt).toLocaleString() },
    { key: 'phoneNumber', header: 'Phone' },
    { key: 'template', header: 'Type', render: (l: any) => <Badge variant="info">{l.template}</Badge> },
    { key: 'message', header: 'Message', render: (l: any) => <span className="text-xs truncate block max-w-[200px]">{l.message}</span> },
    { key: 'status', header: 'Status', render: (l: any) => l.status === 'sent' ? <Badge variant="success">Sent</Badge> : l.status === 'failed' ? <Badge variant="danger">Failed</Badge> : <Badge variant="warning">Pending</Badge> },
  ];

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-on-surface">SMS Management</h1><p className="text-on-surface-variant text-sm">Configure templates, compose messages, and view logs</p></div>

      <Card title="Compose Message">
        <div className="flex gap-2 mb-4">
          <Button variant={composeMode === 'bulk' ? 'primary' : 'ghost'} size="sm" onClick={() => setComposeMode('bulk')}><Users className="w-4 h-4 mr-1" />Bulk</Button>
          <Button variant={composeMode === 'manual' ? 'primary' : 'ghost'} size="sm" onClick={() => setComposeMode('manual')}><Send className="w-4 h-4 mr-1" />Manual</Button>
        </div>

        {composeMode === 'bulk' && (
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-3">
              <Select label="Center" value={composeForm.centerId} onChange={(e) => setComposeForm({ ...composeForm, centerId: e.target.value })}
                options={[{ value: '', label: 'All centers' }, ...centers.map((c: any) => ({ value: c.id, label: c.name }))]} />
              <Select label="Session" value={composeForm.sessionId} onChange={(e) => setComposeForm({ ...composeForm, sessionId: e.target.value })}
                options={[{ value: '', label: 'Active session' }, ...sessions.map((s: any) => ({ value: s.id, label: s.name }))]} />
              <Select label="Status Filter" value={composeForm.status} onChange={(e) => setComposeForm({ ...composeForm, status: e.target.value })}
                options={[{ value: '', label: 'All statuses' }, { value: 'PENDING', label: 'Pending' }, { value: 'APPROVED', label: 'Approved' }, { value: 'REJECTED', label: 'Rejected' }]} />
            </div>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={composeForm.excludeCollected} onChange={(e) => setComposeForm({ ...composeForm, excludeCollected: e.target.checked })}
                className="rounded border-outline-variant text-primary focus:ring-primary" /> Exclude already collected
            </label>
          </div>
        )}

        {composeMode === 'manual' && (
          <Input label="Phone Numbers (comma-separated)" value={composeForm.phones} onChange={(e) => setComposeForm({ ...composeForm, phones: e.target.value })} placeholder="08012345678, 08098765432" />
        )}

        <div className="mt-3 space-y-1.5">
          <label className="block text-xs font-semibold text-on-surface-variant">Message</label>
          <textarea value={composeForm.message} onChange={(e) => setComposeForm({ ...composeForm, message: e.target.value })} rows={4}
            className="w-full rounded-lg border border-outline-variant px-3 py-2.5 text-sm bg-surface focus:ring-2 focus:ring-primary focus:border-primary resize-none"
            placeholder="Type your message... Use {{name}} for recipient name." />
          <p className="text-xs text-on-surface-variant">Use {'{{name}}'} to include recipient name</p>
        </div>

        <div className="flex items-center gap-3 mt-3">
          <Button onClick={handleSend} loading={sending} disabled={!composeForm.message}><Send className="w-4 h-4 mr-2" />Send Messages</Button>
          {sendResult && !sendResult.error && (
            <div className="text-sm"><Badge variant="success">{sendResult.sent} sent</Badge>{' '}{sendResult.failed > 0 && <Badge variant="danger">{sendResult.failed} failed</Badge>}</div>
          )}
          {sendResult?.error && <p className="text-sm text-error">{sendResult.error}</p>}
        </div>
      </Card>

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

      <Modal open={templateModal} onClose={() => setTemplateModal(false)} title={`Edit: ${selectedTemplate?.name}`}>
        <div className="space-y-4">
          <p className="text-xs text-on-surface-variant">Placeholders: {'{{name}}'}, {'{{code}}'}, {'{{day}}'}, {'{{time}}'}, {'{{reason}}'}</p>
          <textarea value={templateBody} onChange={(e) => setTemplateBody(e.target.value)} rows={6} className="block w-full rounded-lg border border-outline-variant px-3 py-2 text-sm bg-surface focus:ring-2 focus:ring-primary focus:border-primary" />
          <Button onClick={handleSaveTemplate} loading={saving}>Save</Button>
        </div>
      </Modal>
    </div>
  );
}
