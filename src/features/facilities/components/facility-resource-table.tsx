import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";

import { FacilityStatusBadge } from "./facility-status-badge";

export type ResourceColumn<TRecord> = {
  header: string;
  render: (record: TRecord) => ReactNode;
};

type FacilityResourceTableProps<TRecord extends { id: string; is_active?: boolean }> = {
  records: TRecord[];
  columns: ResourceColumn<TRecord>[];
  emptyMessage: string;
  canDeactivate?: boolean;
  onDeactivate?: (record: TRecord) => void;
};

export function FacilityResourceTable<TRecord extends { id: string; is_active?: boolean }>({
  records,
  columns,
  emptyMessage,
  canDeactivate,
  onDeactivate,
}: FacilityResourceTableProps<TRecord>) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <table className="hidden min-w-full divide-y divide-border text-sm md:table">
        <thead className="bg-secondary/60 text-left text-muted-foreground">
          <tr>
            {columns.map((column) => <th key={column.header} className="px-4 py-3 font-medium">{column.header}</th>)}
            <th className="px-4 py-3 font-medium">Status</th>
            {canDeactivate ? <th className="px-4 py-3 font-medium">Actions</th> : null}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {records.length ? records.map((record) => (
            <tr key={record.id}>
              {columns.map((column) => <td key={column.header} className="px-4 py-4">{column.render(record) ?? "—"}</td>)}
              <td className="px-4 py-4"><FacilityStatusBadge isActive={record.is_active ?? true} /></td>
              {canDeactivate ? (
                <td className="px-4 py-4">
                  {record.is_active && onDeactivate ? (
                    <Button variant="danger" onClick={() => onDeactivate(record)}>Deactivate</Button>
                  ) : null}
                </td>
              ) : null}
            </tr>
          )) : (
            <tr><td colSpan={columns.length + 2} className="px-4 py-12 text-center text-muted-foreground">{emptyMessage}</td></tr>
          )}
        </tbody>
      </table>
      <div className="divide-y divide-border md:hidden">
        {records.length ? records.map((record) => (
          <article key={record.id} className="space-y-3 p-4">
            <div className="flex items-center justify-between gap-3">
              <FacilityStatusBadge isActive={record.is_active ?? true} />
              {canDeactivate && record.is_active && onDeactivate ? (
                <Button variant="danger" onClick={() => onDeactivate(record)}>Deactivate</Button>
              ) : null}
            </div>
            {columns.map((column) => (
              <div key={column.header}>
                <p className="text-xs font-medium text-muted-foreground">{column.header}</p>
                <div className="text-sm text-foreground">{column.render(record) ?? "—"}</div>
              </div>
            ))}
          </article>
        )) : <p className="p-6 text-center text-sm text-muted-foreground">{emptyMessage}</p>}
      </div>
    </div>
  );
}
