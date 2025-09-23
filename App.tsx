import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { LanguageSelector } from './components/LanguageSelector.tsx';
import { ChatWindow } from './components/ChatWindow.tsx';
import { MessageInput } from './components/MessageInput.tsx';
import { SettingsPanel } from './components/SettingsPanel.tsx';
import { UiLanguageSwitcher } from './components/UiLanguageSwitcher.tsx';
import { LiveTranslator } from './components/LiveTranslator.tsx';
import { TextTranslator } from './components/TextTranslator.tsx';
import { Tutorial } from './components/Tutorial.tsx';
import { UpgradeModal } from './components/UpgradeModal.tsx';
import { getConversationResponse } from './services/geminiService.ts';
import { useSpeechToText } from './hooks/useSpeechToText.ts';
import { useTextToSpeech } from './hooks/useTextToSpeech.ts';
import { useTranslations } from './hooks/useTranslations.ts';
import { SCENARIOS, DAILY_MESSAGE_LIMIT } from './constants.ts';
import type { Language, ChatMessage, AppMode, User, Scenario, HistorySession } from './types.ts';

declare global {
    interface Window {
        AndroidBridge?: {
            showRewardedAd: () => void;
            showInterstitialAd: () => void;
        };
        onRewardedAdCompleted: () => void;
    }
}

