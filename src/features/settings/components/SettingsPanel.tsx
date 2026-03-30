"use client";

import type { AppSettings, AppTheme, InputMode } from "../hooks/useSettings";

interface SettingsPanelProps {
  open: boolean;
  settings: AppSettings;
  labels: {
    title: string;
    close: string;
    theme: string;
    showMilliseconds: string;
    compactMode: string;
    defaultInputMode: string;
    themes: Record<AppTheme, string>;
    modes: Record<InputMode, string>;
  };
  onClose: () => void;
  onThemeChange: (theme: AppTheme) => void;
  onShowMillisecondsChange: (enabled: boolean) => void;
  onCompactModeChange: (enabled: boolean) => void;
  onDefaultInputModeChange: (mode: InputMode) => void;
}

export function SettingsPanel({
  open,
  settings,
  labels,
  onClose,
  onThemeChange,
  onShowMillisecondsChange,
  onCompactModeChange,
  onDefaultInputModeChange,
}: SettingsPanelProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/50 p-3 sm:items-center sm:p-6">
      <div className="glass-card w-full max-w-lg border border-white/15 p-5 sm:p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-slate-100 sm:text-lg">{labels.title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-white/15 px-3 py-1 text-xs text-slate-300 hover:bg-white/10"
          >
            {labels.close}
          </button>
        </div>

        <div className="space-y-5">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">{labels.theme}</p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {(Object.keys(labels.themes) as AppTheme[]).map((theme) => (
                <button
                  key={theme}
                  type="button"
                  onClick={() => onThemeChange(theme)}
                  className={`rounded-xl border px-3 py-2 text-xs font-medium transition-colors ${
                    settings.theme === theme
                      ? "border-white/40 bg-white/15 text-white"
                      : "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
                  }`}
                >
                  {labels.themes[theme]}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="flex cursor-pointer items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3 py-2">
              <span className="text-sm text-slate-200">{labels.showMilliseconds}</span>
              <input
                type="checkbox"
                checked={settings.showMilliseconds}
                onChange={(e) => onShowMillisecondsChange(e.target.checked)}
                className="h-4 w-4 accent-blue-500"
              />
            </label>

            <label className="flex cursor-pointer items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3 py-2">
              <span className="text-sm text-slate-200">{labels.compactMode}</span>
              <input
                type="checkbox"
                checked={settings.compactMode}
                onChange={(e) => onCompactModeChange(e.target.checked)}
                className="h-4 w-4 accent-blue-500"
              />
            </label>
          </div>

          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">{labels.defaultInputMode}</p>
            <div className="grid grid-cols-2 gap-2">
              {(Object.keys(labels.modes) as InputMode[]).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => onDefaultInputModeChange(mode)}
                  className={`rounded-xl border px-3 py-2 text-sm font-medium transition-colors ${
                    settings.defaultInputMode === mode
                      ? "border-white/40 bg-white/15 text-white"
                      : "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
                  }`}
                >
                  {labels.modes[mode]}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
