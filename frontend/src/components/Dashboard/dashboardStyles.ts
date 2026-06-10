import type { SxProps, Theme } from "@mui/material";

export const dashboardMetricGridStyles: SxProps<Theme> = {
  display: "grid",
  gap: 2,
  gridAutoColumns: { xs: "minmax(188px, 72vw)", sm: "minmax(188px, 1fr)" },
  gridAutoFlow: { xs: "column", sm: "initial" },
  gridTemplateColumns: { sm: "repeat(2, minmax(0, 1fr))", lg: "repeat(4, 1fr)" },
  overflowX: { xs: "auto", sm: "visible" },
  pb: { xs: 0.5, sm: 0 },
  scrollSnapType: { xs: "x proximity", sm: "none" },
  "& > *": {
    scrollSnapAlign: "start",
  },
};

export function dashboardMetricIconStyles(
  accent: "primary" | "success" | "warning" | "error",
): SxProps<Theme> {
  return {
    alignItems: "center",
    bgcolor: `${accent}.light`,
    borderRadius: "50%",
    color: `${accent}.main`,
    display: "flex",
    flexShrink: 0,
    height: 52,
    justifyContent: "center",
    width: 52,
  };
}

export const dashboardChartContainerStyles: SxProps<Theme> = {
  height: 260,
};

