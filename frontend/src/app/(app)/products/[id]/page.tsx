"use client";

import { use, useState } from "react";
import Link from "next/link";
import { ArrowLeftIcon, PackagePlusIcon, PencilIcon } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { EmptyState, ListSkeleton, QueryError } from "@/components/layout/query-state";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MovementsTable } from "@/features/products/components/movements-table";
import { ActiveBadge, StockBadge } from "@/features/products/components/product-badges";
import { ProductFormDialog } from "@/features/products/components/product-form-dialog";
import { StockEntryDialog } from "@/features/products/components/stock-entry-dialog";
import { useProduct, useProductMovements } from "@/features/products/queries";
import type { Product } from "@/lib/api/types";
import { permissions } from "@/lib/auth/roles";
import { useSession } from "@/lib/auth/session-provider";
import { formatCurrency } from "@/lib/format";

export default function ProductDetailPage({ params }: PageProps<"/products/[id]">) {
  const { id } = use(params);
  const { user } = useSession();
  const canManage = user ? permissions.manageProducts(user.role) : false;

  const product = useProduct(id);
  const movements = useProductMovements(id);

  const [editing, setEditing] = useState(false);
  const [stockProduct, setStockProduct] = useState<Product | null>(null);

  if (product.isPending) return <ListSkeleton rows={4} />;
  if (product.isError) return <QueryError error={product.error} onRetry={() => product.refetch()} />;

  const data = product.data;

  return (
    <>
      <div>
        <Link href="/products" className={buttonVariants({ variant: "ghost", size: "sm" })}>
          <ArrowLeftIcon data-icon="inline-start" />
          Back to products
        </Link>
      </div>

      <PageHeader
        title={
          <span className="flex flex-wrap items-center gap-2">
            {data.name}
            <ActiveBadge active={data.active} />
            <StockBadge product={data} />
          </span>
        }
        description={<span className="font-mono">{data.sku}</span>}
        actions={
          canManage && data.active ? (
            <>
              <Button variant="outline" onClick={() => setEditing(true)}>
                <PencilIcon data-icon="inline-start" />
                Edit
              </Button>
              <Button onClick={() => setStockProduct(data)}>
                <PackagePlusIcon data-icon="inline-start" />
                Add stock
              </Button>
            </>
          ) : null
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader>
            <CardDescription>Price</CardDescription>
            <CardTitle className="text-2xl tabular-nums">{formatCurrency(data.price)}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>In stock</CardDescription>
            <CardTitle className="text-2xl tabular-nums">{data.quantity}</CardTitle>
            <CardDescription>
              {data.minStock > 0 ? `Alert at ${data.minStock} or less` : "Alert only when out of stock"}
            </CardDescription>
          </CardHeader>
        </Card>
        <Card className="sm:col-span-1">
          <CardHeader>
            <CardDescription>Description</CardDescription>
          </CardHeader>
          <CardContent className="text-sm">
            {data.description || <span className="text-muted-foreground">No description</span>}
          </CardContent>
        </Card>
      </div>

      <section className="flex flex-col gap-3">
        <h2 className="text-base font-semibold">Stock movements</h2>
        {movements.isPending ? (
          <ListSkeleton rows={3} />
        ) : movements.isError ? (
          <QueryError error={movements.error} onRetry={() => movements.refetch()} />
        ) : movements.data.length === 0 ? (
          <EmptyState title="No movements yet" description="Entries, sales and cancellations will show up here." />
        ) : (
          <MovementsTable movements={movements.data} />
        )}
      </section>

      <ProductFormDialog open={editing} product={data} onOpenChange={setEditing} />
      <StockEntryDialog product={stockProduct} onOpenChange={(open) => !open && setStockProduct(null)} />
    </>
  );
}
