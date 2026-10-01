"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MinusIcon, PlusIcon, SearchIcon, ShoppingCartIcon, Trash2Icon } from "lucide-react";
import { toast } from "sonner";
import { FormError } from "@/components/form/form-error";
import { EmptyState, ListSkeleton, QueryError } from "@/components/layout/query-state";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { StockBadge } from "@/features/products/components/product-badges";
import { useProducts } from "@/features/products/queries";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import type { Product } from "@/lib/api/types";
import { formatCurrency } from "@/lib/format";
import { useCreateSale } from "../queries";

interface CartLine {
  product: Product;
  quantity: number;
}

/** How many matches the picker shows; the seller narrows the search for more. */
const PICKER_PAGE_SIZE = 20;

export function NewSaleForm() {
  const router = useRouter();
  const createSale = useCreateSale();

  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<CartLine[]>([]);

  const debouncedSearch = useDebouncedValue(search.trim());
  const products = useProducts({ page: 1, pageSize: PICKER_PAGE_SIZE, search: debouncedSearch || undefined });

  // Out-of-stock products cannot be sold, so they are left out of the picker.
  const available = (products.data?.data ?? []).filter((product) => product.quantity > 0);
  const hiddenMatches = products.data ? products.data.meta.total - products.data.data.length : 0;

  const total = cart.reduce((sum, line) => sum + line.product.price * line.quantity, 0);

  const setQuantity = (productId: string, quantity: number) => {
    setCart((lines) =>
      lines
        .map((line) => {
          if (line.product.id !== productId) return line;
          // Never exceed the stock we know about; the API re-checks on submit.
          return { ...line, quantity: Math.min(Math.max(quantity, 0), line.product.quantity) };
        })
        .filter((line) => line.quantity > 0),
    );
  };

  const addToCart = (product: Product) => {
    const existing = cart.find((line) => line.product.id === product.id);
    if (existing) {
      if (existing.quantity >= product.quantity) {
        toast.warning(`Only ${product.quantity} of "${product.name}" in stock`);
        return;
      }
      setQuantity(product.id, existing.quantity + 1);
    } else {
      setCart((lines) => [...lines, { product, quantity: 1 }]);
    }
  };

  const submit = () => {
    createSale.mutate(
      { items: cart.map((line) => ({ productId: line.product.id, quantity: line.quantity })) },
      {
        onSuccess: (sale) => {
          toast.success(`Sale completed: ${formatCurrency(sale.total)}`);
          router.push(`/sales/${sale.id}`);
        },
      },
    );
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
      <section className="flex flex-col gap-3">
        <div className="relative">
          <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search products by name or SKU"
            className="pl-8"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            aria-label="Search products"
            autoFocus
          />
        </div>

        {products.isPending ? (
          <ListSkeleton />
        ) : products.isError ? (
          <QueryError error={products.error} onRetry={() => products.refetch()} />
        ) : available.length === 0 ? (
          <EmptyState
            title={debouncedSearch ? "No products match your search" : "No products available"}
            description={debouncedSearch ? undefined : "Products need stock before they can be sold."}
          />
        ) : (
          <>
            <ul className="divide-y overflow-hidden rounded-xl border">
              {available.map((product) => {
                const inCart = cart.find((line) => line.product.id === product.id)?.quantity ?? 0;
                return (
                  <li key={product.id} className="flex items-center gap-3 p-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-medium">{product.name}</span>
                        <span className="font-mono text-xs text-muted-foreground">{product.sku}</span>
                        <StockBadge product={product} />
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {formatCurrency(product.price)} · {product.quantity} in stock
                      </div>
                    </div>
                    <Button
                      variant={inCart ? "secondary" : "outline"}
                      size="sm"
                      onClick={() => addToCart(product)}
                      disabled={inCart >= product.quantity}
                    >
                      <PlusIcon data-icon="inline-start" />
                      {inCart ? `Add (${inCart})` : "Add"}
                    </Button>
                  </li>
                );
              })}
            </ul>
            {hiddenMatches > 0 ? (
              <p className="text-xs text-muted-foreground">
                Showing the first {PICKER_PAGE_SIZE} matches. Refine the search to find the other {hiddenMatches}.
              </p>
            ) : null}
          </>
        )}
      </section>

      <Card className="h-fit lg:sticky lg:top-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCartIcon className="size-4" aria-hidden />
            Cart
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {cart.length === 0 ? (
            <p className="text-sm text-muted-foreground">Add products from the list to start a sale.</p>
          ) : (
            <ul className="flex flex-col gap-3">
              {cart.map((line) => (
                <li key={line.product.id} className="flex flex-col gap-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium">{line.product.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {formatCurrency(line.product.price)} each
                      </div>
                    </div>
                    <div className="text-sm font-medium tabular-nums">
                      {formatCurrency(line.product.price * line.quantity)}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="icon-sm"
                      aria-label={`Decrease ${line.product.name}`}
                      onClick={() => setQuantity(line.product.id, line.quantity - 1)}
                    >
                      <MinusIcon />
                    </Button>
                    <Input
                      type="number"
                      inputMode="numeric"
                      min={1}
                      max={line.product.quantity}
                      className="h-7 w-16 text-center"
                      aria-label={`Quantity of ${line.product.name}`}
                      value={line.quantity}
                      onChange={(event) => setQuantity(line.product.id, Number(event.target.value) || 0)}
                    />
                    <Button
                      variant="outline"
                      size="icon-sm"
                      aria-label={`Increase ${line.product.name}`}
                      onClick={() => setQuantity(line.product.id, line.quantity + 1)}
                      disabled={line.quantity >= line.product.quantity}
                    >
                      <PlusIcon />
                    </Button>
                    <span className="ml-1 text-xs text-muted-foreground">/ {line.product.quantity}</span>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className="ml-auto"
                      aria-label={`Remove ${line.product.name}`}
                      onClick={() => setQuantity(line.product.id, 0)}
                    >
                      <Trash2Icon />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}

          <Separator />
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Total</span>
            <span className="text-lg font-semibold tabular-nums">{formatCurrency(total)}</span>
          </div>
          <FormError error={createSale.error} />
          <Button className="w-full" disabled={cart.length === 0 || createSale.isPending} onClick={submit}>
            {createSale.isPending ? "Completing..." : "Complete sale"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
