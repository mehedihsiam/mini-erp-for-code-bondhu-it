import { z } from "zod";

export const purchaseItemSchema = z.object({
  product_id: z.string().uuid("Please select a product"),
  quantity: z.number().int().min(1, "Quantity must be at least 1"),
  unit_price: z.number().min(0, "Price must be positive"),
});

export const purchaseSchema = z.object({
  supplier_id: z.string().uuid("Please select a supplier"),
  items: z.array(purchaseItemSchema).min(1, "At least one item is required"),
});

export type PurchaseItemFormValues = z.infer<typeof purchaseItemSchema>;
export type PurchaseFormValues = z.infer<typeof purchaseSchema>;
