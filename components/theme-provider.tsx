"use client";

import * as React from "react";

type Theme = "light" | "dark";

type ThemeContextValue = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

const ThemeContext = React.createContext<ThemeContextValue | null>(null);

function getInitialTheme(defaultTheme: Theme): Theme {
  if (typeof window === "undefined") return defaultTheme;

  const stored = window.localStorage.getItem("civicdesk-theme");
  if (stored === "light" || stored === "dark") return stored;

  return defaultTheme;
}

function applyTheme(theme: Theme) {
  document.documentElement.classList.toggle("dark", theme === "dark");
  document.documentElement.style.colorScheme = theme;
}

export function ThemeProvider({
  children,
  defaultTheme = "light",
}: {
  children: React.ReactNode;
  defaultTheme?: Theme;
}) {
  const [theme, setThemeState] = React.useState<Theme>(() =>
    getInitialTheme(defaultTheme)
  );

  React.useEffect(() => {
    applyTheme(theme);
    window.localStorage.setItem("civicdesk-theme", theme);
  }, [theme]);

  const value = React.useMemo<ThemeContextValue>(
    () => ({
      theme,
      setTheme: setThemeState,
    }),
    [theme]
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = React.useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used inside ThemeProvider");
  }
  return context;
}
