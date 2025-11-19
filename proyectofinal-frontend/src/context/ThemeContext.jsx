import React, { useEffect, useState } from "react";
import { getTheme, setTheme } from "../utils/theme";
import { ThemeContext } from "./themeContextDef";

export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(false);
  const [isReady, setIsReady] = useState(false);

  // Initialize theme on mount from localStorage
  useEffect(() => {
    const stored = getTheme();
    if (stored) {
      setIsDark(stored === "dark");
    } else {
      // No stored value: use system preference
      const prefersDark =
        window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
      setIsDark(prefersDark);
    }
    setIsReady(true);

    // Listen for storage changes (e.g., from another tab)
    const handleStorageChange = () => {
      const updated = getTheme();
      if (updated) {
        setIsDark(updated === "dark");
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // Persist theme whenever isDark changes
  useEffect(() => {
    if (isReady) {
      setTheme(isDark ? "dark" : "light");
    }
  }, [isDark, isReady]);

  const toggleTheme = () => {
    setIsDark((prev) => !prev);
  };

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme, isReady }}>
      {children}
    </ThemeContext.Provider>
  );
}
