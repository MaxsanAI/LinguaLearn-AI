import React, { useState, useRef, useEffect } from 'react';
import { useTranslations } from '../hooks/useTranslations.ts';
import { UI_LANGUAGES, UiLanguageCode } from '../translations.ts';

const ChevronDownIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
      <path fillRule="evenodd" d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
    </svg>
);

export const UiLanguageSwitcher: React.FC = () => {
    const { uiLanguage, setUiLanguage } = useTranslations();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const currentLang = UI_LANGUAGES.find(lang => lang.code === uiLanguage) || UI_LANGUAGES[0];

    const handleSelectLanguage = (langCode: UiLanguageCode) => {
        setUiLanguage(langCode);
        setIsOpen(false);
    };

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center space-x-2 p-2 rounded-full hover:bg-slate-200 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                aria-haspopup="true"
                aria-expanded={isOpen}
            >
                <span className="text-xl">{currentLang.flag}</span>
                <ChevronDownIcon />
            </button>

            {isOpen && (
                <div
                    className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl ring-1 ring-black ring-opacity-5 z-30"
                    role="menu"
                    aria-orientation="vertical"
                >
                    <div className="py-1" role="none">
                        {UI_LANGUAGES.map(lang => (
                            <button
                                key={lang.code}
                                onClick={() => handleSelectLanguage(lang.code)}
                                className="w-full text-left flex items-center px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
                                role="menuitem"
                            >
                                <span className="text-xl mr-3">{lang.flag}</span>
                                <span>{lang.name}</span>
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};
