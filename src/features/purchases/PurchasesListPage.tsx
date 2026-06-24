import { useState, useCallback, useMemo } from "react";
import { usePurchases } from "@/hooks/usePurchases";
import { DataTable, type ColumnDef } from "@/components/shared/DataTable";
import { PurchaseForm } from "./PurchaseForm";
import type { PurchaseFormValues } from "./schemas";
import { format } from "date-fns";
import type { Database } from "@/types/supabase";

type PurchaseWithSupplier = Database["public"]["Tables"]["purchases"]["Row"] & {
  suppliers: { name: string } | null;
};

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";

export function PurchasesListPage() {
  const { purchases, isLoading, createPurchase } = usePurchases();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleSubmit = useCallback(async (data: PurchaseFormValues) => {
    await createPurchase.mutateAsync(data);
    setIsDialogOpen(false);
  }, [createPurchase]);

  // We are extracting the joined supplier name safely
  const columns = useMemo<ColumnDef<PurchaseWithSupplier>[]>(() => [
    {
      header: "Date",
      cell: (item) => format(new Date(item.created_at), "PPP p"),
    },
    {
      header: "Supplier",
      cell: (item) => item.suppliers?.name || "Unknown",
    },
    {
      header: "Total Amount",
      cell: (item) => (
        <span className="font-medium text-green-600 dark:text-green-400">
          +${item.total_amount.toFixed(2)}
        </span>
      ),
    },
  ], []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Purchase Orders</h2>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> New Purchase
        </Button>
      </div>

      <DataTable
        data={purchases}
        columns={columns}
        isLoading={isLoading}
        emptyMessage="No purchases found."
      />

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-5xl max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>New Purchase Order</DialogTitle>
          </DialogHeader>
          <PurchaseForm
            onSubmit={handleSubmit}
            isSubmitting={createPurchase.isPending}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
