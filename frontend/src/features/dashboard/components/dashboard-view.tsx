"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SaleStatusBadge } from "@/features/sales/components/sale-status-badge";
import { formatCurrency, formatDateTime } from "@/lib/format";
import type { Dashboard } from "../api";
import { StatCard } from "./stat-card";

function plural(count: number, singular: string, pluralForm = `${singular}s`): string {
  return `${count} ${count === 1 ? singular : pluralForm}`;
}

export function DashboardView({ data }: { data: Dashboard }) {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Sales today"
          value={formatCurrency(data.today.revenue)}
          detail={plural(data.today.salesCount, "sale")}
        />
        <StatCard
          label="Sales in the last 7 days"
          value={formatCurrency(data.last7Days.revenue)}
          detail={plural(data.last7Days.salesCount, "sale")}
        />
        <StatCard
          label="Average ticket (7 days)"
          value={formatCurrency(data.last7Days.averageTicket)}
          detail="Completed sales only"
        />
        {data.stock.inventoryValue !== null ? (
          <StatCard
            label="Inventory value"
            value={formatCurrency(data.stock.inventoryValue)}
            detail={plural(data.stock.activeProducts, "active product")}
          />
        ) : (
          <StatCard
            label="Active products"
            value={data.stock.activeProducts}
            detail={plural(data.stock.lowStockCount, "stock alert")}
          />
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Stock alerts
              {data.stock.lowStockCount > 0 ? (
                <Badge variant="destructive">{data.stock.lowStockCount}</Badge>
              ) : null}
            </CardTitle>
            <CardDescription>Products at or below their minimum stock.</CardDescription>
          </CardHeader>
          <CardContent>
            {data.lowStockProducts.length === 0 ? (
              <p className="text-sm text-muted-foreground">Every product is above its minimum stock.</p>
            ) : (
              <ul className="divide-y">
                {data.lowStockProducts.map((product) => (
                  <li key={product.id} className="flex items-center justify-between gap-3 py-2 text-sm">
                    <div className="min-w-0">
                      <Link href={`/products/${product.id}`} className="font-medium hover:underline">
                        {product.name}
                      </Link>
                      <div className="font-mono text-xs text-muted-foreground">{product.sku}</div>
                    </div>
                    <div className="shrink-0 text-right tabular-nums">
                      {product.quantity === 0 ? (
                        <Badge variant="destructive">Out of stock</Badge>
                      ) : (
                        <span>
                          <span className="font-medium">{product.quantity}</span>
                          <span className="text-muted-foreground"> / min {product.minStock}</span>
                        </span>
                      )}
                    </div>
                  </li>
                ))}
                {data.stock.lowStockCount > data.lowStockProducts.length ? (
                  <li className="pt-2 text-xs text-muted-foreground">
                    And {data.stock.lowStockCount - data.lowStockProducts.length} more in{" "}
                    <Link href="/products" className="underline">
                      products
                    </Link>
                    .
                  </li>
                ) : null}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent sales</CardTitle>
            <CardDescription>The latest sales registered.</CardDescription>
          </CardHeader>
          <CardContent>
            {data.recentSales.length === 0 ? (
              <p className="text-sm text-muted-foreground">No sales yet.</p>
            ) : (
              <ul className="divide-y">
                {data.recentSales.map((sale) => (
                  <li key={sale.id} className="flex items-center justify-between gap-3 py-2 text-sm">
                    <div className="min-w-0">
                      <Link href={`/sales/${sale.id}`} className="font-medium hover:underline">
                        {formatDateTime(sale.createdAt)}
                      </Link>
                      <div className="truncate text-xs text-muted-foreground">
                        {sale.userName} · {plural(sale.itemCount, "item")}
                      </div>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-1">
                      <span className="font-medium tabular-nums">{formatCurrency(sale.total)}</span>
                      {sale.status === "CANCELLED" ? <SaleStatusBadge status={sale.status} /> : null}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top products (7 days)</CardTitle>
            <CardDescription>By quantity sold in completed sales.</CardDescription>
          </CardHeader>
          <CardContent>
            {data.topProducts.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nothing sold in the last 7 days.</p>
            ) : (
              <ol className="divide-y">
                {data.topProducts.map((product, index) => (
                  <li key={product.productId} className="flex items-center justify-between gap-3 py-2 text-sm">
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="w-4 shrink-0 text-right text-xs text-muted-foreground tabular-nums">
                        {index + 1}
                      </span>
                      <div className="min-w-0">
                        <Link href={`/products/${product.productId}`} className="font-medium hover:underline">
                          {product.name}
                        </Link>
                        <div className="font-mono text-xs text-muted-foreground">{product.sku}</div>
                      </div>
                    </div>
                    <div className="shrink-0 text-right tabular-nums">
                      <div className="font-medium">{plural(product.quantitySold, "unit")}</div>
                      <div className="text-xs text-muted-foreground">{formatCurrency(product.revenue)}</div>
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
