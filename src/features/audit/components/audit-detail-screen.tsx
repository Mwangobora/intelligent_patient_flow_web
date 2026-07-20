"use client";

import Link from "next/link";
import { Activity, FileSearch, UserRound } from "lucide-react";

import { ErrorState } from "@/components/common/error-state";
import { LoadingState } from "@/components/common/loading-state";
import { SectionCard } from "@/components/common/section-card";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { ResponsiveActionBar } from "@/components/layout/responsive-action-bar";
import { ResponsivePageShell } from "@/components/layout/responsive-page-shell";
import { Button } from "@/components/ui/button";

import { useAuditLogDetailQuery } from "../hooks/use-audit-queries";
import { useAuditWorkspace } from "../hooks/use-audit-workspace";
import { AuditJsonView } from "./audit-json-view";
import { AuditOutcomeBadge } from "./audit-outcome-badge";
import { formatActor, formatAuditDate, formatOptional } from "./audit-formatters";

export function AuditDetailScreen({ auditLogId }: { auditLogId: string }) {
  const workspace = useAuditWorkspace();
  const auditQuery = useAuditLogDetailQuery(auditLogId, { enabled: workspace.canViewAuditLogs });
  const log = auditQuery.data;

  if (workspace.isLoading || auditQuery.isLoading) return <LoadingState title="Loading audit log" description="Fetching audit detail." />;
  if (!workspace.canViewAuditLogs) return <ErrorState title="Audit access required" description="You do not have permission to view audit logs." />;
  if (auditQuery.error) return <ErrorState title="Audit log was not found" description="Audit log was not found." actionLabel="Retry" onAction={() => void auditQuery.refetch()} />;
  if (!log) return <ErrorState title="Audit log was not found" description="The backend did not return this audit log." />;

  return (
    <PageContainer>
      <ResponsivePageShell
        header={<PageHeader title="Audit Event Detail" description={`${log.action} · ${formatAuditDate(log.occurred_at)}`} />}
        actions={<ResponsiveActionBar>
          {log.actor_user ? <Link href={`/audit-logs/actors/${log.actor_user}`}><Button variant="secondary"><UserRound className="mr-2 h-4 w-4" />Actor history</Button></Link> : null}
          {log.resource_id ? <Link href={`/audit-logs/resources/${encodeURIComponent(log.resource_type)}/${log.resource_id}`}><Button variant="secondary"><FileSearch className="mr-2 h-4 w-4" />Resource history</Button></Link> : null}
          <Link href="/audit-logs"><Button variant="secondary">Back to logs</Button></Link>
        </ResponsiveActionBar>}
      >
        <div className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
          <SectionCard title="Event summary" description="Safe audit fields from the backend detail endpoint.">
            <div className="grid gap-4 md:grid-cols-2">
              <Info label="Outcome" value={<AuditOutcomeBadge outcome={log.outcome} />} />
              <Info label="Actor" value={formatActor(log.actor_user_summary)} />
              <Info label="Action" value={log.action} />
              <Info label="Source" value={log.source} />
              <Info label="Resource type" value={log.resource_type} />
              <Info label="Resource ID" value={formatOptional(log.resource_id)} />
              <Info label="Organization" value={formatOptional(log.organization_name)} />
              <Info label="Facility" value={formatOptional(log.facility_name)} />
            </div>
          </SectionCard>
          <SectionCard title="Request context" description="No request body or secrets are exposed.">
            <div className="grid gap-4 md:grid-cols-2">
              <Info label="Method" value={formatOptional(log.method)} />
              <Info label="Path" value={formatOptional(log.path)} />
              <Info label="Status code" value={formatOptional(log.status_code)} />
              <Info label="Request ID" value={formatOptional(log.request_id)} />
              <Info label="IP address" value={formatOptional(log.ip_address)} />
              <Info label="User agent" value={formatOptional(log.user_agent)} />
            </div>
          </SectionCard>
        </div>
        <SectionCard title="Sanitized metadata" description="Sensitive keys are redacted before display.">
          <AuditJsonView value={log.metadata} />
        </SectionCard>
        <SectionCard title="Sanitized changes" description="Append-only change metadata from the backend, if present.">
          <AuditJsonView value={log.changes} />
        </SectionCard>
        <div className="rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground">
          <Activity className="mb-2 h-5 w-5 text-primary" />
          Audit logs are append-only. This UI intentionally provides no edit or delete actions.
        </div>
      </ResponsivePageShell>
    </PageContainer>
  );
}

function Info({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <div className="mt-1 break-words text-sm font-medium text-foreground">{value}</div>
    </div>
  );
}
