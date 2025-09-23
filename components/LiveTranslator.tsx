import React, { useState, useMemo, useCallback } from 'react';
import { LANGUAGES } from '../constants.ts';
import type { Language } from '../types.ts';
import { useTranslations } from '../hooks/useTranslations.ts';
import { useSpeechToText } from '../hooks/useSpeechToText.ts';
import { useTextToSpeech } from '../hooks/useTextToSpeech.ts';
import { translateText } from '../services/geminiService.ts';

const LanguageSelect: React.FC<{
    id: string;
    label: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    options: Language[];
}> = ({ id, label, value, onChange, options }) => (
    <div className="w-full">
        <label htmlFor={id} className="block mb-2 text-sm font-medium text-slate-600">
            {label}
        </label>
        <select
            id={id}
            value={value}
            onChange={onChange}
            className="w-full p-4 bg-white border border-slate-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-150 ease-in-out"
        >
            {options.map((lang) => (
                <option key={lang.code} value={lang.code}>
                    {`${lang.flag} ${lang.name}`}
                </option>
            ))}
        </select>
    </div>
);

const MicIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M8.25 4.5a3.75 3.75 0 1 1 7.5 0v8.25a3.75 3.75 0 1 1-7.5 0V4.5Z" />
      <path d="M6 10.5a.75.75 0 0 1 .75.75v1.5a5.25 5.25 0 1 0 10.5 0v-1.5a.75.75 0 0 1 1.5 0v1.5a6.75 6.75 0 1 1-13.5 0v-1.5A.75.75 0 0 1 6 10.5Z" />
    </svg>
);

const SpeakerIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.318.664-2.66 1.905A9.76 9.76 0 0 0 1.5 12c0 .898.121 1.768.348 2.595.341 1.24 1.518 1.905 2.66 1.905H6.44l4.5 4.5c.945.945 2.56.276 2.56-1.06V4.06ZM18.584 12c0-1.857-.87-3.58-2.298-4.682a.75.75 0 1 0-.964 1.154 3.248 3.248 0 0 1 0 7.056.75.75 0 1 0 .964 1.154A4.735 4.735 0 0 0 18.584 12Z" />
    </svg>
);

export const LiveTranslator: React.FC = () => {
    const { t } = useTranslations();
    const [sourceLangCode, setSourceLangCode] = useState('en');
    const [targetLangCode, setTargetLangCode] = useState('es');
    const [recognizedText, setRecognizedText] = useState('');
    const [translatedText, setTranslatedText] = useState('');
    const [isTranslating, setIsTranslating] = useState(false);

    const { speak: speakTranslated, voices: translatedVoices } = useTextToSpeech(targetLangCode);
    const { speak: speakOriginal } = useTextToSpeech(sourceLangCode);

    const translatedLanguages = useMemo(() => {
        const translationMap = t as unknown as Record<string, string>;
        return LANGUAGES.map(lang => ({
            ...lang,
            name: translationMap[lang.name] || lang.name,
        }));
    }, [t]);

    const handleTranslate = useCallback(async (textToTranslate: string) => {
        if (!textToTranslate.trim()) return;

        setIsTranslating(true);
        setTranslatedText('');
        setRecognizedText(textToTranslate);

        const sourceLang = LANGUAGES.find(l => l.code === sourceLangCode);
        const targetLang = LANGUAGES.find(l => l.code === targetLangCode);

        if (sourceLang && targetLang) {
            try {
                const translation = await translateText(textToTranslate, sourceLang, targetLang);
                setTranslatedText(translation);
                const voice = translatedVoices.find(v => v.default) || (translatedVoices.length > 0 ? translatedVoices[0] : null);
                speakTranslated(translation, voice);
            } catch (error) {
                console.error("Translation error:", error);
                const errorMessage = t.geminiError;
                setTranslatedText(errorMessage);
                speakOriginal(errorMessage, null); // Speak error in the user's source language
            } finally {
                setIsTranslating(false);
            }
        }
    }, [sourceLangCode, targetLangCode, t.geminiError, translatedVoices, speakTranslated, speakOriginal]);
    
    const { isListening, interimTranscript, finalTranscript, startListening, stopListening, hasRecognitionSupport } = useSpeechToText(sourceLangCode, handleTranslate);

    const handleMicClick = () => {
        if (isListening) {
            stopListening();
        } else {
            setRecognizedText('');
            setTranslatedText('');
            startListening();
        }
    };

    const textToDisplay = isListening ? (
      <>
        {finalTranscript}
        <span className="text-slate-500 ml-1">{interimTranscript}</span>
      </>
    ) : recognizedText;

    return (
        <div className="flex flex-col flex-1 bg-slate-100 p-2 sm:p-4 overflow-y-auto">
            <div className="w-full max-w-2xl mx-auto space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <LanguageSelect
                        id="source-language"
                        label={t.iAmSpeaking}
                        value={sourceLangCode}
                        onChange={(e) => setSourceLangCode(e.target.value)}
                        options={translatedLanguages}
                    />
                    <LanguageSelect
                        id="target-language"
                        label={t.translateTo}
                        value={targetLangCode}
                        onChange={(e) => setTargetLangCode(e.target.value)}
                        options={translatedLanguages.filter(l => l.code !== sourceLangCode)}
                    />
                </div>

                <div className="text-center">
                    <button
                        onClick={handleMicClick}
                        disabled={!hasRecognitionSupport || isTranslating}
                        className={`relative w-20 h-20 sm:w-24 sm:h-24 rounded-full transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-offset-4
                            ${isListening 
                                ? 'bg-blue-500 text-white animate-pulse focus:ring-blue-500' 
                                : 'bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500'
                            } 
                            ${(!hasRecognitionSupport || isTranslating) && 'opacity-50 cursor-not-allowed'}`}
                        aria-label={isListening ? t.stopListening : t.startListening}
                    >
                        <MicIcon className="w-8 h-8 sm:w-10 sm:h-10 mx-auto" />
                    </button>
                    <p className="mt-4 text-lg font-semibold text-slate-700">
                        {isListening ? t.listening : (isTranslating ? '...' : t.speakNow)}
                    </p>
                </div>

                {(recognizedText || translatedText || isTranslating || isListening) && (
                    <div className="space-y-4">
                        <div className="p-6 bg-white rounded-2xl shadow-lg">
                            <h3 className="text-sm font-semibold text-slate-500 mb-2 flex justify-between items-center">
                                <span>{t.originalText}</span>
                                {recognizedText && !isTranslating && !isListening && (
                                    <button onClick={() => speakOriginal(recognizedText, null)} className="p-2 rounded-full text-slate-400 hover:bg-slate-200 transition-colors" title={t.replayAudio}>
                                        <SpeakerIcon className="w-5 h-5" />
                                    </button>
                                )}
                            </h3>
                            <p className="text-lg text-slate-800 min-h-[28px]">{textToDisplay}</p>
                        </div>
                        <div className="p-6 bg-white rounded-2xl shadow-lg">
                            <h3 className="text-sm font-semibold text-slate-500 mb-2 flex justify-between items-center">
                                <span>{t.translatedText}</span>
                                {translatedText && !isTranslating && (
                                    <button onClick={() => speakTranslated(translatedText, null)} className="p-2 rounded-full text-slate-400 hover:bg-slate-200 transition-colors" title={t.replayAudio}>
                                        <SpeakerIcon className="w-5 h-5" />
                                    </button>
                                )}
                            </h3>
                            <p className="text-2xl font-semibold text-indigo-600 min-h-[36px]">
                                {isTranslating ? <span className="animate-pulse">...</span> : translatedText}
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};