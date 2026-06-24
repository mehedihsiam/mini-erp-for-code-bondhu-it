import { format } from "date-fns";

export const groupByMonth = <T extends Record<string, unknown>>(
  data: T[],
  dateKey: keyof T,
  valueKey?: keyof T
) => {
  const grouped = data.reduce((acc: Record<string, number>, item: T) => {
    const dateStr = item[dateKey] as string;
    const date = new Date(dateStr);
    const key = date.toLocaleString("default", {
      month: "short",
      year: "numeric",
    });
    if (!acc[key]) acc[key] = 0;
    acc[key] += valueKey ? Number(item[valueKey] || 0) : 1;
    return acc;
  }, {} as Record<string, number>);
  return Object.keys(grouped).map((key) => ({
    name: key,
    value: grouped[key],
  }));
};

export const handleExportCSV = <T extends Record<string, unknown>>(
  data: T[],
  filename: string
) => {
  if (!data || data.length === 0) return;
  const headers = Object.keys(data[0]).filter(
    (key) => typeof data[0][key] !== "object",
  );
  if (data[0].customers) headers.push("customer_name");
  if (data[0].suppliers) headers.push("supplier_name");

  const csvContent = [
    headers.join(","),
    ...data.map((row) =>
      headers
        .map((header) => {
          const r = row as Record<string, unknown>;
          if (header === "customer_name") {
            const cust = r.customers as { name?: string } | undefined;
            return `"${cust?.name || ""}"`;
          }
          if (header === "supplier_name") {
            const supp = r.suppliers as { name?: string } | undefined;
            return `"${supp?.name || ""}"`;
          }
          const val = row[header as keyof T];
          return `"${val ?? ""}"`;
        })
        .join(","),
    ),
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute(
    "download",
    `${filename}_${format(new Date(), "yyyyMMdd")}.csv`,
  );
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
