import {
  Activity,
  CalendarClock,
  Clock3,
  ListOrdered,
  Users,
} from "lucide-react";

import { MetricCard } from "@/components/common/metric-card";
import { SectionCard } from "@/components/common/section-card";
import { StatusBadge } from "@/components/common/status-badge";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { PageTabs } from "@/components/navigation/page-tabs";
import { Button } from "@/components/ui/button";

const dashboardTabs = [
  { label: "Overview", value: "overview", href: "/" },
  { label: "Queue Health", value: "queue-health", href: "/?tab=queue-health", badgeCount: 3 },
  { label: "Scheduling", value: "scheduling", href: "/?tab=scheduling" },
  { label: "Reporting", value: "reporting", href: "/?tab=reporting", disabled: true },
];

export default function DashboardPage() {
  return (
    <PageContainer className="space-y-6">
      <PageHeader
        title="Hospital Operations Dashboard"
        description="A visual shell for queue oversight, appointment flow, and clinical operations monitoring."
        actions={
          <>
            <StatusBadge label="Stable Operations" status="success" />
            <Button>Refresh Preview</Button>
          </>
        }
      />

      <PageTabs tabs={dashboardTabs} activeTab="overview" />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard title="Patients Waiting" value="18" description="Across active service points this hour." icon={Users} trend={{ direction: "down", label: "2 fewer than 30 minutes ago" }} />
        <MetricCard title="Appointments Today" value="124" description="Confirmed and pending appointments scheduled." icon={CalendarClock} trend={{ direction: "up", label: "9 more than yesterday" }} />
        <MetricCard title="Active Queues" value="6" description="Open queues currently serving patients." icon={ListOrdered} trend={{ direction: "up", label: "1 additional queue opened" }} />
        <MetricCard title="Average Wait Time" value="14 min" description="Estimated current waiting time across facilities." icon={Clock3} trend={{ direction: "down", label: "Improved by 3 minutes" }} />
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <SectionCard title="Queue Activity" description="Current operational movement for patient flow teams." action={<StatusBadge label="Live Preview" status="info" />}>
          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-lg bg-secondary p-4">
              <div><p className="text-sm font-medium">Reception Queue</p><p className="mt-1 text-sm text-muted-foreground">11 patients waiting, 2 called</p></div>
              <StatusBadge label="Active" status="success" />
            </div>
            <div className="flex items-center justify-between rounded-lg border border-dashed p-4">
              <div><p className="text-sm font-medium">Urgent Care Queue</p><p className="mt-1 text-sm text-muted-foreground">Fast lane for high-priority check-ins.</p></div>
              <StatusBadge label="Priority" status="warning" />
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Appointment Utilization" description="Placeholder panel for future booking and slot insights." action={<StatusBadge label="Planned" status="info" />}>
          <div className="space-y-4">
            <div className="rounded-lg border bg-card p-4">
              <div className="flex items-center justify-between">
                <div><p className="text-sm font-medium">Cardiology</p><p className="mt-1 text-sm text-muted-foreground">82% slot utilization today</p></div>
                <Activity className="h-5 w-5 text-primary" />
              </div>
            </div>
            <div className="rounded-lg bg-secondary p-4 text-sm text-muted-foreground">Charts and live scheduling analytics will plug into this reusable panel later.</div>
          </div>
        </SectionCard>
      </section>
    </PageContainer>
  );
}
