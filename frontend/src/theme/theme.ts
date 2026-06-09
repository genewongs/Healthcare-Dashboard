import { createTheme, type PaletteMode } from "@mui/material";

export function createAppTheme(mode: PaletteMode) {
  const isDark = mode === "dark";

  return createTheme({
    palette: {
      mode,
      primary: {
        main: isDark ? "#8b7cff" : "#4f46e5",
        light: isDark ? "rgba(139, 124, 255, 0.18)" : "#eef2ff",
        dark: isDark ? "#6d5dfc" : "#3730a3",
        contrastText: "#ffffff",
      },
      secondary: {
        main: isDark ? "#38bdf8" : "#0ea5e9",
      },
      success: {
        main: isDark ? "#22c55e" : "#16a34a",
        light: isDark ? "rgba(34, 197, 94, 0.16)" : "#dcfce7",
      },
      warning: {
        main: isDark ? "#fb923c" : "#f97316",
        light: isDark ? "rgba(251, 146, 60, 0.17)" : "#ffedd5",
      },
      error: {
        main: isDark ? "#f87171" : "#dc2626",
        light: isDark ? "rgba(248, 113, 113, 0.16)" : "#fee2e2",
      },
      background: {
        default: isDark ? "#080d1a" : "#f8faff",
        paper: isDark ? "#101827" : "#ffffff",
      },
      text: {
        primary: isDark ? "#f8fafc" : "#0f172a",
        secondary: isDark ? "#a8b3c7" : "#64748b",
      },
      divider: isDark ? "rgba(148, 163, 184, 0.22)" : "#e2e8f0",
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
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            transition: "background-color 220ms ease, color 220ms ease",
          },
          "*": {
            transitionProperty: "background-color, border-color, box-shadow, color, fill, stroke",
            transitionDuration: "220ms",
            transitionTimingFunction: "ease",
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundColor: isDark ? "#0b1020" : "#ffffff",
            borderBottom: `1px solid ${isDark ? "rgba(148, 163, 184, 0.22)" : "#e2e8f0"}`,
            boxShadow: "none",
            color: isDark ? "#f8fafc" : "#0f172a",
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            minHeight: 40,
            "&.MuiButton-containedPrimary": {
              background: isDark
                ? "linear-gradient(135deg, #8b7cff 0%, #6d5dfc 100%)"
                : "linear-gradient(135deg, #4f46e5 0%, #2563eb 100%)",
              boxShadow: isDark
                ? "0 10px 24px rgba(139, 124, 255, 0.26)"
                : "0 10px 22px rgba(79, 70, 229, 0.22)",
            },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            backgroundImage: isDark
              ? "linear-gradient(145deg, rgba(17, 24, 39, 0.98), rgba(12, 18, 32, 0.98))"
              : "none",
            borderColor: isDark ? "rgba(148, 163, 184, 0.2)" : "#e2e8f0",
            boxShadow: isDark
              ? "0 18px 44px rgba(0, 0, 0, 0.28)"
              : "0 12px 34px rgba(15, 23, 42, 0.04)",
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
            backgroundColor: isDark ? "rgba(15, 23, 42, 0.86)" : "#ffffff",
            borderRadius: 8,
          },
        },
      },
    },
  });
}
