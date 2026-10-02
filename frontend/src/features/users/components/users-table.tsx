"use client";

import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ActiveBadge } from "@/features/products/components/product-badges";
import type { User } from "@/lib/api/types";
import { ROLE_LABELS } from "@/lib/auth/roles";
import { UserActionsMenu } from "./user-actions-menu";

interface UsersTableProps {
  users: User[];
  showStatus: boolean;
  onEdit: (user: User) => void;
  onResetPassword: (user: User) => void;
}

export function UsersTable({ users, showStatus, onEdit, onResetPassword }: UsersTableProps) {
  return (
    <div className="overflow-hidden rounded-xl border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Username</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            {showStatus ? <TableHead>Status</TableHead> : null}
            <TableHead className="w-12" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id} className={user.active ? undefined : "text-muted-foreground"}>
              <TableCell className="font-medium">
                <span className="inline-flex flex-wrap items-center gap-2">
                  {user.name}
                  {user.mustChangePassword ? (
                    <Badge variant="warning">Temporary password</Badge>
                  ) : null}
                </span>
              </TableCell>
              <TableCell className="font-mono text-xs">{user.username}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>{ROLE_LABELS[user.role]}</TableCell>
              {showStatus ? (
                <TableCell>
                  <ActiveBadge active={user.active} />
                </TableCell>
              ) : null}
              <TableCell>
                <UserActionsMenu user={user} onEdit={onEdit} onResetPassword={onResetPassword} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
