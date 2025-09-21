import { GoogleGenAI, Type } from "@google/genai";
import type { Language, ChatMessage } from '../types.ts';

let ai: GoogleGenAI | null = null;

/**
 * Lazily initializes and returns the GoogleGenAI instance.
 * Throws an error if the API key is not available, which should be
 * prevented by UI checks before any API call is made.
 */
const getAi = (): GoogleGenAI => {
  if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable is not set. This should be handled by the UI before any API calls are made.");
  }
  if (!ai) {
    ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }
  return ai;
};


const model = 'gemini-2.5-flash';

const getConversationSystemInstruction = (baseLanguage: Language, targetLanguage: Language, scenarioInstruction?: string): string => `
You are a friendly, patient, and encouraging language tutor named Alex.
You are teaching the user ${targetLanguage.englishName}. The user's native language is ${baseLanguage.englishName}.
Your goal is to help them learn through natural conversation.

${scenarioInstruction ? `Current Scenario: ${scenarioInstruction}` : ''}

Your response MUST ALWAYS be a valid JSON object with this exact structure:
{
  "response": "Your conversational reply in ${targetLanguage.englishName}",
  "translation": "A precise, line-by-line translation of your reply into ${baseLanguage.englishName}"
}

Follow these rules:
1.  Start the conversation with a warm greeting in ${targetLanguage.englishName}. If in a scenario, the greeting should fit the context.
2.  Always try to continue the conversation by asking engaging questions.
3.  When the user makes a mistake, gently correct them. The correction and explanation should be part of your conversational flow.
    - First, provide the corrected sentence or a natural response in the "response" field (in ${targetLanguage.englishName}).
    - Then, in the "translation" field (in ${baseLanguage.englishName}), provide the translation of your response, AND on a new line, add a brief, simple explanation for the correction.
    Example of a correction if user is learning English from Serbian:
    JSON Response:
    {
      "response": "That's a great try! The correct way to say it is 'I am learning English.' What are you finding most interesting so far?",
      "translation": "Sjajan pokušaj! Pravilno bi bilo reći 'I am learning English.' Šta ti je za sada najzanimljivije?\\n(Koristimo 'am learning' za radnju koja se dešava sada.)"
    }
4.  Adapt your vocabulary and grammar to the user's inferred level.
5.  Keep messages relatively short and conversational.
`;

export const getConversationResponse = async (history: ChatMessage[], baseLanguage: Language, targetLanguage: Language, scenarioInstruction?: string): Promise<{ response: string; translation: string; }> => {
  try {
    const aiInstance = getAi();
    const config = {
      systemInstruction: getConversationSystemInstruction(baseLanguage, targetLanguage, scenarioInstruction),
      temperature: 0.7,
      topP: 0.95,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
            response: { type: Type.STRING },
            translation: { type: Type.STRING },
        },
        required: ["response", "translation"],
      }
    };

    const contents = history.length > 0
      ? history.map(msg => ({
          role: msg.role,
          parts: [{ text: msg.content.original }]
        }))
      : [{ role: 'user', parts: [{ text: "Introduce yourself and start our lesson." }] }];

    const response = await aiInstance.models.generateContent({
      model: model,
      contents: contents,
      config: config
    });

    const jsonText = response.text;
    return JSON.parse(jsonText);
  } catch (error) {
    console.error("Error getting conversation response from Gemini:", error);
    throw error; // Re-throw the error to be handled by the caller
  }
};

export const translateText = async (text: string, sourceLang: Language, targetLang: Language): Promise<string> => {
    try {
        const aiInstance = getAi();
        const systemInstruction = `You are a highly skilled translator. Translate the following text from ${sourceLang.englishName} to ${targetLang.englishName}. Provide ONLY the translated text, with no extra explanations or commentary.`;

        const response = await aiInstance.models.generateContent({
            model: model,
            contents: [{ role: 'user', parts: [{ text }] }],
            config: {
                systemInstruction: systemInstruction,
                temperature: 0.2,
            }
        });
        
        return response.text.trim();
    } catch (error) {
        console.error("Error translating text with Gemini:", error);
        throw error;
    }
};