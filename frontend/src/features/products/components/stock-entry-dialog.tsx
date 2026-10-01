"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { FormError } from "@/components/form/form-error";
import { TextField } from "@/components/form/text-field";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FieldGroup } from "@/components/ui/field";
import type { Product } from "@/lib/api/types";
import { useRegisterStockEntry } from "../queries";
import { stockEntrySchema, type StockEntryFormInput, type StockEntryFormOutput } from "../schemas";

interface StockEntryDialogProps {
  product: Product | null;
  onOpenChange: (open: boolean) => void;
}

/** Registers a stock entry (restock) for the given product. Open while `product` is set. */
export function StockEntryDialog({ product, onOpenChange }: StockEntryDialogProps) {
  return (
    <Dialog open={product !== null} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        {product ? <StockEntryForm product={product} onDone={() => onOpenChange(false)} /> : null}
      </DialogContent>
    </Dialog>
  );
}

function StockEntryForm({ product, onDone }: { product: Product; onDone: () => void }) {
  const registerEntry = useRegisterStockEntry();
  const form = useForm<StockEntryFormInput, unknown, StockEntryFormOutput>({
    resolver: zodResolver(stockEntrySchema),
    defaultValues: { quantity: "" },
  });

  const onSubmit = ({ quantity }: StockEntryFormOutput) => {
    registerEntry.mutate(
      { id: product.id, quantity },
      {
        onSuccess: (updated) => {
          toast.success(`Stock of "${updated.name}" is now ${updated.quantity}`);
          onDone();
        },
      },
    );
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
      <DialogHeader>
        <DialogTitle>Add stock</DialogTitle>
        <DialogDescription>
          {product.name} ({product.sku}) currently has {product.quantity} in stock.
        </DialogDescription>
      </DialogHeader>
      <FieldGroup className="my-4">
        <TextField
          control={form.control}
          name="quantity"
          label="Quantity to add"
          type="number"
          inputMode="numeric"
          step="1"
          min="1"
          autoFocus
        />
        <FormError error={registerEntry.error} />
      </FieldGroup>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onDone}>
          Cancel
        </Button>
        <Button type="submit" disabled={registerEntry.isPending}>
          {registerEntry.isPending ? "Saving..." : "Add stock"}
        </Button>
      </DialogFooter>
    </form>
  );
}
