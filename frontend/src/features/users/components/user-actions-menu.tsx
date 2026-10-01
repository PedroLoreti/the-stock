"use client";

import { ArchiveRestoreIcon, KeyRoundIcon, MoreHorizontalIcon, PencilIcon, UserXIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getErrorMessage } from "@/lib/api/errors";
import type { User } from "@/lib/api/types";
import { useSession } from "@/lib/auth/session-provider";
import { useDeactivateUser, useRestoreUser } from "../queries";

interface UserActionsMenuProps {
  user: User;
  onEdit: (user: User) => void;
  onResetPassword: (user: User) => void;
}

export function UserActionsMenu({ user, onEdit, onResetPassword }: UserActionsMenuProps) {
  const { user: currentUser } = useSession();
  const deactivate = useDeactivateUser();
  const restore = useRestoreUser();
  const isSelf = currentUser?.id === user.id;

  const handleDeactivate = () => {
    if (!window.confirm(`Deactivate "${user.username}"? They will no longer be able to sign in.`)) return;
    deactivate.mutate(user.id, {
      onSuccess: () => toast.success(`User "${user.username}" deactivated`),
      onError: (error) => toast.error(getErrorMessage(error)),
    });
  };

  const handleRestore = () => {
    restore.mutate(user.id, {
      onSuccess: () => toast.success(`User "${user.username}" restored`),
      onError: (error) => toast.error(getErrorMessage(error)),
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="ghost" size="icon-sm" aria-label={`Actions for ${user.username}`}>
            <MoreHorizontalIcon />
          </Button>
        }
      />
      <DropdownMenuContent align="end">
        {user.active ? (
          <>
            <DropdownMenuItem onClick={() => onEdit(user)}>
              <PencilIcon aria-hidden />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onResetPassword(user)} disabled={isSelf}>
              <KeyRoundIcon aria-hidden />
              Reset password
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" onClick={handleDeactivate} disabled={isSelf}>
              <UserXIcon aria-hidden />
              {isSelf ? "Cannot deactivate yourself" : "Deactivate"}
            </DropdownMenuItem>
          </>
        ) : (
          <DropdownMenuItem onClick={handleRestore}>
            <ArchiveRestoreIcon aria-hidden />
            Restore
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
