"use client";

import { useState } from "react";
import Link from "next/link";
import { PlusIcon } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Pagination } from "@/components/layout/pagination";
import { EmptyState, ListSkeleton, QueryError } from "@/components/layout/query-state";
import { buttonVariants } from "@/components/ui/button";
import { SalesTable } from "@/features/sales/components/sales-table";
import { useSales } from "@/features/sales/queries";

export default function SalesPage() {
  const [page, setPage] = useState(1);
  const sales = useSales({ page });

  return (
    <>
      <PageHeader
        title="Sales"
        description="Completed and cancelled sales, most recent first."
        actions={
          <Link href="/sales/new" className={buttonVariants()}>
            <PlusIcon data-icon="inline-start" />
            New sale
          </Link>
        }
      />

      {sales.isPending ? (
        <ListSkeleton />
      ) : sales.isError ? (
        <QueryError error={sales.error} onRetry={() => sales.refetch()} />
      ) : sales.data.data.length === 0 ? (
        <EmptyState
          title="No sales yet"
          description="Register the first sale to see it here."
          action={<Link href="/sales/new" className={buttonVariants()}>New sale</Link>}
        />
      ) : (
        <>
          <SalesTable sales={sales.data.data} />
          <Pagination meta={sales.data.meta} onPageChange={setPage} isFetching={sales.isFetching} />
        </>
      )}
    </>
  );
}
