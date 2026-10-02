import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Sale } from "@/lib/api/types";
import { formatCurrency, formatDateTime } from "@/lib/format";
import { SaleStatusBadge } from "./sale-status-badge";

export function SalesTable({ sales }: { sales: Sale[] }) {
  return (
    <div className="overflow-hidden rounded-xl border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Sale</TableHead>
            <TableHead>Seller</TableHead>
            <TableHead className="text-right">Items</TableHead>
            <TableHead className="text-right">Total</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sales.map((sale) => {
            const itemCount = sale.items.reduce((sum, item) => sum + item.quantity, 0);
            return (
              <TableRow key={sale.id} className={sale.status === "CANCELLED" ? "text-muted-foreground" : undefined}>
                <TableCell className="tabular-nums">{formatDateTime(sale.createdAt)}</TableCell>
                <TableCell>
                  <Link href={`/sales/${sale.id}`} className="font-mono text-xs font-medium hover:underline">
                    {sale.id.slice(0, 8)}
                  </Link>
                </TableCell>
                <TableCell>{sale.userName}</TableCell>
                <TableCell className="text-right tabular-nums">{itemCount}</TableCell>
                <TableCell className="text-right font-medium tabular-nums">{formatCurrency(sale.total)}</TableCell>
                <TableCell>
                  <SaleStatusBadge status={sale.status} />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
