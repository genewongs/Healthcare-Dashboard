import { createTheme } from "@mui/material";

export const appTheme = createTheme({
  palette: {
    primary: {
      main: "#4f46e5",
      light: "#eef2ff",
      dark: "#3730a3",
      contrastText: "#ffffff",
    },
    secondary: {
      main: "#0ea5e9",
    },
    success: {
      main: "#16a34a",
      light: "#dcfce7",
    },
    warning: {
      main: "#f97316",
      light: "#ffedd5",
    },
    error: {
      main: "#dc2626",
      light: "#fee2e2",
    },
    background: {
      default: "#f8faff",
      paper: "#ffffff",
    },
    text: {
      primary: "#0f172a",
      secondary: "#64748b",
    },
    divider: "#e2e8f0",
  },
  shape: {
    borderRadius: 8,
  },
  typography: {
    fontFamily:
      'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    h4: {
      fontWeight: 800,
      letterSpacing: 0,
    },
    h5: {
      fontWeight: 800,
      letterSpacing: 0,
    },
    h6: {
      fontWeight: 750,
      letterSpacing: 0,
    },
    button: {
      fontWeight: 700,
      letterSpacing: 0,
      textTransform: "none",
    },
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: "#ffffff",
          borderBottom: "1px solid #e2e8f0",
          boxShadow: "none",
          color: "#0f172a",
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          minHeight: 40,
          "&.MuiButton-containedPrimary": {
            background: "linear-gradient(135deg, #4f46e5 0%, #2563eb 100%)",
            boxShadow: "0 10px 22px rgba(79, 70, 229, 0.22)",
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderColor: "#e2e8f0",
          boxShadow: "0 12px 34px rgba(15, 23, 42, 0.04)",
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 650,
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          backgroundColor: "#ffffff",
          borderRadius: 8,
        },
      },
    },
  },
});
