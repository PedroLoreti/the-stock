import type { UserRole } from "@/lib/api/types";

/** Mirrors the @Roles() rules of the API so the UI hides what the user cannot do. */
export const permissions = {
  manageProducts: (role: UserRole) => role === "MANAGEMENT" || role === "ADMIN",
  restoreProducts: (role: UserRole) => role === "ADMIN",
  viewInactiveProducts: (role: UserRole) => role === "ADMIN",
  cancelSales: (role: UserRole) => role === "MANAGEMENT" || role === "ADMIN",
  manageUsers: (role: UserRole) => role === "ADMIN",
};

export const ROLE_LABELS: Record<UserRole, string> = {
  ADMIN: "Administrator",
  MANAGEMENT: "Management",
  SELLER: "Seller",
};
