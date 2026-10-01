import { Badge } from "@/components/ui/badge";
import type { Product } from "@/lib/api/types";
import { LOW_STOCK_THRESHOLD } from "../schemas";

export function StockBadge({ product }: { product: Product }) {
  if (product.quantity === 0) {
    return <Badge variant="destructive">Out of stock</Badge>;
  }
  if (product.quantity <= LOW_STOCK_THRESHOLD) {
    return <Badge variant="outline" className="border-amber-500/50 text-amber-700 dark:text-amber-400">Low stock</Badge>;
  }
  return null;
}

export function ActiveBadge({ active }: { active: boolean }) {
  return active ? (
    <Badge variant="secondary">Active</Badge>
  ) : (
    <Badge variant="outline" className="text-muted-foreground">Inactive</Badge>
  );
}
