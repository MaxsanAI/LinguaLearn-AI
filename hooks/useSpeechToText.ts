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
  const finalTranscriptRef = useRef<string>(''); // Ref to hold the definitive final transcript

  useEffect(() => {
    if (!SpeechRecognition) {
      console.warn('Speech Recognition API is not supported in this browser.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true; // Use continuous mode for longer speech and better mobile support
    recognition.interimResults = true;
    recognition.lang = languageCode;

    recognition.onresult = (event) => {
      let currentInterim = '';
      let currentFinal = '';

      // Rebuild the final transcript from the beginning of the results list each time
      for (let i = 0; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          currentFinal += transcript + ' ';
        }
      }

      // The interim transcript is the last non-final result
      const lastResult = event.results[event.results.length - 1];
      if (lastResult && !lastResult.isFinal) {
        currentInterim = lastResult[0].transcript;
      }
      
      const finalTrimmed = currentFinal.trim();
      setFinalTranscript(finalTrimmed);
      setInterimTranscript(currentInterim);
      finalTranscriptRef.current = finalTrimmed; // Update the ref for the onStop callback

      if (lastResult && lastResult.isFinal) {
        setConfidence(lastResult[0].confidence);
      }
    };

    recognition.onend = () => {
      setIsListening(false);
      // When recognition ends (e.g., via stopListening), pass the final accumulated transcript
      onStop(finalTranscriptRef.current);
    };
    
    recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
    };

    recognitionRef.current = recognition;
    // We include onStop in the dependency array to ensure the latest version is used in the onend callback.
  }, [languageCode, onStop]);

  const startListening = useCallback(() => {
    if (recognitionRef.current && !isListening) {
      // Reset transcripts and ref for a new listening session.
      setInterimTranscript('');
      setFinalTranscript('');
      finalTranscriptRef.current = '';
      setConfidence(0);
      recognitionRef.current.start();
      setIsListening(true);
    }
  }, [isListening]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      // onend will fire automatically, which then calls the onStop callback with the final transcript.
    }
  }, [isListening]);

  return { isListening, interimTranscript, finalTranscript, confidence, startListening, stopListening, hasRecognitionSupport: !!SpeechRecognition };
};