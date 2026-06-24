import { useMemo, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { DataTable } from "@/components/shared/DataTable";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { useChartProps } from "@/hooks/useChartProps";
import { handleExportCSV, groupByMonth } from "@/lib/reportUtils";
import { customerColumns } from "@/constants/reportColumns";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export function CustomersReportTab() {
  const chartProps = useChartProps();
  const { data: customers, isLoading } = useQuery({
    queryKey: ["reports-customers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("customers")
        .select(`id, name, email, phone, created_at`)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  const chartData = useMemo(() => groupByMonth(customers || [], "created_at"), [customers]);

  const onExport = useCallback(() => {
    handleExportCSV(customers || [], "customers_report");
  }, [customers]);

  return (
    <div className="space-y-6">
      <div className="flex justify-end mb-4">
        <Button variant="outline" size="sm" onClick={onExport}>
          <Download className="mr-2 h-4 w-4" /> Export CSV
        </Button>
      </div>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={chartProps.stroke} />
            <XAxis dataKey="name" stroke={chartProps.textColor} fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke={chartProps.textColor} fontSize={12} tickLine={false} axisLine={false} />
            <Tooltip contentStyle={{ backgroundColor: chartProps.tooltipBg, borderRadius: "8px" }} />
            <Area type="monotone" dataKey="value" stroke="currentColor" className="stroke-primary fill-primary/20" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <DataTable columns={customerColumns} data={customers || []} isLoading={isLoading} />
    </div>
  );
}
