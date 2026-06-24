import { useState, useCallback, useMemo } from "react";
import { useSales } from "@/hooks/useSales";
import { DataTable, type ColumnDef } from "@/components/shared/DataTable";
import { SaleForm } from "./SaleForm";
import { InvoicePrint, type SaleWithDetails } from "./InvoicePrint";
import type { SaleFormValues } from "./schemas";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";

export function SalesListPage() {
  const { sales, isLoading, createSale } = useSales();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleSubmit = useCallback(async (data: SaleFormValues) => {
    try {
      await createSale.mutateAsync(data);
      setIsDialogOpen(false);
    } catch (e: unknown) {
      if (e instanceof Error) {
        alert("Error processing sale: " + e.message);
      } else {
        alert("An unknown error occurred");
      }
    }
  }, [createSale]);

  const columns = useMemo<ColumnDef<SaleWithDetails>[]>(() => [
    { 
      header: "Date", 
      cell: (item) => format(new Date(item.created_at), "PPP p")
    },
    { 
      header: "Customer", 
      cell: (item) => item.customers?.name || "Unknown" 
    },
    {
      header: "Total Amount",
      cell: (item) => <span className="font-medium text-primary">-${item.total_amount.toFixed(2)}</span>,
    },
    {
      header: "Actions",
      cell: (item) => <InvoicePrint sale={item} />,
    }
  ], []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Sales Orders</h2>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> New Sale
        </Button>
      </div>

      <DataTable
        data={sales}
        columns={columns}
        isLoading={isLoading}
        emptyMessage="No sales found."
      />

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-5xl max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>New Sale Order</DialogTitle>
          </DialogHeader>
          <SaleForm
            onSubmit={handleSubmit}
            isSubmitting={createSale.isPending}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
