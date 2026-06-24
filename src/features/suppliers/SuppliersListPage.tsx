import { useState, useCallback, useMemo } from "react";
import { useSuppliers } from "@/hooks/useSuppliers";
import { DataTable, type ColumnDef } from "@/components/shared/DataTable";
import { SupplierForm } from "./SupplierForm";
import type { Database } from "@/types/supabase";
import type { SupplierFormValues } from "./schemas";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Plus, Edit, Trash } from "lucide-react";

type Supplier = Database["public"]["Tables"]["suppliers"]["Row"];

export function SuppliersListPage() {
  const { suppliers, isLoading, createSupplier, updateSupplier, deleteSupplier } = useSuppliers();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | undefined>();

  const handleOpenDialog = useCallback((supplier?: Supplier) => {
    setEditingSupplier(supplier);
    setIsDialogOpen(true);
  }, []);

  const handleCloseDialog = useCallback(() => {
    setIsDialogOpen(false);
    setEditingSupplier(undefined);
  }, []);

  const handleSubmit = useCallback(async (data: SupplierFormValues) => {
    if (editingSupplier) {
      await updateSupplier.mutateAsync({ id: editingSupplier.id, updates: data });
    } else {
      await createSupplier.mutateAsync(data);
    }
    handleCloseDialog();
  }, [editingSupplier, updateSupplier, createSupplier, handleCloseDialog]);

  const handleDelete = useCallback(async (id: string) => {
    if (window.confirm("Are you sure you want to delete this supplier?")) {
      await deleteSupplier.mutateAsync(id);
    }
  }, [deleteSupplier]);

  const columns = useMemo<ColumnDef<Supplier>[]>(() => [
    { header: "Company Name", accessorKey: "name" },
    { header: "Email", accessorKey: "email" },
    { header: "Phone", accessorKey: "phone" },
    {
      header: "Actions",
      cell: (item) => (
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(item)}>
            <Edit className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)}>
            <Trash className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      ),
    },
  ], [handleOpenDialog, handleDelete]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Suppliers</h2>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="mr-2 h-4 w-4" /> Add Supplier
        </Button>
      </div>

      <DataTable
        data={suppliers}
        columns={columns}
        isLoading={isLoading}
        emptyMessage="No suppliers found."
      />

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingSupplier ? "Edit Supplier" : "Add New Supplier"}</DialogTitle>
          </DialogHeader>
          <SupplierForm
            initialData={editingSupplier}
            onSubmit={handleSubmit}
            isSubmitting={createSupplier.isPending || updateSupplier.isPending}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
