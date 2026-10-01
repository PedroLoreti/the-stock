"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { TextField } from "@/components/form/text-field";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FieldGroup } from "@/components/ui/field";
import { getErrorMessage } from "@/lib/api/errors";
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
    <Card>
      <CardHeader>
        <CardTitle>{required ? "Set a new password" : "Change password"}</CardTitle>
        <CardDescription>
          {required
            ? "You are using a temporary password. Choose a new one to continue."
            : `Your new password must have at least ${PASSWORD_MIN_LENGTH} characters.`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={form.handleSubmit(({ currentPassword, newPassword }) =>
            changePassword.mutate({ currentPassword, newPassword }),
          )}
          noValidate
        >
          <FieldGroup>
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
            />
            <TextField
              control={form.control}
              name="confirmPassword"
              label="Confirm new password"
              type="password"
              autoComplete="new-password"
            />
            {changePassword.isError ? (
              <Alert variant="destructive">
                <AlertDescription>{getErrorMessage(changePassword.error)}</AlertDescription>
              </Alert>
            ) : null}
            <Button type="submit" className="w-full" disabled={changePassword.isPending}>
              {changePassword.isPending ? "Saving..." : "Save new password"}
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
      </CardContent>
    </Card>
  );
}
