"use client";

import Link from "next/link";
import { Edit, RefreshCw, UserPlus } from "lucide-react";
import { useState } from "react";

import { ErrorState } from "@/components/common/error-state";
import { LoadingState } from "@/components/common/loading-state";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { ResponsiveActionBar } from "@/components/layout/responsive-action-bar";
import { ConfirmDialog } from "@/components/overlays/confirm-dialog";
import { FormSheet } from "@/components/overlays/form-sheet";
import { Button } from "@/components/ui/button";
import { useFacilitiesQuery } from "@/features/facilities/hooks/use-facility-queries";

import {
  useAssignRoleToUserMutation,
  useCreateMembershipMutation,
  useCreateSettingsUserMutation,
  useDeactivateSettingsUserMutation,
  useEndMembershipMutation,
  useRevokeRoleAssignmentMutation,
  useUpdateSettingsUserMutation,
} from "../hooks/use-settings-mutations";
import {
  useSettingsOrganizationsQuery,
  useSettingsRolesQuery,
  useSettingsUserQuery,
  useSettingsUsersQuery,
  useSettingsWorkspace,
  useUserMembershipsQuery,
  useUserRoleAssignmentsQuery,
} from "../hooks/use-settings-queries";
import type { MembershipRecord, RoleAssignmentRecord, UserRecord } from "../types/settings.types";
import { MembershipForm, RoleAssignmentForm, UserForm } from "./settings-forms";
import { formatOptional, formatSettingsName } from "./settings-formatters";
import { SettingsPageTabs } from "./settings-page-tabs";
import { SettingsStatusBadge } from "./settings-status-badge";
import { SettingsTable } from "./settings-table";

function userInitialValues(user?: UserRecord | null) {
  if (!user) return undefined;
  return {
    email: user.email ?? "",
    phone_number: user.phone_number ?? "",
    first_name: user.first_name,
    middle_name: user.middle_name ?? "",
    last_name: user.last_name,
  };
}

