"use client";

import { Edit, KeyRound, RefreshCw } from "lucide-react";
import { useState } from "react";

import { ErrorState } from "@/components/common/error-state";
import { LoadingState } from "@/components/common/loading-state";
import { TextInputField } from "@/components/forms/text-input-field";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { ResponsiveActionBar } from "@/components/layout/responsive-action-bar";
import { ResponsiveFilterPanel } from "@/components/layout/responsive-filter-panel";
import { ConfirmDialog } from "@/components/overlays/confirm-dialog";
import { FormSheet } from "@/components/overlays/form-sheet";
import { Button } from "@/components/ui/button";
import { useDebouncedValue } from "@/features/appointments/hooks/use-debounced-value";

import {
  useCreateSettingsPermissionMutation,
  useDeactivateSettingsPermissionMutation,
  useUpdateSettingsPermissionMutation,
} from "../hooks/use-settings-mutations";
import { useSettingsPermissionsQuery, useSettingsWorkspace } from "../hooks/use-settings-queries";
import type { PermissionRecord } from "../types/settings.types";
import { PermissionForm } from "./settings-forms";
import { formatOptional, moduleLabel } from "./settings-formatters";
import { SettingsPageTabs } from "./settings-page-tabs";
import { SettingsStatusBadge } from "./settings-status-badge";
import { SettingsTable } from "./settings-table";

function permissionInitialValues(permission?: PermissionRecord | null) {
  if (!permission) return undefined;
  return {
    name: permission.name,
    module: permission.module,
    action: permission.action,
    code: permission.code,
    description: permission.description ?? "",
  };
}

export function SettingsPermissionsScreen() {
  const workspace = useSettingsWorkspace();
  const [showCreate, setShowCreate] = useState(false);
  const [editTarget, setEditTarget] = useState<PermissionRecord | null>(null);
  const [deactivateTarget, setDeactivateTarget] = useState<PermissionRecord | null>(null);
  const [moduleFilter, setModuleFilter] = useState("");
  const debouncedModule = useDebouncedValue(moduleFilter);
  const permissionsQuery = useSettingsPermissionsQuery({ module: debouncedModule || undefined }, { enabled: workspace.canViewPermissions });
  const createMutation = useCreateSettingsPermissionMutation();
  const updateMutation = useUpdateSettingsPermissionMutation(editTarget?.id);
  const deactivateMutation = useDeactivateSettingsPermissionMutation();
  const groupedPermissions = Object.entries(
    (permissionsQuery.data ?? []).reduce<Record<string, PermissionRecord[]>>((groups, permission) => {
      groups[permission.module] = [...(groups[permission.module] ?? []), permission];
      return groups;
    }, {}),
  ).sort(([left], [right]) => left.localeCompare(right));

  if (workspace.isLoading || permissionsQuery.isLoading) return <LoadingState title="Loading permissions" description="Fetching dynamic permission catalog." />;
  if (!workspace.canViewPermissions) return <ErrorState title="Permission settings access required" description="You do not have permission to view permissions." />;

  return (
    <PageContainer className="space-y-6">
      <SettingsPageTabs activeTab="permissions" />
      <PageHeader
        title="Permissions"
        description="Create and review dynamic module.action permissions. Permissions are not seeded or hardcoded."
        actions={<ResponsiveActionBar>
          {workspace.canCreatePermissions ? <Button onClick={() => setShowCreate(true)}><KeyRound className="mr-2 h-4 w-4" />New permission</Button> : null}
          <Button variant="secondary" onClick={() => void permissionsQuery.refetch()}><RefreshCw className="mr-2 h-4 w-4" />Refresh</Button>
        </ResponsiveActionBar>}
      />
      <ResponsiveFilterPanel title="Permission filters" description="Filter permission codes by module name.">
        <TextInputField label="Module" placeholder="accounts_user" value={moduleFilter} onChange={(event) => setModuleFilter(event.target.value)} />
      </ResponsiveFilterPanel>
      {permissionsQuery.error ? <ErrorState title="Unable to load permissions" description={permissionsQuery.error.message} /> : null}
      {groupedPermissions.length ? groupedPermissions.map(([moduleName, permissions]) => (
        <section key={moduleName} className="space-y-3">
          <h2 className="text-sm font-semibold text-foreground">{moduleLabel(moduleName)}</h2>
          <SettingsTable
            records={permissions}
            emptyMessage="No permissions found in this module."
            columns={[
              { header: "Permission", render: (item) => <><strong>{item.name}</strong><div className="text-xs text-muted-foreground">{item.code}</div></> },
              { header: "Action", render: (item) => item.action },
              { header: "Description", render: (item) => formatOptional(item.description) },
              { header: "Status", render: (item) => <SettingsStatusBadge isActive={item.is_active} /> },
              { header: "Actions", render: (item) => <div className="flex flex-wrap gap-2">{workspace.canCreatePermissions ? <Button variant="secondary" onClick={() => setEditTarget(item)}><Edit className="mr-2 h-4 w-4" />Edit</Button> : null}{workspace.canCreatePermissions && item.is_active ? <Button variant="danger" onClick={() => setDeactivateTarget(item)}>Deactivate</Button> : null}</div> },
            ]}
          />
        </section>
      )) : (
        <SettingsTable
          records={[] as PermissionRecord[]}
          emptyMessage="No permissions found."
          columns={[
            { header: "Permission", render: (item) => item.name },
            { header: "Action", render: (item) => item.action },
          ]}
        />
      )}
      <FormSheet open={showCreate} title="Create permission" description="Backend validates single-dot module.action format." onOpenChange={setShowCreate}>
        <PermissionForm isSubmitting={createMutation.isPending} onSubmit={async (values) => { await createMutation.mutateAsync(values); setShowCreate(false); }} />
      </FormSheet>
      <FormSheet open={Boolean(editTarget)} title="Edit permission" description="Update permission metadata through the real accounts permission API." onOpenChange={(open) => !open && setEditTarget(null)}>
        <PermissionForm initialValues={permissionInitialValues(editTarget)} isSubmitting={updateMutation.isPending} onSubmit={async (values) => { await updateMutation.mutateAsync(values); setEditTarget(null); }} />
      </FormSheet>
      <ConfirmDialog open={Boolean(deactivateTarget)} title={`Deactivate ${deactivateTarget?.code ?? "permission"}?`} description="This marks the permission inactive without deleting it." confirmLabel="Deactivate permission" isSubmitting={deactivateMutation.isPending} onClose={() => setDeactivateTarget(null)} onConfirm={async () => { if (!deactivateTarget) return; await deactivateMutation.mutateAsync(deactivateTarget.id); setDeactivateTarget(null); }} />
    </PageContainer>
  );
}
