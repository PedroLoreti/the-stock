"use client";

import { ArchiveRestoreIcon, MoreHorizontalIcon, PackagePlusIcon, PencilIcon, Trash2Icon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getErrorMessage } from "@/lib/api/errors";
import type { Product } from "@/lib/api/types";
import { permissions } from "@/lib/auth/roles";
import { useSession } from "@/lib/auth/session-provider";
import { useDeactivateProduct, useRestoreProduct } from "../queries";

interface ProductActionsMenuProps {
  product: Product;
  onEdit: (product: Product) => void;
  onAddStock: (product: Product) => void;
}

/**
 * Per-product actions, filtered by role. Returns null for sellers, who can
 * only read products.
 */
export function ProductActionsMenu({ product, onEdit, onAddStock }: ProductActionsMenuProps) {
  const { user } = useSession();
  const deactivate = useDeactivateProduct();
  const restore = useRestoreProduct();

  if (!user || !permissions.manageProducts(user.role)) return null;

  const handleDeactivate = () => {
    if (!window.confirm(`Deactivate "${product.name}"? It will no longer be available for sale.`)) return;
    deactivate.mutate(product.id, {
      onSuccess: () => toast.success(`Product "${product.name}" deactivated`),
      onError: (error) => toast.error(getErrorMessage(error)),
    });
  };

  const handleRestore = () => {
    restore.mutate(product.id, {
      onSuccess: () => toast.success(`Product "${product.name}" restored`),
      onError: (error) => toast.error(getErrorMessage(error)),
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="ghost" size="icon-sm" aria-label={`Actions for ${product.name}`}>
            <MoreHorizontalIcon />
          </Button>
        }
      />
      <DropdownMenuContent align="end">
        {product.active ? (
          <>
            <DropdownMenuItem onClick={() => onEdit(product)}>
              <PencilIcon aria-hidden />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onAddStock(product)}>
              <PackagePlusIcon aria-hidden />
              Add stock
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" onClick={handleDeactivate}>
              <Trash2Icon aria-hidden />
              Deactivate
            </DropdownMenuItem>
          </>
        ) : permissions.restoreProducts(user.role) ? (
          <DropdownMenuItem onClick={handleRestore}>
            <ArchiveRestoreIcon aria-hidden />
            Restore
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem disabled>Only administrators can restore</DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
