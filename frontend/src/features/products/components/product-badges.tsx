import { Badge } from "@/components/ui/badge";
import type { Product } from "@/lib/api/types";

/** Uses the API's `lowStock` flag (quantity <= minStock), so the rule lives in one place. */
export function StockBadge({ product }: { product: Product }) {
  if (product.quantity === 0) {
    return <Badge variant="destructive">Out of stock</Badge>;
  }
  if (product.lowStock) {
    return <Badge variant="warning">Low stock</Badge>;
  }
  return null;
}

export function ActiveBadge({ active }: { active: boolean }) {
  return active ? (
    <Badge variant="success">Active</Badge>
  ) : (
    <Badge variant="outline" className="text-muted-foreground">Inactive</Badge>
  );
}
