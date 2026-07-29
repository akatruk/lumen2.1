"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import en from "../../messages/en.json";
import zh from "../../messages/zh.json";

export type UiLocale = "en" | "zh";

type Messages = typeof en;

const catalogs: Record<UiLocale, Messages> = { en, zh };

export const UI_LOCALE_KEY = "lumen.uiLocale";
export const DEFAULT_UI_LOCALE: UiLocale = "zh";

function isUiLocale(value: unknown): value is UiLocale {
  return value === "en" || value === "zh";
}

function readStoredLocale(): UiLocale {
  if (typeof window === "undefined") return DEFAULT_UI_LOCALE;
  const raw = window.localStorage.getItem(UI_LOCALE_KEY);
  if (isUiLocale(raw)) return raw;
  return DEFAULT_UI_LOCALE;
}

function applyDocumentLang(locale: UiLocale) {
  if (typeof document === "undefined") return;
  document.documentElement.lang = locale === "zh" ? "zh-CN" : "en";
}

type I18nContextValue = {
  locale: UiLocale;
  t: Messages;
  setLocale: (locale: UiLocale) => void;
};

const I18nContext = createContext<I18nContextValue>({
  locale: DEFAULT_UI_LOCALE,
  t: catalogs[DEFAULT_UI_LOCALE],
  setLocale: () => {},
});

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<UiLocale>(DEFAULT_UI_LOCALE);

  useEffect(() => {
    const stored = readStoredLocale();
    setLocaleState(stored);
    applyDocumentLang(stored);
  }, []);

  const setLocale = useCallback((next: UiLocale) => {
    setLocaleState(next);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(UI_LOCALE_KEY, next);
    }
    applyDocumentLang(next);
  }, []);

  const value = useMemo(
    () => ({ locale, t: catalogs[locale], setLocale }),
    [locale, setLocale],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  return useContext(I18nContext);
}
