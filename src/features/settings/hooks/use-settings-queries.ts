"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";

import type { ApiError } from "@/lib/api/api-error";
import { queryKeys } from "@/lib/query/query-keys";
import { useCurrentUserQuery } from "@/features/auth/hooks/use-auth-queries";
import { hasAnyPermission, hasPermission } from "@/types/permissions";

import { settingsApiService } from "../api/settings-api.service";
import type { SettingsListParams } from "../types/settings.types";

type QueryOptions = { enabled?: boolean };

function scopeKey(params: Record<string, unknown>) {
  return JSON.stringify(Object.fromEntries(Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== "").sort(([a], [b]) => a.localeCompare(b))));
}

function useSettingsBase<TData>(key: readonly unknown[], queryFn: () => Promise<TData>, options?: QueryOptions) {
  return useQuery<TData, ApiError>({ queryKey: key, queryFn, enabled: options?.enabled, placeholderData: keepPreviousData });
}

export function useSettingsOrganizationsQuery(params: SettingsListParams = {}, options?: QueryOptions) {
  return useSettingsBase([...queryKeys.facilities.lists(), "settings-organizations", scopeKey(params)], () => settingsApiService.listOrganizations(params), options);
}

export function useSettingsOrganizationQuery(id?: string, options?: QueryOptions) {
  return useSettingsBase(id ? [...queryKeys.facilities.detail(id), "organization"] : ["settings", "organization", "missing"], () => settingsApiService.getOrganization(id!), { enabled: Boolean(id) && options?.enabled !== false });
}

export function useSettingsUsersQuery(params: SettingsListParams = {}, options?: QueryOptions) {
  return useSettingsBase([...queryKeys.auth.all, "settings-users", scopeKey(params)], () => settingsApiService.listUsers(params), options);
}

export function useSettingsUserQuery(id?: string, options?: QueryOptions) {
  return useSettingsBase(id ? [...queryKeys.auth.all, "user", id] : ["settings", "user", "missing"], () => settingsApiService.getUser(id!), { enabled: Boolean(id) && options?.enabled !== false });
}

export function useSettingsRolesQuery(params: SettingsListParams = {}, options?: QueryOptions) {
  return useSettingsBase([...queryKeys.auth.all, "roles", scopeKey(params)], () => settingsApiService.listRoles(params), options);
}

export function useSettingsRoleQuery(id?: string, options?: QueryOptions) {
  return useSettingsBase(id ? [...queryKeys.auth.all, "role", id] : ["settings", "role", "missing"], () => settingsApiService.getRole(id!), { enabled: Boolean(id) && options?.enabled !== false });
}

export function useSettingsPermissionsQuery(params: SettingsListParams = {}, options?: QueryOptions) {
  return useSettingsBase([...queryKeys.auth.all, "permissions", scopeKey(params)], () => settingsApiService.listPermissions(params), options);
}

export function useUserMembershipsQuery(userId?: string, params: SettingsListParams = {}, options?: QueryOptions) {
  return useSettingsBase([...queryKeys.auth.all, "user-memberships", userId, scopeKey(params)], () => settingsApiService.listUserMemberships(userId!, params), { enabled: Boolean(userId) && options?.enabled !== false });
}

export function useUserRoleAssignmentsQuery(userId?: string, params: SettingsListParams = {}, options?: QueryOptions) {
  return useSettingsBase([...queryKeys.auth.all, "user-role-assignments", userId, scopeKey(params)], () => settingsApiService.listUserRoleAssignments(userId!, params), { enabled: Boolean(userId) && options?.enabled !== false });
}

export function useFlowSettingsQuery(params: { facility_id?: string } = {}, options?: QueryOptions) {
  return useSettingsBase([...queryKeys.facilities.lists(), "flow-settings", scopeKey(params)], () => settingsApiService.listFlowSettings(params), options);
}

export function useSettingsWorkspace() {
  const userQuery = useCurrentUserQuery();
  const can = (permission: string) => hasPermission(userQuery.data, permission);

  return {
    ...userQuery,
    canManageSettings: hasAnyPermission(userQuery.data, ["accounts_user.view", "accounts_role.view", "facilities_organization.view"]),
    canViewUsers: can("accounts_user.view"),
    canCreateUsers: can("accounts_user.create"),
    canUpdateUsers: can("accounts_user.update"),
    canDeactivateUsers: can("accounts_user.deactivate"),
    canViewRoles: can("accounts_role.view"),
    canCreateRoles: can("accounts_role.create") || can("accounts_role.manage"),
    canUpdateRoles: can("accounts_role.update") || can("accounts_role.manage"),
    canDeactivateRoles: can("accounts_role.deactivate") || can("accounts_role.manage"),
    canViewPermissions: can("accounts_permission.view"),
    canCreatePermissions: can("accounts_permission.create") || can("accounts_permission.manage"),
    canManageRolePermissions: can("accounts_role_permission.grant") || can("accounts_role.manage"),
    canManageMemberships: can("accounts_membership.create"),
    canAssignRoles: can("accounts_role_assignment.create"),
    canViewOrganizations: can("facilities_organization.view"),
    canCreateOrganizations: can("facilities_organization.create"),
    canUpdateOrganizations: can("facilities_organization.update"),
    canDeactivateOrganizations: can("facilities_organization.deactivate"),
    canManageFlowSettings: can("facilities_settings.manage") || can("facilities_flow_settings.manage"),
  };
}
