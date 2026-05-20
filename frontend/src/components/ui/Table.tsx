'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface Column {
  key: string;
  header: string;
  render?: (item: any) => React.ReactNode;
  sortable?: boolean;
}

interface TableProps {
  columns: Column[];
  data: any[];
  onRowClick?: (item: any) => void;
  emptyMessage?: string;
}

export default function Table({ columns, data, onRowClick, emptyMessage = 'No data found' }: TableProps) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const sorted = sortKey
    ? [...data].sort((a, b) => {
        const av = a[sortKey];
        const bv = b[sortKey];
        if (av == null) return 1;
        if (bv == null) return -1;
        const cmp = typeof av === 'string' ? av.localeCompare(String(bv)) : Number(av) - Number(bv);
        return sortDir === 'asc' ? cmp : -cmp;
      })
    : data;

  if (data.length === 0) {
    return <div className="text-center py-12 text-on-surface-variant"><p>{emptyMessage}</p></div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-outline-variant">
        <thead className="bg-surface-container">
          <tr>
            {columns.map((col) => (
              <th key={col.key}
                className={`px-4 py-3 text-left text-xs font-semibold text-on-surface-variant uppercase tracking-wider ${col.sortable !== false ? 'cursor-pointer select-none hover:text-on-surface transition-colors' : ''}`}
                onClick={() => col.sortable !== false && handleSort(col.key)}>
                <span className="inline-flex items-center gap-1">
                  {col.header}
                  {col.sortable !== false && sortKey === col.key && (
                    sortDir === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
                  )}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-surface-container-lowest divide-y divide-outline-variant">
          {sorted.map((item, idx) => (
            <tr key={item.id ?? `row-${idx}-${sortKey}-${sortDir}`} onClick={() => onRowClick?.(item)} className={onRowClick ? 'cursor-pointer hover:bg-surface-container-low transition-colors' : ''}>
              {columns.map((col) => (
                <td key={col.key} className="px-4 py-3 text-sm text-on-surface">{col.render ? col.render(item) : String(item[col.key] ?? '')}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
