import type { SxProps, Theme } from "@mui/material";

export const dashboardTitleIcon: SxProps<Theme> = {
  alignItems: "center",
  bgcolor: "primary.light",
  borderRadius: 2,
  color: "primary.main",
  display: "flex",
  height: 36,
  justifyContent: "center",
  width: 36,
};

export const colorModeToggleStyles: SxProps<Theme> = {
  bgcolor: "background.paper",
  border: 1,
  borderColor: "divider",
  color: "primary.main",
  height: 38,
  width: 38,
  "&:hover": {
    bgcolor: "primary.light",
  },
};

export const headerAvatarIconStyles: SxProps<Theme> = {
  bgcolor: "primary.main",
  color: "primary.contrastText",
  fontSize: 14,
  fontWeight: 800,
  height: 36,
  width: 36,
};

