"use client";

import { useEffect, useMemo, useState } from "react";

export type AppTheme = "midnight" | "ocean" | "sunset" | "forest";

export interface AppSettings {
  theme: AppTheme;
  showMilliseconds: boolean;
}

const STORAGE_KEY = "count23_settings";

const DEFAULT_SETTINGS: AppSettings = {
  theme: "midnight",
  showMilliseconds: true,
};

function parseStoredSettings(raw: string | null): AppSettings {
  if (!raw) return DEFAULT_SETTINGS;
  try {
    const parsed = JSON.parse(raw) as Partial<AppSettings>;
    return {
      theme:
        parsed.theme === "ocean" || parsed.theme === "sunset" || parsed.theme === "forest"
          ? parsed.theme
          : "midnight",
      showMilliseconds: typeof parsed.showMilliseconds === "boolean" ? parsed.showMilliseconds : true,
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function useSettings() {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setSettings(parseStoredSettings(localStorage.getItem(STORAGE_KEY)));
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    document.documentElement.setAttribute("data-theme", settings.theme);
  }, [settings]);

  const api = useMemo(
    () => ({
      settings,
      setTheme: (theme: AppTheme) => setSettings((prev) => ({ ...prev, theme })),
      setShowMilliseconds: (showMilliseconds: boolean) => setSettings((prev) => ({ ...prev, showMilliseconds })),
    }),
    [settings],
  );

  return api;
}