export function SettingsUsersScreen({ userId }: { userId?: string }) {
  const workspace = useSettingsWorkspace();
  const [showCreate, setShowCreate] = useState(false);
  const [showMembership, setShowMembership] = useState(false);
  const [showRoleAssignment, setShowRoleAssignment] = useState(false);
  const [editTarget, setEditTarget] = useState<UserRecord | null>(null);
  const [deactivateTarget, setDeactivateTarget] = useState<UserRecord | null>(null);
  const [endMembershipTarget, setEndMembershipTarget] = useState<MembershipRecord | null>(null);
  const [revokeTarget, setRevokeTarget] = useState<RoleAssignmentRecord | null>(null);
  const listQuery = useSettingsUsersQuery({}, { enabled: workspace.canViewUsers && !userId });
  const detailQuery = useSettingsUserQuery(userId, { enabled: workspace.canViewUsers && Boolean(userId) });
  const membershipsQuery = useUserMembershipsQuery(userId, {}, { enabled: workspace.canViewUsers && Boolean(userId) });
  const assignmentsQuery = useUserRoleAssignmentsQuery(userId, {}, { enabled: workspace.canViewUsers && Boolean(userId) });
  const organizationsQuery = useSettingsOrganizationsQuery({ is_active: true }, { enabled: workspace.canManageMemberships && Boolean(userId) });
  const facilitiesQuery = useFacilitiesQuery({ is_active: true }, { enabled: workspace.canManageMemberships && Boolean(userId) });
  const rolesQuery = useSettingsRolesQuery({ is_active: true }, { enabled: workspace.canAssignRoles && Boolean(userId) });
  const createMutation = useCreateSettingsUserMutation();
  const updateMutation = useUpdateSettingsUserMutation(editTarget?.id ?? detailQuery.data?.id);
  const deactivateMutation = useDeactivateSettingsUserMutation();
  const membershipMutation = useCreateMembershipMutation();
  const endMembershipMutation = useEndMembershipMutation();
  const roleAssignmentMutation = useAssignRoleToUserMutation();
  const revokeRoleAssignmentMutation = useRevokeRoleAssignmentMutation();
  const records = userId && detailQuery.data ? [detailQuery.data] : listQuery.data ?? [];

  if (workspace.isLoading || (userId ? detailQuery.isLoading : listQuery.isLoading)) return <LoadingState title="Loading users" description="Fetching user settings." />;
  if (!workspace.canViewUsers) return <ErrorState title="User settings access required" description="You do not have permission to manage users." />;

  return (
    <PageContainer className="space-y-6">
      <SettingsPageTabs activeTab="users" />
      <PageHeader title={userId ? "User Detail" : "Users"} description="Manage users and review their memberships and role assignments." actions={<ResponsiveActionBar>{workspace.canCreateUsers && !userId ? <Button onClick={() => setShowCreate(true)}><UserPlus className="mr-2 h-4 w-4" />New user</Button> : null}{workspace.canManageMemberships && userId ? <Button onClick={() => setShowMembership(true)}>Add membership</Button> : null}{workspace.canAssignRoles && userId ? <Button onClick={() => setShowRoleAssignment(true)}>Assign role</Button> : null}<Button variant="secondary" onClick={() => void (userId ? detailQuery.refetch() : listQuery.refetch())}><RefreshCw className="mr-2 h-4 w-4" />Refresh</Button></ResponsiveActionBar>} />
      {(listQuery.error || detailQuery.error) ? <ErrorState title="Unable to load users" description={(listQuery.error ?? detailQuery.error)?.message ?? "Please try again."} /> : null}
      <SettingsTable
        records={records}
        emptyMessage="No users found."
        columns={[
          { header: "User", render: (item) => <><strong>{formatSettingsName(item.first_name, item.middle_name, item.last_name)}</strong><div className="text-xs text-muted-foreground">{item.id}</div></> },
          { header: "Contact", render: (item) => `${formatOptional(item.email)} · ${formatOptional(item.phone_number)}` },
          { header: "Status", render: (item) => <SettingsStatusBadge isActive={item.is_active} /> },
          { header: "Access summary", render: (item) => `${item.memberships?.length ?? membershipsQuery.data?.length ?? 0} memberships · ${item.role_assignments?.length ?? assignmentsQuery.data?.length ?? 0} roles` },
          { header: "Actions", render: (item) => <div className="flex flex-wrap gap-2"><Link href={`/settings/users/${item.id}`}><Button variant="secondary">View</Button></Link>{workspace.canUpdateUsers ? <Button variant="secondary" onClick={() => setEditTarget(item)}><Edit className="mr-2 h-4 w-4" />Edit</Button> : null}{workspace.canDeactivateUsers && item.is_active ? <Button variant="danger" onClick={() => setDeactivateTarget(item)}>Deactivate</Button> : null}</div> },
        ]}
      />
      {userId ? (
        <>
          <SettingsTable
            records={membershipsQuery.data ?? []}
            emptyMessage="No memberships found for this user."
            columns={[
              { header: "Organization", render: (item) => item.organization_name ?? item.organization },
              { header: "Facility", render: (item) => formatOptional(item.facility_name ?? item.facility) },
              { header: "Dates", render: (item) => `${item.starts_at} · ${formatOptional(item.ends_at)}` },
              { header: "Status", render: (item) => <SettingsStatusBadge isActive={item.is_active} /> },
              { header: "Actions", render: (item) => workspace.canManageMemberships && item.is_active ? <Button variant="danger" onClick={() => setEndMembershipTarget(item)}>End</Button> : null },
            ]}
          />
          <SettingsTable
            records={assignmentsQuery.data ?? []}
            emptyMessage="No role assignments found for this user."
            columns={[
              { header: "Role", render: (item) => <><strong>{item.role_name ?? item.role}</strong><div className="text-xs text-muted-foreground">{item.role_code}</div></> },
              { header: "Dates", render: (item) => `${item.starts_at} · ${formatOptional(item.ends_at)}` },
              { header: "Status", render: (item) => <SettingsStatusBadge isActive={item.is_active} /> },
              { header: "Actions", render: (item) => workspace.canAssignRoles && item.is_active ? <Button variant="danger" onClick={() => setRevokeTarget(item)}>Revoke</Button> : null },
            ]}
          />
        </>
      ) : null}
      <FormSheet open={showCreate} title="Create user" description="Create a staff/admin account with real accounts API." onOpenChange={setShowCreate}><UserForm isSubmitting={createMutation.isPending} onSubmit={async (values) => { await createMutation.mutateAsync(values); setShowCreate(false); }} /></FormSheet>
      <FormSheet open={Boolean(editTarget)} title="Edit user" description="Update safe user profile fields." onOpenChange={(open) => !open && setEditTarget(null)}><UserForm initialValues={userInitialValues(editTarget)} isSubmitting={updateMutation.isPending} onSubmit={async (values) => { await updateMutation.mutateAsync(values); setEditTarget(null); }} /></FormSheet>
      <FormSheet open={showMembership} title="Create membership" description="Create an organization or facility membership for this user." onOpenChange={setShowMembership}>
        <MembershipForm users={detailQuery.data ? [detailQuery.data] : []} organizations={organizationsQuery.data ?? []} facilities={facilitiesQuery.data ?? []} isSubmitting={membershipMutation.isPending} onSubmit={async (values) => { await membershipMutation.mutateAsync(values); setShowMembership(false); }} />
      </FormSheet>
      <FormSheet open={showRoleAssignment} title="Assign role" description="Assign an active role to this user. Membership requirements are enforced by backend services." onOpenChange={setShowRoleAssignment}>
        <RoleAssignmentForm users={detailQuery.data ? [detailQuery.data] : []} roles={rolesQuery.data ?? []} isSubmitting={roleAssignmentMutation.isPending} onSubmit={async (values) => { await roleAssignmentMutation.mutateAsync(values); setShowRoleAssignment(false); }} />
      </FormSheet>
      <ConfirmDialog open={Boolean(deactivateTarget)} title={`Deactivate ${deactivateTarget?.email ?? "user"}?`} description="This marks the user inactive without deleting history." confirmLabel="Deactivate user" isSubmitting={deactivateMutation.isPending} onClose={() => setDeactivateTarget(null)} onConfirm={async () => { if (!deactivateTarget) return; await deactivateMutation.mutateAsync(deactivateTarget.id); setDeactivateTarget(null); }} />
      <ConfirmDialog open={Boolean(endMembershipTarget)} title="End membership?" description="This ends the membership without deleting its history." confirmLabel="End membership" isSubmitting={endMembershipMutation.isPending} onClose={() => setEndMembershipTarget(null)} onConfirm={async () => { if (!endMembershipTarget) return; await endMembershipMutation.mutateAsync(endMembershipTarget.id); setEndMembershipTarget(null); }} />
      <ConfirmDialog open={Boolean(revokeTarget)} title="Revoke role assignment?" description="This deactivates the assignment without deleting authorization history." confirmLabel="Revoke role assignment" isSubmitting={revokeRoleAssignmentMutation.isPending} onClose={() => setRevokeTarget(null)} onConfirm={async () => { if (!revokeTarget) return; await revokeRoleAssignmentMutation.mutateAsync(revokeTarget.id); setRevokeTarget(null); }} />
    </PageContainer>
  );
}
