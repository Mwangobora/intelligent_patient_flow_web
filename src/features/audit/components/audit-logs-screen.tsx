"use client";

import { RefreshCw, ShieldCheck } from "lucide-react";
import { useMemo, useState } from "react";

import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { LoadingState } from "@/components/common/loading-state";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { ResponsiveActionBar } from "@/components/layout/responsive-action-bar";
import { ResponsivePageShell } from "@/components/layout/responsive-page-shell";
import { FormSheet } from "@/components/overlays/form-sheet";
import { Button } from "@/components/ui/button";
import { useDebouncedValue } from "@/features/appointments/hooks/use-debounced-value";

import { useCreateAuditLogMutation } from "../hooks/use-audit-mutations";
import { useAuditLogsQuery } from "../hooks/use-audit-queries";
import { useAuditWorkspace } from "../hooks/use-audit-workspace";
import type { AuditLogListParams } from "../types/audit.types";
import { AuditCreateForm } from "./audit-create-form";
import { AuditFilterPanel } from "./audit-filter-panel";
import { getFriendlyAuditErrorMessage } from "./audit-formatters";
import { AuditLogMobileCard } from "./audit-log-mobile-card";
import { AuditLogTable } from "./audit-log-table";
import { AuditPageTabs } from "./audit-page-tabs";

const pageSize = 25;

export function AuditLogsScreen() {
  const workspace = useAuditWorkspace();
  const [showCreate, setShowCreate] = useState(false);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<AuditLogListParams>({});
  const debouncedSearch = useDebouncedValue(filters.search ?? "");
  const queryParams = { ...filters, search: debouncedSearch || undefined };
  const logsQuery = useAuditLogsQuery(queryParams, { enabled: workspace.canViewAuditLogs });
  const createMutation = useCreateAuditLogMutation();

  const pagedLogs = useMemo(() => {
    const logs = logsQuery.data ?? [];
    return logs.slice((page - 1) * pageSize, page * pageSize);
  }, [logsQuery.data, page]);
  const totalPages = Math.max(1, Math.ceil((logsQuery.data?.length ?? 0) / pageSize));

  if (workspace.isLoading) return <LoadingState title="Loading audit workspace" description="Checking audit permissions." />;
  if (!workspace.canViewAuditLogs) return <ErrorState title="Audit access required" description="You do not have permission to view audit logs." />;

  return (
    <PageContainer>
      <ResponsivePageShell
        header={<><AuditPageTabs activeTab="logs" /><PageHeader title="Audit Logs" description="Monitor system activity, actor actions, resource history, and security outcomes." /></>}
        actions={<ResponsiveActionBar>
          {workspace.canCreateAuditLogs ? <Button onClick={() => setShowCreate((current) => !current)}><ShieldCheck className="mr-2 h-4 w-4" />Manual log</Button> : null}
          <Button variant="secondary" onClick={() => void logsQuery.refetch()}><RefreshCw className="mr-2 h-4 w-4" />Refresh</Button>
        </ResponsiveActionBar>}
        filters={<AuditFilterPanel filters={filters} onChange={(next) => { setFilters(next); setPage(1); }} />}
      >
        {showCreate ? (
          <FormSheet open={showCreate} title="Create manual audit log" description="Admin-only append-only event creation. No edit or delete workflow exists." onOpenChange={setShowCreate}>
            <AuditCreateForm isSubmitting={createMutation.isPending} onSubmit={async (payload) => {
              await createMutation.mutateAsync(payload);
              setShowCreate(false);
            }} />
          </FormSheet>
        ) : null}
        {logsQuery.isLoading ? <LoadingState title="Loading audit logs" description="Fetching sanitized audit records." /> : null}
        {logsQuery.error ? (
          <ErrorState title="Unable to load audit logs" description={getFriendlyAuditErrorMessage(logsQuery.error.message)} actionLabel="Retry" onAction={() => void logsQuery.refetch()} />
        ) : null}
        {!logsQuery.isLoading && !logsQuery.error ? (
          <>
            <AuditLogTable logs={pagedLogs} />
            <div className="space-y-4 md:hidden">
              {pagedLogs.map((log) => <AuditLogMobileCard key={log.id} log={log} />)}
              {!pagedLogs.length ? <EmptyState title="No audit logs found" description="Try changing the filters. No fake audit data is shown." /> : null}
            </div>
            <div className="flex flex-col items-center justify-between gap-3 rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground md:flex-row">
              <span>Showing {pagedLogs.length} of {logsQuery.data?.length ?? 0} logs. Backend currently returns an array, so pagination is applied client-side.</span>
              <div className="flex gap-2">
                <Button variant="secondary" disabled={page <= 1} onClick={() => setPage((current) => Math.max(1, current - 1))}>Previous</Button>
                <Button variant="secondary" disabled={page >= totalPages} onClick={() => setPage((current) => Math.min(totalPages, current + 1))}>Next</Button>
              </div>
            </div>
          </>
        ) : null}
      </ResponsivePageShell>
    </PageContainer>
  );
}
