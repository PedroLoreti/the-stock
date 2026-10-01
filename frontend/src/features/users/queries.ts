import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { usersApi, type CreateUserInput, type UpdateUserInput } from "./api";

export const userKeys = {
  all: ["users"] as const,
  list: (includeInactive: boolean) => [...userKeys.all, "list", { includeInactive }] as const,
};

export function useUsers(includeInactive = false) {
  return useQuery({
    queryKey: userKeys.list(includeInactive),
    queryFn: () => usersApi.list(includeInactive),
  });
}

function useInvalidateUsers() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: userKeys.all });
}

export function useCreateUser() {
  const invalidate = useInvalidateUsers();
  return useMutation({
    mutationFn: (input: CreateUserInput) => usersApi.create(input),
    onSuccess: invalidate,
  });
}

export function useUpdateUser() {
  const invalidate = useInvalidateUsers();
  return useMutation({
    mutationFn: ({ id, ...input }: UpdateUserInput & { id: string }) => usersApi.update(id, input),
    onSuccess: invalidate,
  });
}

export function useDeactivateUser() {
  const invalidate = useInvalidateUsers();
  return useMutation({
    mutationFn: (id: string) => usersApi.deactivate(id),
    onSuccess: invalidate,
  });
}

export function useRestoreUser() {
  const invalidate = useInvalidateUsers();
  return useMutation({
    mutationFn: (id: string) => usersApi.restore(id),
    onSuccess: invalidate,
  });
}

export function useResetUserPassword() {
  const invalidate = useInvalidateUsers();
  return useMutation({
    mutationFn: ({ id, temporaryPassword }: { id: string; temporaryPassword: string }) =>
      usersApi.resetPassword(id, temporaryPassword),
    onSuccess: invalidate,
  });
}
