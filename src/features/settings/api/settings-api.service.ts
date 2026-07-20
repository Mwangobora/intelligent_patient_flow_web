import { apiClient } from "@/lib/api/api-client";
import { apiEndpoints } from "@/lib/api/endpoints";
import type { CurrentUserResponse } from "@/features/auth/types/auth.types";

import type {
  FacilityFlowPayload,
  FlowSettingRecord,
  MembershipRecord,
  OrganizationPayload,
  OrganizationRecord,
  PermissionPayload,
  PermissionRecord,
  RoleAssignmentRecord,
  RolePayload,
  RoleRecord,
  SettingsListParams,
  UserPayload,
  UserRecord,
} from "../types/settings.types";

function compactParams<T extends Record<string, unknown>>(params?: T) {
  return Object.fromEntries(
    Object.entries(params ?? {}).filter(([, value]) => value !== undefined && value !== null && value !== ""),
  );
}

const detail = (base: string, id: string, action?: string) => `${base}${id}/${action ? `${action}/` : ""}`;

class SettingsApiService {
  async listOrganizations(params: SettingsListParams = {}) {
    const response = await apiClient.get<OrganizationRecord[]>(apiEndpoints.facilities.organizations, { params: compactParams(params) });
    return response.data;
  }

  async getOrganization(id: string) {
    const response = await apiClient.get<OrganizationRecord>(detail(apiEndpoints.facilities.organizations, id));
    return response.data;
  }

  async createOrganization(payload: OrganizationPayload) {
    const response = await apiClient.post<OrganizationRecord>(apiEndpoints.facilities.organizations, payload);
    return response.data;
  }

  async updateOrganization(id: string, payload: OrganizationPayload) {
    const response = await apiClient.patch<OrganizationRecord>(detail(apiEndpoints.facilities.organizations, id), payload);
    return response.data;
  }

  async deactivateOrganization(id: string) {
    const response = await apiClient.post<OrganizationRecord>(detail(apiEndpoints.facilities.organizations, id, "deactivate"), {});
    return response.data;
  }

  async listUsers(params: SettingsListParams = {}) {
    const response = await apiClient.get<UserRecord[]>(apiEndpoints.accounts.users, { params: compactParams(params) });
    return response.data;
  }

  async getUser(id: string) {
    const response = await apiClient.get<UserRecord>(detail(apiEndpoints.accounts.users, id));
    return response.data;
  }

  async createUser(payload: UserPayload) {
    const response = await apiClient.post<UserRecord>(apiEndpoints.accounts.users, payload);
    return response.data;
  }

  async updateUser(id: string, payload: Partial<UserPayload>) {
    const response = await apiClient.patch<UserRecord>(detail(apiEndpoints.accounts.users, id), payload);
    return response.data;
  }

  async deactivateUser(id: string) {
    const response = await apiClient.post<UserRecord>(detail(apiEndpoints.accounts.users, id, "deactivate"), {});
    return response.data;
  }

  async listRoles(params: SettingsListParams = {}) {
    const response = await apiClient.get<RoleRecord[]>(apiEndpoints.accounts.roles, { params: compactParams(params) });
    return response.data;
  }

  async getRole(id: string) {
    const response = await apiClient.get<RoleRecord>(detail(apiEndpoints.accounts.roles, id));
    return response.data;
  }

  async createRole(payload: RolePayload) {
    const response = await apiClient.post<RoleRecord>(apiEndpoints.accounts.roles, payload);
    return response.data;
  }

  async updateRole(id: string, payload: Partial<RolePayload>) {
    const response = await apiClient.patch<RoleRecord>(detail(apiEndpoints.accounts.roles, id), payload);
    return response.data;
  }

  async deactivateRole(id: string) {
    const response = await apiClient.post<RoleRecord>(detail(apiEndpoints.accounts.roles, id, "deactivate"), {});
    return response.data;
  }

  async grantPermission(roleId: string, permissionId: string) {
    const response = await apiClient.post(detail(apiEndpoints.accounts.roles, roleId, "grant-permission"), { permission_id: permissionId });
    return response.data;
  }

