import { api } from "@/lib/api/client";
import type { Page, PageParams, User, UserRole } from "@/lib/api/types";

export interface ListUsersParams extends PageParams {
  /** Matches name, username or email, case-insensitive. */
  search?: string;
  includeInactive?: boolean;
}

export interface CreateUserInput {
  name: string;
  username: string;
  email: string;
  /** Temporary password; the user must change it on first login. */
  password: string;
  role: UserRole;
}

export interface UpdateUserInput {
  name?: string;
  email?: string;
  role?: UserRole;
}

export const usersApi = {
  async list(params: ListUsersParams = {}): Promise<Page<User>> {
    const { data } = await api.get<Page<User>>("/users", {
      params: {
        page: params.page,
        pageSize: params.pageSize,
        search: params.search?.trim() || undefined,
        includeInactive: params.includeInactive ? true : undefined,
      },
    });
    return data;
  },

  async get(id: string): Promise<User> {
    const { data } = await api.get<User>(`/users/${id}`);
    return data;
  },

  async create(input: CreateUserInput): Promise<User> {
    const { data } = await api.post<User>("/users", input);
    return data;
  },

  async update(id: string, input: UpdateUserInput): Promise<User> {
    const { data } = await api.patch<User>(`/users/${id}`, input);
    return data;
  },

  async deactivate(id: string): Promise<User> {
    const { data } = await api.delete<User>(`/users/${id}`);
    return data;
  },

  async restore(id: string): Promise<User> {
    const { data } = await api.post<User>(`/users/${id}/restore`);
    return data;
  },

  async resetPassword(id: string, temporaryPassword: string): Promise<User> {
    const { data } = await api.post<User>(`/users/${id}/reset-password`, { temporaryPassword });
    return data;
  },
};
