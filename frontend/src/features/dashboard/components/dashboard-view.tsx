"use client";

import Link from "next/link";
import {
  ArrowUpRightIcon,
  BanknoteIcon,
  BoxesIcon,
  PackageIcon,
  ReceiptTextIcon,
  TrendingUpIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatDateTime } from "@/lib/format";
import type { Dashboard } from "../api";
import { StatCard } from "./stat-card";

function plural(count: number, singular: string, pluralForm = `${singular}s`): string {
  return `${count} ${count === 1 ? singular : pluralForm}`;
}

function initialsOf(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function ViewAllLink({ href, label = "View all" }: { href: string; label?: string }) {
  return (
    <Link href={href} className="inline-flex items-center gap-1 text-sm font-medium text-success hover:underline">
      {label}
      <ArrowUpRightIcon className="size-4" aria-hidden />
    </Link>
  );
}

export function DashboardView({ data }: { data: Dashboard }) {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Sales today"
          value={formatCurrency(data.today.revenue)}
          detail={plural(data.today.salesCount, "sale")}
          icon={BanknoteIcon}
        />
        <StatCard
          label="Last 7 days"
          value={formatCurrency(data.last7Days.revenue)}
          detail={plural(data.last7Days.salesCount, "sale")}
          icon={TrendingUpIcon}
        />
        <StatCard
          label="Average ticket (7 days)"
          value={formatCurrency(data.last7Days.averageTicket)}
          detail="Completed sales only"
          icon={ReceiptTextIcon}
        />
        {data.stock.inventoryValue !== null ? (
          <StatCard
            label="Inventory value"
            value={formatCurrency(data.stock.inventoryValue)}
            detail={plural(data.stock.activeProducts, "active product")}
            icon={BoxesIcon}
          />
        ) : (
          <StatCard
            label="Active products"
            value={data.stock.activeProducts}
            detail={plural(data.stock.lowStockCount, "stock alert")}
            icon={PackageIcon}
          />
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="px-5 py-5">
          <CardHeader className="px-0">
            <CardTitle className="flex items-center gap-2 text-base font-semibold">
              Stock alerts
              {data.stock.lowStockCount > 0 ? <Badge variant="destructive">{data.stock.lowStockCount}</Badge> : null}
            </CardTitle>
            <CardDescription>Products at or below their minimum stock.</CardDescription>
            <CardAction>
              <ViewAllLink href="/products" />
            </CardAction>
          </CardHeader>
          <CardContent className="px-0">
            {data.lowStockProducts.length === 0 ? (
              <p className="text-sm text-muted-foreground">Every product is above its minimum stock.</p>
            ) : (
              <ul className="flex flex-col">
                {data.lowStockProducts.map((product) => (
                  <li key={product.id} className="flex items-center justify-between gap-3 border-b py-3 last:border-b-0">
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted text-sm font-semibold text-muted-foreground">
                        {product.name[0]?.toUpperCase()}
                      </span>
                      <div className="min-w-0">
                        <Link href={`/products/${product.id}`} className="block truncate text-sm font-medium hover:underline">
                          {product.name}
                        </Link>
                        <div className="font-mono text-xs text-muted-foreground">{product.sku}</div>
                      </div>
                    </div>
                    <div className="shrink-0 text-right text-sm tabular-nums">
                      {product.quantity === 0 ? (
                        <Badge variant="destructive">Out of stock</Badge>
                      ) : (
                        <Badge variant="warning">
                          {product.quantity} / min {product.minStock}
                        </Badge>
                      )}
                    </div>
                  </li>
                ))}
                {data.stock.lowStockCount > data.lowStockProducts.length ? (
                  <li className="pt-3 text-xs text-muted-foreground">
                    And {data.stock.lowStockCount - data.lowStockProducts.length} more in products.
                  </li>
                ) : null}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card className="px-5 py-5">
          <CardHeader className="px-0">
            <CardTitle className="text-base font-semibold">Recent sales</CardTitle>
            <CardDescription>Latest activity</CardDescription>
            <CardAction>
              <ViewAllLink href="/sales" />
            </CardAction>
          </CardHeader>
          <CardContent className="px-0">
            {data.recentSales.length === 0 ? (
              <p className="text-sm text-muted-foreground">No sales yet.</p>
            ) : (
              <ul className="flex flex-col">
                {data.recentSales.map((sale) => (
                  <li key={sale.id} className="flex items-center justify-between gap-3 border-b py-3 last:border-b-0">
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted text-xs font-semibold text-muted-foreground">
                        {initialsOf(sale.userName)}
                      </span>
                      <div className="min-w-0">
                        <Link href={`/sales/${sale.id}`} className="block truncate text-sm font-medium hover:underline">
                          {sale.userName}
                        </Link>
                        <div className="truncate text-xs text-muted-foreground">
                          {formatDateTime(sale.createdAt)} · {plural(sale.itemCount, "item")}
                        </div>
                      </div>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-1">
                      <span className="text-sm font-semibold tabular-nums">{formatCurrency(sale.total)}</span>
                      {sale.status === "CANCELLED" ? (
                        <Badge variant="destructive">Cancelled</Badge>
                      ) : (
                        <Badge variant="success">Completed</Badge>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card className="px-5 py-5">
          <CardHeader className="px-0">
            <CardTitle className="text-base font-semibold">Top products</CardTitle>
            <CardDescription>By quantity sold in the last 7 days</CardDescription>
          </CardHeader>
          <CardContent className="px-0">
            {data.topProducts.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nothing sold in the last 7 days.</p>
            ) : (
              <ol className="flex flex-col">
                {data.topProducts.map((product, index) => (
                  <li key={product.productId} className="flex items-center justify-between gap-3 border-b py-3 last:border-b-0">
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground tabular-nums">
                        {index + 1}
                      </span>
                      <div className="min-w-0">
                        <Link href={`/products/${product.productId}`} className="block truncate text-sm font-medium hover:underline">
                          {product.name}
                        </Link>
                        <div className="font-mono text-xs text-muted-foreground">{product.sku}</div>
                      </div>
                    </div>
                    <div className="shrink-0 text-right tabular-nums">
                      <div className="text-sm font-semibold">{plural(product.quantitySold, "unit")}</div>
                      <div className="text-xs text-success">{formatCurrency(product.revenue)}</div>
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
