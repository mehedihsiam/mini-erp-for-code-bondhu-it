import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";
import type { SaleFormValues } from "../features/sales/schemas";

export function useSales() {
  const queryClient = useQueryClient();

  const { data: sales, isLoading } = useQuery({
    queryKey: ["sales"],
    queryFn: async () => {
      // Fetch sales along with the customer info
      const { data, error } = await supabase
        .from("sales")
        .select(`
          *,
          customers (name, email, address),
          sale_items (
            id,
            quantity,
            unit_price,
            total_price,
            products (name)
          )
        `)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  const createSale = useMutation({
    mutationFn: async (newSale: SaleFormValues) => {
      // Calculate total_amount
      const total_amount = newSale.items.reduce(
        (sum, item) => sum + item.quantity * item.unit_price,
        0
      );

      // 1. Insert Sale Record
      const { data: sale, error: saleError } = await supabase
        .from("sales")
        .insert([{ 
          customer_id: newSale.customer_id, 
          total_amount 
        }])
        .select()
        .single();
      
      if (saleError) throw saleError;

      // 2. Insert Sale Items
      const itemsToInsert = newSale.items.map(item => ({
        sale_id: sale.id,
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.quantity * item.unit_price
      }));

      const { error: itemsError } = await supabase
        .from("sale_items")
        .insert(itemsToInsert);

      if (itemsError) throw itemsError;

      return sale;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sales"] });
      queryClient.invalidateQueries({ queryKey: ["products"] }); // Because triggers will update stock!
    },
  });

  return {
    sales,
    isLoading,
    createSale,
  };
}
