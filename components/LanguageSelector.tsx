import React, { useState, useMemo } from 'react';
import { LANGUAGES } from '../constants.ts';
import type { Language } from '../types.ts';
import { useTranslations } from '../hooks/useTranslations.ts';

interface LanguagePairSelectorProps {
  onLanguagesSelected: (baseLanguage: Language, targetLanguage: Language) => void;
}

const LanguageSelect: React.FC<{
    id: string;
    label: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    options: Language[];
    placeholder: string;
    disabled?: boolean;
}> = ({ id, label, value, onChange, options, placeholder, disabled = false }) => (
    <div className="w-full">
        <label htmlFor={id} className="block mb-2 text-sm font-medium text-slate-600">
            {label}
        </label>
        <select
            id={id}
            value={value}
            onChange={onChange}
            disabled={disabled}
            className="w-full p-4 bg-white border border-slate-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
        >
            <option value="" disabled>{placeholder}</option>
            {options.map((lang) => (
                <option key={lang.code} value={lang.code}>
                    {`${lang.flag} ${lang.name}`}
                </option>
            ))}
        </select>
    </div>
);


export const LanguageSelector: React.FC<LanguagePairSelectorProps> = ({ onLanguagesSelected }) => {
  const [baseLangCode, setBaseLangCode] = useState('');
  const [targetLangCode, setTargetLangCode] = useState('');
  const { t } = useTranslations();

  const translatedLanguages = useMemo(() => {
    const translationMap = t as unknown as Record<string, string>;
    return LANGUAGES.map(lang => ({
      ...lang,
      name: translationMap[lang.name] || lang.name,
    }));
  }, [t]);

  const handleContinue = () => {
    // We find the original language object to pass to the session
    const baseLanguage = LANGUAGES.find(l => l.code === baseLangCode);
    const targetLanguage = LANGUAGES.find(l => l.code === targetLangCode);
    if (baseLanguage && targetLanguage) {
      onLanguagesSelected(baseLanguage, targetLanguage);
    }
  };

  const targetLanguageOptions = useMemo(() => {
    if (!baseLangCode) return [];
    return translatedLanguages.filter(lang => lang.code !== baseLangCode);
  }, [baseLangCode, translatedLanguages]);

  return (
    <div className="flex flex-col items-center justify-center flex-1 bg-slate-100 p-4">
      <div className="text-center mb-12">
        <p className="mt-4 text-lg text-slate-600 max-w-2xl">{t.welcomeDescription}</p>
      </div>
      
      <div className="w-full max-w-md p-6 sm:p-8 space-y-6 bg-white/50 backdrop-blur-sm rounded-2xl shadow-xl">
          <LanguageSelect
            id="base-language"
            label={t.iSpeak}
            value={baseLangCode}
            onChange={(e) => {
                setBaseLangCode(e.target.value);
                setTargetLangCode('');
            }}
            options={translatedLanguages}
            placeholder={t.selectLanguage}
          />
          <LanguageSelect
            id="target-language"
            label={t.iWantToLearn}
            value={targetLangCode}
            onChange={(e) => setTargetLangCode(e.target.value)}
            options={targetLanguageOptions}
            disabled={!baseLangCode}
            placeholder={t.selectLanguage}
          />

          <button
            onClick={handleContinue}
            disabled={!baseLangCode || !targetLangCode}
            className="w-full py-4 text-lg font-bold text-white bg-indigo-600 rounded-xl shadow-lg hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-300 ease-in-out disabled:bg-indigo-400 disabled:cursor-not-allowed transform disabled:scale-100 hover:scale-105"
          >
            {t.continue}
          </button>
      </div>
    </div>
  );
};