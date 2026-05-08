"use client";

import { useState, useCallback, useEffect } from "react";

interface UseVoiceOutputProps {
  language?: string;
  rate?: number;
  pitch?: number;
  volume?: number;
}

export function useVoiceOutput({ 
  language = "en-US", 
  rate = 0.9, 
  pitch = 1.1,
  volume = 1 
}: UseVoiceOutputProps = {}) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);

  useEffect(() => {
    if (!("speechSynthesis" in window)) {
      setIsSupported(false);
      return;
    }

    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      setAvailableVoices(voices);
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  const speak = useCallback((text: string) => {
    if (!isSupported) {
      console.warn("Speech synthesis not supported");
      return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language;
    utterance.rate = rate;
    utterance.pitch = pitch;
    utterance.volume = volume;

    // Try to find a natural sounding voice
    const preferredVoice = availableVoices.find(
      voice => voice.lang.includes(language.split("-")[0]) && voice.name.includes("Google")
    );
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  }, [isSupported, language, rate, pitch, volume, availableVoices]);

  const stop = useCallback(() => {
    if (isSupported) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, [isSupported]);

  return {
    isSpeaking,
    isSupported,
    speak,
    stop,
    availableVoices,
  };
}
