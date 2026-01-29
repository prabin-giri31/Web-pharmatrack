import { z } from "zod";

export const customerSchema = z.object({
  name: z
    .string()
    .min(1, "Customer name is required")
    .min(2, "Name must be at least 2 characters"),

  company: z
    .string()
    .optional(),

  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),

  phone: z
    .string()
    .optional()
    .refine((val) => !val || /^\d{10}$/.test(val), {
      message: "Mobile number must be exactly 10 digits",
    }),

  address: z
    .string()
    .optional(),

  status: z
    .enum(["active", "inactive", "overdue", "unpaid"])
    .default("active"),
});
