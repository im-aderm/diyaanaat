interface Column {
  key: string;
  header: string;
  render?: (item: any) => React.ReactNode;
}

interface TableProps {
  columns: Column[];
  data: any[];
  onRowClick?: (item: any) => void;
  emptyMessage?: string;
}

export default function Table({ columns, data, onRowClick, emptyMessage = 'No data found' }: TableProps) {
  if (data.length === 0) {
    return <div className="text-center py-12 text-on-surface-variant"><p>{emptyMessage}</p></div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-outline-variant">
        <thead className="bg-surface-container">
          <tr>
            {columns.map((col) => (
              <th key={col.key} className="px-4 py-3 text-left text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-surface-container-lowest divide-y divide-outline-variant">
          {data.map((item, idx) => (
            <tr key={idx} onClick={() => onRowClick?.(item)} className={onRowClick ? 'cursor-pointer hover:bg-surface-container-low transition-colors' : ''}>
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
