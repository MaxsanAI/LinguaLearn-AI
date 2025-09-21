import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { LANGUAGES } from '../constants.ts';
import type { Language } from '../types.ts';
import { useTranslations } from '../hooks/useTranslations.ts';
import { useTextToSpeech } from '../hooks/useTextToSpeech.ts';
import { translateText } from '../services/geminiService.ts';

const LanguageSelect: React.FC<{
    value: string;
    onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    options: Language[];
}> = ({ value, onChange, options }) => (
    <select
        value={value}
        onChange={onChange}
        className="w-full p-3 bg-white border border-slate-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-150 ease-in-out"
    >
        {options.map((lang) => (
            <option key={lang.code} value={lang.code}>
                {`${lang.flag} ${lang.name}`}
            </option>
        ))}
    </select>
);

const SwapIcon: React.FC<{ className?: string }> = ({ className }) => ( <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}> <path d="M6.39 3.442a.75.75 0 0 1 .14-1.052l3.5-2.5a.75.75 0 0 1 .9 1.204L8.23 3.5H14.5A2.5 2.5 0 0 1 17 6v1.07a.75.75 0 0 1-1.5 0V6a1 1 0 0 0-1-1H8.23l2.7 1.942a.75.75 0 1 1-.9 1.204l-3.5-2.5a.75.75 0 0 1 .06-.15Zm7.22 13.116a.75.75 0 0 1-.14 1.052l-3.5 2.5a.75.75 0 0 1-.9-1.204l2.7-1.942H5.5A2.5 2.5 0 0 1 3 14V12.93a.75.75 0 0 1 1.5 0V14a1 1 0 0 0 1 1h6.27l-2.7-1.942a.75.75 0 1 1 .9-1.204l3.5 2.5a.75.75 0 0 1-.06.15Z" /> </svg> );
const CopyIcon: React.FC<{ className?: string }> = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}><path d="M7 3.5A1.5 1.5 0 0 1 8.5 2h5.879a1.5 1.5 0 0 1 1.06.44l3.122 3.121A1.5 1.5 0 0 1 19 6.621V16.5A1.5 1.5 0 0 1 17.5 18h-11A1.5 1.5 0 0 1 5 16.5v-13A1.5 1.5 0 0 1 6.5 2H7v1.5Z" /><path d="M3 8.5A1.5 1.5 0 0 1 4.5 7h5A1.5 1.5 0 0 1 11 8.5v9a1.5 1.5 0 0 1-1.5 1.5h-5A1.5 1.5 0 0 1 3 17.5v-9Z" /></svg>);
const SpeakerIcon: React.FC<{ className?: string }> = ({ className }) => ( <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}> <path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.318.664-2.66 1.905A9.76 9.76 0 0 0 1.5 12c0 .898.121 1.768.348 2.595.341 1.24 1.518 1.905 2.66 1.905H6.44l4.5 4.5c.945.945 2.56.276 2.56-1.06V4.06ZM18.584 12c0-1.857-.87-3.58-2.298-4.682a.75.75 0 1 0-.964 1.154 3.248 3.248 0 0 1 0 7.056.75.75 0 1 0 .964 1.154A4.735 4.735 0 0 0 18.584 12Z" /> </svg> );


