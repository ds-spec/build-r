"use client";

import { useEffect, useState } from "react";

type Theme = "dark" | "light";

function applyTheme(theme: Theme) {
  document.documentElement.setAttribute("data-theme", theme);
}

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window === "undefined") return "dark";
    return (localStorage.getItem("buildr-theme") as Theme) ?? "dark";
  });

  // Sync theme to DOM + localStorage whenever it changes
  useEffect(() => {
    applyTheme(theme);
    localStorage.setItem("buildr-theme", theme);
  }, [theme]);

  // Apply saved theme immediately on first mount to prevent flash
  useEffect(() => {
    const saved = localStorage.getItem("buildr-theme") as Theme | null;
    applyTheme(saved ?? "dark");
  }, []);

  const toggle = () => setTheme((t) => (t === "dark" ? "light" : "dark"));

  return { theme, toggle };
}
