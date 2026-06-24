import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { productSchema, type ProductFormValues } from "./schemas";
import { InputField } from "@/components/shared/InputField";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import type { Database } from "@/types/supabase";

type Product = Database["public"]["Tables"]["products"]["Row"];

interface ProductFormProps {
  initialData?: Product;
  onSubmit: (data: ProductFormValues) => Promise<void>;
  isSubmitting?: boolean;
}

export function ProductForm({ initialData, onSubmit, isSubmitting }: ProductFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: initialData?.name || "",
      sku: initialData?.sku || "",
      description: initialData?.description || "",
      price: initialData?.price || 0,
      stock_quantity: initialData?.stock_quantity || 0,
    },
  });

  useEffect(() => {
    if (initialData) {
      reset({
        name: initialData.name,
        sku: initialData.sku,
        description: initialData.description || "",
        price: initialData.price || 0,
        stock_quantity: initialData.stock_quantity || 0,
      });
    }
  }, [initialData, reset]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <InputField
          label="Name"
          {...register("name")}
          error={errors.name?.message}
        />
        <InputField
          label="SKU"
          {...register("sku")}
          error={errors.sku?.message}
        />
      </div>
      <InputField
        label="Description"
        {...register("description")}
        error={errors.description?.message}
      />
      <div className="grid grid-cols-2 gap-4">
        <InputField
          label="Price"
          type="number"
          step="0.01"
          {...register("price", { valueAsNumber: true })}
          error={errors.price?.message}
        />
        <InputField
          label="Stock Quantity"
          type="number"
          {...register("stock_quantity", { valueAsNumber: true })}
          error={errors.stock_quantity?.message}
        />
      </div>
      <div className="flex justify-end pt-4">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {initialData ? "Update Product" : "Save Product"}
        </Button>
      </div>
    </form>
  );
}
