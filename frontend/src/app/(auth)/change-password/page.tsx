"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { PageSpinner } from "@/components/page-spinner";
import { ChangePasswordForm } from "@/features/auth/change-password-form";
import { useSession } from "@/lib/auth/session-provider";

/**
 * Reachable both when the API forces a password change (temporary password)
 * and when a signed-in user wants to change their own password.
 */
export default function ChangePasswordPage() {
  const router = useRouter();
  const { status } = useSession();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
    }
  }, [status, router]);

  if (status !== "authenticated") {
    return <PageSpinner />;
  }

  return <ChangePasswordForm />;
}
