"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark" | "system";

interface ThemeContextType {
  theme: Theme;
  resolvedTheme: "light" | "dark";
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: "system",
  resolvedTheme: "light",
  setTheme: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("system");
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const saved = (localStorage.getItem("lifeify_theme") as Theme) || "system";
    setThemeState(saved);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const applyTheme = () => {
      let isDark = false;
      if (theme === "system") {
        isDark = mediaQuery.matches;
      } else {
        isDark = theme === "dark";
      }

      setResolvedTheme(isDark ? "dark" : "light");
      if (isDark) {
        root.classList.add("dark");
      } else {
        root.classList.remove("dark");
      }
    };

    applyTheme();

    const listener = () => {
      if (theme === "system") applyTheme();
    };

    mediaQuery.addEventListener("change", listener);
    return () => mediaQuery.removeEventListener("change", listener);
  }, [theme]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem("lifeify_theme", newTheme);
    document.cookie = `lifeify_theme=${newTheme}; path=/; max-age=31536000`;
  };

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}

export function ThemeToggle({ className = "" }: { className?: string }) {
  const { theme, setTheme } = useTheme();

  return (
    <div className={`inline-flex rounded-lg border border-line bg-surface p-0.5 text-xs ${className}`}>
      <button
        type="button"
        onClick={() => setTheme("light")}
        className={`rounded-md px-2 py-1 font-medium transition-colors ${
          theme === "light" ? "bg-primary-soft text-primary-dark font-bold" : "text-ink-muted hover:text-ink"
        }`}
        title="Light Mode"
      >
        ☀️
      </button>
      <button
        type="button"
        onClick={() => setTheme("dark")}
        className={`rounded-md px-2 py-1 font-medium transition-colors ${
          theme === "dark" ? "bg-primary-soft text-primary-dark font-bold" : "text-ink-muted hover:text-ink"
        }`}
        title="Dark Mode"
      >
        🌙
      </button>
      <button
        type="button"
        onClick={() => setTheme("system")}
        className={`rounded-md px-2 py-1 font-medium transition-colors ${
          theme === "system" ? "bg-primary-soft text-primary-dark font-bold" : "text-ink-muted hover:text-ink"
        }`}
        title="System Preference"
      >
        💻
      </button>
    </div>
  );
}
