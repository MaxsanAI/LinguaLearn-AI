import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';
import { translations, UI_LANGUAGES, UiLanguageCode, TranslationSet } from '../translations.ts';

type TranslationsContextType = {
  uiLanguage: UiLanguageCode;
  setUiLanguage: (lang: UiLanguageCode) => void;
  t: TranslationSet;
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

  // The setter function `setUiLanguage` from useState is stable. We memoize the 
  // context value to prevent unnecessary re-renders of consuming components. The 
  // value object is only recreated when the `uiLanguage` state changes.
  const value = useMemo(() => ({
    uiLanguage,
    setUiLanguage,
    t: translations[uiLanguage],
  }), [uiLanguage]);

  // FIX: Replaced JSX with React.createElement to resolve parsing errors in a .ts file.
  // The file uses JSX syntax but has a .ts extension, which causes the TypeScript
  // compiler to misinterpret JSX tags as comparison operators.
  return React.createElement(TranslationsContext.Provider, { value: value }, children);
};

export const useTranslations = () => {
  const context = useContext(TranslationsContext);
  if (context === undefined) {
    throw new Error('useTranslations must be used within a TranslationsProvider');
  }
  return context;
};
