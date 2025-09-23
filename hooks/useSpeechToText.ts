import { useState, useRef, useCallback, useEffect } from 'react';

// Define interfaces for the non-standard SpeechRecognition API to resolve TypeScript errors.
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

export const useSpeechToText = (
    languageCode: string, 
    onStop: (transcript: string) => void
) => {
  const [isListening, setIsListening] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState('');
  const [finalTranscript, setFinalTranscript] = useState('');
  const [confidence, setConfidence] = useState(0);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const finalTranscriptRef = useRef<string>('');
  const onStopCalledRef = useRef(false); // Guard against multiple onend events

  useEffect(() => {
    if (!SpeechRecognition) {
      console.warn('Speech Recognition API is not supported in this browser.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = languageCode;

    recognition.onresult = (event) => {
      let currentInterim = '';
      let currentFinal = '';

      for (let i = 0; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          currentFinal += transcript + ' ';
        }
      }

      const lastResult = event.results[event.results.length - 1];
      if (lastResult && !lastResult.isFinal) {
        currentInterim = lastResult[0].transcript;
      }
      
      const finalTrimmed = currentFinal.trim();
      setFinalTranscript(finalTrimmed);
      setInterimTranscript(currentInterim);
      finalTranscriptRef.current = finalTrimmed;

      if (lastResult && lastResult.isFinal) {
        setConfidence(lastResult[0].confidence);
      }
    };

    recognition.onend = () => {
      setIsListening(false);
      // Guard against multiple onend events from some browsers
      if (!onStopCalledRef.current) {
        onStopCalledRef.current = true;
        onStop(finalTranscriptRef.current);
      }
    };
    
    recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
    };

    recognitionRef.current = recognition;

    // Cleanup function to stop recognition when component unmounts or language changes
    return () => {
      recognition.stop();
    };
  }, [languageCode, onStop]);

  const startListening = useCallback(() => {
    if (recognitionRef.current && !isListening) {
      onStopCalledRef.current = false; // Reset guard for a new session
      setInterimTranscript('');
      setFinalTranscript('');
      finalTranscriptRef.current = '';
      setConfidence(0);
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (error) {
        console.error("Speech recognition could not start:", error);
      }
    }
  }, [isListening]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      // The 'onend' event will fire, which handles calling onStop.
    }
  }, [isListening]);

  return { isListening, interimTranscript, finalTranscript, confidence, startListening, stopListening, hasRecognitionSupport: !!SpeechRecognition };
};