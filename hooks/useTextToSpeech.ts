import { useState, useEffect, useCallback } from 'react';

export const useTextToSpeech = (languageCode: string) => {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [hasVoices, setHasVoices] = useState(false);

  const populateVoiceList = useCallback(() => {
    if (!window.speechSynthesis) return;
    const allVoices = window.speechSynthesis.getVoices();
    if (allVoices.length === 0) return;

    const langVoices = allVoices.filter(voice => voice.lang.startsWith(languageCode));
    setVoices(langVoices);
    setHasVoices(langVoices.length > 0);
  }, [languageCode]);

  useEffect(() => {
    populateVoiceList();
    if (window.speechSynthesis?.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = populateVoiceList;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [languageCode]); // Depend only on languageCode to repopulate when it changes

  const speak = (text: string, voice: SpeechSynthesisVoice | null, options?: { rate?: number; pitch?: number }) => {
    try {
      if (!text || !window.speechSynthesis) return;
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = languageCode;
      if (voice) {
          utterance.voice = voice;
      }
      if (options?.rate !== undefined) {
        utterance.rate = options.rate;
      }
      if (options?.pitch !== undefined) {
        utterance.pitch = options.pitch;
      }
      
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = (e) => {
          console.error('Speech synthesis error:', e);
          setIsSpeaking(false);
      };
      
      // Cancel any ongoing speech and use a short timeout to ensure the queue is cleared before speaking again.
      // This can help prevent issues on some browsers where cancel/speak happens too quickly.
      window.speechSynthesis.cancel();
      setTimeout(() => {
          window.speechSynthesis.speak(utterance);
      }, 50);
    } catch (error) {
      console.error("Failed to initiate speech synthesis:", error);
      setIsSpeaking(false); // Ensure state is reset on error
    }
  };

  return { speak, voices, isSpeaking, hasVoices };
};