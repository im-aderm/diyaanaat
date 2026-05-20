'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import Card from '@/components/ui/Card';
import { Users, Package, Beef, CheckCircle, Clock, AlertTriangle, TrendingUp } from 'lucide-react';

interface DashboardStats {
  session: { name: string; gregorianYear: number; status: string };
  beneficiaries: {
    total: number; pending: number; approved: number;
    rejected: number; collected: number;
    collectionRate: string; totalApprovedSlots: number;
  };
  inventory: { totalCows: number; slaughtered: number };
  distributions: { total: number };
}

const statusLabel = (s: string) => {
  switch (s) {
    case 'REGISTRATION_OPEN': return 'Registration Open';
    case 'REGISTRATION_CLOSED': return 'Registration Closed';
    case 'DISTRIBUTION_ACTIVE': return 'Distribution Active';
    case 'ARCHIVED': return 'Archived';
    default: return s;
  }
};

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get<DashboardStats>('/reporting/dashboard')
      .then(setStats)
      .catch((err) => { setError(err.message || 'Failed to load dashboard data'); })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="flex justify-center py-16"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;
  }

  if (error) {
    return <Card className="max-w-lg mx-auto mt-8"><p className="text-error">{error}</p></Card>;
  }

  if (!stats) {
    return <Card className="max-w-lg mx-auto mt-8"><p className="text-on-surface-variant">No data available. Create a session first.</p></Card>;
  }

  const statCards = [
    { label: 'Total Applications', value: stats.beneficiaries.total, Icon: Users, color: 'bg-secondary-container text-on-secondary-container' },
    { label: 'Pending Review', value: stats.beneficiaries.pending, Icon: Clock, color: 'bg-yellow-100 text-yellow-800' },
    { label: 'Approved', value: stats.beneficiaries.approved, Icon: CheckCircle, color: 'bg-tertiary-container text-on-tertiary-container' },
    { label: 'Collected', value: stats.beneficiaries.collected, Icon: Package, color: 'bg-primary-container text-on-primary-container' },
    { label: 'Rejected', value: stats.beneficiaries.rejected, Icon: AlertTriangle, color: 'bg-error-container text-on-error-container' },
    { label: 'Total Cows', value: stats.inventory.totalCows, Icon: Beef, color: 'bg-surface-container-high text-on-surface' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-on-surface">Dashboard</h1>
        <p className="text-on-surface-variant text-sm mt-1">
          {stats.session?.name} ({stats.session?.gregorianYear}) &mdash; <span className="font-medium">{statusLabel(stats.session?.status)}</span>
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {statCards.map(({ label, value, Icon, color }) => (
          <div key={label} className="bg-surface-container-lowest rounded-xl p-4 border border-outline-variant shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <div className={`p-1.5 rounded-lg ${color}`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-bold text-on-surface">{value}</p>
            <p className="text-xs text-on-surface-variant mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card title="Collection Progress">
          <div className="text-center py-2">
            <div className="text-3xl font-bold text-primary">{parseFloat(stats.beneficiaries.collectionRate) || 0}%</div>
            <p className="text-sm text-on-surface-variant mt-1 flex items-center justify-center gap-1">
              <TrendingUp className="w-4 h-4" /> Collection Rate
            </p>
            <div className="mt-4 bg-surface-container rounded-full h-2">
              <div className="bg-primary h-2 rounded-full transition-all" style={{ width: `${parseFloat(stats.beneficiaries.collectionRate) || 0}%` }} />
            </div>
          </div>
        </Card>

        <Card title="Approved Slots">
          <div className="text-center py-2">
            <div className="text-3xl font-bold text-on-surface">{stats.beneficiaries.totalApprovedSlots}</div>
            <p className="text-sm text-on-surface-variant mt-1">Total Approved Meat Slots</p>
          </div>
        </Card>

        <Card title="Inventory Overview">
          <div className="text-center py-2">
            <div className="text-3xl font-bold text-on-surface">
              {stats.inventory.slaughtered}<span className="text-on-surface-variant text-xl">/{stats.inventory.totalCows}</span>
            </div>
            <p className="text-sm text-on-surface-variant mt-1">Slaughtered / Total Cows</p>
          </div>
        </Card>
      </div>
    </div>
  );
}
