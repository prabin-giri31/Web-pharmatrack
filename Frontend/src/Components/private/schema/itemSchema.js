import { z } from "zod";

export const itemSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .min(2, "Name must be at least 2 characters"),

  sku: z
    .string()
    .optional(),

  unit: z
    .string()
    .min(1, "Unit is required"),

  category: z
    .string()
    .optional(),

  returnable: z
    .boolean()
    .default(true),

  sellingPrice: z
    .string()
    .min(1, "Selling price is required")
    .refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
      message: "Selling price must be a valid positive number",
    }),

  costPrice: z
    .string()
    .min(1, "Cost price is required")
    .refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
      message: "Cost price must be a valid positive number",
    }),

  stockOnHand: z
    .string()
    .optional()
    .refine((val) => !val || (!isNaN(Number(val)) && Number(val) >= 0), {
      message: "Stock must be a valid positive number",
    }),

  reorderLevel: z
    .string()
    .optional()
    .refine((val) => !val || (!isNaN(Number(val)) && Number(val) >= 0), {
      message: "Reorder level must be a valid positive number",
    }),

  description: z
    .string()
    .optional(),
});
