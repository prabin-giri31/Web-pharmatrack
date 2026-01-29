import { z } from "zod";

export const inventoryAdjustmentSchema = z.object({
  itemId: z
    .union([
      z.string().min(1, "Item is required"),
      z.number().min(1, "Item is required")
    ]),

  date: z
    .string()
    .min(1, "Date is required"),

  type: z
    .enum(["Increase", "Decrease"], {
      message: "Type is required",
    }),

  reason: z
    .string()
    .min(1, "Reason is required"),

  description: z
    .string()
    .optional(),

  reference: z
    .string()
    .optional(),

  quantity: z
    .string()
    .min(1, "Quantity is required")
    .refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
      message: "Quantity must be a positive number",
    }),

  createdBy: z
    .string()
    .optional(),
});
