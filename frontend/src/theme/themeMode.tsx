import { CssBaseline, ThemeProvider, type PaletteMode } from "@mui/material";
import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { createAppTheme } from "./theme";

type ThemeModeContextValue = {
  mode: PaletteMode;
  toggleMode: () => void;
};

const ThemeModeContext = createContext<ThemeModeContextValue | null>(null);

export function AppThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<PaletteMode>("light");
  const theme = useMemo(() => createAppTheme(mode), [mode]);

  const value = useMemo(
    () => ({
      mode,
      toggleMode: () => setMode((currentMode) => (currentMode === "light" ? "dark" : "light")),
    }),
    [mode],
  );

  return (
    <ThemeModeContext.Provider value={value}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeModeContext.Provider>
  );
}

export function useThemeMode() {
  const context = useContext(ThemeModeContext);
  if (!context) {
    throw new Error("useThemeMode must be used inside AppThemeProvider");
  }

  return context;
}
