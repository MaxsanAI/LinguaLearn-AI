import React, { useState, useEffect } from 'react';
import { useTranslations } from '../hooks/useTranslations.ts';

interface MessageInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  isListening: boolean;
  onMicClick: () => void;
  interimTranscript: string;
  finalTranscript: string;
  hasRecognitionSupport: boolean;
  dailyMessageCount: number;
  dailyLimit: number;
  isPremium: boolean;
  onUpgradeClick: () => void;
}

const SendIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.404Z" />
    </svg>
);

const MicIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M8.25 4.5a3.75 3.75 0 1 1 7.5 0v8.25a3.75 3.75 0 1 1-7.5 0V4.5Z" />
      <path d="M6 10.5a.75.75 0 0 1 .75.75v1.5a5.25 5.25 0 1 0 10.5 0v-1.5a.75.75 0 0 1 1.5 0v1.5a6.75 6.75 0 1 1-13.5 0v-1.5A.75.75 0 0 1 6 10.5Z" />
    </svg>
);

const SuggestionIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M12 2.25a.75.75 0 0 1 .75.75v.518c.985.234 1.91.706 2.744 1.349a.75.75 0 0 1-.364 1.392 6.999 6.999 0 0 0-5.464 8.65c.225.56.046 1.192-.412 1.576s-1.12 0-1.468-.539a8.498 8.498 0 0 1-1.112-9.282.75.75 0 0 1 1.282.815 6.995 6.995 0 0 0 1.026 7.647 6.998 6.998 0 0 0 8.897-5.464.75.75 0 0 1 1.392.364c.643.834 1.115 1.758 1.349 2.744h.518a.75.75 0 0 1 0 1.5h-.518a8.495 8.495 0 0 1-1.349 2.744.75.75 0 0 1-1.392-.364 6.999 6.999 0 0 0-8.65-5.464c-.56.225-1.192.046-1.576-.412s0-1.12.539-1.468a8.498 8.498 0 0 1 9.282-1.112.75.75 0 0 1-.815 1.282 6.995 6.995 0 0 0-7.647 1.026.75.75 0 0 1-1.042-1.042 8.498 8.498 0 0 1 5.464-8.897V3a.75.75 0 0 1-.75-.75Z" />
        <path d="M12 12.25a.75.75 0 0 1 .75.75v3a.75.75 0 0 1-1.5 0v-3a.75.75 0 0 1 .75-.75Z" />
        <path d="M9.75 15.75a.75.75 0 0 0 0 1.5h4.5a.75.75 0 0 0 0-1.5h-4.5Z" />
        <path d="M11.25 18.75a.75.75 0 0 1 .75.75v.008a.75.75 0 0 1-1.5 0V19.5a.75.75 0 0 1 .75-.75Z" />
    </svg>
);

export const MessageInput: React.FC<MessageInputProps> = ({ 
    onSendMessage, 
    isLoading, 
    isListening, 
    onMicClick,
    interimTranscript,
    finalTranscript,
    hasRecognitionSupport,
    dailyMessageCount,
    dailyLimit,
    isPremium,
    onUpgradeClick,
}) => {
  const [inputValue, setInputValue] = useState('');
  const { t } = useTranslations();

  const limitReached = !isPremium && dailyMessageCount >= dailyLimit;

  useEffect(() => {
    if (finalTranscript && !isLoading) {
      onSendMessage(finalTranscript);
    }
  }, [finalTranscript, onSendMessage, isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() && !isLoading && !limitReached) {
      onSendMessage(inputValue);
      setInputValue('');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
  };

  const handleSuggestion = () => {
    const starters = t.conversationStarters;
    if (starters && starters.length > 0) {
      const suggestion = starters[Math.floor(Math.random() * starters.length)];
      setInputValue(suggestion);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as unknown as React.FormEvent);
    }
  };

  const micTitle = limitReached
    ? t.dailyLimitReached
    : !hasRecognitionSupport 
    ? t.micNotSupported 
    : (isListening ? t.stopListening : t.startListening);

  const dailyMessages = isPremium 
    ? '∞' 
    : String(dailyLimit - dailyMessageCount);
  
  const textToShow = isListening
    ? `${inputValue}${inputValue ? ' ' : ''}${interimTranscript}`.trim() || t.listeningAria
    : inputValue;

  return (
    <div className="p-2 sm:p-4 bg-white/80 backdrop-blur-sm border-t border-slate-200">
      <div className="text-center text-xs text-slate-500 mb-2">
          {t.messagesLeft?.replace('{count}', dailyMessages)}
      </div>
      {limitReached ? (
        <div className="text-center p-2">
            <p className="text-slate-600 mb-3">{t.dailyLimitReached}</p>
            <button 
                onClick={onUpgradeClick} 
                className="px-6 py-3 font-bold text-white bg-amber-500 rounded-xl shadow-lg hover:bg-amber-600 focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-amber-500 transition-all duration-300"
            >
                {t.upgrade_to_premium}
            </button>
        </div>
      ) : (
      <form onSubmit={handleSubmit} className="flex items-center space-x-2 md:space-x-4 max-w-4xl mx-auto">
        <button
          type="button"
          onClick={handleSuggestion}
          disabled={isLoading || isListening || limitReached}
          className="p-3 rounded-full text-slate-500 hover:bg-slate-200 focus:ring-indigo-500 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label={t.suggestionAria}
          title={t.suggestionAria}
        >
          <SuggestionIcon className="w-6 h-6" />
        </button>
        <button
          type="button"
          onClick={onMicClick}
          disabled={isLoading || !hasRecognitionSupport || limitReached}
          className={`p-3 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
              isListening 
              ? 'bg-blue-500 text-white animate-pulse focus:ring-blue-500' 
              : 'text-slate-500 hover:bg-slate-200 focus:ring-indigo-500'
          } ${(!hasRecognitionSupport || limitReached) && 'opacity-50 cursor-not-allowed'}`}
          aria-label={isListening ? t.listeningAria : micTitle}
          title={micTitle}
        >
          <MicIcon className="w-6 h-6" />
        </button>
        <div className="flex-1 relative">
            <textarea
              value={textToShow}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder={limitReached ? t.dailyLimitReached : t.typeMessage}
              rows={1}
              className="w-full p-3 bg-slate-100 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 placeholder-slate-500"
              disabled={isLoading || isListening || limitReached}
            />
        </div>
        <button
          type="submit"
          disabled={isLoading || !inputValue.trim() || limitReached}
          className="p-3 rounded-full bg-indigo-500 text-white disabled:bg-indigo-300 disabled:cursor-not-allowed hover:bg-indigo-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          aria-label={t.sendAria}
        >
          <SendIcon className="w-6 h-6" />
        </button>
      </form>
      )}
    </div>
  );
};