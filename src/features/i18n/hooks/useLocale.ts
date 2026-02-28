"use client";

import { createContext, useContext } from "react";
import en from "../messages/en.json";
import fr from "../messages/fr.json";

export type Locale = "en" | "fr";

type Messages = typeof en;

const messages: Record<Locale, Messages> = { en, fr };

interface LocaleContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: Messages;
}

export const LocaleContext = createContext<LocaleContextValue>({
  locale: "en",
  setLocale: () => {},
  t: en,
});

export function useLocale() {
  return useContext(LocaleContext);
}

export function getMessages(locale: Locale): Messages {
  return messages[locale];
}
