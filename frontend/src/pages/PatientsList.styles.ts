import type { SxProps, Theme } from "@mui/material";

export const patientListToolbarStyles: SxProps<Theme> = {
  alignItems: "center",
  display: "grid",
  gap: 1.5,
  gridTemplateAreas: {
    xs: `
      "search search search"
      "sort filters page"
      "create create create"
    `,
    md: `
      "search search search"
      "sort page filters"
      "create create create"
    `,
    lg: `"search sort page filters create"`,
  },
  gridTemplateColumns: {
    xs: "minmax(0, 1.25fr) minmax(118px, auto) minmax(0, 0.75fr)",
    md: "minmax(0, 1fr) 130px 166px",
    lg: "minmax(280px, 1fr) minmax(150px, 180px) 130px 166px 174px",
  },
};

export function patientFilterButtonStyles(hasActiveFilters: boolean): SxProps<Theme> {
  return {
    gridArea: "filters",
    minHeight: 40,
    minWidth: 0,
    position: "relative",
    px: { xs: 1, sm: 2 },
    pr: hasActiveFilters ? { xs: 4.5, sm: 5 } : undefined,
    whiteSpace: "nowrap",
  };
}

export const patientFilterBadgeStyles: SxProps<Theme> = {
  alignItems: "center",
  bgcolor: "primary.main",
  borderRadius: "999px",
  color: "primary.contrastText",
  display: "inline-flex",
  fontSize: 12,
  fontWeight: 800,
  height: 22,
  justifyContent: "center",
  minWidth: 22,
  position: "absolute",
  px: 0.75,
  right: 8,
  top: "50%",
  transform: "translateY(-50%)",
};

export function patientListContentStyles(isFetching: boolean): SxProps<Theme> {
  return {
    opacity: isFetching ? 0.72 : 1,
    transform: isFetching ? "translateY(2px)" : "translateY(0)",
    transition: "opacity 180ms ease, transform 180ms ease",
  };
}
