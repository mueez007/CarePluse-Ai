"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Languages, 
  Volume2, 
  Play, 
  Check,
  Mic,
  Globe
} from "lucide-react";

interface LanguageVoiceProps {
  onNext: () => void;
}

const languages = [
  { code: "en", name: "English", flag: "🇺🇸", voice: "Microsoft David - English (United States)" },
  { code: "hi", name: "हिन्दी", flag: "🇮🇳", voice: "Microsoft Hemant - Hindi (India)" },
  { code: "kn", name: "ಕನ್ನಡ", flag: "🇮🇳", voice: "Microsoft Charu - Kannada (India)" },
  { code: "ta", name: "தமிழ்", flag: "🇮🇳", voice: "Microsoft Valluvar - Tamil (India)" },
  { code: "te", name: "తెలుగు", flag: "🇮🇳", voice: "Microsoft Madhav - Telugu (India)" },
  { code: "ml", name: "മലയാളം", flag: "🇮🇳", voice: "Microsoft Midhun - Malayalam (India)" },
];

const voiceTypes = [
  { id: "calm", name: "Calm & Gentle", description: "Soft, soothing tone for elderly", icon: "😌" },
  { id: "warm", name: "Warm & Caring", description: "Friendly, compassionate voice", icon: "🤗" },
  { id: "clear", name: "Clear & Precise", description: "Enunciated, easy to understand", icon: "🎯" },
];

const reminderStyles = [
  { id: "gentle", name: "Gentle Reminder", example: "Namaste, it's time for your medicine when you're ready." },
  { id: "direct", name: "Direct Alert", example: "Please take your diabetes medicine now." },
  { id: "encouraging", name: "Encouraging", example: "You're doing great! Time to take care of your health." },
];

export default function LanguageVoiceScreen({ onNext }: LanguageVoiceProps) {
  const [selectedLanguage, setSelectedLanguage] = useState(languages[0]);
  const [selectedVoice, setSelectedVoice] = useState(voiceTypes[0]);
  const [selectedReminderStyle, setSelectedReminderStyle] = useState(reminderStyles[0]);
  const [isPlaying, setIsPlaying] = useState(false);

  const playVoicePreview = () => {
    setIsPlaying(true);
    const message = `Namaste, I'm your CarePulse AI companion. ${selectedReminderStyle.example}`;
    
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(message);
      utterance.lang = selectedLanguage.code;
      utterance.rate = 0.9;
      utterance.pitch = 1.1;
      
      // Try to find a matching voice
      const voices = window.speechSynthesis.getVoices();
      const matchingVoice = voices.find(v => v.lang.includes(selectedLanguage.code));
      if (matchingVoice) utterance.voice = matchingVoice;
      
      utterance.onend = () => setIsPlaying(false);
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utterance);
    } else {
      setIsPlaying(false);
      alert("Speech synthesis not supported in your browser");
    }
  };

  const handleSubmit = () => {
    const preferences = {
      language: selectedLanguage,
      voiceType: selectedVoice,
      reminderStyle: selectedReminderStyle,
    };
    localStorage.setItem("onboarding_language_voice", JSON.stringify(preferences));
    onNext();
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-20">
      <div className="max-w-3xl w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
            Language & Voice Setup
          </h1>
          <p className="text-gray-400">
            Choose your preferred language and AI voice style
          </p>
        </motion.div>

        {/* Language Selection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass rounded-2xl p-6 mb-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <Globe className="w-6 h-6 text-cyan-400" />
            <h2 className="text-xl font-semibold text-white">Preferred Language</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => setSelectedLanguage(lang)}
                className={`p-4 rounded-xl text-left transition-all ${
                  selectedLanguage.code === lang.code
                    ? "bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border-cyan-500"
                    : "glass border border-white/10 hover:bg-white/5"
                }`}
              >
                <div className="text-2xl mb-2">{lang.flag}</div>
                <div className="font-medium text-white">{lang.name}</div>
                <div className="text-xs text-gray-500 mt-1">{lang.voice.split(" - ")[0]}</div>
                {selectedLanguage.code === lang.code && (
                  <Check className="w-4 h-4 text-cyan-400 mt-2" />
                )}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Voice Type Selection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass rounded-2xl p-6 mb-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <Volume2 className="w-6 h-6 text-purple-400" />
            <h2 className="text-xl font-semibold text-white">AI Voice Type</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {voiceTypes.map((voice) => (
              <button
                key={voice.id}
                onClick={() => setSelectedVoice(voice)}
                className={`p-4 rounded-xl text-center transition-all ${
                  selectedVoice.id === voice.id
                    ? "bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border-cyan-500"
                    : "glass border border-white/10 hover:bg-white/5"
                }`}
              >
                <div className="text-3xl mb-2">{voice.icon}</div>
                <div className="font-medium text-white">{voice.name}</div>
                <div className="text-xs text-gray-400 mt-1">{voice.description}</div>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Reminder Style */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass rounded-2xl p-6 mb-8"
        >
          <div className="flex items-center gap-3 mb-4">
            <Mic className="w-6 h-6 text-green-400" />
            <h2 className="text-xl font-semibold text-white">Reminder Style</h2>
          </div>
          <div className="space-y-3">
            {reminderStyles.map((style) => (
              <button
                key={style.id}
                onClick={() => setSelectedReminderStyle(style)}
                className={`w-full p-4 rounded-xl text-left transition-all ${
                  selectedReminderStyle.id === style.id
                    ? "bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border-cyan-500"
                    : "glass border border-white/10 hover:bg-white/5"
                }`}
              >
                <div className="font-medium text-white">{style.name}</div>
                <div className="text-sm text-gray-400 mt-1">"{style.example}"</div>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Voice Preview Button */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          onClick={playVoicePreview}
          disabled={isPlaying}
          className="w-full mb-6 py-4 rounded-xl glass border border-cyan-500 text-cyan-400 font-semibold hover:bg-cyan-500/10 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
        >
          {isPlaying ? (
            <>
              <div className="w-5 h-5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
              Playing preview...
            </>
          ) : (
            <>
              <Play className="w-5 h-5" />
              Preview AI Voice
            </>
          )}
        </motion.button>

        {/* Continue Button */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          onClick={handleSubmit}
          className="w-full py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-semibold hover:shadow-lg hover:shadow-cyan-500/25 transition-all"
        >
          Continue to Emergency Setup
        </motion.button>
      </div>
    </div>
  );
}
