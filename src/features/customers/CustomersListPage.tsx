import { useState, useCallback, useMemo } from "react";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { useCustomers } from "@/hooks/useCustomers";
import { DataTable, type ColumnDef } from "@/components/shared/DataTable";
import { CustomerForm } from "./CustomerForm";
import type { Database } from "@/types/supabase";
import type { CustomerFormValues } from "./schemas";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Plus, Edit, Trash } from "lucide-react";

type Customer = Database["public"]["Tables"]["customers"]["Row"];

export function CustomersListPage() {
  useDocumentTitle("Customers");
  const { customers, isLoading, createCustomer, updateCustomer, deleteCustomer } = useCustomers();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | undefined>();

  const handleOpenDialog = useCallback((customer?: Customer) => {
    setEditingCustomer(customer);
    setIsDialogOpen(true);
  }, []);

  const handleCloseDialog = useCallback(() => {
    setIsDialogOpen(false);
    setEditingCustomer(undefined);
  }, []);

  const handleSubmit = useCallback(async (data: CustomerFormValues) => {
    if (editingCustomer) {
      await updateCustomer.mutateAsync({ id: editingCustomer.id, updates: data });
    } else {
      await createCustomer.mutateAsync(data);
    }
    handleCloseDialog();
  }, [editingCustomer, updateCustomer, createCustomer, handleCloseDialog]);

  const handleDelete = useCallback(async (id: string) => {
    if (window.confirm("Are you sure you want to delete this customer?")) {
      await deleteCustomer.mutateAsync(id);
    }
  }, [deleteCustomer]);

  const columns = useMemo<ColumnDef<Customer>[]>(() => [
    { header: "Name", accessorKey: "name" },
    { header: "Email", accessorKey: "email" },
    { header: "Phone", accessorKey: "phone" },
    { header: "Address", accessorKey: "address" },
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
        <h2 className="text-2xl font-bold tracking-tight">Customers</h2>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="mr-2 h-4 w-4" /> Add Customer
        </Button>
      </div>

      <DataTable
        data={customers}
        columns={columns}
        isLoading={isLoading}
        emptyMessage="No customers found."
      />

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingCustomer ? "Edit Customer" : "Add New Customer"}</DialogTitle>
          </DialogHeader>
          <CustomerForm
            initialData={editingCustomer}
            onSubmit={handleSubmit}
            isSubmitting={createCustomer.isPending || updateCustomer.isPending}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
