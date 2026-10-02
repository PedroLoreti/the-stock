import { z } from "zod";

export const SKU_PATTERN = /^TS-\d+$/;

/**
 * Numeric inputs arrive as strings from the DOM. The schema's input type is
 * a string (what the form holds) and its output type is a number (what the
 * API receives), so forms use `z.input`/`z.output` for the two sides.
 */
const requiredNumber = (requiredMessage: string) =>
  z
    .string()
    .trim()
    .min(1, requiredMessage)
    .pipe(z.coerce.number({ error: "Must be a number" }));

const priceSchema = requiredNumber("Price is required").pipe(
  z
    .number()
    .positive("Price must be greater than zero")
    .multipleOf(0.01, "Price can have at most 2 decimal places"),
);

const quantitySchema = requiredNumber("Quantity is required").pipe(
  z.number().int("Quantity must be a whole number").min(0, "Quantity cannot be negative"),
);

/** Zero disables the low-stock alert until the product runs out. */
const minStockSchema = requiredNumber("Minimum stock is required").pipe(
  z.number().int("Minimum stock must be a whole number").min(0, "Minimum stock cannot be negative"),
);

export const createProductSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  brand: z.string().trim().min(1, "Brand is required"),
  description: z.string().trim(),
  sku: z
    .string()
    .trim()
    .toUpperCase()
    .regex(SKU_PATTERN, "SKU must follow the format TS-<number> (e.g. TS-1)"),
  price: priceSchema,
  quantity: quantitySchema,
  minStock: minStockSchema,
});
export type CreateProductFormInput = z.input<typeof createProductSchema>;
export type CreateProductFormOutput = z.output<typeof createProductSchema>;

export const updateProductSchema = createProductSchema.pick({
  name: true,
  brand: true,
  description: true,
  price: true,
  minStock: true,
});
export type UpdateProductFormInput = z.input<typeof updateProductSchema>;
export type UpdateProductFormOutput = z.output<typeof updateProductSchema>;

export const stockEntrySchema = z.object({
  quantity: requiredNumber("Quantity is required").pipe(
    z.number().int("Quantity must be a whole number").positive("Quantity must be greater than zero"),
  ),
});
export type StockEntryFormInput = z.input<typeof stockEntrySchema>;
export type StockEntryFormOutput = z.output<typeof stockEntrySchema>;
