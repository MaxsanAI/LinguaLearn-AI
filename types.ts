export interface Language {
  name: string; // Translation key
  englishName: string; // English name for AI prompts
  code: string; // BCP 47 language code for TTS
  flag: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  content: {
    original: string;
    translation?: string;
  };
}

export interface VoiceOption {
  name: string;
  voice: SpeechSynthesisVoice;
  gender: 'male' | 'female';
}

export type AppMode = 'tutor' | 'translator' | 'text_translator';

export interface User {
  name:string;
  premiumUntil: number | null; // Timestamp for subscription expiry
}

export interface Scenario {
  id: string;
  titleKey: string;
  descriptionKey: string;
  instruction: string;
}

export interface HistorySession {
  id: string;
  baseLanguage: Language;
  targetLanguage: Language;
  scenarioTitleKey?: string;
  messages: ChatMessage[];
  timestamp: number;
}