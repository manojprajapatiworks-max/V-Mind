import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";

export type Language = "en" | "th";
export type EnabledLanguages = "both" | "en" | "th";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  enabledLanguages: EnabledLanguages;
  showLanguageSwitcher: boolean;
  t: (key: string, translations?: Record<string, any>) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [enabledLanguages, setEnabledLanguages] = useState<EnabledLanguages>("both");
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem("vmind_lang");
    return (saved as Language) || "en";
  });

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "settings", "global"), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        const enabled = (data.enabledLanguages as EnabledLanguages) || "both";
        setEnabledLanguages(enabled);
        if (enabled === "en") {
          setLanguageState("en");
        } else if (enabled === "th") {
          setLanguageState("th");
        }
      }
    }, () => {
      // Fallback silently if offline or error
    });
    return () => unsub();
  }, []);

  const setLanguage = (lang: Language) => {
    if (enabledLanguages === "en" && lang !== "en") return;
    if (enabledLanguages === "th" && lang !== "th") return;
    setLanguageState(lang);
    localStorage.setItem("vmind_lang", lang);
  };

  const t = (key: string, translations?: Record<string, any>) => {
    if (!translations) return key;
    
    // If translations is a simple object with en/th keys
    if (translations[language]) {
      return translations[language];
    }

    // Fallback to English if Thai is missing
    if (language === "th" && translations["en"]) {
      return translations["en"];
    }

    return translations["en"] || key;
  };

  const showLanguageSwitcher = enabledLanguages === "both";

  return (
    <LanguageContext.Provider value={{ language, setLanguage, enabledLanguages, showLanguageSwitcher, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}

