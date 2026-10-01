"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { FormError } from "@/components/form/form-error";
import { TextField } from "@/components/form/text-field";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FieldGroup } from "@/components/ui/field";
import { PASSWORD_MIN_LENGTH } from "@/features/auth/schemas";
import type { User } from "@/lib/api/types";
import { useResetUserPassword } from "../queries";
import { resetPasswordSchema, type ResetPasswordFormValues } from "../schemas";

interface ResetPasswordDialogProps {
  user: User | null;
  onOpenChange: (open: boolean) => void;
}

/** Sets a temporary password for the user, who will have to change it on next login. */
export function ResetPasswordDialog({ user, onOpenChange }: ResetPasswordDialogProps) {
  return (
    <Dialog open={user !== null} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        {user ? <ResetPasswordForm user={user} onDone={() => onOpenChange(false)} /> : null}
      </DialogContent>
    </Dialog>
  );
}

function ResetPasswordForm({ user, onDone }: { user: User; onDone: () => void }) {
  const reset = useResetUserPassword();
  const form = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { temporaryPassword: "" },
  });

  const onSubmit = ({ temporaryPassword }: ResetPasswordFormValues) => {
    reset.mutate(
      { id: user.id, temporaryPassword },
      {
        onSuccess: () => {
          toast.success(`Temporary password set for "${user.username}"`);
          onDone();
        },
      },
    );
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
      <DialogHeader>
        <DialogTitle>Reset password</DialogTitle>
        <DialogDescription>
          {user.name} will sign in with this temporary password and be asked to choose a new one.
        </DialogDescription>
      </DialogHeader>
      <FieldGroup className="my-4">
        <TextField
          control={form.control}
          name="temporaryPassword"
          label="Temporary password"
          type="text"
          autoComplete="off"
          autoFocus
          description={`At least ${PASSWORD_MIN_LENGTH} characters. Share it with the user.`}
        />
        <FormError error={reset.error} />
      </FieldGroup>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onDone}>
          Cancel
        </Button>
        <Button type="submit" disabled={reset.isPending}>
          {reset.isPending ? "Saving..." : "Reset password"}
        </Button>
      </DialogFooter>
    </form>
  );
}
