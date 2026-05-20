'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import Card from '@/components/ui/Card';
import { BarChart3, Users, Beef, Globe, TrendingUp, Package, AlertTriangle } from 'lucide-react';

export default function ReportsPage() {
  const [dashboard, setDashboard] = useState<any>(null);
  const [beneficiaryReport, setBeneficiaryReport] = useState<any>(null);
  const [inventoryReport, setInventoryReport] = useState<any>(null);
  const [geoReport, setGeoReport] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'beneficiaries' | 'inventory' | 'geographic'>('overview');

  const loadReports = async () => {
    setLoading(true);
    try {
      const [d, b, i, g] = await Promise.all([
        api.get('/reporting/dashboard'),
        api.get('/reporting/beneficiaries'),
        api.get('/reporting/inventory'),
        api.get('/reporting/geographic'),
      ]);
      setDashboard(d); setBeneficiaryReport(b); setInventoryReport(i); setGeoReport(g);
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { loadReports(); }, []);

  if (loading) return <div className="flex justify-center py-16"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-on-surface">Reports & Analytics</h1><p className="text-on-surface-variant text-sm">Operational reports and data exports</p></div>

      {/* Summary Cards */}
      {dashboard && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <div className="bg-surface-container-lowest rounded-xl p-4 border border-outline-variant shadow-sm">
            <div className="flex items-center gap-2 mb-2"><div className="p-1.5 rounded-lg bg-secondary-container"><Users className="w-4 h-4 text-on-secondary-container" /></div></div>
            <p className="text-2xl font-bold">{dashboard.beneficiaries?.total || 0}</p><p className="text-xs text-on-surface-variant">Total Applications</p>
          </div>
          <div className="bg-surface-container-lowest rounded-xl p-4 border border-outline-variant shadow-sm">
            <div className="flex items-center gap-2 mb-2"><div className="p-1.5 rounded-lg bg-yellow-100"><AlertTriangle className="w-4 h-4 text-yellow-800" /></div></div>
            <p className="text-2xl font-bold">{dashboard.beneficiaries?.pending || 0}</p><p className="text-xs text-on-surface-variant">Pending</p>
          </div>
          <div className="bg-surface-container-lowest rounded-xl p-4 border border-outline-variant shadow-sm">
            <div className="flex items-center gap-2 mb-2"><div className="p-1.5 rounded-lg bg-tertiary-container"><CheckIcon className="w-4 h-4 text-on-tertiary-container" /></div></div>
            <p className="text-2xl font-bold">{dashboard.beneficiaries?.approved || 0}</p><p className="text-xs text-on-surface-variant">Approved</p>
          </div>
          <div className="bg-surface-container-lowest rounded-xl p-4 border border-outline-variant shadow-sm">
            <div className="flex items-center gap-2 mb-2"><div className="p-1.5 rounded-lg bg-primary-container"><Package className="w-4 h-4 text-on-primary-container" /></div></div>
            <p className="text-2xl font-bold">{dashboard.beneficiaries?.collected || 0}</p><p className="text-xs text-on-surface-variant">Collected</p>
          </div>
          <div className="bg-surface-container-lowest rounded-xl p-4 border border-outline-variant shadow-sm">
            <div className="flex items-center gap-2 mb-2"><div className="p-1.5 rounded-lg bg-surface-container-high"><Beef className="w-4 h-4 text-on-surface" /></div></div>
            <p className="text-2xl font-bold">{dashboard.inventory?.totalCows || 0}</p><p className="text-xs text-on-surface-variant">Total Cows</p>
          </div>
          <div className="bg-surface-container-lowest rounded-xl p-4 border border-outline-variant shadow-sm">
            <div className="flex items-center gap-2 mb-2"><div className="p-1.5 rounded-lg bg-primary-container/30"><TrendingUp className="w-4 h-4 text-primary" /></div></div>
            <p className="text-2xl font-bold">{dashboard.beneficiaries?.collectionRate || '0%'}</p><p className="text-xs text-on-surface-variant">Collection Rate</p>
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex gap-2 border-b border-outline-variant">
        {(['overview', 'beneficiaries', 'inventory', 'geographic'] as const).map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === tab ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant hover:text-on-surface'}`}>
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      <Card>
        {activeTab === 'overview' && dashboard && (
          <div className="space-y-6">
            <h3 className="font-semibold text-lg flex items-center gap-2"><BarChart3 className="w-5 h-5 text-primary" />Session Overview</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-sm font-semibold text-on-surface-variant mb-3 uppercase tracking-wider">Application Breakdown</h4>
                <div className="space-y-3">
                  {[
                    { label: 'Pending', value: dashboard.beneficiaries?.pending || 0, total: dashboard.beneficiaries?.total || 1, color: 'bg-yellow-500' },
                    { label: 'Approved', value: dashboard.beneficiaries?.approved || 0, total: dashboard.beneficiaries?.total || 1, color: 'bg-tertiary' },
                    { label: 'Rejected', value: dashboard.beneficiaries?.rejected || 0, total: dashboard.beneficiaries?.total || 1, color: 'bg-error' },
                    { label: 'Collected', value: dashboard.beneficiaries?.collected || 0, total: dashboard.beneficiaries?.total || 1, color: 'bg-primary' },
                  ].map((item) => (
                    <div key={item.label}>
                      <div className="flex justify-between text-sm mb-1"><span>{item.label}</span><span className="font-medium">{item.value}</span></div>
                      <div className="w-full bg-surface-container rounded-full h-2"><div className={`h-2 rounded-full ${item.color}`} style={{ width: `${Math.min(100, (item.value / item.total) * 100)}%` }} /></div>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-on-surface-variant mb-3 uppercase tracking-wider">Inventory Summary</h4>
                <div className="space-y-3">
                  <div className="flex justify-between p-3 bg-surface-container rounded-lg"><span className="text-sm">Total Cows</span><span className="font-bold">{dashboard.inventory?.totalCows || 0}</span></div>
                  <div className="flex justify-between p-3 bg-surface-container rounded-lg"><span className="text-sm">Slaughtered</span><span className="font-bold">{dashboard.inventory?.slaughtered || 0}</span></div>
                  <div className="flex justify-between p-3 bg-surface-container rounded-lg"><span className="text-sm">Approved Slots</span><span className="font-bold">{dashboard.beneficiaries?.totalApprovedSlots || 0}</span></div>
                  <div className="flex justify-between p-3 bg-surface-container rounded-lg"><span className="text-sm">Collection Rate</span><span className="font-bold">{dashboard.beneficiaries?.collectionRate || '0%'}</span></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'beneficiaries' && beneficiaryReport && (
          <div className="space-y-6">
            <h3 className="font-semibold text-lg flex items-center gap-2"><Users className="w-5 h-5 text-primary" />Beneficiary Report</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {beneficiaryReport.statusCounts?.map((s: any) => (
                <div key={s.status} className="bg-surface-container rounded-xl p-4 text-center">
                  <p className="text-3xl font-bold">{s._count}</p><p className="text-sm text-on-surface-variant mt-1">{s.status}</p>
                </div>
              ))}
            </div>
            <h4 className="font-semibold mt-4">By State (Top 10)</h4>
            <div className="space-y-2">
              {beneficiaryReport.byState?.slice(0, 10).map((s: any, i: number) => (
                <div key={s.stateId} className="flex items-center gap-3">
                  <span className="text-xs font-bold text-on-surface-variant w-5">{i + 1}</span>
                  <span className="text-sm flex-1">{s.stateName}</span>
                  <span className="text-sm font-semibold">{s._count}</span>
                  <div className="w-24 bg-surface-container rounded-full h-1.5"><div className="bg-primary h-1.5 rounded-full" style={{ width: `${Math.min(100, (s._count / (beneficiaryReport.statusCounts?.[0]?._count || 1)) * 100)}%` }} /></div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'inventory' && inventoryReport && (
          <div className="space-y-6">
            <h3 className="font-semibold text-lg flex items-center gap-2"><Beef className="w-5 h-5 text-primary" />Inventory Report</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {inventoryReport.statusCounts?.map((s: any) => (
                <div key={s.status} className="bg-surface-container rounded-xl p-4 text-center">
                  <p className="text-3xl font-bold">{s._count}</p><p className="text-sm text-on-surface-variant mt-1 capitalize">{s.status.toLowerCase()}</p>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-primary-container/20 rounded-xl p-6 text-center">
                <p className="text-sm text-on-surface-variant">Total Cost</p>
                <p className="text-2xl font-bold text-primary mt-1">{inventoryReport.cost?.total ? `₦${Number(inventoryReport.cost.total).toLocaleString()}` : '₦0'}</p>
              </div>
              <div className="bg-secondary-container rounded-xl p-6 text-center">
                <p className="text-sm text-on-secondary-container">Est. Yield</p>
                <p className="text-2xl font-bold text-on-secondary-container mt-1">{inventoryReport.yield?.total || 0} portions</p>
              </div>
            </div>
            <h4 className="font-semibold mt-4">By Supplier</h4>
            <div className="space-y-2">
              {inventoryReport.bySupplier?.map((s: any, i: number) => (
                <div key={s.supplierId} className="flex items-center gap-3">
                  <span className="text-xs font-bold text-on-surface-variant w-5">{i + 1}</span>
                  <span className="text-sm flex-1">{s.supplierName}</span>
                  <span className="text-sm font-semibold">{s._count} cows</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'geographic' && geoReport && (
          <div className="space-y-6">
            <h3 className="font-semibold text-lg flex items-center gap-2"><Globe className="w-5 h-5 text-primary" />Geographic Distribution</h3>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {geoReport.byState?.map((s: any, i: number) => (
                <div key={s.stateName} className="flex items-center gap-3 py-2 border-b border-outline-variant/50 last:border-0">
                  <span className="text-xs font-bold text-on-surface-variant w-5">{i + 1}</span>
                  <span className="text-sm flex-1">{s.stateName}</span>
                  <span className="text-sm font-semibold">{s.count}</span>
                  <div className="w-24 bg-surface-container rounded-full h-1.5"><div className="bg-primary h-1.5 rounded-full" style={{ width: `${Math.min(100, (s.count / (geoReport.byState?.[0]?.count || 1)) * 100)}%` }} /></div>
                </div>
              ))}
            </div>
            <h4 className="font-semibold mt-6">Center Coverage</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {geoReport.centers?.map((c: any) => (
                <div key={c.name} className="bg-surface-container rounded-xl p-4 border border-outline-variant">
                  <p className="font-semibold">{c.name}</p>
                  <p className="text-xs text-on-surface-variant mt-1">{c.code}</p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {c.states.slice(0, 5).map((st: string) => <span key={st} className="text-[10px] bg-surface-container-lowest px-2 py-0.5 rounded-full border border-outline-variant">{st}</span>)}
                    {c.states.length > 5 && <span className="text-[10px] text-on-surface-variant px-1">+{c.states.length - 5}</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  );
}
