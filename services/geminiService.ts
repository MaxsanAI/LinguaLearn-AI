import type { Language, ChatMessage } from '../types.ts';

/**
 * Helper function to call our new serverless API proxy.
 * It sends the action and payload to the /api/gemini endpoint.
 */
async function callApi<T>(action: string, payload: unknown): Promise<T> {
    const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action, payload }),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to parse error response' }));
        console.error("API call failed:", errorData);
        throw new Error(errorData.error || 'An unknown API error occurred');
    }

    return response.json();
}

export const getConversationResponse = async (history: ChatMessage[], baseLanguage: Language, targetLanguage: Language, scenarioInstruction?: string): Promise<{ response: string; translation: string; }> => {
  try {
    const payload = { history, baseLanguage, targetLanguage, scenarioInstruction };
    return await callApi<{ response: string; translation: string; }>('getConversationResponse', payload);
  } catch (error) {
    console.error("Error getting conversation response from API:", error);
    throw error;
  }
};

export const translateText = async (text: string, sourceLang: Language, targetLang: Language): Promise<string> => {
    try {
        const payload = { text, sourceLang, targetLang };
        const result = await callApi<{ translation: string }>('translateText', payload);
        return result.translation;
    } catch (error) {
        console.error("Error translating text with API:", error);
        throw error;
    }
};
