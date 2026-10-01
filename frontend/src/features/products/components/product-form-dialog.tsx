"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { FormError } from "@/components/form/form-error";
import { TextField } from "@/components/form/text-field";
import { TextareaField } from "@/components/form/textarea-field";
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
import { useCreateProduct, useUpdateProduct } from "../queries";
import {
  createProductSchema,
  updateProductSchema,
  type CreateProductFormInput,
  type CreateProductFormOutput,
  type UpdateProductFormInput,
  type UpdateProductFormOutput,
} from "../schemas";

interface ProductFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** When provided the dialog edits this product; otherwise it creates a new one. */
  product?: Product;
}

export function ProductFormDialog({ open, onOpenChange, product }: ProductFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        {product ? (
          <EditProductForm product={product} onDone={() => onOpenChange(false)} />
        ) : (
          <CreateProductForm onDone={() => onOpenChange(false)} />
        )}
      </DialogContent>
    </Dialog>
  );
}

function CreateProductForm({ onDone }: { onDone: () => void }) {
  const create = useCreateProduct();
  const form = useForm<CreateProductFormInput, unknown, CreateProductFormOutput>({
    resolver: zodResolver(createProductSchema),
    defaultValues: { name: "", description: "", sku: "", price: "", quantity: "", minStock: "0" },
  });

  const onSubmit = (values: CreateProductFormOutput) => {
    create.mutate(values, {
      onSuccess: (created) => {
        toast.success(`Product "${created.name}" created`);
        onDone();
      },
    });
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
      <DialogHeader>
        <DialogTitle>New product</DialogTitle>
        <DialogDescription>The initial quantity becomes the first stock entry.</DialogDescription>
      </DialogHeader>
      <FieldGroup className="my-4">
        <TextField control={form.control} name="name" label="Name" autoFocus />
        <TextField
          control={form.control}
          name="sku"
          label="SKU"
          placeholder="TS-1"
          description="Format: TS-<number>"
        />
        <TextareaField control={form.control} name="description" label="Description" rows={2} />
        <div className="grid grid-cols-2 gap-4">
          <TextField
            control={form.control}
            name="price"
            label="Price"
            type="number"
            inputMode="decimal"
            step="0.01"
            min="0"
          />
          <TextField
            control={form.control}
            name="quantity"
            label="Initial quantity"
            type="number"
            inputMode="numeric"
            step="1"
            min="0"
          />
        </div>
        <TextField
          control={form.control}
          name="minStock"
          label="Minimum stock"
          type="number"
          inputMode="numeric"
          step="1"
          min="0"
          description="Alerts when the quantity reaches this value. Zero alerts only when out of stock."
        />
        <FormError error={create.error} />
      </FieldGroup>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onDone}>
          Cancel
        </Button>
        <Button type="submit" disabled={create.isPending}>
          {create.isPending ? "Creating..." : "Create product"}
        </Button>
      </DialogFooter>
    </form>
  );
}

function EditProductForm({ product, onDone }: { product: Product; onDone: () => void }) {
  const update = useUpdateProduct();
  const form = useForm<UpdateProductFormInput, unknown, UpdateProductFormOutput>({
    resolver: zodResolver(updateProductSchema),
    defaultValues: {
      name: product.name,
      description: product.description,
      price: String(product.price),
      minStock: String(product.minStock),
    },
  });

  // Keep the form in sync if the dialog is reused for another product.
  useEffect(() => {
    form.reset({
      name: product.name,
      description: product.description,
      price: String(product.price),
      minStock: String(product.minStock),
    });
  }, [product, form]);

  const onSubmit = (values: UpdateProductFormOutput) => {
    update.mutate(
      { id: product.id, ...values },
      {
        onSuccess: (updated) => {
          toast.success(`Product "${updated.name}" updated`);
          onDone();
        },
      },
    );
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
      <DialogHeader>
        <DialogTitle>Edit product</DialogTitle>
        <DialogDescription>
          SKU {product.sku}. Stock is changed through entries and sales, not here.
        </DialogDescription>
      </DialogHeader>
      <FieldGroup className="my-4">
        <TextField control={form.control} name="name" label="Name" autoFocus />
        <TextareaField control={form.control} name="description" label="Description" rows={2} />
        <TextField
          control={form.control}
          name="price"
          label="Price"
          type="number"
          inputMode="decimal"
          step="0.01"
          min="0"
        />
        <TextField
          control={form.control}
          name="minStock"
          label="Minimum stock"
          type="number"
          inputMode="numeric"
          step="1"
          min="0"
          description="Alerts when the quantity reaches this value. Zero alerts only when out of stock."
        />
        <FormError error={update.error} />
      </FieldGroup>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onDone}>
          Cancel
        </Button>
        <Button type="submit" disabled={update.isPending}>
          {update.isPending ? "Saving..." : "Save changes"}
        </Button>
      </DialogFooter>
    </form>
  );
}
