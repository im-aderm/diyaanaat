'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Menu, X, LogOut } from 'lucide-react';

export default function MobileHeader() {
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();

  return (
    <header className="lg:hidden sticky top-0 z-30 bg-surface border-b border-outline-variant">
      <div className="flex items-center justify-between px-4 h-14">
        <Link href="/admin/dashboard" className="flex items-center gap-2">
          <img src="/logo.png" alt="Türkiye Diyanet Foundation" className="h-6 w-auto" />
          <span className="text-base font-bold text-on-surface">Türkiye Diyanet Vakfı</span>
        </Link>
        <button onClick={() => setOpen(!open)} className="text-on-surface-variant p-2">
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>
      {open && (
        <div className="border-t border-outline-variant p-4 bg-surface">
          <div className="text-sm text-on-surface-variant mb-3">Signed in as <strong>{user?.fullName}</strong></div>
          <button onClick={logout} className="flex items-center gap-2 text-sm text-error"><LogOut className="w-4 h-4" /> Sign out</button>
        </div>
      )}
    </header>
  );
}
