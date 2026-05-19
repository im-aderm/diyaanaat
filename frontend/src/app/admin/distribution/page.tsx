'use client';

import { useState } from 'react';
import { api } from '@/lib/api';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Badge from '@/components/ui/Badge';
import { Search, CheckCircle, Package } from 'lucide-react';

export default function DistributionPage() {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');
  const [collectLoading, setCollectLoading] = useState(false);
  const [collectSuccess, setCollectSuccess] = useState(false);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setError(''); setResult(null); setCollectSuccess(false);
    try { const res = await api.post('/distribution/verify-code', { code: code.trim() }); setResult(res); }
    catch (err: any) { setError(err.message || 'Verification failed'); }
    finally { setLoading(false); }
  };

  const handleCollect = async () => {
    setCollectLoading(true);
    try { await api.post('/distribution/collect', { code: code.trim() }); setCollectSuccess(true); setResult(null); setCode(''); }
    catch (err: any) { setError(err.message || 'Collection failed'); }
    finally { setCollectLoading(false); }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-on-surface">Distribution & Collection</h1>
        <p className="text-on-surface-variant text-sm">Verify codes and mark collections at the distribution center</p>
      </div>
      <div className="max-w-lg">
        <Card title="Verify Beneficiary Code">
          <form onSubmit={handleVerify} className="space-y-4">
            <Input label="Beneficiary Code" value={code} onChange={(e) => setCode(e.target.value)} placeholder="e.g., QRB-26-ABJ-8F3K2" required />
            <Button type="submit" loading={loading} className="w-full"><Search className="w-4 h-4 mr-2" />Verify Code</Button>
          </form>
          {error && <div className="bg-error-container text-on-error-container text-sm p-3 rounded-lg mt-4">{error}</div>}
          {collectSuccess && <div className="bg-tertiary-container text-on-tertiary-container p-4 rounded-lg mt-4 flex items-center gap-2"><CheckCircle className="w-5 h-5" />Collection recorded successfully!</div>}
          {result?.valid && (
            <div className="mt-6 bg-primary-container/10 rounded-lg p-4 space-y-2 border border-outline-variant">
              <div className="flex justify-between"><span className="text-sm text-on-surface-variant">Name</span><span className="font-medium">{result.beneficiary.fullName}</span></div>
              <div className="flex justify-between"><span className="text-sm text-on-surface-variant">Slots</span><span className="font-medium">{result.beneficiary.approvedSlots}</span></div>
              <div className="flex justify-between"><span className="text-sm text-on-surface-variant">Day</span><Badge variant="info">{result.beneficiary.distributionDay}</Badge></div>
              <div className="flex justify-between"><span className="text-sm text-on-surface-variant">Time</span><span className="font-medium">{result.beneficiary.distributionTime}</span></div>
              <div className="flex justify-between"><span className="text-sm text-on-surface-variant">Center</span><span className="font-medium">{result.beneficiary.centerName}</span></div>
              <Button onClick={handleCollect} loading={collectLoading} className="w-full mt-3"><Package className="w-4 h-4 mr-2" />Confirm Collection</Button>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
