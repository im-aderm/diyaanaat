'use client';

import { useState } from 'react';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Badge from '@/components/ui/Badge';
import Card from '@/components/ui/Card';
import { api } from '@/lib/api';
import { Search } from 'lucide-react';

export default function StatusPage() {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError(''); setResult(null);
    try {
      const searchResult: any = await api.get(`/beneficiaries?search=${phone}&take=1`);
      if (searchResult.data?.length > 0) setResult(searchResult.data[0]);
      else setError('No registration found with this phone number');
    } catch { setError('Could not check status.'); } finally { setLoading(false); }
  };

  const statusVariant = (status: string) => {
    switch (status) { case 'APPROVED': return 'success'; case 'PENDING': return 'warning'; case 'REJECTED': return 'danger'; default: return 'neutral'; }
  };

  return (
    <div className="min-h-screen bg-surface">
      <header className="bg-surface-container-lowest border-b border-outline-variant">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <img src="/logo.png" alt="Logo" className="h-6 w-auto" />
            <span className="text-base font-bold text-on-surface">Türkiye Diyanet Vakfı</span>
          </Link>
        </div>
      </header>
      <main className="max-w-md mx-auto px-4 py-12">
        <h2 className="text-xl font-bold text-center mb-6">Check Registration Status</h2>
        <Card>
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
              <Input placeholder="Enter your phone number" value={phone} onChange={(e) => setPhone(e.target.value)} className="pl-9" type="tel" required />
            </div>
            <Button type="submit" loading={loading} className="w-full">Check Status</Button>
          </form>
          {error && <p className="text-error text-sm mt-4 text-center">{error}</p>}
          {result && (
            <div className="mt-6 space-y-3">
              <div className="flex justify-between"><span className="text-sm text-on-surface-variant">Status</span><Badge variant={statusVariant(result.status)}>{result.status}</Badge></div>
              <div className="flex justify-between"><span className="text-sm text-on-surface-variant">Name</span><span className="font-medium">{result.fullName}</span></div>
              {result.approvedSlots && <div className="flex justify-between"><span className="text-sm text-on-surface-variant">Approved Slots</span><span className="font-medium">{result.approvedSlots}</span></div>}
              {result.uniqueCode && <div className="bg-primary-container/20 rounded-lg p-4 text-center"><p className="text-sm text-primary">Your Collection Code</p><p className="text-xl font-mono font-bold text-on-surface mt-1">{result.uniqueCode}</p></div>}
              {result.distributionDay && <div className="text-sm text-center text-on-surface-variant">Collection: Day {result.distributionDay} at {result.distributionTime}</div>}
              {result.rejectionReason && <div className="bg-error-container text-on-error-container text-sm p-3 rounded-lg">{result.rejectionReason}</div>}
            </div>
          )}
        </Card>
      </main>
    </div>
  );
}
