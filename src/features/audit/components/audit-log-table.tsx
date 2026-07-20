import Link from "next/link";
import { Eye } from "lucide-react";

import { Button } from "@/components/ui/button";

import type { AuditLogRecord } from "../types/audit.types";
import { AuditOutcomeBadge } from "./audit-outcome-badge";
import { formatActor, formatAuditDate, formatOptional } from "./audit-formatters";

type AuditLogTableProps = {
  logs: AuditLogRecord[];
};

export function AuditLogTable({ logs }: AuditLogTableProps) {
  return (
    <div className="hidden overflow-hidden rounded-xl border border-border bg-card md:block">
      <table className="min-w-full divide-y divide-border text-sm">
        <thead className="bg-secondary/60 text-left text-muted-foreground">
          <tr>
            {["Occurred", "Actor", "Action", "Resource", "Outcome", "Request", "Scope", "Actions"].map((column) => (
              <th key={column} className="px-4 py-3 font-medium">{column}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {logs.length ? logs.map((log) => (
            <tr key={log.id} className="align-top">
              <td className="px-4 py-4 whitespace-nowrap">{formatAuditDate(log.occurred_at)}</td>
              <td className="px-4 py-4">{formatActor(log.actor_user_summary)}</td>
              <td className="px-4 py-4 font-medium text-foreground">{log.action}</td>
              <td className="px-4 py-4">
                <div>{log.resource_type}</div>
                <div className="max-w-[180px] truncate text-xs text-muted-foreground">{formatOptional(log.resource_id)}</div>
              </td>
              <td className="px-4 py-4"><AuditOutcomeBadge outcome={log.outcome} /></td>
              <td className="px-4 py-4">
                <div>{formatOptional(log.method)} {formatOptional(log.status_code)}</div>
                <div className="max-w-[220px] truncate text-xs text-muted-foreground">{formatOptional(log.path)}</div>
              </td>
              <td className="px-4 py-4">
                <div>{formatOptional(log.organization_name)}</div>
                <div className="text-xs text-muted-foreground">{formatOptional(log.facility_name)}</div>
              </td>
              <td className="px-4 py-4">
                <Link href={`/audit-logs/${log.id}`}>
                  <Button variant="secondary"><Eye className="mr-2 h-4 w-4" />View</Button>
                </Link>
              </td>
            </tr>
          )) : (
            <tr><td colSpan={8} className="px-4 py-12 text-center text-muted-foreground">No audit logs found. The table is ready when backend data exists.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
