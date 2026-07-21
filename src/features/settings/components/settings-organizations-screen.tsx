"use client";

import Link from "next/link";
import { Building2, Edit, RefreshCw } from "lucide-react";
import { useState } from "react";

import { ErrorState } from "@/components/common/error-state";
import { LoadingState } from "@/components/common/loading-state";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { ResponsiveActionBar } from "@/components/layout/responsive-action-bar";
import { ConfirmDialog } from "@/components/overlays/confirm-dialog";
import { FormSheet } from "@/components/overlays/form-sheet";
import { Button } from "@/components/ui/button";

import { useCreateOrganizationSettingsMutation, useDeactivateOrganizationSettingsMutation, useUpdateOrganizationSettingsMutation } from "../hooks/use-settings-mutations";
import { useSettingsOrganizationsQuery, useSettingsOrganizationQuery, useSettingsWorkspace } from "../hooks/use-settings-queries";
import type { OrganizationRecord } from "../types/settings.types";
import { OrganizationForm } from "./settings-forms";
import { formatOptional } from "./settings-formatters";
import { SettingsPageTabs } from "./settings-page-tabs";
import { SettingsStatusBadge } from "./settings-status-badge";
import { SettingsTable } from "./settings-table";

function organizationInitialValues(organization?: OrganizationRecord | null) {
  if (!organization) return undefined;
  return {
    name: organization.name,
    legal_name: organization.legal_name ?? "",
    email: organization.email ?? "",
    phone_number: organization.phone_number ?? "+255",
    registration_number: organization.registration_number ?? "",
  };
}

export function SettingsOrganizationsScreen({ organizationId }: { organizationId?: string }) {
  const workspace = useSettingsWorkspace();
  const [showCreate, setShowCreate] = useState(false);
  const [editTarget, setEditTarget] = useState<OrganizationRecord | null>(null);
  const [deactivateTarget, setDeactivateTarget] = useState<OrganizationRecord | null>(null);
  const listQuery = useSettingsOrganizationsQuery({}, { enabled: workspace.canViewOrganizations && !organizationId });
  const detailQuery = useSettingsOrganizationQuery(organizationId, { enabled: workspace.canViewOrganizations && Boolean(organizationId) });
  const createMutation = useCreateOrganizationSettingsMutation();
  const updateMutation = useUpdateOrganizationSettingsMutation(editTarget?.id ?? detailQuery.data?.id);
  const deactivateMutation = useDeactivateOrganizationSettingsMutation();
  const records = organizationId && detailQuery.data ? [detailQuery.data] : listQuery.data ?? [];

  if (workspace.isLoading || (organizationId ? detailQuery.isLoading : listQuery.isLoading)) return <LoadingState title="Loading organizations" description="Fetching organization settings." />;
  if (!workspace.canViewOrganizations) return <ErrorState title="Organization settings access required" description="You do not have permission to manage organizations." />;

  return (
    <PageContainer className="space-y-6">
      <SettingsPageTabs activeTab="organizations" />
      <PageHeader title={organizationId ? "Organization Detail" : "Organizations"} description="Organizations belong in Settings and use real facilities organization APIs." actions={<ResponsiveActionBar>{workspace.canCreateOrganizations && !organizationId ? <Button onClick={() => setShowCreate(true)}><Building2 className="mr-2 h-4 w-4" />New organization</Button> : null}<Button variant="secondary" onClick={() => void (organizationId ? detailQuery.refetch() : listQuery.refetch())}><RefreshCw className="mr-2 h-4 w-4" />Refresh</Button></ResponsiveActionBar>} />
      {(listQuery.error || detailQuery.error) ? <ErrorState title="Unable to load organizations" description={(listQuery.error ?? detailQuery.error)?.message ?? "Please try again."} /> : null}
      <SettingsTable
        records={records}
        emptyMessage="No organizations found."
        columns={[
          { header: "Name", render: (item) => <><strong>{item.name}</strong><div className="text-xs text-muted-foreground">{item.code}</div></> },
          { header: "Legal / Registration", render: (item) => `${formatOptional(item.legal_name)} · ${formatOptional(item.registration_number)}` },
          { header: "Contact", render: (item) => `${formatOptional(item.email)} · ${formatOptional(item.phone_number)}` },
          { header: "Status", render: (item) => <SettingsStatusBadge isActive={item.is_active} /> },
          { header: "Created", render: (item) => formatOptional(item.created_at) },
          { header: "Actions", render: (item) => <div className="flex flex-wrap gap-2"><Link href={`/settings/organizations/${item.id}`}><Button variant="secondary">View</Button></Link>{workspace.canUpdateOrganizations ? <Button variant="secondary" onClick={() => setEditTarget(item)}><Edit className="mr-2 h-4 w-4" />Edit</Button> : null}{workspace.canDeactivateOrganizations && item.is_active ? <Button variant="danger" onClick={() => setDeactivateTarget(item)}>Deactivate</Button> : null}</div> },
        ]}
      />
      <FormSheet open={showCreate} title="Create organization" description="Create a tenant organization using the backend organization endpoint." onOpenChange={setShowCreate}><OrganizationForm isSubmitting={createMutation.isPending} onSubmit={async (values) => { await createMutation.mutateAsync(values); setShowCreate(false); }} /></FormSheet>
      <FormSheet open={Boolean(editTarget)} title="Edit organization" description="Update organization settings." onOpenChange={(open) => !open && setEditTarget(null)}><OrganizationForm initialValues={organizationInitialValues(editTarget)} isSubmitting={updateMutation.isPending} onSubmit={async (values) => { await updateMutation.mutateAsync(values); setEditTarget(null); }} /></FormSheet>
      <ConfirmDialog open={Boolean(deactivateTarget)} title={`Deactivate ${deactivateTarget?.name ?? "organization"}?`} description="This marks the organization inactive without deleting it." confirmLabel="Deactivate organization" isSubmitting={deactivateMutation.isPending} onClose={() => setDeactivateTarget(null)} onConfirm={async () => { if (!deactivateTarget) return; await deactivateMutation.mutateAsync(deactivateTarget.id); setDeactivateTarget(null); }} />
    </PageContainer>
  );
}
