"use client";

import { Edit, RefreshCw, SlidersHorizontal } from "lucide-react";
import { useState } from "react";

import { ErrorState } from "@/components/common/error-state";
import { LoadingState } from "@/components/common/loading-state";
import { SelectField } from "@/components/forms/select-field";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { ResponsiveActionBar } from "@/components/layout/responsive-action-bar";
import { ResponsiveFilterPanel } from "@/components/layout/responsive-filter-panel";
import { FormSheet } from "@/components/overlays/form-sheet";
import { Button } from "@/components/ui/button";
import { useFacilitiesQuery } from "@/features/facilities/hooks/use-facility-queries";

import { useSaveFlowSettingsMutation } from "../hooks/use-settings-mutations";
import { useFlowSettingsQuery, useSettingsWorkspace } from "../hooks/use-settings-queries";
import type { FlowSettingRecord } from "../types/settings.types";
import { FlowSettingsForm } from "./settings-forms";
import { SettingsPageTabs } from "./settings-page-tabs";
import { SettingsTable } from "./settings-table";

function flowInitialValues(record?: FlowSettingRecord | null) {
  if (!record) return undefined;
  return { ...record, facility_id: record.facility };
}

export function SettingsFlowScreen() {
  const workspace = useSettingsWorkspace();
  const [facilityId, setFacilityId] = useState("");
  const [editTarget, setEditTarget] = useState<FlowSettingRecord | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const facilitiesQuery = useFacilitiesQuery({ is_active: true }, { enabled: workspace.canManageFlowSettings });
  const flowQuery = useFlowSettingsQuery({ facility_id: facilityId || undefined }, { enabled: workspace.canManageFlowSettings });
  const saveMutation = useSaveFlowSettingsMutation(editTarget?.id);

  if (workspace.isLoading || facilitiesQuery.isLoading || flowQuery.isLoading) return <LoadingState title="Loading facility flow settings" description="Fetching queue and appointment timing rules." />;
  if (!workspace.canManageFlowSettings) return <ErrorState title="Facility flow access required" description="You do not have permission to manage facility flow settings." />;

  return (
    <PageContainer className="space-y-6">
      <SettingsPageTabs activeTab="flow" />
      <PageHeader
        title="Facility Flow Settings"
        description="Manage operational queue, appointment, reminder, and check-in timing rules."
        actions={<ResponsiveActionBar>
          <Button onClick={() => setShowCreate(true)}><SlidersHorizontal className="mr-2 h-4 w-4" />New flow settings</Button>
          <Button variant="secondary" onClick={() => void flowQuery.refetch()}><RefreshCw className="mr-2 h-4 w-4" />Refresh</Button>
        </ResponsiveActionBar>}
      />
      <ResponsiveFilterPanel title="Flow setting filters" description="Filter settings by facility.">
        <SelectField
          label="Facility"
          value={facilityId}
          onChange={(event) => setFacilityId(event.target.value)}
          options={[{ label: "All facilities", value: "" }, ...(facilitiesQuery.data ?? []).map((item) => ({ label: item.name, value: item.id }))]}
        />
      </ResponsiveFilterPanel>
      {flowQuery.error ? <ErrorState title="Unable to load flow settings" description={flowQuery.error.message} /> : null}
      <SettingsTable
        records={flowQuery.data ?? []}
        emptyMessage="No facility flow settings found."
        columns={[
          { header: "Facility", render: (item) => <><strong>{item.facility_name}</strong><div className="text-xs text-muted-foreground">{item.facility}</div></> },
          { header: "Booking", render: (item) => `${item.max_advance_booking_days} days ahead · ${item.minimum_booking_notice_minutes} min notice` },
          { header: "Check-in", render: (item) => `${item.early_checkin_minutes} min early · ${item.late_checkin_grace_minutes} min grace` },
          { header: "Queue", render: (item) => `Padding ${item.queue_number_padding} · ${item.auto_create_daily_queues ? "Auto daily queues" : "Manual queues"}` },
          { header: "Actions", render: (item) => <Button variant="secondary" onClick={() => setEditTarget(item)}><Edit className="mr-2 h-4 w-4" />Edit</Button> },
        ]}
      />
      <FormSheet open={showCreate} title="Create facility flow settings" description="One active settings row is allowed per facility." onOpenChange={setShowCreate}>
        <FlowSettingsForm facilities={facilitiesQuery.data ?? []} isSubmitting={saveMutation.isPending} onSubmit={async (values) => { await saveMutation.mutateAsync(values); setShowCreate(false); }} />
      </FormSheet>
      <FormSheet open={Boolean(editTarget)} title="Edit facility flow settings" description="Update operational timing values for this facility." onOpenChange={(open) => !open && setEditTarget(null)}>
        <FlowSettingsForm facilities={facilitiesQuery.data ?? []} initialValues={flowInitialValues(editTarget)} isSubmitting={saveMutation.isPending} onSubmit={async (values) => { await saveMutation.mutateAsync(values); setEditTarget(null); }} />
      </FormSheet>
    </PageContainer>
  );
}
