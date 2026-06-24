import { useMemo, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { DataTable } from "@/components/shared/DataTable";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { useChartProps } from "@/hooks/useChartProps";
import { handleExportCSV, groupByMonth } from "@/lib/reportUtils";
import { purchasesColumns } from "@/constants/reportColumns";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export function PurchasesReportTab() {
  const chartProps = useChartProps();
  const { data: purchases, isLoading } = useQuery({
    queryKey: ["reports-purchases"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("purchases")
        .select(`*, suppliers(name)`)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  const chartData = useMemo(() => groupByMonth(purchases || [], "created_at", "total_amount"), [purchases]);

  const onExport = useCallback(() => {
    handleExportCSV(purchases || [], "purchases_report");
  }, [purchases]);

  return (
    <div className="space-y-6">
      <div className="flex justify-end mb-4">
        <Button variant="outline" size="sm" onClick={onExport}>
          <Download className="mr-2 h-4 w-4" /> Export CSV
        </Button>
      </div>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={chartProps.stroke} />
            <XAxis dataKey="name" stroke={chartProps.textColor} fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke={chartProps.textColor} fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `$${val}`} />
            <Tooltip
              contentStyle={{ backgroundColor: chartProps.tooltipBg, borderRadius: "8px" }}
              formatter={(val: unknown) => [`$${Number(val).toFixed(2)}`, "Amount"]}
            />
            <Line type="monotone" dataKey="value" stroke="currentColor" className="stroke-destructive" strokeWidth={2} dot={{ r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <DataTable columns={purchasesColumns} data={purchases || []} isLoading={isLoading} />
    </div>
  );
}
