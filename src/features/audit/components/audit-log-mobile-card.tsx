import Link from "next/link";

import { Button } from "@/components/ui/button";

import type { AuditLogRecord } from "../types/audit.types";
import { AuditOutcomeBadge } from "./audit-outcome-badge";
import { formatActor, formatAuditDate, formatOptional } from "./audit-formatters";

export function AuditLogMobileCard({ log }: { log: AuditLogRecord }) {
  return (
    <article className="rounded-xl border border-border bg-card p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-semibold text-foreground">{log.action}</p>
          <p className="text-xs text-muted-foreground">{formatAuditDate(log.occurred_at)}</p>
        </div>
        <AuditOutcomeBadge outcome={log.outcome} />
      </div>
      <div className="mt-4 grid gap-3 text-sm">
        <Info label="Actor" value={formatActor(log.actor_user_summary)} />
        <Info label="Resource" value={`${log.resource_type} · ${formatOptional(log.resource_id)}`} />
        <Info label="Request" value={`${formatOptional(log.method)} ${formatOptional(log.path)}`} />
        <Info label="Scope" value={`${formatOptional(log.organization_name)} · ${formatOptional(log.facility_name)}`} />
      </div>
      <Link href={`/audit-logs/${log.id}`} className="mt-4 inline-flex">
        <Button variant="secondary">View detail</Button>
      </Link>
    </article>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="break-words text-foreground">{value}</p>
    </div>
  );
}
