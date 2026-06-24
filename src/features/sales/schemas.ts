import { z } from "zod";

export const saleItemSchema = z.object({
  product_id: z.string().uuid("Please select a product"),
  quantity: z.number().int().min(1, "Quantity must be at least 1"),
  unit_price: z.number().min(0, "Unit price must be positive"),
});

export const saleSchema = z.object({
  customer_id: z.string().uuid("Please select a customer"),
  items: z.array(saleItemSchema).min(1, "At least one item is required"),
});

export type SaleItemFormValues = z.infer<typeof saleItemSchema>;
export type SaleFormValues = z.infer<typeof saleSchema>;
