'use client';

import { useState } from 'react';
import { api } from '@/lib/api';
import Card from '@/components/ui/Card';
import { BarChart3, Users, Beef, Globe } from 'lucide-react';

export default function ReportsPage() {
  const [beneficiaryReport, setBeneficiaryReport] = useState<any>(null);
  const [inventoryReport, setInventoryReport] = useState<any>(null);
  const [geoReport, setGeoReport] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'beneficiaries' | 'inventory' | 'geographic'>('beneficiaries');

  const loadReport = async (type: string) => {
    setLoading(true);
    try {
      if (type === 'beneficiaries') { setBeneficiaryReport(await api.get('/reporting/beneficiaries')); }
      else if (type === 'inventory') { setInventoryReport(await api.get('/reporting/inventory')); }
      else { setGeoReport(await api.get('/reporting/geographic')); }
    } finally { setLoading(false); }
  };

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-on-surface">Reports & Analytics</h1><p className="text-on-surface-variant text-sm">Operational reports and data exports</p></div>
      <div className="flex gap-2 border-b border-outline-variant">
        {(['beneficiaries', 'inventory', 'geographic'] as const).map((tab) => (
          <button key={tab} onClick={() => { setActiveTab(tab); loadReport(tab); }}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === tab ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant hover:text-on-surface'}`}>
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>
      {loading ? <div className="flex justify-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div> : (
        <Card>
          {activeTab === 'beneficiaries' && beneficiaryReport && (
            <div className="space-y-4">
              <h3 className="font-semibold text-lg"><Users className="w-5 h-5 inline mr-2" />Beneficiary Report</h3>
              <div className="grid grid-cols-2 gap-4">
                {beneficiaryReport.statusCounts?.map((s: any) => (
                  <div key={s.status} className="flex justify-between p-3 bg-surface-container rounded-lg"><span>{s.status}</span><span className="font-bold">{s._count}</span></div>
                ))}
              </div>
              <h4 className="font-medium mt-4">By State</h4>
              <div className="space-y-2">{beneficiaryReport.byState?.slice(0, 10).map((s: any) => <div key={s.stateId} className="flex justify-between text-sm"><span>{s.stateName}</span><span className="font-medium">{s._count}</span></div>)}</div>
            </div>
          )}
          {activeTab === 'inventory' && inventoryReport && (
            <div className="space-y-4">
              <h3 className="font-semibold text-lg"><Beef className="w-5 h-5 inline mr-2" />Inventory Report</h3>
              <div className="grid grid-cols-2 gap-4">{inventoryReport.statusCounts?.map((s: any) => <div key={s.status} className="flex justify-between p-3 bg-surface-container rounded-lg"><span>{s.status}</span><span className="font-bold">{s._count}</span></div>)}</div>
              <div className="flex justify-between p-3 bg-primary-container/20 rounded-lg"><span>Total Cost</span><span className="font-bold">₦{inventoryReport.cost?.total || 0}</span></div>
              <div className="flex justify-between p-3 bg-secondary-container rounded-lg"><span>Total Estimated Yield</span><span className="font-bold">{inventoryReport.yield?.total || 0} portions</span></div>
            </div>
          )}
          {activeTab === 'geographic' && geoReport && (
            <div className="space-y-4">
              <h3 className="font-semibold text-lg"><Globe className="w-5 h-5 inline mr-2" />Geographic Report</h3>
              <div className="space-y-2">{geoReport.byState?.map((s: any) => <div key={s.stateName} className="flex justify-between text-sm"><span>{s.stateName}</span><span className="font-medium">{s.count}</span></div>)}</div>
              <h4 className="font-medium mt-4">Centers Coverage</h4>
              {geoReport.centers?.map((c: any) => <div key={c.name} className="p-3 bg-surface-container rounded-lg"><p className="font-medium">{c.name} ({c.code})</p><p className="text-sm text-on-surface-variant">{c.states.join(', ')}</p></div>)}
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
