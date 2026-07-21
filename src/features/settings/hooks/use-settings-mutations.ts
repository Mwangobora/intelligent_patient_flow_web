"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { normalizeApiError } from "@/lib/api/api-error";
import { queryKeys } from "@/lib/query/query-keys";

import { settingsApiService } from "../api/settings-api.service";
import type { FacilityFlowPayload, OrganizationPayload, PermissionPayload, RolePayload, UserPayload } from "../types/settings.types";

function friendlySettingsError(error: unknown) {
  const normalized = normalizeApiError(error);
  const message = normalized.message.toLowerCase();
  if (normalized.status === 403) return "You do not have permission to manage settings.";
  if (normalized.status === null) return "Could not connect to the server. Please try again.";
  if (message.includes("organization") && message.includes("code")) return "This organization code is already used.";
  if (message.includes("email") && (message.includes("exists") || message.includes("unique"))) return "A user with this email already exists.";
  if (message.includes("role") && message.includes("assigned")) return "This role is already assigned to the user.";
  if (message.includes("permission") && message.includes("assigned")) return "This permission is already assigned to the role.";
  return normalized.message || "Something went wrong while managing settings.";
}

function invalidateSettings(queryClient: ReturnType<typeof useQueryClient>) {
  void queryClient.invalidateQueries({ queryKey: queryKeys.auth.all });
  void queryClient.invalidateQueries({ queryKey: queryKeys.facilities.all });
}

export function useCreateOrganizationSettingsMutation() {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: (payload: OrganizationPayload) => settingsApiService.createOrganization(payload), onSuccess: () => { toast.success("Organization created successfully."); invalidateSettings(queryClient); }, onError: (error) => toast.error(friendlySettingsError(error)) });
}

export function useUpdateOrganizationSettingsMutation(id?: string) {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: (payload: OrganizationPayload) => settingsApiService.updateOrganization(id!, payload), onSuccess: () => { toast.success("Organization updated successfully."); invalidateSettings(queryClient); }, onError: (error) => toast.error(friendlySettingsError(error)) });
}

export function useDeactivateOrganizationSettingsMutation() {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: (id: string) => settingsApiService.deactivateOrganization(id), onSuccess: () => { toast.success("Organization deactivated successfully."); invalidateSettings(queryClient); }, onError: (error) => toast.error(friendlySettingsError(error)) });
}

export function useCreateSettingsUserMutation() {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: (payload: UserPayload) => settingsApiService.createUser(payload), onSuccess: () => { toast.success("User created successfully."); invalidateSettings(queryClient); }, onError: (error) => toast.error(friendlySettingsError(error)) });
}

export function useUpdateSettingsUserMutation(id?: string) {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: (payload: Partial<UserPayload>) => settingsApiService.updateUser(id!, payload), onSuccess: () => { toast.success("User updated successfully."); invalidateSettings(queryClient); }, onError: (error) => toast.error(friendlySettingsError(error)) });
}

export function useDeactivateSettingsUserMutation() {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: (id: string) => settingsApiService.deactivateUser(id), onSuccess: () => { toast.success("User deactivated successfully."); invalidateSettings(queryClient); }, onError: (error) => toast.error(friendlySettingsError(error)) });
}

export function useCreateSettingsRoleMutation() {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: (payload: RolePayload) => settingsApiService.createRole(payload), onSuccess: () => { toast.success("Role created successfully."); invalidateSettings(queryClient); }, onError: (error) => toast.error(friendlySettingsError(error)) });
}

export function useUpdateSettingsRoleMutation(id?: string) {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: (payload: Partial<RolePayload>) => settingsApiService.updateRole(id!, payload), onSuccess: () => { toast.success("Role updated successfully."); invalidateSettings(queryClient); }, onError: (error) => toast.error(friendlySettingsError(error)) });
}

export function useDeactivateSettingsRoleMutation() {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: (id: string) => settingsApiService.deactivateRole(id), onSuccess: () => { toast.success("Role deactivated successfully."); invalidateSettings(queryClient); }, onError: (error) => toast.error(friendlySettingsError(error)) });
}

