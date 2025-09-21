import { GoogleGenAI, Type } from "@google/genai";
import type { Language, ChatMessage } from "../types.ts";

// This function is copied from the original services/geminiService.ts
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


export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  if (!process.env.API_KEY) {
    console.error("API_KEY is not set on the server.");
    return res.status(500).json({ error: 'Server configuration error. The API_KEY is missing.' });
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const model = 'gemini-2.5-flash';

  const { action, payload } = req.body;

  try {
    if (action === 'getConversationResponse') {
        const { history, baseLanguage, targetLanguage, scenarioInstruction } = payload;
        
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
          },
          thinkingConfig: { thinkingBudget: 0 }
        };

        const contents = history.length > 0
          ? history.map((msg: ChatMessage) => ({
              role: msg.role,
              parts: [{ text: msg.content.original }]
            }))
          : [{ role: 'user', parts: [{ text: "Introduce yourself and start our lesson." }] }];

        const response = await ai.models.generateContent({
          model: model,
          contents: contents,
          config: config
        });

        const jsonText = response.text;
        return res.status(200).json(JSON.parse(jsonText));

    } else if (action === 'translateText') {
        const { text, sourceLang, targetLang } = payload;
        
        const systemInstruction = `You are a highly skilled translator. Translate the following text from ${sourceLang.englishName} to ${targetLang.englishName}. Provide ONLY the translated text, with no extra explanations or commentary.`;

        const response = await ai.models.generateContent({
            model: model,
            contents: [{ role: 'user', parts: [{ text }] }],
            config: {
                systemInstruction: systemInstruction,
                temperature: 0.2,
                thinkingConfig: { thinkingBudget: 0 }
            }
        });
        
        return res.status(200).json({ translation: response.text.trim() });
    } else {
      return res.status(400).json({ error: 'Invalid action' });
    }
  } catch (error: any) {
    console.error(`Error in /api/gemini for action ${action}:`, error);
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}