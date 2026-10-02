"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { ArrowRightIcon } from "lucide-react";
import { FormError } from "@/components/form/form-error";
import { TextField } from "@/components/form/text-field";
import { Button } from "@/components/ui/button";
import { FieldGroup } from "@/components/ui/field";
import { useSession } from "@/lib/auth/session-provider";
import { authApi } from "./api";
import { loginSchema, type LoginFormValues } from "./schemas";

export function LoginForm() {
  const router = useRouter();
  const { signIn } = useSession();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { login: "", password: "" },
  });

  const login = useMutation({
    mutationFn: authApi.login,
    onSuccess: (response) => {
      signIn(response);
      router.replace(response.mustChangePassword ? "/change-password" : "/");
    },
  });

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight">Welcome back</h1>
        <p className="text-sm text-muted-foreground">Sign in with your email or username to continue.</p>
      </div>

      <form onSubmit={form.handleSubmit((values) => login.mutate(values))} noValidate>
        <FieldGroup className="gap-6">
          <TextField
            control={form.control}
            name="login"
            label="Email or username"
            placeholder="you@company.com"
            autoComplete="username"
            autoFocus
          />
          <TextField
            control={form.control}
            name="password"
            label="Password"
            type="password"
            placeholder="••••••••"
            autoComplete="current-password"
          />
          <FormError error={login.error} />
          <Button
            type="submit"
            size="lg"
            className="h-11 w-full text-xs font-semibold tracking-[0.12em] uppercase"
            disabled={login.isPending || login.isSuccess}
          >
            {login.isPending || login.isSuccess ? "Signing in..." : "Sign in"}
            {login.isPending || login.isSuccess ? null : <ArrowRightIcon data-icon="inline-end" />}
          </Button>
        </FieldGroup>
      </form>

      <p className="text-center text-xs text-muted-foreground">
        Accounts are created by an administrator. Forgot your password? Ask them for a temporary one.
      </p>
    </div>
  );
}
