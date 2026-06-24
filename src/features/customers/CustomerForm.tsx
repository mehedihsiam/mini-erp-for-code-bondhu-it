import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { customerSchema, type CustomerFormValues } from "./schemas";
import { InputField } from "@/components/shared/InputField";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import type { Database } from "@/types/supabase";

type Customer = Database["public"]["Tables"]["customers"]["Row"];

interface CustomerFormProps {
  initialData?: Customer;
  onSubmit: (data: CustomerFormValues) => Promise<void>;
  isSubmitting?: boolean;
}

export function CustomerForm({ initialData, onSubmit, isSubmitting }: CustomerFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CustomerFormValues>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      name: initialData?.name || "",
      email: initialData?.email || "",
      phone: initialData?.phone || "",
      address: initialData?.address || "",
    },
  });

  useEffect(() => {
    if (initialData) {
      reset({
        name: initialData.name,
        email: initialData.email || "",
        phone: initialData.phone || "",
        address: initialData.address || "",
      });
    }
  }, [initialData, reset]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <InputField
        label="Name"
        {...register("name")}
        error={errors.name?.message}
      />
      <InputField
        label="Email"
        type="email"
        {...register("email")}
        error={errors.email?.message}
      />
      <InputField
        label="Phone"
        {...register("phone")}
        error={errors.phone?.message}
      />
      <InputField
        label="Address"
        {...register("address")}
        error={errors.address?.message}
      />
      <div className="flex justify-end pt-4">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {initialData ? "Update Customer" : "Save Customer"}
        </Button>
      </div>
    </form>
  );
}
