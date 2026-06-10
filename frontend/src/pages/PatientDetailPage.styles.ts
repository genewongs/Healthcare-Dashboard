import type { SxProps, Theme } from "@mui/material";

export const patientFiledValueCardStyles: SxProps<Theme> = {
  alignItems: "center",
  bgcolor: "primary.light",
  borderRadius: 1.5,
  color: "primary.main",
  display: "flex",
  flexShrink: 0,
  height: 28,
  justifyContent: "center",
  mt: 0.25,
  width: 28,
};

export const patientDetailsAvatarStyles: SxProps<Theme> = {
  bgcolor: "primary.light",
  color: "primary.main",
  flexShrink: 0,
  fontSize: { xs: 18, sm: 24, md: 30 },
  fontWeight: 800,
  height: { xs: 48, sm: 64, md: 88 },
  mt: { xs: 0.5, md: 0 },
  width: { xs: 48, sm: 64, md: 88 },
};

export const patientDetailsEditButtonStyles: SxProps<Theme> = {
  border: 1,
  borderColor: "divider",
  bgcolor: "background.paper",
  height: { xs: 38, sm: 44, md: 48 },
  width: { xs: 38, sm: 44, md: 48 },
}

export const patientDeleteButtonStyles: SxProps<Theme> = {
  border: 1,
  borderColor: "divider",
  bgcolor: "background.paper",
  height: { xs: 38, sm: 44, md: 48 },
  width: { xs: 38, sm: 44, md: 48 },
};

