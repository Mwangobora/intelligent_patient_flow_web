"use client";

import { AlertTriangle, CheckCircle, Clock, ShieldAlert, ShieldCheck, XCircle } from "lucide-react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { ErrorState } from "@/components/common/error-state";
import { LoadingState } from "@/components/common/loading-state";
import { MetricCard } from "@/components/common/metric-card";
import { SectionCard } from "@/components/common/section-card";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { ResponsivePageShell } from "@/components/layout/responsive-page-shell";

import { useAuditSummaryQuery } from "../hooks/use-audit-queries";
import { useAuditWorkspace } from "../hooks/use-audit-workspace";
import { AuditOutcomeBadge } from "./audit-outcome-badge";
import { formatAuditDate } from "./audit-formatters";
import { AuditPageTabs } from "./audit-page-tabs";

export function AuditSummaryScreen() {
  const workspace = useAuditWorkspace();
  const summaryQuery = useAuditSummaryQuery({}, { enabled: workspace.canViewAuditSummary });
  const summary = summaryQuery.data;

  if (workspace.isLoading || summaryQuery.isLoading) return <LoadingState title="Loading audit summary" description="Aggregating audit activity." />;
  if (!workspace.canViewAuditSummary) return <ErrorState title="Audit summary access required" description="You need audit_log.summary permission." />;
  if (summaryQuery.error) return <ErrorState title="Unable to load audit summary" description={summaryQuery.error.message} actionLabel="Retry" onAction={() => void summaryQuery.refetch()} />;
  if (!summary) return <ErrorState title="No audit summary available" description="The backend did not return summary data." />;

  const outcomeRows = [
    { outcome: "success", count: summary.success_count },
    { outcome: "failure", count: summary.failure_count },
    { outcome: "denied", count: summary.denied_count },
  ];

  return (
    <PageContainer>
      <ResponsivePageShell header={<><AuditPageTabs activeTab="summary" /><PageHeader title="Audit Summary" description="Security monitoring overview for success, failure, denied events, and top actions." /></>}>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard title="Total logs" value={String(summary.total_logs)} description="Latest 1000 summary window from backend." icon={ShieldCheck} />
          <MetricCard title="Success events" value={String(summary.success_count)} description="Completed audited actions." icon={CheckCircle} />
          <MetricCard title="Failed events" value={String(summary.failure_count)} description="Actions recorded with failure." icon={XCircle} />
          <MetricCard title="Denied events" value={String(summary.denied_count)} description="Permission or policy denials." icon={ShieldAlert} />
        </div>
        <div className="grid gap-4 xl:grid-cols-2">
          <SectionCard title="Events by day" description="Daily event volume from the audit summary endpoint.">
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={summary.events_by_day}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="date" tickLine={false} axisLine={false} />
                  <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
                  <Tooltip />
                  <Bar dataKey="count" fill="var(--color-primary)" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </SectionCard>
          <SectionCard title="Outcome distribution" description="Success, failure, and denied counts.">
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={outcomeRows}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="outcome" tickLine={false} axisLine={false} />
                  <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
                  <Tooltip />
                  <Bar dataKey="count" fill="var(--color-info)" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </SectionCard>
        </div>
        <div className="grid gap-4 xl:grid-cols-2">
          <SectionCard title="Top actions" description="Most common audited actions.">
            <div className="space-y-3">
              {summary.top_actions.length ? summary.top_actions.map((item) => (
                <div key={item.action} className="flex items-center justify-between rounded-xl border border-border p-3">
                  <span className="font-medium text-foreground">{item.action}</span>
                  <span className="text-sm text-muted-foreground">{item.count}</span>
                </div>
              )) : <p className="text-sm text-muted-foreground">No top actions yet.</p>}
            </div>
          </SectionCard>
          <SectionCard title="Recent failed or denied events" description="Critical audit events returned by backend summary.">
            <div className="space-y-3">
              {summary.recent_critical_events.length ? summary.recent_critical_events.map((event) => (
                <div key={event.id} className="rounded-xl border border-border p-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-medium text-foreground">{event.action}</p>
                    <AuditOutcomeBadge outcome={event.outcome} />
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground"><Clock className="mr-1 inline h-3 w-3" />{formatAuditDate(event.occurred_at)}</p>
                </div>
              )) : <p className="text-sm text-muted-foreground">No failed or denied events in the summary window.</p>}
            </div>
          </SectionCard>
        </div>
        <div className="rounded-xl border border-warning/20 bg-warning/10 p-4 text-sm text-warning">
          <AlertTriangle className="mr-2 inline h-4 w-4" />Audit export permission is configured, but report/export UI is intentionally not built inside this module.
        </div>
      </ResponsivePageShell>
    </PageContainer>
  );
}
