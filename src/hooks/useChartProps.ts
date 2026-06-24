import { useMemo } from "react";
import { useTheme } from "@/components/ThemeProvider";

export function useChartProps() {
  const { theme } = useTheme();
  return useMemo(
    () => ({
      stroke: theme === "dark" ? "#333" : "#eee",
      textColor: "#888888",
      tooltipBg: theme === "dark" ? "#1f2937" : "#fff",
    }),
    [theme]
  );
}
