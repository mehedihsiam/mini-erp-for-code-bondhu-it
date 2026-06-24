import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";
import type { PurchaseFormValues } from "../features/purchases/schemas";

export function usePurchases() {
  const queryClient = useQueryClient();

  const { data: purchases, isLoading } = useQuery({
    queryKey: ["purchases"],
    queryFn: async () => {
      // Fetch purchases along with the supplier info
      const { data, error } = await supabase
        .from("purchases")
        .select(`
          *,
          suppliers (name)
        `)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  const createPurchase = useMutation({
    mutationFn: async (newPurchase: PurchaseFormValues) => {
      // Calculate total_amount
      const total_amount = newPurchase.items.reduce(
        (sum, item) => sum + item.quantity * item.unit_price,
        0
      );

      // 1. Insert Purchase Record
      const { data: purchase, error: purchaseError } = await supabase
        .from("purchases")
        .insert([{ 
          supplier_id: newPurchase.supplier_id, 
          total_amount 
        }])
        .select()
        .single();
      
      if (purchaseError) throw purchaseError;

      // 2. Insert Purchase Items
      const itemsToInsert = newPurchase.items.map(item => ({
        purchase_id: purchase.id,
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.quantity * item.unit_price
      }));

      const { error: itemsError } = await supabase
        .from("purchase_items")
        .insert(itemsToInsert);

      if (itemsError) throw itemsError;

      return purchase;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["purchases"] });
      queryClient.invalidateQueries({ queryKey: ["products"] }); // Because triggers will update stock!
    },
  });

  return {
    purchases,
    isLoading,
    createPurchase,
  };
}
