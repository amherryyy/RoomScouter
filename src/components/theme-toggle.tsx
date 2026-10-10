"use client";

import { useEffect, useState } from "react";
import { UiIcon } from "./ui-icon";

const storageKey = "roomscouter-theme";
const themeEvent = "roomscouter-theme-change";

function currentThemeIsDark() {
  return document.documentElement.dataset.theme === "dark";
}

export function ThemeToggle({ className = "" }: { className?: string }) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const syncTheme = () => setIsDark(currentThemeIsDark());
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const syncSystemTheme = (event: MediaQueryListEvent) => {
      try {
        if (window.localStorage.getItem(storageKey)) return;
      } catch {
        // Follow the system preference when browser storage is unavailable.
      }
      document.documentElement.dataset.theme = event.matches ? "dark" : "light";
      syncTheme();
    };

    syncTheme();
    window.addEventListener(themeEvent, syncTheme);
    media.addEventListener("change", syncSystemTheme);
    return () => {
      window.removeEventListener(themeEvent, syncTheme);
      media.removeEventListener("change", syncSystemTheme);
    };
  }, []);

  function toggleTheme() {
    const nextIsDark = !isDark;
    document.documentElement.dataset.theme = nextIsDark ? "dark" : "light";
    try {
      window.localStorage.setItem(storageKey, nextIsDark ? "dark" : "light");
    } catch {
      // The selected theme still applies for this page when storage is unavailable.
    }
    setIsDark(nextIsDark);
    window.dispatchEvent(new Event(themeEvent));
  }

  return (
    <button
      aria-label="Dark mode"
      aria-pressed={isDark}
      className={`theme-toggle ${className}`.trim()}
      onClick={toggleTheme}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      type="button"
    >
      <UiIcon className="ui-icon" name={isDark ? "sun" : "moon"} />
      <span className="theme-toggle-label">Dark mode</span>
    </button>
  );
}