  async revokePermission(roleId: string, permissionId: string) {
    const response = await apiClient.post(detail(apiEndpoints.accounts.roles, roleId, "revoke-permission"), { permission_id: permissionId });
    return response.data;
  }

  async listPermissions(params: SettingsListParams = {}) {
    const response = await apiClient.get<PermissionRecord[]>(apiEndpoints.accounts.permissions, { params: compactParams(params) });
    return response.data;
  }

  async createPermission(payload: PermissionPayload) {
    const response = await apiClient.post<PermissionRecord>(apiEndpoints.accounts.permissions, payload);
    return response.data;
  }

  async updatePermission(id: string, payload: Partial<PermissionPayload>) {
    const response = await apiClient.patch<PermissionRecord>(detail(apiEndpoints.accounts.permissions, id), payload);
    return response.data;
  }

  async deactivatePermission(id: string) {
    const response = await apiClient.post<PermissionRecord>(detail(apiEndpoints.accounts.permissions, id, "deactivate"), {});
    return response.data;
  }

  async createOrganizationMembership(payload: Record<string, unknown>) {
    const response = await apiClient.post<MembershipRecord>(`${apiEndpoints.accounts.memberships}organization/`, payload);
    return response.data;
  }

  async createFacilityMembership(payload: Record<string, unknown>) {
    const response = await apiClient.post<MembershipRecord>(`${apiEndpoints.accounts.memberships}facility/`, payload);
    return response.data;
  }

  async deactivateMembership(id: string) {
    const response = await apiClient.post<MembershipRecord>(detail(apiEndpoints.accounts.memberships, id, "deactivate"), {});
    return response.data;
  }

  async reactivateMembership(id: string) {
    const response = await apiClient.post<MembershipRecord>(detail(apiEndpoints.accounts.memberships, id, "reactivate"), {});
    return response.data;
  }

  async endMembership(id: string) {
    const response = await apiClient.post<MembershipRecord>(detail(apiEndpoints.accounts.memberships, id, "end"), {});
    return response.data;
  }

  async assignRoleToUser(payload: Record<string, unknown>) {
    const response = await apiClient.post<RoleAssignmentRecord>(apiEndpoints.accounts.roleAssignments, payload);
    return response.data;
  }

  async revokeRoleAssignment(id: string) {
    const response = await apiClient.post<RoleAssignmentRecord>(detail(apiEndpoints.accounts.roleAssignments, id, "revoke"), {});
    return response.data;
  }

  async listUserMemberships(userId: string, params: SettingsListParams = {}) {
    const response = await apiClient.get<MembershipRecord[]>(`${apiEndpoints.accounts.users}${userId}/memberships/`, { params: compactParams(params) });
    return response.data;
  }

  async listUserRoleAssignments(userId: string, params: SettingsListParams = {}) {
    const response = await apiClient.get<RoleAssignmentRecord[]>(`${apiEndpoints.accounts.users}${userId}/role-assignments/`, { params: compactParams(params) });
    return response.data;
  }

  async listFlowSettings(params: { facility_id?: string } = {}) {
    const response = await apiClient.get<FlowSettingRecord[]>(apiEndpoints.facilities.flowSettings, { params: compactParams(params) });
    return response.data;
  }

  async createFlowSettings(payload: FacilityFlowPayload) {
    const response = await apiClient.post<FlowSettingRecord>(apiEndpoints.facilities.flowSettings, payload);
    return response.data;
  }

  async updateFlowSettings(id: string, payload: FacilityFlowPayload) {
    const response = await apiClient.patch<FlowSettingRecord>(detail(apiEndpoints.facilities.flowSettings, id), payload);
    return response.data;
  }

  async updateProfile(payload: { first_name?: string; middle_name?: string | null; last_name?: string }) {
    const response = await apiClient.patch<CurrentUserResponse>(apiEndpoints.auth.me, payload);
    return response.data;
  }

  async changePassword(payload: { old_password: string; new_password: string }) {
    await apiClient.post(apiEndpoints.auth.changePassword, payload);
  }
}

export const settingsApiService = new SettingsApiService();
