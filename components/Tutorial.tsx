import React from 'react';
import { useTranslations } from '../hooks/useTranslations';

// Icons will be defined inline as simple FCs
const CloseIcon: React.FC<{ className?: string }> = ({ className }) => ( <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}><path fillRule="evenodd" d="M5.47 5.47a.75.75 0 0 1 1.06 0L12 10.94l5.47-5.47a.75.75 0 1 1 1.06 1.06L13.06 12l5.47 5.47a.75.75 0 1 1-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 0 1-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" /></svg>);
const TutorIcon: React.FC<{ className?: string }> = ({ className }) => ( <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}> <path d="M12.378 1.602a.75.75 0 0 0-.756 0L3 7.225V18a2.25 2.25 0 0 0 2.25 2.25h13.5A2.25 2.25 0 0 0 21 18V7.225L12.378 1.602ZM12 15.75a3 3 0 1 1 0-6 3 3 0 0 1 0 6Z" /> </svg> );
const TranslatorIcon: React.FC<{ className?: string }> = ({ className }) => ( <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}> <path d="M12.865 3.033a.75.75 0 0 0-1.23 0L3.34 14.22a.75.75 0 0 0 .615 1.125h2.476a.75.75 0 0 1 .737.623l.635 2.855a.75.75 0 0 0 1.46-.324L10.33 13.5h3.34l1.066 4.999a.75.75 0 0 0 1.46.324l.636-2.855a.75.75 0 0 1 .736-.623h2.476a.75.75 0 0 0 .616-1.125L12.865 3.033Zm-1.54 8.217L12 6.561l.675 4.689h-1.35Z" /> <path d="M21.573 17.625a.75.75 0 0 1-1.015.31L18 16.687v2.063a.75.75 0 0 1-1.5 0V15.75a.75.75 0 0 1 .88-.743l2.573.514a.75.75 0 0 1 .62.723v1.38Z" /> </svg> );
const MicIcon: React.FC<{className?: string}> = ({ className }) => ( <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}> <path d="M8.25 4.5a3.75 3.75 0 1 1 7.5 0v8.25a3.75 3.75 0 1 1-7.5 0V4.5Z" /> <path d="M6 10.5a.75.75 0 0 1 .75.75v1.5a5.25 5.25 0 1 0 10.5 0v-1.5a.75.75 0 0 1 1.5 0v1.5a6.75 6.75 0 1 1-13.5 0v-1.5A.75.75 0 0 1 6 10.5Z" /> </svg> );
const SuggestionIcon: React.FC<{className?: string}> = ({ className }) => ( <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}> <path d="M12 2.25a.75.75 0 0 1 .75.75v.518c.985.234 1.91.706 2.744 1.349a.75.75 0 0 1-.364 1.392 6.999 6.999 0 0 0-5.464 8.65c.225.56.046 1.192-.412 1.576s-1.12 0-1.468-.539a8.498 8.498 0 0 1-1.112-9.282.75.75 0 0 1 1.282.815 6.995 6.995 0 0 0 1.026 7.647 6.998 6.998 0 0 0 8.897-5.464.75.75 0 0 1 1.392.364c.643.834 1.115 1.758 1.349 2.744h.518a.75.75 0 0 1 0 1.5h-.518a8.495 8.495 0 0 1-1.349 2.744.75.75 0 0 1-1.392-.364 6.999 6.999 0 0 0-8.65-5.464c-.56.225-1.192.046-1.576-.412s0-1.12.539-1.468a8.498 8.498 0 0 1 9.282-1.112.75.75 0 0 1-.815 1.282 6.995 6.995 0 0 0-7.647 1.026.75.75 0 0 1-1.042-1.042 8.498 8.498 0 0 1 5.464-8.897V3a.75.75 0 0 1-.75-.75Z" /> <path d="M12 12.25a.75.75 0 0 1 .75.75v3a.75.75 0 0 1-1.5 0v-3a.75.75 0 0 1 .75-.75Z" /> <path d="M9.75 15.75a.75.75 0 0 0 0 1.5h4.5a.75.75 0 0 0 0-1.5h-4.5Z" /> <path d="M11.25 18.75a.75.75 0 0 1 .75.75v.008a.75.75 0 0 1-1.5 0V19.5a.75.75 0 0 1 .75-.75Z" /> </svg> );
const HistoryIcon: React.FC<{ className?: string }> = ({ className }) => ( <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}> <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25ZM12.75 6a.75.75 0 0 0-1.5 0v6c0 .414.336.75.75.75h4.5a.75.75 0 0 0 0-1.5h-3.75V6Z" clipRule="evenodd" /> </svg> );
const SettingsIcon: React.FC<{ className?: string }> = ({ className }) => ( <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}> <path fillRule="evenodd" d="M11.078 2.25c-.917 0-1.699.663-1.85 1.567L9.05 5.85a1.5 1.5 0 0 1-1.058 1.058l-2.022.171c-.904.076-1.567.833-1.567 1.745v2.246c0 .912.663 1.669 1.567 1.745l2.022.171a1.5 1.5 0 0 1 1.058 1.058l.171 2.022c.076.904.833 1.567 1.745 1.567h2.246c.912 0 1.669-.663 1.745-1.567l.171-2.022a1.5 1.5 0 0 1 1.058-1.058l2.022-.171c.904-.076 1.567-.833 1.567-1.745v-2.246c0-.912-.663-1.669-1.567-1.745l-2.022-.171a1.5 1.5 0 0 1-1.058-1.058l-.171-2.022c-.076-.904-.833-1.567-1.745-1.567h-2.246Zm-1.63 9.75a4.125 4.125 0 1 1 8.25 0 4.125 4.125 0 0 1-8.25 0Z" clipRule="evenodd" /> </svg> );
const SpeakerIcon: React.FC<{ className?: string }> = ({ className }) => ( <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}> <path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.318.664-2.66 1.905A9.76 9.76 0 0 0 1.5 12c0 .898.121 1.768.348 2.595.341 1.24 1.518 1.905 2.66 1.905H6.44l4.5 4.5c.945.945 2.56.276 2.56-1.06V4.06ZM18.584 12c0-1.857-.87-3.58-2.298-4.682a.75.75 0 1 0-.964 1.154 3.248 3.248 0 0 1 0 7.056.75.75 0 1 0 .964 1.154A4.735 4.735 0 0 0 18.584 12Z" /> </svg> );

