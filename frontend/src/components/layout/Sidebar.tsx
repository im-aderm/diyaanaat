'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { LayoutDashboard, Users, Package, Beef, Factory, Building2, CalendarRange, UserCog, BarChart3, FileSearch, MessageSquare } from 'lucide-react';

const menuItems = [
  { href: '/admin/dashboard', label: 'Dashboard', Icon: LayoutDashboard },
  { href: '/admin/beneficiaries', label: 'Beneficiaries', Icon: Users },
  { href: '/admin/distribution', label: 'Distribution', Icon: Package },
  { href: '/admin/inventory', label: 'Inventory', Icon: Beef },
  { href: '/admin/suppliers', label: 'Suppliers', Icon: Factory },
];

const superAdminItems = [
  { href: '/admin/centers', label: 'Centers', Icon: Building2 },
  { href: '/admin/sessions', label: 'Sessions', Icon: CalendarRange },
  { href: '/admin/users', label: 'Admins', Icon: UserCog },
  { href: '/admin/reports', label: 'Reports', Icon: BarChart3 },
  { href: '/admin/audit', label: 'Audit Log', Icon: FileSearch },
  { href: '/admin/sms', label: 'SMS', Icon: MessageSquare },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();

  const items = user?.role === 'SUPER_ADMIN' ? [...menuItems, ...superAdminItems] : menuItems;

  return (
    <aside className="w-64 bg-inverse-surface border-r border-outline-variant/20 h-screen sticky top-0 overflow-y-auto hidden lg:block">
      <div className="p-6">
        <Link href="/admin/dashboard" className="flex items-center gap-3">
          <img src="/logo.png" alt="Logo" className="h-7 w-auto" />
          <span className="text-lg font-bold text-inverse-on-surface">Türkiye Diyanet Vakfı</span>
        </Link>
      </div>
      <nav className="px-3 pb-6">
        <ul className="space-y-1">
          {items.map(({ href, label, Icon }) => {
            const isActive = pathname === href || pathname?.startsWith(href + '/');
            return (
              <li key={href}>
                <Link
                  href={href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-primary text-on-primary'
                      : 'text-inverse-on-surface/70 hover:bg-white/10 hover:text-inverse-on-surface'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
