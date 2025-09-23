import React from 'react';
import { useTranslations } from '../hooks/useTranslations.ts';

interface SettingsPanelProps {
  isSessionActive: boolean;
  voices: SpeechSynthesisVoice[];
  selectedVoiceURI: string | null;
  onVoiceChange: (voiceURI: string) => void;
  voiceRate: number;
  onRateChange: (rate: number) => void;
  voicePitch: number;
  onPitchChange: (pitch: number) => void;
  onEndSession: () => void;
  onLogout: () => void;
  onTestVoice: (voice: SpeechSynthesisVoice) => void;
}

const Slider: React.FC<{
    id: string;
    label: string;
    value: number;
    min: number;
    max: number;
    step: number;
    onChange: (value: number) => void;
}> = ({ id, label, value, min, max, step, onChange }) => (
    <div>
        <label htmlFor={id} className="flex justify-between text-sm font-medium text-slate-600 mb-2">
            <span>{label}</span>
            <span>{value.toFixed(1)}</span>
        </label>
        <input
            type="range"
            id={id}
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={(e) => onChange(parseFloat(e.target.value))}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
        />
    </div>
);

const PlayIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M6.3 2.841A1.5 1.5 0 0 0 4 4.11V15.89a1.5 1.5 0 0 0 2.3 1.269l9.344-5.89a1.5 1.5 0 0 0 0-2.538L6.3 2.841Z" />
    </svg>
);

export const SettingsPanel: React.FC<SettingsPanelProps> = ({ 
    isSessionActive,
    voices,
    selectedVoiceURI,
    onVoiceChange,
    voiceRate,
    onRateChange,
    voicePitch,
    onPitchChange,
    onEndSession,
    onLogout,
    onTestVoice,
}) => {
  const { t } = useTranslations();
  
  return (
    <div className="p-4 space-y-6">
      {isSessionActive && (
        <>
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-2">{t.tutorVoice}</label>
            {voices.length > 0 ? (
              <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                {voices.map((voice) => (
                  <div key={voice.voiceURI} className="flex items-center justify-between p-2 bg-slate-100 rounded-lg">
                    <label className="flex items-center space-x-3 cursor-pointer">
                        <input
                            type="radio"
                            name="voice"
                            value={voice.voiceURI}
                            checked={voice.voiceURI === selectedVoiceURI}
                            onChange={() => onVoiceChange(voice.voiceURI)}
                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-slate-300 bg-white"
                        />
                        <span className="text-sm">{voice.name}</span>
                    </label>
                    <button 
                      onClick={() => onTestVoice(voice)} 
                      className="p-2 rounded-full text-slate-500 hover:bg-slate-200 transition-colors"
                      title={t.testVoice}
                    >
                      <PlayIcon className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500 mt-2">{t.noVoicesAvailable}</p>
            )}
            <p className="text-xs text-slate-500 mt-3">{t.voiceQualityNotice}</p>
          </div>

          <Slider 
            id="rate-slider"
            label={t.voiceSpeed}
            value={voiceRate}
            min={0.5}
            max={2}
            step={0.1}
            onChange={onRateChange}
          />

          <Slider 
            id="pitch-slider"
            label={t.voicePitch}
            value={voicePitch}
            min={0.5}
            max={2}
            step={0.1}
            onChange={onPitchChange}
          />
          
          <hr className="border-slate-200" />

          <div className="space-y-3">
             <button
              onClick={onEndSession}
              className="w-full text-center px-4 py-2 text-sm font-semibold rounded-lg bg-indigo-500/10 text-indigo-600 hover:bg-indigo-500/20 transition-colors"
            >
              {t.endSessionAndSave}
            </button>
            <button
              onClick={onLogout}
              className="w-full text-center px-4 py-2 text-sm font-semibold rounded-lg bg-red-500/10 text-red-600 hover:bg-red-500/20 transition-colors"
            >
              {t.logout}
            </button>
          </div>
        </>
      )}
    </div>
  );
};