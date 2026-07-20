import type { ReactNode } from "react";

export type IntelligenceColumn<T> = { header: string; render: (record: T) => ReactNode };

type IntelligenceTableProps<T> = {
  records: T[];
  columns: IntelligenceColumn<T>[];
  emptyMessage: string;
  getKey?: (record: T, index: number) => string;
};

function defaultKeyFor<T>(record: T, index: number) {
  if (record && typeof record === "object") {
    const candidate = record as { id?: string; prediction_id?: string; appointment_slot_id?: string };
    return candidate.id ?? candidate.prediction_id ?? candidate.appointment_slot_id ?? String(index);
  }
  return String(index);
}

export function IntelligenceTable<T>({ records, columns, emptyMessage, getKey = defaultKeyFor }: IntelligenceTableProps<T>) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <table className="hidden min-w-full divide-y divide-border text-sm md:table">
        <thead className="bg-secondary/60 text-left text-muted-foreground"><tr>{columns.map((column) => <th key={column.header} className="px-4 py-3 font-medium">{column.header}</th>)}</tr></thead>
        <tbody className="divide-y divide-border">
          {records.length ? records.map((record, index) => <tr key={getKey(record, index)}>{columns.map((column) => <td key={column.header} className="px-4 py-4 align-top">{column.render(record)}</td>)}</tr>) : <tr><td colSpan={columns.length} className="px-4 py-12 text-center text-muted-foreground">{emptyMessage}</td></tr>}
        </tbody>
      </table>
      <div className="divide-y divide-border md:hidden">
        {records.length ? records.map((record, index) => <article key={getKey(record, index)} className="space-y-3 p-4">{columns.map((column) => <div key={column.header}><p className="text-xs font-medium text-muted-foreground">{column.header}</p><div className="break-words text-sm text-foreground">{column.render(record)}</div></div>)}</article>) : <p className="p-6 text-center text-sm text-muted-foreground">{emptyMessage}</p>}
      </div>
    </div>
  );
}
