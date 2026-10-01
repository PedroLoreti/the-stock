"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { FormError } from "@/components/form/form-error";
import { SelectField, type SelectOption } from "@/components/form/select-field";
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
import { ROLE_LABELS } from "@/lib/auth/roles";
import { useSession } from "@/lib/auth/session-provider";
import { useCreateUser, useUpdateUser } from "../queries";
import {
  createUserSchema,
  updateUserSchema,
  USER_ROLES,
  type CreateUserFormValues,
  type UpdateUserFormValues,
} from "../schemas";

const ROLE_OPTIONS: SelectOption[] = USER_ROLES.map((role) => ({ value: role, label: ROLE_LABELS[role] }));

interface UserFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** When provided the dialog edits this user; otherwise it creates a new one. */
  user?: User;
}

export function UserFormDialog({ open, onOpenChange, user }: UserFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        {user ? (
          <EditUserForm user={user} onDone={() => onOpenChange(false)} />
        ) : (
          <CreateUserForm onDone={() => onOpenChange(false)} />
        )}
      </DialogContent>
    </Dialog>
  );
}

function CreateUserForm({ onDone }: { onDone: () => void }) {
  const create = useCreateUser();
  const form = useForm<CreateUserFormValues>({
    resolver: zodResolver(createUserSchema),
    defaultValues: { name: "", username: "", email: "", password: "", role: "SELLER" },
  });

  const onSubmit = (values: CreateUserFormValues) => {
    create.mutate(values, {
      onSuccess: (created) => {
        toast.success(`User "${created.username}" created`);
        onDone();
      },
    });
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
      <DialogHeader>
        <DialogTitle>New user</DialogTitle>
        <DialogDescription>
          The user signs in with the temporary password and must change it on first login.
        </DialogDescription>
      </DialogHeader>
      <FieldGroup className="my-4">
        <TextField control={form.control} name="name" label="Name" autoFocus autoComplete="off" />
        <TextField
          control={form.control}
          name="username"
          label="Username"
          autoComplete="off"
          description='3-30 characters: lowercase letters, numbers, "." or "_"'
        />
        <TextField control={form.control} name="email" label="Email" type="email" autoComplete="off" />
        <TextField
          control={form.control}
          name="password"
          label="Temporary password"
          type="password"
          autoComplete="new-password"
          description={`At least ${PASSWORD_MIN_LENGTH} characters`}
        />
        <SelectField control={form.control} name="role" label="Role" options={ROLE_OPTIONS} />
        <FormError error={create.error} />
      </FieldGroup>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onDone}>
          Cancel
        </Button>
        <Button type="submit" disabled={create.isPending}>
          {create.isPending ? "Creating..." : "Create user"}
        </Button>
      </DialogFooter>
    </form>
  );
}

function EditUserForm({ user, onDone }: { user: User; onDone: () => void }) {
  const { user: currentUser, updateUser: updateSessionUser } = useSession();
  const update = useUpdateUser();
  const isSelf = currentUser?.id === user.id;

  const form = useForm<UpdateUserFormValues>({
    resolver: zodResolver(updateUserSchema),
    defaultValues: { name: user.name, email: user.email, role: user.role },
  });

  useEffect(() => {
    form.reset({ name: user.name, email: user.email, role: user.role });
  }, [user, form]);

  const onSubmit = (values: UpdateUserFormValues) => {
    update.mutate(
      { id: user.id, ...values },
      {
        onSuccess: (updated) => {
          // Keep the header/menu in sync when the admin edits their own account.
          if (isSelf) updateSessionUser(updated);
          toast.success(`User "${updated.username}" updated`);
          onDone();
        },
      },
    );
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
      <DialogHeader>
        <DialogTitle>Edit user</DialogTitle>
        <DialogDescription>Username {user.username} cannot be changed.</DialogDescription>
      </DialogHeader>
      <FieldGroup className="my-4">
        <TextField control={form.control} name="name" label="Name" autoFocus autoComplete="off" />
        <TextField control={form.control} name="email" label="Email" type="email" autoComplete="off" />
        <SelectField
          control={form.control}
          name="role"
          label="Role"
          options={ROLE_OPTIONS}
          disabled={isSelf}
          description={isSelf ? "You cannot change your own role." : undefined}
        />
        <FormError error={update.error} />
      </FieldGroup>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onDone}>
          Cancel
        </Button>
        <Button type="submit" disabled={update.isPending}>
          {update.isPending ? "Saving..." : "Save changes"}
        </Button>
      </DialogFooter>
    </form>
  );
}
