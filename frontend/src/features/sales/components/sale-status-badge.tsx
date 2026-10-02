import { Badge } from "@/components/ui/badge";
import type { SaleStatus } from "@/lib/api/types";

export function SaleStatusBadge({ status }: { status: SaleStatus }) {
  return status === "COMPLETED" ? (
    <Badge variant="success">Completed</Badge>
  ) : (
    <Badge variant="destructive">Cancelled</Badge>
  );
}
