'use client';

import { useState } from 'react';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Badge from '@/components/ui/Badge';
import { api } from '@/lib/api';
import { Search, CheckCircle, XCircle, Clock, ArrowLeft } from 'lucide-react';

export default function StatusPage() {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError(''); setResult(null);
    try {
      const searchResult: any = await api.get(`/beneficiaries?search=${encodeURIComponent(phone)}&take=1`);
      if (searchResult.data?.length > 0) setResult(searchResult.data[0]);
      else setError('No registration found with this phone number');
    } catch { setError('Could not check status.'); } finally { setLoading(false); }
  };

  const statusConfig = (status: string) => {
    switch (status) {
      case 'APPROVED': return { bg: 'bg-tertiary-container/40', text: 'text-on-tertiary-container', icon: CheckCircle, label: 'Approved' };
      case 'PENDING': return { bg: 'bg-yellow-100/80', text: 'text-yellow-800', icon: Clock, label: 'Pending Review' };
      case 'REJECTED': return { bg: 'bg-error-container/40', text: 'text-on-error-container', icon: XCircle, label: 'Rejected' };
      default: return { bg: 'bg-surface-container', text: 'text-on-surface-variant', icon: Clock, label: status };
    }
  };

  const s = result ? statusConfig(result.status) : null;

  return (
    <div className="min-h-screen bg-surface">
      <header className="bg-surface-container-lowest border-b border-outline-variant">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <Link href="/" className="inline-flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <img src="/logo.png" alt="Logo" className="h-6 w-auto" />
          </Link>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 py-16">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-on-surface">Check Application Status</h1>
          <p className="text-sm text-on-surface-variant mt-2">Enter your phone number or application code to track your application</p>
        </div>

        <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant shadow-sm p-6">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
              <Input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="08012345678"
                type="tel"
                required
                className="pl-10 py-3"
              />
            </div>
            <Button type="submit" loading={loading} className="w-full py-3">
              {loading ? 'Searching...' : 'Check Status'}
            </Button>
          </form>

          {error && (
            <div className="mt-6 bg-error-container/40 text-on-error-container text-sm p-4 rounded-xl flex items-center gap-3">
              <XCircle className="w-5 h-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {result && s && (
            <div className="mt-6">
              <div className={`rounded-xl ${s.bg} p-4 flex items-center gap-3 mb-4`}>
                <div className="w-10 h-10 rounded-full bg-surface-container-lowest flex items-center justify-center shadow-sm">
                  <s.icon className={`w-5 h-5 ${s.text}`} />
                </div>
                <div>
                  <p className={`text-sm font-semibold ${s.text}`}>{s.label}</p>
                  <p className="text-xs text-on-surface-variant">Application Status</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b border-outline-variant/50">
                  <span className="text-sm text-on-surface-variant">Name</span>
                  <span className="text-sm font-semibold text-on-surface">{result.fullName}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-outline-variant/50">
                  <span className="text-sm text-on-surface-variant">Phone</span>
                  <span className="text-sm font-semibold text-on-surface">{result.phoneNumber}</span>
                </div>
                {result.approvedSlots && (
                  <div className="flex justify-between py-2 border-b border-outline-variant/50">
                    <span className="text-sm text-on-surface-variant">Approved Slots</span>
                    <span className="text-sm font-semibold text-on-surface">{result.approvedSlots}</span>
                  </div>
                )}
                {result.distributionDay && (
                  <div className="flex justify-between py-2 border-b border-outline-variant/50">
                    <span className="text-sm text-on-surface-variant">Collection</span>
                    <span className="text-sm font-semibold text-on-surface">Day {result.distributionDay} at {result.distributionTime}</span>
                  </div>
                )}
              </div>

              {result.uniqueCode && (
                <div className="mt-4 bg-primary-container/10 border border-primary/20 rounded-xl p-5 text-center">
                  <p className="text-xs font-semibold text-primary tracking-wider uppercase">Your Collection Code</p>
                  <p className="text-2xl font-mono font-bold text-on-surface mt-2 tracking-wider">{result.uniqueCode}</p>
                  <p className="text-xs text-on-surface-variant mt-2">Present this code at your assigned center on collection day</p>
                </div>
              )}

              {result.center && (
                <div className="mt-3 text-center text-xs text-on-surface-variant">
                  Center: <span className="font-medium text-on-surface">{result.center.name}</span>
                </div>
              )}

              {result.rejectionReason && (
                <div className="mt-4 bg-error-container/30 text-on-error-container text-sm p-4 rounded-xl">
                  <p className="font-semibold text-xs mb-1">Rejection Reason</p>
                  <p>{result.rejectionReason}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
