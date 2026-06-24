import { z } from "zod";

export const supplierSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  phone: z.string().optional(),
  address: z.string().optional(),
});

export type SupplierFormValues = z.infer<typeof supplierSchema>;
