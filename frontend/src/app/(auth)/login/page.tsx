"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { PageSpinner } from "@/components/page-spinner";
import { LoginForm } from "@/features/auth/login-form";
import { useSession } from "@/lib/auth/session-provider";

export default function LoginPage() {
  const router = useRouter();
  const { status, user } = useSession();

  // Already signed in (e.g. restored from the refresh cookie): skip the form.
  useEffect(() => {
    if (status === "authenticated") {
      router.replace(user?.mustChangePassword ? "/change-password" : "/");
    }
  }, [status, user, router]);

  if (status !== "unauthenticated") {
    return <PageSpinner />;
  }

  return <LoginForm />;
}
