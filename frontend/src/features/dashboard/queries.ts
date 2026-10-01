import { useQuery } from "@tanstack/react-query";
import { dashboardApi } from "./api";

export const dashboardKeys = {
  all: ["dashboard"] as const,
};

export function useDashboard() {
  return useQuery({
    queryKey: dashboardKeys.all,
    queryFn: dashboardApi.get,
    // Numbers change with every sale; refetch on mount and keep them fresh for a minute.
    staleTime: 60_000,
    refetchOnMount: "always",
  });
}