// Icons for UI elements
const SettingsIcon: React.FC = () => ( <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"> <path fillRule="evenodd" d="M11.078 2.25c-.917 0-1.699.663-1.85 1.567L9.05 5.85a1.5 1.5 0 0 1-1.058 1.058l-2.022.171c-.904.076-1.567.833-1.567 1.745v2.246c0 .912.663 1.669 1.567 1.745l2.022.171a1.5 1.5 0 0 1 1.058 1.058l.171 2.022c.076.904.833 1.567 1.745 1.567h2.246c.912 0 1.669-.663 1.745-1.567l.171-2.022a1.5 1.5 0 0 1 1.058-1.058l2.022-.171c.904-.076 1.567-.833 1.567-1.745v-2.246c0-.912-.663-1.669-1.567-1.745l-2.022-.171a1.5 1.5 0 0 1-1.058-1.058l-.171-2.022c-.076-.904-.833-1.567-1.745-1.567h-2.246Zm-1.63 9.75a4.125 4.125 0 1 1 8.25 0 4.125 4.125 0 0 1-8.25 0Z" clipRule="evenodd" /> </svg> );
const TutorIcon: React.FC = () => ( <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"> <path d="M12.378 1.602a.75.75 0 0 0-.756 0L3 7.225V18a2.25 2.25 0 0 0 2.25 2.25h13.5A2.25 2.25 0 0 0 21 18V7.225L12.378 1.602ZM12 15.75a3 3 0 1 1 0-6 3 3 0 0 1 0 6Z" /> </svg> );
const TranslatorIcon: React.FC = () => ( <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"> <path d="M12.865 3.033a.75.75 0 0 0-1.23 0L3.34 14.22a.75.75 0 0 0 .615 1.125h2.476a.75.75 0 0 1 .737.623l.635 2.855a.75.75 0 0 0 1.46-.324L10.33 13.5h3.34l1.066 4.999a.75.75 0 0 0 1.46.324l.636-2.855a.75.75 0 0 1 .736-.623h2.476a.75.75 0 0 0 .616-1.125L12.865 3.033Zm-1.54 8.217L12 6.561l.675 4.689h-1.35Z" /> <path d="M21.573 17.625a.75.75 0 0 1-1.015.31L18 16.687v2.063a.75.75 0 0 1-1.5 0V15.75a.75.75 0 0 1 .88-.743l2.573.514a.75.75 0 0 1 .62.723v1.38Z" /> </svg> );
const TextIcon: React.FC = () => ( <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"> <path fillRule="evenodd" d="M3.375 3C2.339 3 1.5 3.84 1.5 4.875v14.25C1.5 20.16 2.34 21 3.375 21h17.25c1.035 0 1.875-.84 1.875-1.875V4.875C22.5 3.839 21.66 3 20.625 3H3.375ZM9 8.25a.75.75 0 0 0 0 1.5h6a.75.75 0 0 0 0-1.5H9Zm0 3.75a.75.75 0 0 0 0 1.5h6a.75.75 0 0 0 0-1.5H9Zm0 3.75a.75.75 0 0 0 0 1.5h6a.75.75 0 0 0 0-1.5H9Z" clipRule="evenodd" /> </svg> );
const HistoryIcon: React.FC = () => ( <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"> <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25ZM12.75 6a.75.75 0 0 0-1.5 0v6c0 .414.336.75.75.75h4.5a.75.75 0 0 0 0-1.5h-3.75V6Z" clipRule="evenodd" /> </svg> );
const TutorialIcon: React.FC = () => ( <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"> <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm11.378-3.917c-.89-.777-2.366-.777-3.255 0a.75.75 0 0 1-.988-1.129c1.454-1.272 3.776-1.272 5.23 0 .79.688.98 1.864.485 2.711l-.458.764c-.3.502-.635.926-.994 1.282a.75.75 0 0 0 .534 1.281h1.116a.75.75 0 0 1 0 1.5H12a.75.75 0 0 1-.75-.75v-1.123c0-.383.158-.75.432-1.012l.458-.764c.247-.413.43-.805.534-1.18.103-.374.08-.783-.058-1.129Zm-1.128 9.062a1.125 1.125 0 1 0 0-2.25 1.125 1.125 0 0 0 0 2.25Z" clipRule="evenodd" /> </svg> );
const XPIcon: React.FC<{ className?: string }> = ({ className }) => ( <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={`w-5 h-5 ${className || ''}`}> <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006 5.404.434c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.434 2.082-5.005Z" clipRule="evenodd" /> </svg> );
const StreakIcon: React.FC<{ className?: string }> = ({ className }) => ( <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={`w-5 h-5 ${className || ''}`}> <path fillRule="evenodd" d="M12.963 2.286a.75.75 0 0 0-1.071 1.052A9.75 9.75 0 0 1 12 12.75v1.25a.75.75 0 0 0 1.5 0v-1.25a8.25 8.25 0 0 0-2.66-6.075.75.75 0 0 0-1.052-1.071 9.75 9.75 0 0 1 5.223 6.316.75.75 0 0 0 .683.425h2.82a.75.75 0 0 0 0-1.5h-2.82a8.25 8.25 0 0 0-4.42-5.276Z" clipRule="evenodd" /> <path fillRule="evenodd" d="M12 21a8.25 8.25 0 0 0 8.25-8.25.75.75 0 0 0-1.5 0A6.75 6.75 0 0 1 12 19.5a.75.75 0 0 0 0 1.5ZM12 3.75a.75.75 0 0 0 0 1.5A6.75 6.75 0 0 1 18.75 12a.75.75 0 0 0 1.5 0A8.25 8.25 0 0 0 12 3.75Z" clipRule="evenodd" /> </svg> );
const CloseIcon: React.FC<{ className?: string }> = ({ className }) => ( <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}><path fillRule="evenodd" d="M5.47 5.47a.75.75 0 0 1 1.06 0L12 10.94l5.47-5.47a.75.75 0 1 1 1.06 1.06L13.06 12l5.47 5.47a.75.75 0 1 1-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 0 1-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" /></svg>);
const PremiumCrownIcon: React.FC<{ className?: string; title?: string }> = ({ className, title }) => (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}><title>{title}</title><path fillRule="evenodd" d="M15.994 4.502a.75.75 0 0 1 .098 1.05l-2.008 2.935-1.553.228.318 3.548a.75.75 0 0 1-1.495.138l-.6-6.661a.75.75 0 0 1 .523-.71l2.541-.847.76-.928a.75.75 0 0 1 1.05-.098ZM5.453 7.437l2.008-2.935a.75.75 0 0 1 1.148.098l.76.928 2.541.847a.75.75 0 0 1 .523.71l-.6 6.661a.75.75 0 1 1-1.495-.138l.318-3.548-1.553-.228-2.008-2.935a.75.75 0 0 1-.098-1.05Z" clipRule="evenodd" /></svg>);


const ApiKeyErrorScreen: React.FC<{ message: string }> = ({ message }) => ( <div className="flex flex-col h-screen items-center justify-center p-4 bg-slate-100 text-slate-800"> <div className="w-full max-w-md text-center bg-white p-8 rounded-2xl shadow-xl"> <svg xmlns="http://www.w3.org/2000/svg" className="w-16 h-16 mx-auto text-red-500" viewBox="0 0 24 24" fill="currentColor"> <path fillRule="evenodd" d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.51 12.992a3 3 0 0 1-2.598 4.504H4.49C1.895 20.5 0 18.364 0 15.75c0-1.12.375-2.162 1.002-3.003L9.401 3.003ZM12 8.25a.75.75 0 0 1 .75.75v3.75a.75.75 0 0 1-1.5 0V9a.75.75 0 0 1 .75-.75Zm0 8.25a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z" clipRule="evenodd" /> </svg> <h1 className="mt-4 text-2xl font-bold">Configuration Error</h1> <p className="mt-2 text-slate-600">{message}</p> </div> </div> );

// SUB-COMPONENTS
const LoginScreen: React.FC<{ onLogin: (name: string) => void; }> = ({ onLogin }) => {
    const [name, setName] = useState('');
    const { t } = useTranslations();
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (name.trim()) onLogin(name.trim());
    };
    return (
        <div className="flex flex-col items-center justify-center h-screen bg-slate-100 p-4">
            <div className="text-center mb-8 sm:mb-12">
                <h1 className="text-4xl sm:text-5xl font-bold text-indigo-600">{t.welcomeTitle}</h1>
            </div>
            <div className="w-full max-w-sm p-6 sm:p-8 space-y-6 bg-white/50 backdrop-blur-sm rounded-2xl shadow-xl">
                <h2 className="text-2xl font-bold text-center text-slate-800">{t.login_title}</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="name" className="block mb-2 text-sm font-medium text-slate-600">{t.your_name}</label>
                        <input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} required className="w-full p-4 bg-white border border-slate-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder={t.name_placeholder} />
                    </div>
                    <button type="submit" className="w-full py-4 text-lg font-bold text-white bg-indigo-600 rounded-xl shadow-lg hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-300 ease-in-out">
                        {t.login_button}
                    </button>
                </form>
            </div>
        </div>
    );
};

const ScenarioSelector: React.FC<{ onSelectScenario: (scenario: Scenario) => void; onSelectFreeConversation: () => void; }> = ({ onSelectScenario, onSelectFreeConversation }) => {
    const { t } = useTranslations();
    const translationMap = t as unknown as Record<string, string>;
    return (
        <div className="flex flex-col items-center justify-center flex-1 bg-slate-100 p-4">
            <div className="w-full max-w-2xl mx-auto">
                <h2 className="text-2xl sm:text-3xl font-bold text-center text-slate-800 mb-8">{t.chooseMode}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <button onClick={onSelectFreeConversation} className="p-6 sm:p-8 bg-white/50 backdrop-blur-sm rounded-2xl shadow-xl text-center hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
                        <h3 className="text-xl sm:text-2xl font-bold text-indigo-600">{t.freeConversation}</h3>
                        <p className="text-slate-600 mt-2">{t.freeConversationDesc}</p>
                    </button>
                    {SCENARIOS.map(scenario => (
                        <button key={scenario.id} onClick={() => onSelectScenario(scenario)} className="p-6 sm:p-8 bg-white/50 backdrop-blur-sm rounded-2xl shadow-xl text-center hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
                            <h3 className="text-xl sm:text-2xl font-bold text-indigo-600">{translationMap[scenario.titleKey] || scenario.titleKey}</h3>
                            <p className="text-slate-600 mt-2">{translationMap[scenario.descriptionKey] || scenario.descriptionKey}</p>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

const HistoryPanel: React.FC<{ history: HistorySession[], onSelectSession: (session: HistorySession) => void; onClose: () => void; }> = ({ history, onSelectSession, onClose }) => {
    const { t } = useTranslations();
    return (
        <div className="absolute inset-0 z-20 flex" onClick={onClose}>
            <div className="w-full max-w-md bg-white shadow-2xl h-full flex flex-col" onClick={e => e.stopPropagation()}>
                <header className="flex items-center justify-between p-4 border-b">
                    <h2 className="text-xl font-bold">{t.history}</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100"><CloseIcon className="w-6 h-6" /></button>
                </header>
                <div className="flex-1 overflow-y-auto p-4">
                    {history.length === 0 ? (
                        <p className="text-slate-500 text-center mt-8">{t.history_empty}</p>
                    ) : (
                        <ul className="space-y-3">
                            {history.slice().reverse().map(session => (
                                <li key={session.id}>
                                    <button onClick={() => onSelectSession(session)} className="w-full text-left p-4 bg-slate-50 rounded-lg hover:bg-slate-100 border border-slate-200">
                                        <div className="font-semibold">{`${session.baseLanguage.flag} ${t[session.baseLanguage.name] || session.baseLanguage.name} → ${session.targetLanguage.flag} ${t[session.targetLanguage.name] || session.targetLanguage.name}`}</div>
                                        {session.scenarioTitleKey && <div className="text-sm text-indigo-600">{t[session.scenarioTitleKey] || session.scenarioTitleKey}</div>}
                                        <div className="text-xs text-slate-500 mt-1">{new Date(session.timestamp).toLocaleString()}</div>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
};

const App: React.FC = () => {
    // App State
    const [view, setView] = useState<AppMode | 'login' | 'language' | 'scenario' | 'history_view' | 'chat'>('login');
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<{ base: Language; target: Language } | null>(null);
    const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);
    const [isTutorialOpen, setIsTutorialOpen] = useState(false);
    const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
    const [history, setHistory] = useState<HistorySession[]>([]);
    const [xp, setXp] = useState(0);
    const [streak, setStreak] = useState(0);
    const [dailyMessageCount, setDailyMessageCount] = useState(0);
    const [isWatchingAd, setIsWatchingAd] = useState(false);
    const [adRewardMessage, setAdRewardMessage] = useState<string | null>(null);

    const { t } = useTranslations();
    const { baseLanguage, targetLanguage } = useMemo(() => ({ baseLanguage: session?.base, targetLanguage: session?.target }), [session]);
    const isPremium = useMemo(() => (user?.premiumUntil ?? 0) > Date.now(), [user]);

    const { speak, voices, hasVoices } = useTextToSpeech(targetLanguage?.code || 'en');
    
    // FIX: Moved `handleTutorResponse` and `sendMessage` up to resolve a "used before declaration" error in `handleFinishedSpeech`.
    const handleTutorResponse = useCallback((content: { original: string; translation?: string; }) => {
        setMessages(prev => [...prev, { role: 'model', content: content }]);
    }, []);

    const sendMessage = useCallback(async (text: string) => {
        if (!baseLanguage || !targetLanguage || view !== 'chat' || (!isPremium && dailyMessageCount >= DAILY_MESSAGE_LIMIT)) return;

        const userMessage: ChatMessage = { role: 'user', content: { original: text } };
        const updatedMessages = [...messages, userMessage];
        setMessages(updatedMessages);
        setIsLoading(true);
        try {
            const response = await getConversationResponse(updatedMessages, baseLanguage, targetLanguage, selectedScenario?.instruction);
            handleTutorResponse({ original: response.response, translation: response.translation });
            setXp(prev => prev + 10);
            
            if (!isPremium) {
                const newCount = dailyMessageCount + 1;
                setDailyMessageCount(newCount);
                localStorage.setItem('lingua_daily_limit', JSON.stringify({ date: new Date().toDateString(), count: newCount }));
            }
        } catch (error) {
            console.error("Error sending message:", error);
            setMessages(prev => [...prev, { role: 'model', content: { original: t.geminiError } }]);
        } finally {
            setIsLoading(false);
        }
    }, [baseLanguage, targetLanguage, handleTutorResponse, t.geminiError, messages, selectedScenario, view, dailyMessageCount, isPremium]);

    const handleFinishedSpeech = useCallback((transcript: string) => {
        if (transcript && !isLoading) {
            sendMessage(transcript);
        }
    }, [isLoading, sendMessage]);
    
    const { isListening, interimTranscript, finalTranscript, startListening, stopListening, hasRecognitionSupport } = useSpeechToText(baseLanguage?.code || 'en', handleFinishedSpeech);
    
    const [selectedVoiceURI, setSelectedVoiceURI] = useState<string | null>(null);
    const [voiceRate, setVoiceRate] = useState(1);
    const [voicePitch, setVoicePitch] = useState(1);
    
    // Load data from localStorage on initial render
    useEffect(() => {
        try {
            const savedUser = localStorage.getItem('lingua_user');
            const savedHistory = localStorage.getItem('lingua_history');
            const savedGamification = localStorage.getItem('lingua_gamification');
            if (savedUser) {
                const parsedUser = JSON.parse(savedUser);
                setUser(parsedUser);
                setView('language');
            }
            if (savedHistory) setHistory(JSON.parse(savedHistory));
            if (savedGamification) {
                const { xp, streak, lastLogin } = JSON.parse(savedGamification);
                setXp(xp || 0);
                const today = new Date().toDateString();
                const yesterday = new Date(Date.now() - 86400000).toDateString();
                if (lastLogin === today) {
                    setStreak(streak || 0);
                } else if (lastLogin === yesterday) {
                    setStreak((streak || 0) + 1);
                } else {
                    setStreak(1); // Reset or start streak
                }
            } else {
                setStreak(1);
            }

            const savedLimit = localStorage.getItem('lingua_daily_limit');
            const today = new Date().toDateString();
            if (savedLimit) {
                const { date, count } = JSON.parse(savedLimit);
                if (date === today) {
                    setDailyMessageCount(count);
                } else {
                    localStorage.setItem('lingua_daily_limit', JSON.stringify({ date: today, count: 0 }));
                    setDailyMessageCount(0);
                }
            } else {
                 localStorage.setItem('lingua_daily_limit', JSON.stringify({ date: today, count: 0 }));
            }
        } catch (error) {
            console.error("Failed to load data from localStorage", error);
        }
    }, []);

    // Save user data to localStorage
    useEffect(() => {
        if (user === null && !localStorage.getItem('lingua_user')) return;
        try {
            if (user) {
                localStorage.setItem('lingua_user', JSON.stringify(user));
            }
        } catch (error) {
            console.error('Failed to save user data to localStorage:', error);
        }
    }, [user]);

    // Save chat history to localStorage
    useEffect(() => {
        if (history.length === 0 && !localStorage.getItem('lingua_history')) return;
        try {
            localStorage.setItem('lingua_history', JSON.stringify(history));
        } catch (error) {
            console.error('Failed to save history to localStorage:', error);
        }
    }, [history]);

    // Save gamification stats to localStorage
    useEffect(() => {
        try {
            const gamificationData = { xp, streak, lastLogin: new Date().toDateString() };
            localStorage.setItem('lingua_gamification', JSON.stringify(gamificationData));
        } catch (error) {
            console.error('Failed to save gamification data to localStorage:', error);
        }
    }, [xp, streak]);


    useEffect(() => {
        if (voices.length > 0) {
            const currentVoiceIsValid = voices.some(v => v.voiceURI === selectedVoiceURI);
            if (!currentVoiceIsValid) {
                const defaultVoice = voices.find(v => v.default) || voices[0];
                setSelectedVoiceURI(defaultVoice?.voiceURI);
            }
        }
    }, [voices, selectedVoiceURI]);

    // Effect to handle speaking new messages from the model
    useEffect(() => {
        const lastMessage = messages[messages.length - 1];

        if (lastMessage?.role === 'model' && view === 'chat') {
            const isFirstModelMessage = messages.filter(m => m.role === 'model').length === 1;

            const voiceToUse = isFirstModelMessage
                ? null
                : voices.find(v => v.voiceURI === selectedVoiceURI) || null;

            speak(lastMessage.content.original, voiceToUse, { rate: voiceRate, pitch: voicePitch });
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [messages]);
    
    const startChatSession = useCallback(async (base: Language, target: Language, scenario: Scenario | null) => {
        setSession({ base, target });
        setSelectedScenario(scenario);
        setView('chat');
        setIsLoading(true);
        setMessages([]);
        try {
            const response = await getConversationResponse([], base, target, scenario?.instruction);
            handleTutorResponse({ original: response.response, translation: response.translation });
        } catch (error) {
           console.error("Failed to start session:", error);
           setMessages([{ role: 'model', content: { original: t.geminiError } }]);
        } finally {
            setIsLoading(false);
        }
    }, [handleTutorResponse, t.geminiError]);

    const handleLanguagesSelected = useCallback((base: Language, target: Language) => {
        setSession({ base, target });
        setView('scenario');
    }, []);
    
    const endAndSaveSession = useCallback(() => {
        // Show interstitial ad for non-premium users before resetting state
        if (!isPremium && window.AndroidBridge?.showInterstitialAd) {
            window.AndroidBridge.showInterstitialAd();
        }

        if (session && messages.length > 0) {
            const newHistorySession: HistorySession = {
                id: Date.now().toString(),
                baseLanguage: session.base,
                targetLanguage: session.target,
                scenarioTitleKey: selectedScenario?.titleKey,
                messages: messages,
                timestamp: Date.now(),
            };
            setHistory(prev => [...prev, newHistorySession]);
        }
        setSession(null);
        setMessages([]);
        setSelectedScenario(null);
        setIsLoading(false);
        setIsSettingsOpen(false);
        setView('language');
    }, [session, messages, selectedScenario, isPremium]);
    
    const handleLogin = useCallback((name: string) => {
        setUser({ name, premiumUntil: null });
        setView('language');
    }, []);
    const handleLogout = useCallback(() => {
        localStorage.removeItem('lingua_user');
        setUser(null);
        setView('login');
        setSession(null);
        setMessages([]);
        setIsSettingsOpen(false);
    }, []);

    const handleReplayAudio = useCallback((text: string) => {
        const selectedVoice = voices.find(v => v.voiceURI === selectedVoiceURI) || null;
        speak(text, selectedVoice, { rate: voiceRate, pitch: voicePitch });
    }, [speak, voices, selectedVoiceURI, voiceRate, voicePitch]);

    const handleTestVoice = useCallback((voice: SpeechSynthesisVoice) => {
        speak(t.voiceTestSentence, voice, { rate: voiceRate, pitch: voicePitch });
    }, [speak, t.voiceTestSentence, voiceRate, voicePitch]);

    const handleSelectHistorySession = useCallback((session: HistorySession) => {
        setSession({ base: session.baseLanguage, target: session.targetLanguage });
        setMessages(session.messages);
        setView('history_view');
        setIsHistoryOpen(false);
    }, [])

    const handleUpgradeSuccess = useCallback((plan: 'monthly' | 'yearly') => {
        if (user) {
            const now = new Date();
            let expiryDate: Date;
            if (plan === 'monthly') {
                expiryDate = new Date(now.setMonth(now.getMonth() + 1));
            } else {
                expiryDate = new Date(now.setFullYear(now.getFullYear() + 1));
            }
            setUser({ ...user, premiumUntil: expiryDate.getTime() });
        }
        setIsUpgradeModalOpen(false);
    }, [user]);

    const handleWatchAd = useCallback(() => {
        if (window.AndroidBridge?.showRewardedAd) {
            setIsWatchingAd(true);
            window.AndroidBridge.showRewardedAd();
        } else {
            console.warn("Android Ad Bridge not found. Bypassing for web testing.");
             // Fallback for web testing - grant reward immediately
            const newCount = Math.max(0, dailyMessageCount - 5);
            setDailyMessageCount(newCount);
            localStorage.setItem('lingua_daily_limit', JSON.stringify({ date: new Date().toDateString(), count: newCount }));
            setAdRewardMessage(t.rewardGranted);
            setTimeout(() => setAdRewardMessage(null), 3000);
        }
    }, [dailyMessageCount, t.rewardGranted]);

    useEffect(() => {
        // This function will be called from the native Android code after a rewarded ad is successfully watched.
        window.onRewardedAdCompleted = () => {
            const newCount = Math.max(0, dailyMessageCount - 5); // Grant 5 messages by reducing the count
            setDailyMessageCount(newCount);
            localStorage.setItem('lingua_daily_limit', JSON.stringify({ date: new Date().toDateString(), count: newCount }));
            
            setIsWatchingAd(false);
            setAdRewardMessage(t.rewardGranted);
            setTimeout(() => setAdRewardMessage(null), 3000); // Show a confirmation message
        };

        return () => { // Cleanup on component unmount
            // @ts-ignore
            delete window.onRewardedAdCompleted;
        };
    }, [dailyMessageCount, t.rewardGranted]);
    
    if (view === 'login') return <LoginScreen onLogin={handleLogin} />;

    const ModeButton: React.FC<{ mode: AppMode; label: string; children: React.ReactNode; }> = ({ mode, label, children }) => {
        const isTutorModeActive = ['language', 'scenario', 'chat', 'history_view'].includes(view as string) && mode === 'tutor';
        const isCurrentMode = view === mode;
        const isActive = isTutorModeActive || isCurrentMode;

        const handleSetView = () => {
            if (mode === 'tutor') {
                setView('language');
            } else {
                setView(mode);
            }
        };

        return (
            <button 
                onClick={handleSetView} 
                className={`flex items-center gap-2 px-3 py-1.5 text-sm font-semibold rounded-full transition-colors ${ isActive ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-200'}`}
            > 
                {children} 
                <span className="hidden sm:inline">{label}</span> 
            </button>
        );
    };

    const mainContent = () => {
        switch (view) {
            case 'language': return <LanguageSelector onLanguagesSelected={handleLanguagesSelected} />;
            case 'scenario': return <ScenarioSelector onSelectScenario={(s) => startChatSession(session!.base, session!.target, s)} onSelectFreeConversation={() => startChatSession(session!.base, session!.target, null)} />;
            case 'chat':
            case 'history_view':
                return (
                    <main className="flex-1 flex flex-col overflow-hidden">
                        <ChatWindow messages={messages} isLoading={isLoading} onReplayAudio={handleReplayAudio} hasVoices={hasVoices} />
                        {view === 'chat' && 
                            <MessageInput 
                                onSendMessage={sendMessage} 
                                isLoading={isLoading} 
                                isListening={isListening} 
                                onMicClick={isListening ? stopListening : startListening} 
                                interimTranscript={interimTranscript} 
                                finalTranscript={finalTranscript} 
                                hasRecognitionSupport={hasRecognitionSupport} 
                                dailyMessageCount={dailyMessageCount}
                                dailyLimit={DAILY_MESSAGE_LIMIT}
                                isPremium={isPremium}
                                onUpgradeClick={() => setIsUpgradeModalOpen(true)}
                                onWatchAd={handleWatchAd}
                                isWatchingAd={isWatchingAd}
                            />
                        }
                    </main>
                );
            case 'translator': return <LiveTranslator />;
            case 'text_translator': return <TextTranslator />;
            default: return <LanguageSelector onLanguagesSelected={handleLanguagesSelected} />;
        }
    };

    return (
    <div className="flex flex-col h-screen font-sans bg-slate-100 text-slate-800">
      {adRewardMessage && (
          <div className="fixed bottom-20 left-1/2 -translate-x-1/2 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-fade-in-up">
              {adRewardMessage}
          </div>
      )}
      <header className="relative flex flex-wrap sm:flex-nowrap items-center justify-between p-3 border-b border-slate-200 bg-white/80 backdrop-blur-sm z-10 shrink-0">
        {/* Left Icons */}
        <div className="flex items-center gap-2">
            <button onClick={() => setIsTutorialOpen(true)} className="p-2 rounded-full text-slate-500 hover:bg-slate-200 transition-colors" aria-label={t.tutorial} title={t.tutorial}>
              <TutorialIcon />
            </button>
            {user && (
              <button onClick={() => setIsHistoryOpen(true)} className="p-2 rounded-full text-slate-500 hover:bg-slate-200 transition-colors" aria-label={t.history} title={t.history}>
                  <HistoryIcon />
              </button>
            )}
        </div>
        
        {/* Right Icons */}
        <div className="flex items-center gap-2 sm:gap-4">
            <div className="flex items-center gap-1 text-sm font-semibold text-slate-600" title={`${xp} ${t.xp_points}`}>
               {isPremium && <PremiumCrownIcon className="w-5 h-5 text-amber-500" title={t.premium_user} />}
               <XPIcon className="text-yellow-500"/> <span className="hidden sm:inline">{xp}</span>
            </div>
             <div className="flex items-center gap-1 text-sm font-semibold text-slate-600" title={`${streak} ${t.streak_days}`}>
                <StreakIcon className="text-orange-500"/> <span className="hidden sm:inline">{streak}</span>
            </div>
            {session && (view === 'chat' || view === 'history_view') && (
              <button onClick={() => setIsSettingsOpen(true)} className="p-2 rounded-full text-slate-500 hover:bg-slate-200 transition-colors" aria-label={t.settings} title={t.settings}>
                <SettingsIcon />
              </button>
            )}
            <UiLanguageSwitcher />
        </div>
        
        {/* Mode switcher - on a new line on mobile, absolute center on desktop */}
        <div className="order-last sm:order-none w-full sm:w-auto mt-2 sm:mt-0 sm:absolute sm:left-1/2 sm:-translate-x-1/2">
            <div className="flex justify-center">
                <div className="flex bg-slate-200/80 p-1 rounded-full">
                    <ModeButton mode="tutor" label={t.tutorMode}><TutorIcon /></ModeButton>
                    <ModeButton mode="text_translator" label={t.textTranslatorMode}><TextIcon /></ModeButton>
                    <ModeButton mode="translator" label={t.translatorMode}><TranslatorIcon /></ModeButton>
                </div>
            </div>
        </div>
      </header>
      
      {mainContent()}

      {isSettingsOpen && (
        <div className="absolute inset-0 z-20 flex justify-end bg-black/50 backdrop-blur-sm" onClick={() => setIsSettingsOpen(false)}>
            <div className="w-full max-w-sm bg-white h-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
                <header className="flex items-center justify-between p-4 border-b">
                    <h2 className="text-xl font-bold">{t.settings}</h2>
                    <button onClick={() => setIsSettingsOpen(false)} className="p-2 rounded-full hover:bg-slate-100"><CloseIcon className="w-6 h-6" /></button>
                </header>
                <SettingsPanel isSessionActive={!!session} voices={voices} selectedVoiceURI={selectedVoiceURI} onVoiceChange={setSelectedVoiceURI} voiceRate={voiceRate} onRateChange={setVoiceRate} voicePitch={voicePitch} onPitchChange={setVoicePitch} onEndSession={endAndSaveSession} onLogout={handleLogout} onTestVoice={handleTestVoice} isPremium={isPremium} premiumUntil={user?.premiumUntil || null} onUpgradeClick={() => setIsUpgradeModalOpen(true)} />
            </div>
        </div>
      )}
      {isHistoryOpen && <HistoryPanel history={history} onSelectSession={handleSelectHistorySession} onClose={() => setIsHistoryOpen(false)} />}
      {isTutorialOpen && <Tutorial onClose={() => setIsTutorialOpen(false)} />}
      {isUpgradeModalOpen && <UpgradeModal onClose={() => setIsUpgradeModalOpen(false)} onUpgradeSuccess={handleUpgradeSuccess} />}
    </div>
  );
};

export default App;
