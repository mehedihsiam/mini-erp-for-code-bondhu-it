import { useRef } from "react";
import { useReactToPrint } from "react-to-print";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import { format } from "date-fns";
import Logo from "@/assets/cb-logo-header.svg";
import { COMPANY_DETAILS } from "@/constants/company";

import type { Database } from "@/types/supabase";

export type SaleWithDetails = Database["public"]["Tables"]["sales"]["Row"] & {
  customers: { name: string; email: string | null; address: string | null } | null;
  sale_items: Array<{
    id: string;
    quantity: number;
    unit_price: number;
    total_price: number;
    products: { name: string } | null;
  }> | null;
};

interface InvoicePrintProps {
  sale: SaleWithDetails;
}

export function InvoicePrint({ sale }: InvoicePrintProps) {
  const componentRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: `Invoice_${sale.id}`,
  });

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => handlePrint()}>
        <Printer className="mr-2 h-4 w-4" /> Print Invoice
      </Button>

      {/* Hidden printable area */}
      <div className="hidden">
        <div ref={componentRef} className="p-8 font-sans text-black bg-white" style={{ width: "800px" }}>
          <div className="flex justify-between border-b-2 border-[#0354db] pb-6 mb-6">
            <div>
              <img src={Logo} alt="Code Bondhu Logo" className="h-12 mb-4 object-contain" />
              <h1 className="text-3xl font-bold text-[#0354db]">INVOICE</h1>
              <p className="text-sm font-semibold text-gray-600">#{sale.id.slice(0, 8).toUpperCase()}</p>
            </div>
            <div className="text-right">
              <h2 className="text-xl font-bold text-gray-800">{COMPANY_DETAILS.name}</h2>
              <p className="text-sm text-gray-600">
                {COMPANY_DETAILS.address}<br />
                {COMPANY_DETAILS.email}<br />
                {COMPANY_DETAILS.phone}
              </p>
            </div>
          </div>

          <div className="flex justify-between mb-8">
            <div>
              <h3 className="font-bold text-gray-700">Bill To:</h3>
              <p className="text-sm">{sale.customers?.name}</p>
              <p className="text-sm">{sale.customers?.email}</p>
              <p className="text-sm">{sale.customers?.address}</p>
            </div>
            <div className="text-right">
              <h3 className="font-bold text-gray-700">Date:</h3>
              <p className="text-sm">{format(new Date(sale.created_at), "PPP")}</p>
            </div>
          </div>

          <table className="w-full text-left mb-8 border-collapse">
            <thead>
              <tr className="border-b-2 border-gray-300">
                <th className="py-2 text-gray-700">Item ID</th>
                <th className="py-2 text-right text-gray-700">Qty</th>
                <th className="py-2 text-right text-gray-700">Price</th>
                <th className="py-2 text-right text-gray-700">Total</th>
              </tr>
            </thead>
            <tbody>
              {sale.sale_items?.map((item) => (
                <tr key={item.id} className="border-b border-gray-200">
                  <td className="py-2 text-gray-800">{item.products?.name}</td>
                  <td className="py-2 text-right text-gray-800">{item.quantity}</td>
                  <td className="py-2 text-right text-gray-800">${item.unit_price.toFixed(2)}</td>
                  <td className="py-2 text-right text-gray-800">${item.total_price.toFixed(2)}</td>
                </tr>
              ))}
              {!sale.sale_items?.length && (
                <tr className="border-b border-gray-200">
                  <td colSpan={4} className="py-4 text-center text-gray-500">No items found</td>
                </tr>
              )}
            </tbody>
          </table>

          <div className="flex justify-end">
            <div className="w-64">
              <div className="flex justify-between font-bold text-lg border-t-2 border-gray-800 pt-2">
                <span>Total:</span>
                <span>${sale.total_amount.toFixed(2)}</span>
              </div>
            </div>
          </div>
          
          <div className="mt-16 text-center text-sm text-gray-500">
            Thank you for your business!
          </div>
        </div>
      </div>
    </>
  );
}
