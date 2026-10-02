"use client";

import { useState } from "react";
import { PlusIcon, SearchIcon } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Pagination } from "@/components/layout/pagination";
import { EmptyState, ListSkeleton, QueryError } from "@/components/layout/query-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ProductFormDialog } from "@/features/products/components/product-form-dialog";
import { ProductsTable } from "@/features/products/components/products-table";
import { StockEntryDialog } from "@/features/products/components/stock-entry-dialog";
import { useProducts } from "@/features/products/queries";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import type { Product } from "@/lib/api/types";
import { permissions } from "@/lib/auth/roles";
import { useSession } from "@/lib/auth/session-provider";

export default function ProductsPage() {
  const { user } = useSession();
  const canManage = user ? permissions.manageProducts(user.role) : false;
  const canViewInactive = user ? permissions.viewInactiveProducts(user.role) : false;

  const [includeInactive, setIncludeInactive] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [formState, setFormState] = useState<{ open: boolean; product?: Product }>({ open: false });
  const [stockProduct, setStockProduct] = useState<Product | null>(null);

  // Search and filters are applied by the API; typing is debounced to avoid a request per key.
  const debouncedSearch = useDebouncedValue(search.trim());
  const products = useProducts({
    page,
    search: debouncedSearch || undefined,
    includeInactive: includeInactive && canViewInactive,
  });

  const updateSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };
  const updateIncludeInactive = (value: boolean) => {
    setIncludeInactive(value);
    setPage(1);
  };

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
            placeholder="Search by name, brand or SKU"
            className="pl-8"
            value={search}
            onChange={(event) => updateSearch(event.target.value)}
            aria-label="Search products"
          />
        </div>
        {canViewInactive ? (
          <Label className="gap-2 font-normal">
            <input
              type="checkbox"
              className="size-4 accent-primary"
              checked={includeInactive}
              onChange={(event) => updateIncludeInactive(event.target.checked)}
            />
            Show inactive products
          </Label>
        ) : null}
      </div>

      {products.isPending ? (
        <ListSkeleton />
      ) : products.isError ? (
        <QueryError error={products.error} onRetry={() => products.refetch()} />
      ) : products.data.data.length === 0 ? (
        <EmptyState
          title={debouncedSearch ? "No products match your search" : "No products yet"}
          description={
            debouncedSearch
              ? "Try a different name or SKU."
              : canManage
                ? "Create the first product to get started."
                : undefined
          }
        />
      ) : (
        <>
          <ProductsTable
            products={products.data.data}
            showStatus={includeInactive}
            onEdit={(product) => setFormState({ open: true, product })}
            onAddStock={setStockProduct}
          />
          <Pagination meta={products.data.meta} onPageChange={setPage} isFetching={products.isFetching} />
        </>
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
