import React, { useRef, useEffect } from 'react';
import type { ChatMessage } from '../types';
import { useTranslations } from '../hooks/useTranslations';

const TypingIndicator: React.FC = () => (
  <div className="flex items-center space-x-1.5 p-3 rounded-lg">
    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
  </div>
);

const UserIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
        <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z" clipRule="evenodd" />
    </svg>
);

const TutorIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
        <path fillRule="evenodd" d="M9.315 7.585c.934-1.102 2.43-1.635 3.963-1.424 1.13.155 2.16.66 3.006 1.424a6.712 6.712 0 0 1 2.332 4.606c.036.311.05.623.05.937 0 3.494-2.285 6.443-5.323 7.119a.75.75 0 0 1-.803-.536l-.38-1.524a.75.75 0 0 1 .496-.867l.383-.095c1.468-.365 2.54-1.69 2.54-3.237 0-1.84-1.488-3.34-3.323-3.34S8.677 12.66 8.677 14.5c0 .312.043.616.125.907l.21.734a.75.75 0 0 1-.564.903l-1.524.435a.75.75 0 0 1-.868-.693 7.452 7.452 0 0 1-.082-1.123c-.023-1.29.44-2.528 1.25-3.483ZM10.5 2.25a.75.75 0 0 0-1.5 0v1.94a.75.75 0 0 0 1.5 0V2.25ZM15 3.188a.75.75 0 0 0-1.06-.02l-1.355 1.298a.75.75 0 1 0 1.03 1.092l1.355-1.298a.75.75 0 0 0 .03-1.072ZM4.875 11.25a.75.75 0 0 1 0-1.5h1.94a.75.75 0 0 1 0 1.5H4.875ZM18 10.5a.75.75 0 0 0 1.5 0v-1.94a.75.75 0 0 0-1.5 0v1.94Z" clipRule="evenodd" />
        <path d="m3.188 15-.02 1.06a.75.75 0 0 0 1.072.03l1.298-1.355a.75.75 0 1 0-1.092-1.03L3.188 15Zm15.624 0-1.298-1.355a.75.75 0 1 0-1.092 1.03l1.298 1.355a.75.75 0 0 0 1.092-1.03l-.02-1.06ZM13.5 21.75a.75.75 0 0 1 0-1.5h-1.94a.75.75 0 0 1 0 1.5h1.94ZM7.5 18a.75.75 0 0 0-1.06-.02l-1.355 1.298a.75.75 0 1 0 1.03 1.092L7.53 19.06a.75.75 0 0 0-.03-1.072Z" />
    </svg>
);

const SpeakerIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.318.664-2.66 1.905A9.76 9.76 0 0 0 1.5 12c0 .898.121 1.768.348 2.595.341 1.24 1.518 1.905 2.66 1.905H6.44l4.5 4.5c.945.945 2.56.276 2.56-1.06V4.06ZM18.584 12c0-1.857-.87-3.58-2.298-4.682a.75.75 0 1 0-.964 1.154 3.248 3.248 0 0 1 0 7.056.75.75 0 1 0 .964 1.154A4.735 4.735 0 0 0 18.584 12Z" />
    </svg>
);

const ChatMessageBubble: React.FC<{ message: ChatMessage; onReplayAudio: (text: string) => void; hasVoices: boolean; }> = ({ message, onReplayAudio, hasVoices }) => {
  const isUser = message.role === 'user';
  const { t } = useTranslations();
  
  const bubbleClasses = isUser
    ? 'bg-indigo-500 text-white rounded-br-none'
    : 'bg-white text-slate-800 rounded-bl-none';

  const icon = isUser ? <UserIcon /> : <TutorIcon />;
  const iconContainerClasses = isUser ? 'text-indigo-200' : 'text-slate-400';
  
  const replayButtonTitle = hasVoices ? t.replayAudio : t.noVoicesAvailable;

  return (
    <div className={`flex items-end gap-2 ${isUser ? 'flex-row-reverse' : 'flex-row'} animate-fade-in-up`}>
      <div className={`flex-shrink-0 p-2 bg-slate-200 rounded-full ${iconContainerClasses}`}>
        {icon}
      </div>
      <div className={`max-w-md w-fit px-4 py-3 rounded-2xl shadow-md ${bubbleClasses}`}>
        <p className="whitespace-pre-wrap">{message.content.original}</p>
        {message.content.translation && (
            <>
                <hr className="my-2 border-slate-300 opacity-50" />
                <p className="whitespace-pre-wrap text-sm text-slate-600 italic">{message.content.translation}</p>
            </>
        )}
      </div>
      {!isUser && (
        <button 
          onClick={() => onReplayAudio(message.content.original)}
          disabled={!hasVoices}
          className="p-2 rounded-full text-slate-400 hover:bg-slate-200 transition-colors self-center disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label={replayButtonTitle}
          title={replayButtonTitle}
        >
            <SpeakerIcon className="w-5 h-5" />
        </button>
      )}
    </div>
  );
};

const WelcomeBubble: React.FC = () => {
  const { t } = useTranslations();
  return (
    <div className="text-center p-4 my-4 animate-fade-in-up">
      <div className="inline-block p-4 bg-white/60 backdrop-blur-sm rounded-2xl shadow-lg">
        <p className="text-slate-700 font-semibold">{t.welcomeChat}</p>
      </div>
    </div>
  );
};

export const ChatWindow: React.FC<ChatWindowProps> = ({ messages, isLoading, onReplayAudio, hasVoices }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      const scrollElement = scrollRef.current;
      setTimeout(() => {
        scrollElement.scrollTo({
          top: scrollElement.scrollHeight,
          behavior: 'smooth'
        });
      }, 100); // A slightly longer timeout to allow for animations
    }
  }, [messages, isLoading]);

  return (
    <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6">
      <WelcomeBubble />
      <div className="flex flex-col space-y-4">
        {messages.map((msg, index) => (
          <ChatMessageBubble key={index} message={msg} onReplayAudio={onReplayAudio} hasVoices={hasVoices} />
        ))}
        {isLoading && (
          <div className="flex items-end gap-2 flex-row animate-fade-in-up">
            <div className="flex-shrink-0 p-2 bg-slate-200 rounded-full text-slate-400">
                <TutorIcon />
            </div>
            <div className="max-w-md w-fit px-4 py-3 rounded-2xl shadow-md bg-white rounded-bl-none">
              <TypingIndicator />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

interface ChatWindowProps {
  messages: ChatMessage[];
  isLoading: boolean;
  onReplayAudio: (text: string) => void;
  hasVoices: boolean;
}