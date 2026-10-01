import { api } from "@/lib/api/client";
import type { AuthResponse, User } from "@/lib/api/types";

export interface LoginInput {
  login: string;
  password: string;
}

export interface ChangePasswordInput {
  currentPassword: string;
  newPassword: string;
}

export const authApi = {
  async login(input: LoginInput): Promise<AuthResponse> {
    const { data } = await api.post<AuthResponse>("/auth/login", input);
    return data;
  },

  async logout(): Promise<void> {
    await api.post("/auth/logout");
  },

  async changePassword(input: ChangePasswordInput): Promise<AuthResponse> {
    const { data } = await api.patch<AuthResponse>("/auth/password", input);
    return data;
  },

  async me(): Promise<User> {
    const { data } = await api.get<User>("/auth/me");
    return data;
  },
};
