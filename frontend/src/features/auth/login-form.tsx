"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
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
    <Card>
      <CardHeader>
        <CardTitle>Sign in</CardTitle>
        <CardDescription>Use your email or username and password.</CardDescription>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={form.handleSubmit((values) => login.mutate(values))}
          noValidate
        >
          <FieldGroup>
            <TextField
              control={form.control}
              name="login"
              label="Email or username"
              autoComplete="username"
              autoFocus
            />
            <TextField
              control={form.control}
              name="password"
              label="Password"
              type="password"
              autoComplete="current-password"
            />
            {login.isError ? (
              <Alert variant="destructive">
                <AlertDescription>{getErrorMessage(login.error)}</AlertDescription>
              </Alert>
            ) : null}
            <Button type="submit" className="w-full" disabled={login.isPending}>
              {login.isPending ? "Signing in..." : "Sign in"}
            </Button>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}
