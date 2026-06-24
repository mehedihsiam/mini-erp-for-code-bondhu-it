import { useState, useCallback, useMemo } from "react";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { DataTable, type ColumnDef } from "@/components/shared/DataTable";
import { format } from "date-fns";
import type { Database } from "@/types/supabase";

type SaleReportRow = Database["public"]["Tables"]["sales"]["Row"] & {
  customers: { name: string } | null;
};

type PurchaseReportRow = Database["public"]["Tables"]["purchases"]["Row"] & {
  suppliers: { name: string } | null;
};

type StockReportRow = Pick<
  Database["public"]["Tables"]["products"]["Row"],
  "id" | "name" | "sku" | "stock_quantity" | "price"
>;

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

export function ReportsOverviewPage() {
  useDocumentTitle("Reports");
  const [activeTab, setActiveTab] = useState("sales");

  // Fetch Sales
  const { data: sales, isLoading: isLoadingSales } = useQuery({
    queryKey: ["reports-sales"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sales")
        .select(`*, customers(name)`)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  // Fetch Purchases
  const { data: purchases, isLoading: isLoadingPurchases } = useQuery({
    queryKey: ["reports-purchases"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("purchases")
        .select(`*, suppliers(name)`)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  // Fetch Stock
  const { data: stock, isLoading: isLoadingStock } = useQuery({
    queryKey: ["reports-stock"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select(`id, name, sku, stock_quantity, price`)
        .order("name", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  const handleExportCSV = useCallback(<T extends Record<string, unknown>>(data: T[], filename: string) => {
    if (!data || data.length === 0) return;
    
    // Extract headers
    const headers = Object.keys(data[0]).filter(key => typeof data[0][key] !== 'object');
    // For nested objects like customers/suppliers, we add them manually
    if (data[0].customers) headers.push("customer_name");
    if (data[0].suppliers) headers.push("supplier_name");

    const csvContent = [
      headers.join(","),
      ...data.map((row) =>
        headers
          .map((header) => {
            const r = row as Record<string, unknown>;
            if (header === "customer_name") {
              const cust = r.customers as { name?: string } | undefined;
              return `"${cust?.name || ""}"`;
            }
            if (header === "supplier_name") {
              const supp = r.suppliers as { name?: string } | undefined;
              return `"${supp?.name || ""}"`;
            }
            const val = row[header as keyof T];
            return `"${val ?? ""}"`;
          })
          .join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `${filename}_${format(new Date(), "yyyyMMdd")}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, []);

  const handleExportClicked = useCallback(() => {
    if (activeTab === "sales") handleExportCSV(sales || [], "sales_report");
    if (activeTab === "purchases") handleExportCSV(purchases || [], "purchases_report");
    if (activeTab === "stock") handleExportCSV(stock || [], "stock_report");
  }, [activeTab, sales, purchases, stock, handleExportCSV]);

  const salesColumns = useMemo<ColumnDef<SaleReportRow>[]>(() => [
    { header: "ID", cell: (item) => item.id.slice(0, 8) },
    { header: "Date", cell: (item) => format(new Date(item.created_at), "PPP") },
    { header: "Customer", cell: (item) => item.customers?.name || "Unknown" },
    { header: "Amount", cell: (item) => `$${item.total_amount.toFixed(2)}` },
  ], []);

  const purchasesColumns = useMemo<ColumnDef<PurchaseReportRow>[]>(() => [
    { header: "ID", cell: (item) => item.id.slice(0, 8) },
    { header: "Date", cell: (item) => format(new Date(item.created_at), "PPP") },
    { header: "Supplier", cell: (item) => item.suppliers?.name || "Unknown" },
    { header: "Amount", cell: (item) => `$${item.total_amount.toFixed(2)}` },
  ], []);

  const stockColumns = useMemo<ColumnDef<StockReportRow>[]>(() => [
    { header: "SKU", cell: (item) => item.sku },
    { header: "Product", cell: (item) => item.name },
    { header: "Stock Qty", cell: (item) => (
      <span className={item.stock_quantity < 10 ? "text-red-500 font-bold" : "text-green-600 font-bold"}>
        {item.stock_quantity}
      </span>
    )},
    { header: "Unit Price", cell: (item) => `$${item.price.toFixed(2)}` },
    { header: "Total Value", cell: (item) => `$${(item.price * item.stock_quantity).toFixed(2)}` },
  ], []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Reports</h2>
          <p className="text-muted-foreground">Detailed data grids with CSV export.</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Data Grids</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="flex justify-between items-center mb-4">
              <TabsList>
                <TabsTrigger value="sales">Sales</TabsTrigger>
                <TabsTrigger value="purchases">Purchases</TabsTrigger>
                <TabsTrigger value="stock">Current Stock</TabsTrigger>
              </TabsList>

              <Button
                variant="outline"
                size="sm"
                onClick={handleExportClicked}
              >
                <Download className="mr-2 h-4 w-4" /> Export CSV
              </Button>
            </div>

            <TabsContent value="sales" className="mt-0">
              <DataTable columns={salesColumns} data={sales || []} isLoading={isLoadingSales} />
            </TabsContent>
            <TabsContent value="purchases" className="mt-0">
              <DataTable columns={purchasesColumns} data={purchases || []} isLoading={isLoadingPurchases} />
            </TabsContent>
            <TabsContent value="stock" className="mt-0">
              <DataTable columns={stockColumns} data={stock || []} isLoading={isLoadingStock} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
