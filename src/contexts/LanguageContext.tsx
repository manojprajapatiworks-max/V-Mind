import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

type Language = "en" | "th";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, translations?: Record<string, any>) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem("vmind_lang");
    return (saved as Language) || "en";
  });

  const setLanguage = (lang: Language) => {
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

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
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
