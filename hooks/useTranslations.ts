import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';
import { translations, UI_LANGUAGES, UiLanguageCode } from '../translations.ts';

type TranslationsContextType = {
  uiLanguage: UiLanguageCode;
  setUiLanguage: (lang: UiLanguageCode) => void;
  t: typeof translations.en;
};

const TranslationsContext = createContext<TranslationsContextType | undefined>(undefined);

const getInitialLanguage = (): UiLanguageCode => {
    const browserLang = navigator.language.split('-')[0];
    const supportedLang = UI_LANGUAGES.find(lang => lang.code === browserLang);
    return supportedLang ? supportedLang.code : 'en';
};

export const TranslationsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [uiLanguage, setUiLanguage] = useState<UiLanguageCode>(getInitialLanguage);

  useEffect(() => {
    document.documentElement.lang = uiLanguage;
  }, [uiLanguage]);

  const t = useMemo(() => translations[uiLanguage], [uiLanguage]);

  const value = {
    uiLanguage,
    setUiLanguage,
    t,
  };

  return React.createElement(TranslationsContext.Provider, { value }, children);
};

export const useTranslations = () => {
  const context = useContext(TranslationsContext);
  if (context === undefined) {
    throw new Error('useTranslations must be used within a TranslationsProvider');
  }
  return context;
};
