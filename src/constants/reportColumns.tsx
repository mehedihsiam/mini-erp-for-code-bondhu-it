import { format } from "date-fns";
import type { ColumnDef } from "@/components/shared/DataTable";
import type {
  SaleReportRow,
  PurchaseReportRow,
  StockReportRow,
  CustomerReportRow,
  SupplierReportRow,
} from "@/types/reports";

export const salesColumns: ColumnDef<SaleReportRow>[] = [
  { header: "ID", cell: (item) => item.id.slice(0, 8) },
  {
    header: "Date",
    cell: (item) => format(new Date(item.created_at), "PPP"),
  },
  { header: "Customer", cell: (item) => item.customers?.name || "Unknown" },
  { header: "Amount", cell: (item) => `$${item.total_amount.toFixed(2)}` },
];

export const purchasesColumns: ColumnDef<PurchaseReportRow>[] = [
  { header: "ID", cell: (item) => item.id.slice(0, 8) },
  {
    header: "Date",
    cell: (item) => format(new Date(item.created_at), "PPP"),
  },
  { header: "Supplier", cell: (item) => item.suppliers?.name || "Unknown" },
  { header: "Amount", cell: (item) => `$${item.total_amount.toFixed(2)}` },
];

export const stockColumns: ColumnDef<StockReportRow>[] = [
  { header: "SKU", cell: (item) => item.sku },
  { header: "Product", cell: (item) => item.name },
  {
    header: "Stock Qty",
    cell: (item) => (
      <span
        className={
          item.stock_quantity < 10
            ? "text-destructive font-bold"
            : "text-green-600 font-bold"
        }
      >
        {item.stock_quantity}
      </span>
    ),
  },
  { header: "Unit Price", cell: (item) => `$${item.price.toFixed(2)}` },
  {
    header: "Total Value",
    cell: (item) => `$${(item.price * item.stock_quantity).toFixed(2)}`,
  },
];

export const customerColumns: ColumnDef<CustomerReportRow>[] = [
  { header: "Name", accessorKey: "name" },
  { header: "Email", cell: (item) => item.email || "N/A" },
  { header: "Phone", cell: (item) => item.phone || "N/A" },
  {
    header: "Joined",
    cell: (item) => format(new Date(item.created_at), "PPP"),
  },
];

export const supplierColumns: ColumnDef<SupplierReportRow>[] = [
  { header: "Name", accessorKey: "name" },
  { header: "Email", cell: (item) => item.email || "N/A" },
  { header: "Phone", cell: (item) => item.phone || "N/A" },
  {
    header: "Joined",
    cell: (item) => format(new Date(item.created_at), "PPP"),
  },
];
