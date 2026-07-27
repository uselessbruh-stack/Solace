"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { themes, getTheme } from "@/lib/themes";
import type { ThemeKey, ThemeDefinition } from "@/types";

interface ThemeContextValue {
  theme: ThemeDefinition;
  themeKey: ThemeKey;
  setTheme: (key: ThemeKey) => void;
  availableThemes: ThemeDefinition[];
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function applyThemeToDOM(theme: ThemeDefinition) {
  const root = document.documentElement;
  root.setAttribute("data-theme", theme.key);

  // Toggle dark/light class for tailwind dark mode
  if (theme.isDark) {
    root.classList.add("dark");
    root.classList.remove("light");
  } else {
    root.classList.add("light");
    root.classList.remove("dark");
  }

  // Apply CSS custom properties
  const { colors } = theme;
  root.style.setProperty("--background", colors.background);
  root.style.setProperty("--foreground", colors.foreground);
  root.style.setProperty("--card", colors.card);
  root.style.setProperty("--card-foreground", colors.cardForeground);
  root.style.setProperty("--popover", colors.popover);
  root.style.setProperty("--popover-foreground", colors.popoverForeground);
  root.style.setProperty("--primary", colors.primary);
  root.style.setProperty("--primary-foreground", colors.primaryForeground);
  root.style.setProperty("--secondary", colors.secondary);
  root.style.setProperty("--secondary-foreground", colors.secondaryForeground);
  root.style.setProperty("--muted", colors.muted);
  root.style.setProperty("--muted-foreground", colors.mutedForeground);
  root.style.setProperty("--accent", colors.accent);
  root.style.setProperty("--accent-foreground", colors.accentForeground);
  root.style.setProperty("--destructive", colors.destructive);
  root.style.setProperty("--border", colors.border);
  root.style.setProperty("--input", colors.input);
  root.style.setProperty("--ring", colors.ring);
  root.style.setProperty("--sidebar", colors.sidebar);
  root.style.setProperty("--sidebar-foreground", colors.sidebarForeground);
  root.style.setProperty("--sidebar-border", colors.sidebarBorder);
  root.style.setProperty("--sidebar-primary", colors.sidebarPrimary);
  root.style.setProperty("--sidebar-accent", colors.sidebarAccent);
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [themeKey, setThemeKey] = useState<ThemeKey>("midnight");
  const [mounted, setMounted] = useState(false);

  // Load saved theme on mount
  useEffect(() => {
    const saved = localStorage.getItem("solace-theme") as ThemeKey | null;
    if (saved && themes[saved]) {
      setThemeKey(saved);
    }
    setMounted(true);
  }, []);

  // Apply theme to DOM whenever it changes
  useEffect(() => {
    if (mounted) {
      const theme = getTheme(themeKey);
      applyThemeToDOM(theme);
    }
  }, [themeKey, mounted]);

  const setTheme = useCallback((key: ThemeKey) => {
    setThemeKey(key);
    localStorage.setItem("solace-theme", key);
  }, []);

  const theme = getTheme(themeKey);
  const availableThemes = Object.values(themes);

  // Prevent flash of unstyled content
  if (!mounted) {
    return <div style={{ visibility: "hidden" }}>{children}</div>;
  }

  return (
    <ThemeContext.Provider value={{ theme, themeKey, setTheme, availableThemes }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return ctx;
}
