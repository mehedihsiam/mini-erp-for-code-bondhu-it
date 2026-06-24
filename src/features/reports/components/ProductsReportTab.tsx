import { useMemo, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { DataTable } from "@/components/shared/DataTable";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { useChartProps } from "@/hooks/useChartProps";
import { handleExportCSV } from "@/lib/reportUtils";
import { stockColumns } from "@/constants/reportColumns";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export function ProductsReportTab() {
  const chartProps = useChartProps();
  const { data: stock, isLoading } = useQuery({
    queryKey: ["reports-stock"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select(`id, name, sku, stock_quantity, price`)
        .order("stock_quantity", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const chartData = useMemo(() => {
    if (!stock) return [];
    return stock.slice(0, 15).map((s) => ({ name: s.name, value: s.stock_quantity }));
  }, [stock]);

  const onExport = useCallback(() => {
    handleExportCSV(stock || [], "products_report");
  }, [stock]);

  return (
    <div className="space-y-6">
      <div className="flex justify-end mb-4">
        <Button variant="outline" size="sm" onClick={onExport}>
          <Download className="mr-2 h-4 w-4" /> Export CSV
        </Button>
      </div>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={chartProps.stroke} />
            <XAxis dataKey="name" stroke={chartProps.textColor} fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke={chartProps.textColor} fontSize={12} tickLine={false} axisLine={false} />
            <Tooltip cursor={{ fill: chartProps.stroke }} contentStyle={{ backgroundColor: chartProps.tooltipBg, borderRadius: "8px" }} />
            <Bar dataKey="value" fill="currentColor" className="fill-primary" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <DataTable columns={stockColumns} data={stock || []} isLoading={isLoading} />
    </div>
  );
}
