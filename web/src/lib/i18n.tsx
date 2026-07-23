"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import en from "../../messages/en.json";

type Messages = typeof en;

const I18nContext = createContext<{ locale: string; t: Messages }>({
  locale: "en",
  t: en,
});

export function I18nProvider({ children }: { children: ReactNode }) {
  const value = useMemo(() => ({ locale: "en", t: en }), []);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  return useContext(I18nContext);
}
