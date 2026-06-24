import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Package, ShoppingCart, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useTheme } from "@/components/ThemeProvider";

interface ChartData {
  name: string;
  sales: number;
}

export function DashboardOverviewPage() {
  const { theme } = useTheme();

  const { data: stats } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const [
        { count: productCount },
        { count: customerCount },
        { data: sales },
        { data: purchases },
      ] = await Promise.all([
        supabase.from("products").select("*", { count: "exact", head: true }),
        supabase.from("customers").select("*", { count: "exact", head: true }),
        supabase.from("sales").select("total_amount, created_at"),
        supabase.from("purchases").select("total_amount, created_at"),
      ]);

      const totalSales =
        sales?.reduce((sum, s) => sum + s.total_amount, 0) || 0;
      const totalPurchases =
        purchases?.reduce((sum, p) => sum + p.total_amount, 0) || 0;

      return {
        productCount: productCount || 0,
        customerCount: customerCount || 0,
        totalSales,
        totalPurchases,
        salesData: sales || [],
      };
    },
  });

  const [viewType, setViewType] = useState<"daily" | "monthly">("monthly");

  const salesData = stats?.salesData;
  const chartData = useMemo<ChartData[]>(() => {
    if (!salesData) return [];
    return salesData.reduce<ChartData[]>((acc, sale) => {
      // Supabase returns string for created_at and number for total_amount, but we add safety fallbacks
      const createdAt = sale.created_at || new Date().toISOString();
      const amount = sale.total_amount || 0;

      const date = new Date(createdAt);
      const key =
        viewType === "monthly"
          ? date.toLocaleString("default", { month: "short", year: "numeric" })
          : date.toLocaleString("default", { month: "short", day: "numeric" });

      const existing = acc.find((m) => m.name === key);
      if (existing) {
        existing.sales += amount;
      } else {
        acc.push({ name: key, sales: amount });
      }
      return acc;
    }, []);
  }, [salesData, viewType]);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${stats?.totalSales.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">Lifetime revenue</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Purchases
            </CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${stats?.totalPurchases.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">Lifetime expenses</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Products
            </CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.productCount}</div>
            <p className="text-xs text-muted-foreground">Items in inventory</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Customers
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.customerCount}</div>
            <p className="text-xs text-muted-foreground">
              Registered in database
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="col-span-4">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle>Sales Overview</CardTitle>
          <div className="space-x-2">
            <Button
              variant={viewType === "daily" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewType("daily")}
            >
              Daily
            </Button>
            <Button
              variant={viewType === "monthly" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewType("monthly")}
            >
              Monthly
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pl-2 pt-4">
          <div className="h-75 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke={theme === "dark" ? "#333" : "#eee"}
                />
                <XAxis
                  dataKey="name"
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `$${value}`}
                />
                <Tooltip
                  cursor={{ fill: theme === "dark" ? "#333" : "#f5f5f5" }}
                  contentStyle={{
                    backgroundColor: theme === "dark" ? "#1f2937" : "#fff",
                    borderRadius: "8px",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="sales"
                  stroke="currentColor"
                  className="stroke-primary"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
