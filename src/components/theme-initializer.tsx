"use client";

import { useLayoutEffect } from "react";

const storageKey = "roomscouter-theme";

export function ThemeInitializer() {
  useLayoutEffect(() => {
    let savedTheme: string | null = null;
    try {
      savedTheme = window.localStorage.getItem(storageKey);
    } catch {
      // Fall back to the operating system preference when storage is unavailable.
    }
    const isDark = savedTheme
      ? savedTheme === "dark"
      : window.matchMedia("(prefers-color-scheme: dark)").matches;
    document.documentElement.dataset.theme = isDark ? "dark" : "light";
  }, []);

  return null;
}
