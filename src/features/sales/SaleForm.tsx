import { useState, useMemo } from "react";
import { useForm, useFieldArray, Controller, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { saleSchema, type SaleFormValues } from "./schemas";
import { InputField } from "@/components/shared/InputField";
import { Button } from "@/components/ui/button";
import { Loader2, Plus, Trash } from "lucide-react";
import { useProducts } from "@/hooks/useProducts";
import { useCustomers } from "@/hooks/useCustomers";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CustomerForm } from "../customers/CustomerForm";

interface SaleFormProps {
  onSubmit: (data: SaleFormValues) => Promise<void>;
  isSubmitting?: boolean;
}

export function SaleForm({ onSubmit, isSubmitting }: SaleFormProps) {
  const { products } = useProducts();
  const { customers, createCustomer } = useCustomers();
  const [isCustomerDialogOpen, setIsCustomerDialogOpen] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<SaleFormValues>({
    resolver: zodResolver(saleSchema),
    defaultValues: {
      customer_id: "",
      items: [{ product_id: "", quantity: 1, unit_price: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    name: "items",
    control,
  });

  const watchedItems = useWatch({
    control,
    name: "items",
  });
  const items = watchedItems || [];
  
  const totalAmount = useMemo(() => {
    const safeItems = watchedItems || [];
    return safeItems.reduce(
      (sum, item) => sum + (item.quantity * item.unit_price || 0),
      0,
    );
  }, [watchedItems]);

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Customer</Label>
            <Button
              type="button"
              variant="link"
              className="h-auto p-0 text-primary"
              onClick={() => setIsCustomerDialogOpen(true)}
            >
              + Add new customer
            </Button>
          </div>
          <Controller
            name="customer_id"
            control={control}
            render={({ field }) => (
              <Select
                onValueChange={field.onChange}
                value={field.value || undefined}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a customer">
                    {field.value
                      ? customers?.find((c) => c.id === field.value)?.name
                      : "Select a customer"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {customers?.map((customer) => (
                    <SelectItem key={customer.id} value={customer.id}>
                      {customer.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.customer_id && (
            <span className="text-sm text-destructive">
              {errors.customer_id.message}
            </span>
          )}
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium">Sale Items</h4>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                append({ product_id: "", quantity: 1, unit_price: 0 })
              }
            >
              <Plus className="mr-2 h-4 w-4" /> Add Item
            </Button>
          </div>

          {fields.map((field, index) => {
            // Check stock available to show helper or block
            const selectedProduct = products?.find(
              (p) => p.id === items[index]?.product_id,
            );

            return (
              <div
                key={field.id}
                className="flex items-start gap-4 rounded-lg border p-4"
              >
                <div className="flex-1 space-y-2">
                  <Label>Product</Label>
                  <Controller
                    name={`items.${index}.product_id`}
                    control={control}
                    render={({ field: productField }) => (
                      <Select
                        onValueChange={(val) => {
                          productField.onChange(val);
                          const product = products?.find((p) => p.id === val);
                          if (product) {
                            setValue(
                              `items.${index}.unit_price`,
                              product.price,
                            );
                          }
                        }}
                        value={productField.value || undefined}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select product">
                            {productField.value
                              ? products?.find(
                                  (p) => p.id === productField.value,
                                )?.name
                              : "Select product"}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {products?.map((product) => (
                            <SelectItem
                              key={product.id}
                              value={product.id}
                              disabled={product.stock_quantity <= 0}
                            >
                              {product.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.items?.[index]?.product_id && (
                    <span className="text-sm text-destructive">
                      {errors.items[index]?.product_id?.message}
                    </span>
                  )}
                </div>

                <div className="w-24">
                  <InputField
                    label="Qty"
                    type="number"
                    {...register(`items.${index}.quantity` as const, { valueAsNumber: true })}
                    error={errors.items?.[index]?.quantity?.message}
                  />
                  {selectedProduct &&
                    selectedProduct.stock_quantity < items[index].quantity && (
                      <span className="text-xs text-destructive block mt-1">
                        Exceeds stock
                      </span>
                    )}
                </div>

                <div className="w-32">
                  <InputField
                    label="Price"
                    type="number"
                    step="0.01"
                    {...register(`items.${index}.unit_price` as const, { valueAsNumber: true })}
                    error={errors.items?.[index]?.unit_price?.message}
                  />
                </div>

                <div className="pt-8">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => remove(index)}
                    disabled={fields.length === 1}
                  >
                    <Trash className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-between border-t pt-4">
          <div className="text-lg font-bold">
            Total: ${totalAmount.toFixed(2)}
          </div>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Complete Sale
          </Button>
        </div>
      </form>

      <Dialog
        open={isCustomerDialogOpen}
        onOpenChange={setIsCustomerDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Customer</DialogTitle>
          </DialogHeader>
          <CustomerForm
            onSubmit={async (data) => {
              const newCustomer = await createCustomer.mutateAsync(data);
              setIsCustomerDialogOpen(false);
              // Auto select the new customer
              if (newCustomer && newCustomer.id) {
                setValue("customer_id", newCustomer.id);
              }
            }}
            isSubmitting={createCustomer.isPending}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
