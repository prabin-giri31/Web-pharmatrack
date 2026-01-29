import { z } from "zod";

export const registerSchema = z.object({
  company: z
    .string()
    .min(1, "Company name is required")
    .min(2, "Company name must be at least 2 characters"),

  email: z
    .string()
    .min(1, "Email is required")
    .email("Invalid email address"),

  phone: z
    .string()
    .min(1, "Phone number is required")
    .min(10, "Phone number must be at least 10 digits")
    .regex(/^[0-9]+$/, "Phone number must contain only numbers"),

  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(20, "Password must be at most 20 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(
      /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/,
      "Password must contain at least one special character"
    ),

  agreeTerms: z
    .boolean()
    .refine((val) => val === true, {
      message: "You must accept the terms & conditions",
    }),
});
