"use client";

import React, { createContext, useContext, useState, useEffect, useMemo } from "react";
import { Language, TranslationDictionary } from "./types";
import { translations } from "./translations";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: TranslationDictionary;
}

const STORAGE_KEY = "whenreset_lang";

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en");

  // Read saved preference on mount; default to English
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as Language | null;
      if (saved === "en" || saved === "zh") {
        setLanguageState(saved);
        return;
      }

      // Clean up legacy storage key if present
      localStorage.removeItem("whenreset_language");
    } catch {
      // Ignore localStorage read errors
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      // Ignore localStorage write errors
    }
  };

  const toggleLanguage = () => {
    setLanguage(language === "en" ? "zh" : "en");
  };

  const t = useMemo(() => translations[language], [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextType {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
