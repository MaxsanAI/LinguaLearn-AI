import { useState, useRef, useCallback, useEffect } from 'react';

// Fix: Define interfaces for the non-standard SpeechRecognition API to resolve TypeScript errors.
// These interfaces provide types for the recognition instance and its constructor,
// preventing name collisions and type errors.
interface SpeechRecognitionInstance {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onresult: (event: any) => void;
  onend: () => void;
  onerror: (event: any) => void;
}

interface SpeechRecognitionStatic {
  new (): SpeechRecognitionInstance;
}

// Polyfill for browsers that might not have SpeechRecognition
const SpeechRecognition: SpeechRecognitionStatic | undefined =
  (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

export const useSpeechToText = (languageCode: string) => {
  const [isListening, setIsListening] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState('');
  const [finalTranscript, setFinalTranscript] = useState('');
  const [confidence, setConfidence] = useState(0);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);

  useEffect(() => {
    if (!SpeechRecognition) {
      console.warn('Speech Recognition API is not supported in this browser.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = languageCode;

    recognition.onresult = (event) => {
      let currentInterim = '';
      for (let i = 0; i < event.results.length; i++) {
        currentInterim += event.results[i][0].transcript;
      }
      setInterimTranscript(currentInterim);

      const lastResult = event.results[event.results.length - 1];
      if (lastResult.isFinal) {
        setFinalTranscript(currentInterim.trim());
        setConfidence(lastResult[0].confidence);
        setInterimTranscript('');
      }
    };

    recognition.onend = () => {
      setIsListening(false);
    };
    
    recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
    };

    recognitionRef.current = recognition;
  }, [languageCode]);

  const startListening = useCallback(() => {
    if (recognitionRef.current && !isListening) {
      setInterimTranscript('');
      setFinalTranscript('');
      setConfidence(0);
      recognitionRef.current.start();
      setIsListening(true);
    }
  }, [isListening]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  }, [isListening]);

  return { isListening, interimTranscript, finalTranscript, confidence, startListening, stopListening, hasRecognitionSupport: !!SpeechRecognition };
};