import type { ReactNode } from "react";

export type SettingsColumn<T> = { header: string; render: (record: T) => ReactNode };

export function SettingsTable<T extends { id: string }>({ records, columns, emptyMessage }: { records: T[]; columns: SettingsColumn<T>[]; emptyMessage: string }) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <table className="hidden min-w-full divide-y divide-border text-sm md:table">
        <thead className="bg-secondary/60 text-left text-muted-foreground"><tr>{columns.map((column) => <th key={column.header} className="px-4 py-3 font-medium">{column.header}</th>)}</tr></thead>
        <tbody className="divide-y divide-border">
          {records.length ? records.map((record) => <tr key={record.id}>{columns.map((column) => <td key={column.header} className="px-4 py-4 align-top">{column.render(record)}</td>)}</tr>) : <tr><td colSpan={columns.length} className="px-4 py-12 text-center text-muted-foreground">{emptyMessage}</td></tr>}
        </tbody>
      </table>
      <div className="divide-y divide-border md:hidden">
        {records.length ? records.map((record) => <article key={record.id} className="space-y-3 p-4">{columns.map((column) => <div key={column.header}><p className="text-xs font-medium text-muted-foreground">{column.header}</p><div className="break-words text-sm text-foreground">{column.render(record)}</div></div>)}</article>) : <p className="p-6 text-center text-sm text-muted-foreground">{emptyMessage}</p>}
      </div>
    </div>
  );
}
