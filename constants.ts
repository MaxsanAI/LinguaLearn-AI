import type { Language, Scenario } from './types.ts';

export const DAILY_MESSAGE_LIMIT = 30;

export const LANGUAGES: Language[] = [
  { name: 'lang_en', englishName: 'English', code: 'en', flag: '🇺🇸' },
  { name: 'lang_es', englishName: 'Spanish', code: 'es', flag: '🇪🇸' },
  { name: 'lang_fr', englishName: 'French', code: 'fr', flag: '🇫🇷' },
  { name: 'lang_de', englishName: 'German', code: 'de', flag: '🇩🇪' },
  { name: 'lang_it', englishName: 'Italian', code: 'it', flag: '🇮🇹' },
  { name: 'lang_ja', englishName: 'Japanese', code: 'ja', flag: '🇯🇵' },
  { name: 'lang_zh', englishName: 'Chinese', code: 'zh', flag: '🇨🇳' },
  { name: 'lang_ar', englishName: 'Arabic', code: 'ar', flag: '🇸🇦' },
  { name: 'lang_ru', englishName: 'Russian', code: 'ru', flag: '🇷🇺' },
  { name: 'lang_pt', englishName: 'Portuguese', code: 'pt', flag: '🇧🇷' },
  { name: 'lang_sr', englishName: 'Serbian', code: 'sr', flag: '🇷🇸' },
];

export const SCENARIOS: Scenario[] = [
    {
        id: 'coffee',
        titleKey: 'scenario_coffee_title',
        descriptionKey: 'scenario_coffee_desc',
        instruction: "You are a friendly barista in a café. Start by greeting the user and asking for their order."
    },
    {
        id: 'airport',
        titleKey: 'scenario_airport_title',
        descriptionKey: 'scenario_airport_desc',
        instruction: "You are an airline check-in agent at an airport. The user is a passenger. Start by greeting them and asking for their passport and ticket."
    },
    {
        id: 'job_interview',
        titleKey: 'scenario_job_interview_title',
        descriptionKey: 'scenario_job_interview_desc',
        instruction: "You are a hiring manager conducting a job interview. Start by welcoming the user and asking them to tell you about themselves."
    },
    {
        id: 'restaurant',
        titleKey: 'scenario_restaurant_title',
        descriptionKey: 'scenario_restaurant_desc',
        instruction: "You are a waiter in a restaurant. Greet the user, present the menu, and ask if they are ready to order drinks."
    }
];
