import { useMemo, useCallback } from "react";
import { useForm, useFieldArray, Controller, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { purchaseSchema, type PurchaseFormValues } from "./schemas";
import { InputField } from "@/components/shared/InputField";
import { Button } from "@/components/ui/button";
import { Loader2, Plus, Trash } from "lucide-react";
import { useProducts } from "@/hooks/useProducts";
import { useSuppliers } from "@/hooks/useSuppliers";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PurchaseFormProps {
  onSubmit: (data: PurchaseFormValues) => Promise<void>;
  isSubmitting?: boolean;
}

export function PurchaseForm({ onSubmit, isSubmitting }: PurchaseFormProps) {
  const { products } = useProducts();
  const { suppliers } = useSuppliers();

  const {
    register,
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<PurchaseFormValues>({
    resolver: zodResolver(purchaseSchema),
    defaultValues: {
      supplier_id: "",
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
  const totalAmount = useMemo(() => {
    const items = watchedItems || [];
    return items.reduce(
      (sum, item) => sum + (item.quantity * item.unit_price || 0),
      0,
    );
  }, [watchedItems]);

  const handleAddItem = useCallback(() => {
    append({ product_id: "", quantity: 1, unit_price: 0 });
  }, [append]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-2">
        <Label>Supplier</Label>
        <Controller
          name="supplier_id"
          control={control}
          render={({ field }) => (
            <Select
              onValueChange={field.onChange}
              value={field.value || undefined}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a supplier">
                  {field.value
                    ? suppliers?.find((s) => s.id === field.value)?.name
                    : "Select a supplier"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {suppliers?.map((supplier) => (
                  <SelectItem key={supplier.id} value={supplier.id}>
                    {supplier.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {errors.supplier_id && (
          <span className="text-sm text-destructive">
            {errors.supplier_id.message}
          </span>
        )}
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium">Purchase Items</h4>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAddItem}
          >
            <Plus className="mr-2 h-4 w-4" /> Add Item
          </Button>
        </div>

        {fields.map((field, index) => (
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
                        setValue(`items.${index}.unit_price`, product.price); // Using standard price as default, user can edit
                      }
                    }}
                    value={productField.value || undefined}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select product">
                        {productField.value
                          ? products?.find((p) => p.id === productField.value)
                              ?.name
                          : "Select product"}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {products?.map((product) => (
                        <SelectItem key={product.id} value={product.id}>
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
        ))}
      </div>

      <div className="flex items-center justify-between border-t pt-4">
        <div className="text-lg font-bold">
          Total: ${totalAmount.toFixed(2)}
        </div>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Complete Purchase
        </Button>
      </div>
    </form>
  );
}
