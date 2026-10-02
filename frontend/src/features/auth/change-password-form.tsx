"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { ArrowRightIcon } from "lucide-react";
import { toast } from "sonner";
import { FormError } from "@/components/form/form-error";
import { TextField } from "@/components/form/text-field";
import { Button } from "@/components/ui/button";
import { FieldGroup } from "@/components/ui/field";
import { useSession } from "@/lib/auth/session-provider";
import { authApi } from "./api";
import {
  changePasswordSchema,
  PASSWORD_MIN_LENGTH,
  type ChangePasswordFormValues,
} from "./schemas";

export function ChangePasswordForm() {
  const router = useRouter();
  const { user, signIn, signOut } = useSession();
  const required = user?.mustChangePassword ?? false;

  const form = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
  });

  const changePassword = useMutation({
    mutationFn: authApi.changePassword,
    onSuccess: (response) => {
      // The API issues new tokens without the "must change" flag.
      signIn(response);
      toast.success("Password updated");
      router.replace("/");
    },
  });

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight">
          {required ? "Set a new password" : "Change password"}
        </h1>
        <p className="text-sm text-muted-foreground">
          {required
            ? `Hi ${user?.name ?? ""}. You signed in with a temporary password; choose your own to continue.`
            : `Your new password must have at least ${PASSWORD_MIN_LENGTH} characters.`}
        </p>
      </div>

      <form
        onSubmit={form.handleSubmit(({ currentPassword, newPassword }) =>
          changePassword.mutate({ currentPassword, newPassword }),
        )}
        noValidate
      >
        <FieldGroup className="gap-6">
          <TextField
            control={form.control}
            name="currentPassword"
            label="Current password"
            type="password"
            autoComplete="current-password"
            autoFocus
          />
          <TextField
            control={form.control}
            name="newPassword"
            label="New password"
            type="password"
            autoComplete="new-password"
            description={`At least ${PASSWORD_MIN_LENGTH} characters`}
          />
          <TextField
            control={form.control}
            name="confirmPassword"
            label="Confirm new password"
            type="password"
            autoComplete="new-password"
          />
          <FormError error={changePassword.error} />
          <Button
            type="submit"
            size="lg"
            className="h-11 w-full text-xs font-semibold tracking-[0.12em] uppercase"
            disabled={changePassword.isPending}
          >
            {changePassword.isPending ? "Saving..." : "Save new password"}
            {changePassword.isPending ? null : <ArrowRightIcon data-icon="inline-end" />}
          </Button>
          {required ? (
            <Button type="button" variant="ghost" className="w-full" onClick={() => signOut()}>
              Sign out
            </Button>
          ) : (
            <Button type="button" variant="ghost" className="w-full" onClick={() => router.back()}>
              Cancel
            </Button>
          )}
        </FieldGroup>
      </form>
    </div>
  );
}
