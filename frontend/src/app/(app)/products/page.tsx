"use client";

import { useMemo, useState } from "react";
import { PlusIcon, SearchIcon } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { EmptyState, ListSkeleton, QueryError } from "@/components/layout/query-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ProductFormDialog } from "@/features/products/components/product-form-dialog";
import { ProductsTable } from "@/features/products/components/products-table";
import { StockEntryDialog } from "@/features/products/components/stock-entry-dialog";
import { useProducts } from "@/features/products/queries";
import type { Product } from "@/lib/api/types";
import { permissions } from "@/lib/auth/roles";
import { useSession } from "@/lib/auth/session-provider";

export default function ProductsPage() {
  const { user } = useSession();
  const canManage = user ? permissions.manageProducts(user.role) : false;
  const canViewInactive = user ? permissions.viewInactiveProducts(user.role) : false;

  const [includeInactive, setIncludeInactive] = useState(false);
  const [search, setSearch] = useState("");
  const [formState, setFormState] = useState<{ open: boolean; product?: Product }>({ open: false });
  const [stockProduct, setStockProduct] = useState<Product | null>(null);

  const products = useProducts(includeInactive && canViewInactive);

  // The API has no search endpoint, so filtering happens on the loaded list.
  const filtered = useMemo(() => {
    const list = products.data ?? [];
    const term = search.trim().toLowerCase();
    if (!term) return list;
    return list.filter(
      (product) =>
        product.name.toLowerCase().includes(term) || product.sku.toLowerCase().includes(term),
    );
  }, [products.data, search]);

  return (
    <>
      <PageHeader
        title="Products"
        description="Catalogue and stock levels."
        actions={
          canManage ? (
            <Button onClick={() => setFormState({ open: true })}>
              <PlusIcon data-icon="inline-start" />
              New product
            </Button>
          ) : null
        }
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative sm:max-w-xs sm:flex-1">
          <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search by name or SKU"
            className="pl-8"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            aria-label="Search products"
          />
        </div>
        {canViewInactive ? (
          <Label className="gap-2 font-normal">
            <input
              type="checkbox"
              className="size-4 accent-primary"
              checked={includeInactive}
              onChange={(event) => setIncludeInactive(event.target.checked)}
            />
            Show inactive products
          </Label>
        ) : null}
      </div>

      {products.isPending ? (
        <ListSkeleton />
      ) : products.isError ? (
        <QueryError error={products.error} onRetry={() => products.refetch()} />
      ) : filtered.length === 0 ? (
        <EmptyState
          title={search ? "No products match your search" : "No products yet"}
          description={search ? "Try a different name or SKU." : canManage ? "Create the first product to get started." : undefined}
        />
      ) : (
        <ProductsTable
          products={filtered}
          showStatus={includeInactive}
          onEdit={(product) => setFormState({ open: true, product })}
          onAddStock={setStockProduct}
        />
      )}

      <ProductFormDialog
        open={formState.open}
        product={formState.product}
        onOpenChange={(open) => setFormState((state) => ({ ...state, open }))}
      />
      <StockEntryDialog product={stockProduct} onOpenChange={(open) => !open && setStockProduct(null)} />
    </>
  );
}
