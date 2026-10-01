"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { PageSpinner } from "@/components/page-spinner";
import { useSession } from "@/lib/auth/session-provider";

/** Everything under (app) requires a signed-in user with no pending password change. */
export default function AppLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { status, user } = useSession();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
    } else if (status === "authenticated" && user?.mustChangePassword) {
      router.replace("/change-password");
    }
  }, [status, user, router]);

  if (status !== "authenticated" || user?.mustChangePassword) {
    return <PageSpinner />;
  }

  return <AppShell>{children}</AppShell>;
}