export const TextTranslator: React.FC = () => {
    const { t } = useTranslations();
    const [sourceLangCode, setSourceLangCode] = useState('en');
    const [targetLangCode, setTargetLangCode] = useState('sr');
    const [inputText, setInputText] = useState('');
    const [outputText, setOutputText] = useState('');
    const [isTranslating, setIsTranslating] = useState(false);
    const [copied, setCopied] = useState(false);

    const { speak: speakTranslated, hasVoices: hasTranslatedVoices } = useTextToSpeech(targetLangCode);
    const { speak: speakOriginal, hasVoices: hasOriginalVoices } = useTextToSpeech(sourceLangCode);

    const translatedLanguages = useMemo(() => {
        const translationMap = t as unknown as Record<string, string>;
        return LANGUAGES.map(lang => ({
            ...lang,
            name: translationMap[lang.name] || lang.name,
        }));
    }, [t]);

    const handleSwapLanguages = () => {
        const oldSource = sourceLangCode;
        setSourceLangCode(targetLangCode);
        setTargetLangCode(oldSource);
        setInputText(outputText);
        setOutputText('');
    };

    const handleTranslate = useCallback(async () => {
        if (!inputText.trim()) return;

        setIsTranslating(true);
        setOutputText('');

        const sourceLang = LANGUAGES.find(l => l.code === sourceLangCode);
        const targetLang = LANGUAGES.find(l => l.code === targetLangCode);

        if (sourceLang && targetLang) {
            try {
                const translation = await translateText(inputText, sourceLang, targetLang);
                setOutputText(translation);
            } catch (error) {
                console.error("Translation error:", error);
                setOutputText(t.geminiError);
            } finally {
                setIsTranslating(false);
            }
        }
    }, [inputText, sourceLangCode, targetLangCode, t.geminiError]);

    const handleCopyToClipboard = () => {
        if (!outputText) return;
        navigator.clipboard.writeText(outputText);
        setCopied(true);
    };
    
    useEffect(() => {
        if (copied) {
            const timer = setTimeout(() => setCopied(false), 2000);
            return () => clearTimeout(timer);
        }
    }, [copied]);

    const MAX_CHARS = 1000;

    return (
        <div className="flex flex-col flex-1 bg-slate-100 p-2 sm:p-4 overflow-y-auto">
            <div className="w-full max-w-2xl mx-auto space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-5 gap-2 items-center">
                    <div className="md:col-span-2">
                        <LanguageSelect value={sourceLangCode} onChange={(e) => setSourceLangCode(e.target.value)} options={translatedLanguages} />
                    </div>
                    <div className="text-center">
                         <button onClick={handleSwapLanguages} title={t.swapLanguages} className="p-3 rounded-full hover:bg-slate-200 transition-colors">
                            <SwapIcon className="w-5 h-5 text-slate-600" />
                        </button>
                    </div>
                    <div className="md:col-span-2">
                         <LanguageSelect value={targetLangCode} onChange={(e) => setTargetLangCode(e.target.value)} options={translatedLanguages.filter(l => l.code !== sourceLangCode)} />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="relative p-4 bg-white rounded-2xl shadow-lg">
                        <textarea
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value.slice(0, MAX_CHARS))}
                            placeholder={t.typeToTranslate}
                            className="w-full h-48 bg-transparent resize-none focus:outline-none text-slate-800 placeholder-slate-500 text-lg"
                            disabled={isTranslating}
                        />
                         <div className="absolute bottom-4 right-4 flex items-center gap-2">
                             <span className="text-xs text-slate-400">{t.characterLimit.replace('{count}', String(inputText.length)).replace('{limit}', String(MAX_CHARS))}</span>
                            <button onClick={() => speakOriginal(inputText, null)} disabled={!hasOriginalVoices || !inputText} title={t.replayAudio} className="p-2 rounded-full text-slate-400 hover:bg-slate-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                                <SpeakerIcon className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                    <div className="relative p-4 bg-white rounded-2xl shadow-lg">
                        <p className="w-full h-48 text-indigo-600 font-semibold text-lg overflow-y-auto">
                            {isTranslating ? <span className="animate-pulse">...</span> : outputText}
                        </p>
                         <div className="absolute bottom-4 right-4 flex items-center gap-2">
                             <button onClick={handleCopyToClipboard} title={t.copyToClipboard} className="p-2 rounded-full text-slate-400 hover:bg-slate-200 transition-colors">
                                {copied ? <span className="text-sm text-indigo-600 font-semibold">{t.copied}</span> : <CopyIcon className="w-5 h-5" />}
                            </button>
                            <button onClick={() => speakTranslated(outputText, null)} disabled={!hasTranslatedVoices || !outputText} title={t.replayAudio} className="p-2 rounded-full text-slate-400 hover:bg-slate-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                                <SpeakerIcon className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
                 <div className="text-center">
                    <button onClick={handleTranslate} disabled={isTranslating || !inputText.trim()} className="px-8 py-3 font-bold text-white bg-indigo-600 rounded-xl shadow-lg hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-300 disabled:bg-indigo-400 disabled:cursor-not-allowed">
                        {t.translateButton}
                    </button>
                </div>
            </div>
        </div>
    );
};