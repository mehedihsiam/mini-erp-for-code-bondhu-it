import type { Database } from "@/types/supabase";

export type SaleReportRow = Database["public"]["Tables"]["sales"]["Row"] & {
  customers: { name: string } | null;
};
export type PurchaseReportRow = Database["public"]["Tables"]["purchases"]["Row"] & {
  suppliers: { name: string } | null;
};
export type StockReportRow = Pick<
  Database["public"]["Tables"]["products"]["Row"],
  "id" | "name" | "sku" | "stock_quantity" | "price"
>;
export type CustomerReportRow = Pick<
  Database["public"]["Tables"]["customers"]["Row"],
  "id" | "name" | "email" | "phone" | "created_at"
>;
export type SupplierReportRow = Pick<
  Database["public"]["Tables"]["suppliers"]["Row"],
  "id" | "name" | "email" | "phone" | "created_at"
>;