interface TutorialProps {
  onClose: () => void;
}

const TutorialSection: React.FC<{ title: string; description: string; children: React.ReactNode; }> = ({ title, description, children }) => (
    <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-xl">
        <div className="flex-shrink-0 p-3 bg-indigo-100 text-indigo-600 rounded-full">
            {children}
        </div>
        <div>
            <h3 className="font-bold text-slate-800">{title}</h3>
            <p className="text-sm text-slate-600 mt-1">{description}</p>
        </div>
    </div>
);

export const Tutorial: React.FC<TutorialProps> = ({ onClose }) => {
  const { t } = useTranslations();
  return (
    <div className="absolute inset-0 z-20 flex" onClick={onClose}>
      <div className="w-full max-w-md bg-white shadow-2xl h-full flex flex-col" onClick={e => e.stopPropagation()}>
        <header className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-bold">{t.tutorial_title}</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100"><CloseIcon className="w-6 h-6" /></button>
        </header>
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <div className="text-center p-4 bg-indigo-50 rounded-lg">
                <h2 className="text-lg font-bold text-indigo-700">{t.tutorial_welcome_title}</h2>
                <p className="text-sm text-indigo-600 mt-1">{t.tutorial_welcome_desc}</p>
            </div>
            <TutorialSection title={t.tutorial_tutor_mode_title} description={t.tutorial_tutor_mode_desc}>
                <TutorIcon className="w-6 h-6" />
            </TutorialSection>
            <TutorialSection title={t.tutorial_translator_mode_title} description={t.tutorial_translator_mode_desc}>
                <TranslatorIcon className="w-6 h-6" />
            </TutorialSection>
            <TutorialSection title={t.tutorial_mic_button_title} description={t.tutorial_mic_button_desc}>
                <MicIcon className="w-6 h-6" />
            </TutorialSection>
            <TutorialSection title={t.tutorial_suggestion_button_title} description={t.tutorial_suggestion_button_desc}>
                <SuggestionIcon className="w-6 h-6" />
            </TutorialSection>
            <TutorialSection title={t.tutorial_history_button_title} description={t.tutorial_history_button_desc}>
                <HistoryIcon className="w-6 h-6" />
            </TutorialSection>
            <TutorialSection title={t.tutorial_settings_button_title} description={t.tutorial_settings_button_desc}>
                <SettingsIcon className="w-6 h-6" />
            </TutorialSection>
            <TutorialSection title={t.tutorial_voices_title} description={t.tutorial_voices_desc}>
                <SpeakerIcon className="w-6 h-6" />
            </TutorialSection>
            <div className="p-4 bg-yellow-50 text-yellow-800 rounded-xl border border-yellow-200">
                <h3 className="font-bold">{t.tutorial_ai_delay_title}</h3>
                <p className="text-sm mt-1">{t.tutorial_ai_delay_desc}</p>
            </div>
        </div>
      </div>
    </div>
  );
};
