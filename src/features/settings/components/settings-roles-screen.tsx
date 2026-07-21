"use client";

import Link from "next/link";
import { Edit, KeyRound, RefreshCw, ShieldCheck } from "lucide-react";
import { useState } from "react";

import { ErrorState } from "@/components/common/error-state";
import { LoadingState } from "@/components/common/loading-state";
import { SelectField } from "@/components/forms/select-field";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { ResponsiveActionBar } from "@/components/layout/responsive-action-bar";
import { ConfirmDialog } from "@/components/overlays/confirm-dialog";
import { FormDialog } from "@/components/overlays/form-dialog";
import { FormSheet } from "@/components/overlays/form-sheet";
import { Button } from "@/components/ui/button";
import { useFacilitiesQuery } from "@/features/facilities/hooks/use-facility-queries";

import {
  useCreateSettingsRoleMutation,
  useDeactivateSettingsRoleMutation,
  useGrantRolePermissionMutation,
  useRevokeRolePermissionMutation,
  useUpdateSettingsRoleMutation,
} from "../hooks/use-settings-mutations";
import {
  useSettingsOrganizationsQuery,
  useSettingsPermissionsQuery,
  useSettingsRoleQuery,
  useSettingsRolesQuery,
  useSettingsWorkspace,
} from "../hooks/use-settings-queries";
import type { PermissionRecord, RolePermissionRecord, RoleRecord } from "../types/settings.types";
import { RoleForm } from "./settings-forms";
import { formatOptional } from "./settings-formatters";
import { SettingsPageTabs } from "./settings-page-tabs";
import { SettingsStatusBadge } from "./settings-status-badge";
import { SettingsTable } from "./settings-table";

function GrantPermissionForm({
  permissions,
  isSubmitting,
  onSubmit,
}: {
  permissions: PermissionRecord[];
  isSubmitting: boolean;
  onSubmit: (permissionId: string) => Promise<void>;
}) {
  const [permissionId, setPermissionId] = useState("");

  return (
    <form className="space-y-4" onSubmit={(event) => { event.preventDefault(); void onSubmit(permissionId); }}>
      <SelectField
        label="Permission"
        required
        value={permissionId}
        onChange={(event) => setPermissionId(event.target.value)}
        options={[{ label: "Select permission", value: "" }, ...permissions.map((item) => ({ label: `${item.name} (${item.code})`, value: item.id }))]}
      />
      <Button className="w-full" type="submit" disabled={isSubmitting || !permissionId}>
        {isSubmitting ? "Granting..." : "Grant permission"}
      </Button>
    </form>
  );
}

function roleInitialValues(role?: RoleRecord | null) {
  if (!role) return undefined;
  return {
    name: role.name,
    description: role.description ?? "",
    organization_id: role.organization ?? "",
    facility_id: role.facility ?? "",
  };
}

