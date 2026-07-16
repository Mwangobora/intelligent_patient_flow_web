import { apiEndpoints } from "@/lib/api/endpoints";
import { apiClient } from "@/lib/api/api-client";

import type {
  CurrentUserResponse,
  LoginRequest,
  LoginResponse,
  LogoutResponse,
} from "../types/auth.types";

type LogoutPayload = {
  refresh: string;
};

type ChangePasswordPayload = {
  old_password: string;
  new_password: string;
};

class AuthApiService {
  async login(payload: LoginRequest): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse>(apiEndpoints.auth.login, payload);
    return response.data;
  }

  async logout(payload: LogoutPayload): Promise<LogoutResponse> {
    await apiClient.post(apiEndpoints.auth.logout, payload);
  }

  async getCurrentUser(): Promise<CurrentUserResponse> {
    const response = await apiClient.get<CurrentUserResponse>(apiEndpoints.auth.me);
    return response.data;
  }

  async refreshSession(payload: LogoutPayload): Promise<{ access: string }> {
    const response = await apiClient.post<{ access: string }>(
      apiEndpoints.auth.refresh,
      payload,
    );
    return response.data;
  }

  async changePassword(payload: ChangePasswordPayload): Promise<void> {
    await apiClient.post(apiEndpoints.auth.changePassword, payload);
  }
}

export const authApiService = new AuthApiService();
