"use client";

import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Product } from "@/lib/api/types";
import { formatCurrency } from "@/lib/format";
import { ActiveBadge, StockBadge } from "./product-badges";
import { ProductActionsMenu } from "./product-actions-menu";

interface ProductsTableProps {
  products: Product[];
  showStatus: boolean;
  onEdit: (product: Product) => void;
  onAddStock: (product: Product) => void;
}

export function ProductsTable({ products, showStatus, onEdit, onAddStock }: ProductsTableProps) {
  return (
    <div className="overflow-hidden rounded-xl border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>SKU</TableHead>
            <TableHead>Name</TableHead>
            <TableHead className="text-right">Price</TableHead>
            <TableHead className="text-right">Quantity</TableHead>
            {showStatus ? <TableHead>Status</TableHead> : null}
            <TableHead className="w-12" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => (
            <TableRow key={product.id} className={product.active ? undefined : "text-muted-foreground"}>
              <TableCell className="font-mono text-xs">{product.sku}</TableCell>
              <TableCell>
                <Link href={`/products/${product.id}`} className="font-medium hover:underline">
                  {product.name}
                </Link>
                {product.description ? (
                  <p className="line-clamp-1 text-xs text-muted-foreground">{product.description}</p>
                ) : null}
              </TableCell>
              <TableCell className="text-right tabular-nums">{formatCurrency(product.price)}</TableCell>
              <TableCell className="text-right">
                <span className="inline-flex items-center justify-end gap-2 tabular-nums">
                  <StockBadge product={product} />
                  {product.quantity}
                </span>
              </TableCell>
              {showStatus ? (
                <TableCell>
                  <ActiveBadge active={product.active} />
                </TableCell>
              ) : null}
              <TableCell>
                <ProductActionsMenu product={product} onEdit={onEdit} onAddStock={onAddStock} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
