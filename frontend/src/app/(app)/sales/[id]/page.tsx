"use client";

import { use } from "react";
import Link from "next/link";
import { ArrowLeftIcon } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { ListSkeleton, QueryError } from "@/components/layout/query-state";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CancelSaleButton } from "@/features/sales/components/cancel-sale-button";
import { SaleStatusBadge } from "@/features/sales/components/sale-status-badge";
import { useSale } from "@/features/sales/queries";
import { formatCurrency, formatDateTime } from "@/lib/format";

export default function SaleDetailPage({ params }: PageProps<"/sales/[id]">) {
  const { id } = use(params);
  const sale = useSale(id);

  if (sale.isPending) return <ListSkeleton rows={4} />;
  if (sale.isError) return <QueryError error={sale.error} onRetry={() => sale.refetch()} />;

  const data = sale.data;

  return (
    <>
      <div>
        <Link href="/sales" className={buttonVariants({ variant: "ghost", size: "sm" })}>
          <ArrowLeftIcon data-icon="inline-start" />
          Back to sales
        </Link>
      </div>

      <PageHeader
        title={
          <span className="flex flex-wrap items-center gap-2">
            Sale <span className="font-mono">{data.id.slice(0, 8)}</span>
            <SaleStatusBadge status={data.status} />
          </span>
        }
        description={
          data.status === "CANCELLED" && data.cancelledAt
            ? `Cancelled on ${formatDateTime(data.cancelledAt)}`
            : `Registered on ${formatDateTime(data.createdAt)}`
        }
        actions={<CancelSaleButton sale={data} />}
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader>
            <CardDescription>Total</CardDescription>
            <CardTitle className="text-2xl tabular-nums">{formatCurrency(data.total)}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Seller</CardDescription>
            <CardTitle className="text-2xl">{data.userName}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Date</CardDescription>
            <CardTitle className="text-2xl tabular-nums">{formatDateTime(data.createdAt)}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <section className="flex flex-col gap-3">
        <h2 className="text-base font-semibold">Items</h2>
        <div className="overflow-hidden rounded-xl border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead className="text-right">Quantity</TableHead>
                <TableHead className="text-right">Unit price</TableHead>
                <TableHead className="text-right">Subtotal</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <Link href={`/products/${item.productId}`} className="font-medium hover:underline">
                      {item.productName}
                    </Link>
                    <span className="ml-2 font-mono text-xs text-muted-foreground">{item.productSku}</span>
                  </TableCell>
                  <TableCell className="text-right tabular-nums">{item.quantity}</TableCell>
                  <TableCell className="text-right tabular-nums">{formatCurrency(item.unitPrice)}</TableCell>
                  <TableCell className="text-right font-medium tabular-nums">{formatCurrency(item.subtotal)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell colSpan={3}>Total</TableCell>
                <TableCell className="text-right font-semibold tabular-nums">{formatCurrency(data.total)}</TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </div>
      </section>
    </>
  );
}