export function useCreateSettingsPermissionMutation() {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: (payload: PermissionPayload) => settingsApiService.createPermission(payload), onSuccess: () => { toast.success("Permission created successfully."); invalidateSettings(queryClient); }, onError: (error) => toast.error(friendlySettingsError(error)) });
}

export function useUpdateSettingsPermissionMutation(id?: string) {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: (payload: Partial<PermissionPayload>) => settingsApiService.updatePermission(id!, payload), onSuccess: () => { toast.success("Permission updated successfully."); invalidateSettings(queryClient); }, onError: (error) => toast.error(friendlySettingsError(error)) });
}

export function useDeactivateSettingsPermissionMutation() {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: (id: string) => settingsApiService.deactivatePermission(id), onSuccess: () => { toast.success("Permission deactivated successfully."); invalidateSettings(queryClient); }, onError: (error) => toast.error(friendlySettingsError(error)) });
}

export function useGrantRolePermissionMutation(roleId?: string) {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: (permissionId: string) => settingsApiService.grantPermission(roleId!, permissionId), onSuccess: () => { toast.success("Permission assigned to role."); invalidateSettings(queryClient); }, onError: (error) => toast.error(friendlySettingsError(error)) });
}

export function useRevokeRolePermissionMutation(roleId?: string) {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: (permissionId: string) => settingsApiService.revokePermission(roleId!, permissionId), onSuccess: () => { toast.success("Permission removed from role."); invalidateSettings(queryClient); }, onError: (error) => toast.error(friendlySettingsError(error)) });
}

export function useCreateMembershipMutation() {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: (payload: Record<string, unknown>) => payload.facility_id ? settingsApiService.createFacilityMembership(payload) : settingsApiService.createOrganizationMembership(payload), onSuccess: () => { toast.success("Membership created."); invalidateSettings(queryClient); }, onError: (error) => toast.error(friendlySettingsError(error)) });
}

export function useDeactivateMembershipMutation() {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: (id: string) => settingsApiService.deactivateMembership(id), onSuccess: () => { toast.success("Membership deactivated successfully."); invalidateSettings(queryClient); }, onError: (error) => toast.error(friendlySettingsError(error)) });
}

export function useEndMembershipMutation() {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: (id: string) => settingsApiService.endMembership(id), onSuccess: () => { toast.success("Membership ended successfully."); invalidateSettings(queryClient); }, onError: (error) => toast.error(friendlySettingsError(error)) });
}

export function useAssignRoleToUserMutation() {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: (payload: Record<string, unknown>) => settingsApiService.assignRoleToUser(payload), onSuccess: () => { toast.success("Role assigned to user successfully."); invalidateSettings(queryClient); }, onError: (error) => toast.error(friendlySettingsError(error)) });
}

export function useRevokeRoleAssignmentMutation() {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: (assignmentId: string) => settingsApiService.revokeRoleAssignment(assignmentId), onSuccess: () => { toast.success("Role assignment revoked successfully."); invalidateSettings(queryClient); }, onError: (error) => toast.error(friendlySettingsError(error)) });
}

export function useSaveFlowSettingsMutation(existingId?: string) {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: (payload: FacilityFlowPayload) => existingId ? settingsApiService.updateFlowSettings(existingId, payload) : settingsApiService.createFlowSettings(payload), onSuccess: () => { toast.success("Facility flow settings saved."); invalidateSettings(queryClient); }, onError: (error) => toast.error(friendlySettingsError(error)) });
}

export function useUpdateProfileMutation() {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: (payload: { first_name?: string; middle_name?: string | null; last_name?: string }) => settingsApiService.updateProfile(payload), onSuccess: () => { toast.success("Profile updated."); invalidateSettings(queryClient); }, onError: (error) => toast.error(friendlySettingsError(error)) });
}

export function useChangePasswordMutation() {
  return useMutation({ mutationFn: (payload: { old_password: string; new_password: string }) => settingsApiService.changePassword(payload), onSuccess: () => toast.success("Password changed successfully."), onError: (error) => toast.error(friendlySettingsError(error)) });
}
