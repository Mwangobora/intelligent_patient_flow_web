"use client";

import Link from "next/link";

import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { LoadingState } from "@/components/common/loading-state";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { ResponsiveActionBar } from "@/components/layout/responsive-action-bar";
import { ResponsivePageShell } from "@/components/layout/responsive-page-shell";
import { Button } from "@/components/ui/button";

import { useActorAuditLogsQuery, useResourceAuditLogsQuery } from "../hooks/use-audit-queries";
import { useAuditWorkspace } from "../hooks/use-audit-workspace";
import { AuditLogMobileCard } from "./audit-log-mobile-card";
import { AuditLogTable } from "./audit-log-table";

type AuditHistoryScreenProps =
  | { mode: "actor"; userId: string }
  | { mode: "resource"; resourceType: string; resourceId: string };

export function AuditHistoryScreen(props: AuditHistoryScreenProps) {
  const workspace = useAuditWorkspace();
  const actorQuery = useActorAuditLogsQuery(props.mode === "actor" ? props.userId : undefined, {
    enabled: workspace.canViewAuditLogs && props.mode === "actor",
  });
  const resourceQuery = useResourceAuditLogsQuery(
    props.mode === "resource" ? props.resourceType : undefined,
    props.mode === "resource" ? props.resourceId : undefined,
    { enabled: workspace.canViewAuditLogs && props.mode === "resource" },
  );
  const query = props.mode === "actor" ? actorQuery : resourceQuery;
  const title = props.mode === "actor" ? "Actor Audit History" : "Resource Audit History";
  const description = props.mode === "actor"
    ? `Audit logs for user ${props.userId}`
    : `Audit logs for ${props.resourceType}/${props.resourceId}`;

  if (workspace.isLoading || query.isLoading) return <LoadingState title="Loading audit history" description="Fetching history records." />;
  if (!workspace.canViewAuditLogs) return <ErrorState title="Audit access required" description="You do not have permission to view audit logs." />;

  return (
    <PageContainer>
      <ResponsivePageShell
        header={<PageHeader title={title} description={description} />}
        actions={<ResponsiveActionBar><Link href="/audit-logs"><Button variant="secondary">Back to audit logs</Button></Link></ResponsiveActionBar>}
      >
        {query.error ? <ErrorState title="Unable to load audit history" description={query.error.message} actionLabel="Retry" onAction={() => void query.refetch()} /> : null}
        {!query.error ? (
          <>
            <AuditLogTable logs={query.data ?? []} />
            <div className="space-y-4 md:hidden">
              {(query.data ?? []).map((log) => <AuditLogMobileCard key={log.id} log={log} />)}
              {!(query.data ?? []).length ? <EmptyState title="No audit history found" description="No events were returned by the backend for this history endpoint." /> : null}
            </div>
          </>
        ) : null}
      </ResponsivePageShell>
    </PageContainer>
  );
}
