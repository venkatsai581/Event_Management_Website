import { createContext, useCallback, useContext, useEffect, useMemo } from "react";
import useLocalStorage from "../hooks/useLocalStorage";
import { formatMoney, formatTotal } from "../utils/format";

export const DEFAULT_SETTINGS = {
  siteName: "Eventify",
  contactEmail: "support@eventify.com",
  currency: "INR",
  maxTicketsPerBooking: 6,
  registrationsOpen: true,
  theme: "light",
};

const SettingsContext = createContext(null);

export function SettingsProvider({ children }) {
  const [stored, setStored] = useLocalStorage("eventify_settings_v1", DEFAULT_SETTINGS);
  const settings = useMemo(() => ({ ...DEFAULT_SETTINGS, ...(stored || {}) }), [stored]);

  useEffect(() => {
    document.documentElement.dataset.theme = settings.theme === "dark" ? "dark" : "light";
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", settings.theme === "dark" ? "#0f0e1a" : "#6246ea");
  }, [settings.theme]);

  useEffect(() => {
    document.title = `${settings.siteName} | Discover Events`;
  }, [settings.siteName]);

  const updateSettings = useCallback((patch) => setStored((s) => ({ ...DEFAULT_SETTINGS, ...s, ...patch })), [setStored]);
  const resetSettings = useCallback(() => setStored(DEFAULT_SETTINGS), [setStored]);
  const toggleTheme = useCallback(
    () => setStored((s) => ({ ...DEFAULT_SETTINGS, ...s, theme: s?.theme === "dark" ? "light" : "dark" })),
    [setStored]
  );

  const value = useMemo(
    () => ({
      settings,
      updateSettings,
      resetSettings,
      toggleTheme,
      money: (n) => formatMoney(n, settings.currency),
      total: (n) => formatTotal(n, settings.currency),
    }),
    [settings, updateSettings, resetSettings, toggleTheme]
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings must be used inside SettingsProvider");
  return ctx;
}