export function SettingsRolesScreen({ roleId }: { roleId?: string }) {
  const workspace = useSettingsWorkspace();
  const [showCreate, setShowCreate] = useState(false);
  const [showGrant, setShowGrant] = useState(false);
  const [editTarget, setEditTarget] = useState<RoleRecord | null>(null);
  const [deactivateTarget, setDeactivateTarget] = useState<RoleRecord | null>(null);
  const [revokeTarget, setRevokeTarget] = useState<RolePermissionRecord | null>(null);
  const rolesQuery = useSettingsRolesQuery({}, { enabled: workspace.canViewRoles && !roleId });
  const roleQuery = useSettingsRoleQuery(roleId, { enabled: workspace.canViewRoles && Boolean(roleId) });
  const organizationsQuery = useSettingsOrganizationsQuery({ is_active: true }, { enabled: workspace.canViewRoles });
  const facilitiesQuery = useFacilitiesQuery({ is_active: true }, { enabled: workspace.canViewRoles });
  const permissionsQuery = useSettingsPermissionsQuery({ is_active: true }, { enabled: workspace.canManageRolePermissions });
  const createMutation = useCreateSettingsRoleMutation();
  const updateMutation = useUpdateSettingsRoleMutation(editTarget?.id ?? roleQuery.data?.id);
  const deactivateMutation = useDeactivateSettingsRoleMutation();
  const grantMutation = useGrantRolePermissionMutation(roleId);
  const revokeMutation = useRevokeRolePermissionMutation(roleId);
  const records = roleId && roleQuery.data ? [roleQuery.data] : rolesQuery.data ?? [];

  if (workspace.isLoading || (roleId ? roleQuery.isLoading : rolesQuery.isLoading)) return <LoadingState title="Loading roles" description="Fetching authorization roles." />;
  if (!workspace.canViewRoles) return <ErrorState title="Role settings access required" description="You do not have permission to manage roles." />;

  return (
    <PageContainer className="space-y-6">
      <SettingsPageTabs activeTab="roles" />
      <PageHeader
        title={roleId ? "Role Detail" : "Roles"}
        description="Manage dynamic business roles. No Django groups or hardcoded role behavior are used."
        actions={<ResponsiveActionBar>
          {workspace.canCreateRoles && !roleId ? <Button onClick={() => setShowCreate(true)}><ShieldCheck className="mr-2 h-4 w-4" />New role</Button> : null}
          {workspace.canManageRolePermissions && roleId ? <Button onClick={() => setShowGrant(true)}><KeyRound className="mr-2 h-4 w-4" />Grant permission</Button> : null}
          <Button variant="secondary" onClick={() => void (roleId ? roleQuery.refetch() : rolesQuery.refetch())}><RefreshCw className="mr-2 h-4 w-4" />Refresh</Button>
        </ResponsiveActionBar>}
      />
      {(rolesQuery.error || roleQuery.error) ? <ErrorState title="Unable to load roles" description={(rolesQuery.error ?? roleQuery.error)?.message ?? "Please try again."} /> : null}
      <SettingsTable
        records={records}
        emptyMessage="No roles found."
        columns={[
          { header: "Role", render: (item) => <><strong>{item.name}</strong><div className="text-xs text-muted-foreground">{item.code}</div></> },
          { header: "Scope", render: (item) => item.facility_name ?? item.organization_name ?? "Platform" },
          { header: "Description", render: (item) => formatOptional(item.description) },
          { header: "Status", render: (item) => <SettingsStatusBadge isActive={item.is_active} /> },
          { header: "Actions", render: (item) => <div className="flex flex-wrap gap-2"><Link href={`/settings/roles/${item.id}`}><Button variant="secondary">View</Button></Link>{workspace.canUpdateRoles ? <Button variant="secondary" onClick={() => setEditTarget(item)}><Edit className="mr-2 h-4 w-4" />Edit</Button> : null}{workspace.canDeactivateRoles && item.is_active ? <Button variant="danger" onClick={() => setDeactivateTarget(item)}>Deactivate</Button> : null}</div> },
        ]}
      />
      {roleId ? (
        <SettingsTable
          records={roleQuery.data?.role_permissions ?? []}
          emptyMessage="No permissions granted to this role yet."
          columns={[
            { header: "Permission", render: (item) => <><strong>{item.permission_name}</strong><div className="text-xs text-muted-foreground">{item.permission_code}</div></> },
            { header: "Status", render: (item) => <SettingsStatusBadge isActive={item.is_active} /> },
            { header: "Actions", render: (item) => workspace.canManageRolePermissions && item.is_active ? <Button variant="danger" onClick={() => setRevokeTarget(item)}>Revoke</Button> : null },
          ]}
        />
      ) : null}
      <FormSheet open={showCreate} title="Create role" description="Create platform, organization, or facility scoped roles." onOpenChange={setShowCreate}>
        <RoleForm organizations={organizationsQuery.data ?? []} facilities={facilitiesQuery.data ?? []} isSubmitting={createMutation.isPending} onSubmit={async (values) => { await createMutation.mutateAsync(values); setShowCreate(false); }} />
      </FormSheet>
      <FormSheet open={Boolean(editTarget)} title="Edit role" description="Update role name, description, or scope." onOpenChange={(open) => !open && setEditTarget(null)}>
        <RoleForm organizations={organizationsQuery.data ?? []} facilities={facilitiesQuery.data ?? []} initialValues={roleInitialValues(editTarget)} isSubmitting={updateMutation.isPending} onSubmit={async (values) => { await updateMutation.mutateAsync(values); setEditTarget(null); }} />
      </FormSheet>
      <FormDialog open={showGrant} title="Grant permission" description="Assign a dynamic module.action permission to this role." onOpenChange={setShowGrant}>
        <GrantPermissionForm permissions={permissionsQuery.data ?? []} isSubmitting={grantMutation.isPending} onSubmit={async (permissionId) => { await grantMutation.mutateAsync(permissionId); setShowGrant(false); }} />
      </FormDialog>
      <ConfirmDialog open={Boolean(deactivateTarget)} title={`Deactivate ${deactivateTarget?.name ?? "role"}?`} description="This marks the role inactive without deleting history." confirmLabel="Deactivate role" isSubmitting={deactivateMutation.isPending} onClose={() => setDeactivateTarget(null)} onConfirm={async () => { if (!deactivateTarget) return; await deactivateMutation.mutateAsync(deactivateTarget.id); setDeactivateTarget(null); }} />
      <ConfirmDialog open={Boolean(revokeTarget)} title="Revoke permission?" description="This deactivates the role-permission link without deleting history." confirmLabel="Revoke permission" isSubmitting={revokeMutation.isPending} onClose={() => setRevokeTarget(null)} onConfirm={async () => { if (!revokeTarget) return; await revokeMutation.mutateAsync(revokeTarget.permission); setRevokeTarget(null); }} />
    </PageContainer>
  );
}
