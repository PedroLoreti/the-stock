import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { StockMovement, StockMovementType } from "@/lib/api/types";
import { formatDateTime } from "@/lib/format";

const MOVEMENT_LABELS: Record<StockMovementType, { label: string; sign: "+" | "-" }> = {
  ENTRY: { label: "Entry", sign: "+" },
  SALE: { label: "Sale", sign: "-" },
  SALE_CANCELLATION: { label: "Sale cancelled", sign: "+" },
};

export function MovementsTable({ movements }: { movements: StockMovement[] }) {
  return (
    <div className="overflow-hidden rounded-xl border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Type</TableHead>
            <TableHead className="text-right">Quantity</TableHead>
            <TableHead>Sale</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {movements.map((movement) => {
            const { label, sign } = MOVEMENT_LABELS[movement.type];
            return (
              <TableRow key={movement.id}>
                <TableCell className="tabular-nums">{formatDateTime(movement.createdAt)}</TableCell>
                <TableCell>
                  <Badge variant={sign === "+" ? "secondary" : "outline"}>{label}</Badge>
                </TableCell>
                <TableCell className="text-right font-medium tabular-nums">
                  {sign}
                  {movement.quantity}
                </TableCell>
                <TableCell>
                  {movement.saleId ? (
                    <Link href={`/sales/${movement.saleId}`} className="font-mono text-xs hover:underline">
                      {movement.saleId.slice(0, 8)}
                    </Link>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
