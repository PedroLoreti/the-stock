"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { PlusIcon, SearchIcon } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { EmptyState, ListSkeleton, QueryError } from "@/components/layout/query-state";
import { PageSpinner } from "@/components/page-spinner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ResetPasswordDialog } from "@/features/users/components/reset-password-dialog";
import { UserFormDialog } from "@/features/users/components/user-form-dialog";
import { UsersTable } from "@/features/users/components/users-table";
import { useUsers } from "@/features/users/queries";
import type { User } from "@/lib/api/types";
import { permissions } from "@/lib/auth/roles";
import { useSession } from "@/lib/auth/session-provider";

export default function UsersPage() {
  const router = useRouter();
  const { user: currentUser } = useSession();
  const isAdmin = currentUser ? permissions.manageUsers(currentUser.role) : false;

  // The API rejects non-admins anyway; this just avoids showing a broken page.
  useEffect(() => {
    if (!isAdmin) router.replace("/");
  }, [isAdmin, router]);

  const [includeInactive, setIncludeInactive] = useState(false);
  const [search, setSearch] = useState("");
  const [formState, setFormState] = useState<{ open: boolean; user?: User }>({ open: false });
  const [resetUser, setResetUser] = useState<User | null>(null);

  const users = useUsers(includeInactive);

  const filtered = useMemo(() => {
    const list = users.data ?? [];
    const term = search.trim().toLowerCase();
    if (!term) return list;
    return list.filter(
      (user) =>
        user.name.toLowerCase().includes(term) ||
        user.username.includes(term) ||
        user.email.includes(term),
    );
  }, [users.data, search]);

  if (!isAdmin) return <PageSpinner />;

  return (
    <>
      <PageHeader
        title="Users"
        description="Accounts and roles. New users receive a temporary password."
        actions={
          <Button onClick={() => setFormState({ open: true })}>
            <PlusIcon data-icon="inline-start" />
            New user
          </Button>
        }
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative sm:max-w-xs sm:flex-1">
          <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search by name, username or email"
            className="pl-8"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            aria-label="Search users"
          />
        </div>
        <Label className="gap-2 font-normal">
          <input
            type="checkbox"
            className="size-4 accent-primary"
            checked={includeInactive}
            onChange={(event) => setIncludeInactive(event.target.checked)}
          />
          Show inactive users
        </Label>
      </div>

      {users.isPending ? (
        <ListSkeleton />
      ) : users.isError ? (
        <QueryError error={users.error} onRetry={() => users.refetch()} />
      ) : filtered.length === 0 ? (
        <EmptyState
          title={search ? "No users match your search" : "No users found"}
          description={search ? "Try a different name, username or email." : undefined}
        />
      ) : (
        <UsersTable
          users={filtered}
          showStatus={includeInactive}
          onEdit={(user) => setFormState({ open: true, user })}
          onResetPassword={setResetUser}
        />
      )}

      <UserFormDialog
        open={formState.open}
        user={formState.user}
        onOpenChange={(open) => setFormState((state) => ({ ...state, open }))}
      />
      <ResetPasswordDialog user={resetUser} onOpenChange={(open) => !open && setResetUser(null)} />
    </>
  );
}
