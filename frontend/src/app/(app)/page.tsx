"use client";

import Link from "next/link";
import { ShoppingCartIcon } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { ListSkeleton, QueryError } from "@/components/layout/query-state";
import { buttonVariants } from "@/components/ui/button";
import { DashboardView } from "@/features/dashboard/components/dashboard-view";
import { useDashboard } from "@/features/dashboard/queries";
import { useSession } from "@/lib/auth/session-provider";
import { formatDateTime } from "@/lib/format";

export default function DashboardPage() {
  const { user } = useSession();
  const dashboard = useDashboard();

  return (
    <>
      <PageHeader
        title="Dashboard"
        description={
          dashboard.data
            ? `Hello, ${user?.name}. Updated ${formatDateTime(dashboard.data.generatedAt)}.`
            : `Hello, ${user?.name}.`
        }
        actions={
          <Link href="/sales/new" className={buttonVariants()}>
            <ShoppingCartIcon data-icon="inline-start" />
            New sale
          </Link>
        }
      />

      {dashboard.isPending ? (
        <ListSkeleton rows={6} />
      ) : dashboard.isError ? (
        <QueryError error={dashboard.error} onRetry={() => dashboard.refetch()} />
      ) : (
        <DashboardView data={dashboard.data} />
      )}
    </>
  );
}
