import { useState } from "react";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProductsReportTab } from "./components/ProductsReportTab";
import { CustomersReportTab } from "./components/CustomersReportTab";
import { SuppliersReportTab } from "./components/SuppliersReportTab";
import { PurchasesReportTab } from "./components/PurchasesReportTab";
import { SalesReportTab } from "./components/SalesReportTab";

export function ReportsOverviewPage() {
  useDocumentTitle("Reports");
  const [activeTab, setActiveTab] = useState("products");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Reports</h2>
          <p className="text-muted-foreground">
            Comprehensive reporting and visual analytics.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Analytics Grids</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <div className="flex justify-between items-center mb-6 border-b pb-4">
              <TabsList className="bg-transparent border-0 p-0 space-x-2">
                <TabsTrigger
                  value="products"
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  Products
                </TabsTrigger>
                <TabsTrigger
                  value="customers"
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  Customers
                </TabsTrigger>
                <TabsTrigger
                  value="suppliers"
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  Suppliers
                </TabsTrigger>
                <TabsTrigger
                  value="purchases"
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  Purchases
                </TabsTrigger>
                <TabsTrigger
                  value="sales"
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  Sales
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="products" className="mt-0">
              <ProductsReportTab />
            </TabsContent>
            <TabsContent value="customers" className="mt-0">
              <CustomersReportTab />
            </TabsContent>
            <TabsContent value="suppliers" className="mt-0">
              <SuppliersReportTab />
            </TabsContent>
            <TabsContent value="purchases" className="mt-0">
              <PurchasesReportTab />
            </TabsContent>
            <TabsContent value="sales" className="mt-0">
              <SalesReportTab />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
