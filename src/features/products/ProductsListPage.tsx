import { useState, useCallback, useMemo } from "react";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { useProducts } from "@/hooks/useProducts";
import { DataTable, type ColumnDef } from "@/components/shared/DataTable";
import { ProductForm } from "./ProductForm";
import type { Database } from "@/types/supabase";
import type { ProductFormValues } from "./schemas";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Plus, Edit, Trash } from "lucide-react";

type Product = Database["public"]["Tables"]["products"]["Row"];

export function ProductsListPage() {
  useDocumentTitle("Products");
  const { products, isLoading, createProduct, updateProduct, deleteProduct } =
    useProducts();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | undefined>();

  const handleOpenDialog = useCallback((product?: Product) => {
    setEditingProduct(product);
    setIsDialogOpen(true);
  }, []);

  const handleCloseDialog = useCallback(() => {
    setIsDialogOpen(false);
    setEditingProduct(undefined);
  }, []);

  const handleSubmit = useCallback(async (data: ProductFormValues) => {
    if (editingProduct) {
      await updateProduct.mutateAsync({ id: editingProduct.id, updates: data });
    } else {
      await createProduct.mutateAsync(data);
    }
    handleCloseDialog();
  }, [editingProduct, updateProduct, createProduct, handleCloseDialog]);

  const handleDelete = useCallback(async (id: string) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      await deleteProduct.mutateAsync(id);
    }
  }, [deleteProduct]);

  const columns = useMemo<ColumnDef<Product>[]>(() => [
    { header: "SKU", accessorKey: "sku" },
    { header: "Name", accessorKey: "name" },
    {
      header: "Price",
      cell: (item) => `$${item.price.toFixed(2)}`,
    },
    { header: "Stock", accessorKey: "stock_quantity" },
    {
      header: "Actions",
      cell: (item) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleOpenDialog(item)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleDelete(item.id)}
          >
            <Trash className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      ),
    },
  ], [handleOpenDialog, handleDelete]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Products</h2>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="mr-2 h-4 w-4" /> Add Product
        </Button>
      </div>

      <DataTable
        data={products}
        columns={columns}
        isLoading={isLoading}
        emptyMessage="No products found."
      />

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingProduct ? "Edit Product" : "Add New Product"}
            </DialogTitle>
          </DialogHeader>
          <ProductForm
            initialData={editingProduct}
            onSubmit={handleSubmit}
            isSubmitting={createProduct.isPending || updateProduct.isPending}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
