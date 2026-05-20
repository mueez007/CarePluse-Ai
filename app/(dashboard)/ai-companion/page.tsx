"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Mic, 
  MicOff, 
  Send, 
  Brain,
  Smile,
  Sparkles,
  Volume2,
  VolumeX,
  Phone,
  PhoneOff,
  Plus,
  MessageSquare,
  Heart,
  Pill,
  Salad,
  Stethoscope,
  Clock,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Settings2
} from "lucide-react";
import Sidebar from "@/components/dashboard/Sidebar";
import Header from "@/components/dashboard/Header";
import { buildPatientContext, getFullHealthProfile } from "@/lib/health-data";

// ─── Types ─────────────────────────────────────────────
interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface ChatSession {
  id: string;
  title: string;
  category: string;
  messages: Message[];
  createdAt: string;
  updatedAt: string;
}

type FocusCategory = "emotional" | "medicine" | "health" | "symptom";

interface VoicePersona {
  id: string;
  name: string;
  description: string;
  rate: number;
  pitch: number;
  voiceMatch: string[];
}

// ─── Constants ─────────────────────────────────────────
const FOCUS_CATEGORIES: { id: FocusCategory; label: string; icon: any; color: string; description: string }[] = [
  { id: "emotional", label: "Emotional Support", icon: Heart, color: "from-pink-500 to-rose-500", description: "Empathy, mindfulness & coping" },
  { id: "medicine", label: "Medicine Guide", icon: Pill, color: "from-purple-500 to-indigo-500", description: "Dosages, interactions & safety" },
  { id: "health", label: "Health Tips", icon: Salad, color: "from-emerald-500 to-teal-500", description: "Nutrition, exercise & wellness" },
  { id: "symptom", label: "Symptom Check", icon: Stethoscope, color: "from-amber-500 to-orange-500", description: "Assessment & quick triage" },
];

const VOICE_PERSONAS: VoicePersona[] = [
  { id: "nurse", name: "Caring Nurse Priya", description: "Warm, compassionate, simple", rate: 0.92, pitch: 1.1, voiceMatch: ["Samantha", "Google UK English Female", "Female"] },
  { id: "doctor", name: "Doctor Arjun", description: "Professional, detailed", rate: 0.95, pitch: 0.95, voiceMatch: ["Daniel", "Google UK English Male", "Male"] },
  { id: "friend", name: "Friendly Companion", description: "Casual, upbeat, modern", rate: 1.0, pitch: 1.05, voiceMatch: ["Karen", "Google US English", "Female"] },
];

const STORAGE_KEY = "carepulse_chat_sessions";
const MAX_SESSIONS = 10;

// ─── Helper Functions ──────────────────────────────────
function loadSessions(): ChatSession[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveSessions(sessions: ChatSession[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions.slice(0, MAX_SESSIONS)));
}

function generateTitle(messages: Message[], category: string): string {
  const userMessages = messages.filter(m => m.role === "user");
  if (userMessages.length === 0) {
    const labels: Record<string, string> = {
      emotional: "Emotional Support",
      medicine: "Medicine Guide",
      health: "Health Consultation",
      symptom: "Symptom Check",
    };
    return labels[category] || "New Chat";
  }
  const firstMsg = userMessages[0].content;
  return firstMsg.length > 40 ? firstMsg.substring(0, 40) + "…" : firstMsg;
}

function getCategoryMeta(cat: string) {
  return FOCUS_CATEGORIES.find(c => c.id === cat) || FOCUS_CATEGORIES[0];
}

// ─── Main Component ────────────────────────────────────
export default function AICompanionPage() {
  // Session state
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [showSessions, setShowSessions] = useState(false);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);

  // Chat state
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [liveMode, setLiveMode] = useState(false);
  const [activeCategory, setActiveCategory] = useState<FocusCategory>("emotional");
  const [voicePersona, setVoicePersona] = useState<VoicePersona>(VOICE_PERSONAS[0]);
  const [showVoiceSettings, setShowVoiceSettings] = useState(false);

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const speechQueueRef = useRef<string[]>([]);
  const isSpeakingRef = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const patientContextRef = useRef<string>("");

  // ─── Initialize ────────────────────────────────────────
  useEffect(() => {
    const loaded = loadSessions();
    setSessions(loaded);

    const profile = getFullHealthProfile();
    patientContextRef.current = buildPatientContext();

    // Start with a fresh session
    createNewSession("emotional", profile?.basicDetails?.name);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Save session whenever messages change
  useEffect(() => {
    if (!activeSessionId || messages.length <= 1) return;
    setSessions(prev => {
      const updated = prev.map(s =>
        s.id === activeSessionId
          ? { ...s, messages, title: generateTitle(messages, s.category), updatedAt: new Date().toISOString() }
          : s
      );
      saveSessions(updated);
      return updated;
    });
  }, [messages, activeSessionId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // ─── Session Management ────────────────────────────────
  const createNewSession = (category: FocusCategory = "emotional", userName?: string) => {
    const profile = getFullHealthProfile();
    const name = userName || profile?.basicDetails?.name || "there";
    const catMeta = getCategoryMeta(category);

    const greeting: Message = {
      id: "1",
      role: "assistant",
      content: `Hello ${name}! I'm your CarePulse AI companion, ready for **${catMeta.label}**. ${
        category === "emotional" ? "I'm here to listen and support you. How are you feeling today? 💙" :
        category === "medicine" ? "I can help with medication info, interactions, and safety. What would you like to know? 💊" :
        category === "health" ? "Let's talk about nutrition, exercise, and wellness tips for you! 🌿" :
        "I'll help assess your symptoms carefully. What are you experiencing? 🩺"
      }`,
      timestamp: new Date(),
    };

    const newSession: ChatSession = {
      id: Date.now().toString(),
      title: catMeta.label,
      category,
      messages: [greeting],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setSessions(prev => {
      const updated = [newSession, ...prev].slice(0, MAX_SESSIONS);
      saveSessions(updated);
      return updated;
    });

    setActiveSessionId(newSession.id);
    setMessages([greeting]);
    setActiveCategory(category);
    setShowCategoryPicker(false);
    setShowSessions(false);
  };

  const switchToSession = (session: ChatSession) => {
    setActiveSessionId(session.id);
    setMessages(session.messages.map(m => ({ ...m, timestamp: new Date(m.timestamp) })));
    setActiveCategory(session.category as FocusCategory);
    setShowSessions(false);
  };

  const deleteSession = (sessionId: string) => {
    setSessions(prev => {
      const updated = prev.filter(s => s.id !== sessionId);
      saveSessions(updated);
      if (activeSessionId === sessionId) {
        if (updated.length > 0) {
          switchToSession(updated[0]);
        } else {
          createNewSession("emotional");
        }
      }
      return updated;
    });
  };

  // ─── Speech Synthesis (TTS) ───────────────────────────
  const speakText = useCallback((text: string) => {
    if (!voiceEnabled || !("speechSynthesis" in window)) return;

    const cleanText = text
      .replace(/[\u{1F600}-\u{1F9FF}]/gu, "")
      .replace(/[*_~`#]/g, "")
      .replace(/\*\*/g, "")
      .trim();

    if (!cleanText) return;

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = "en-US";
    utterance.rate = voicePersona.rate;
    utterance.pitch = voicePersona.pitch;
    
    const voices = window.speechSynthesis.getVoices();
    const preferred = voices.find(v =>
      voicePersona.voiceMatch.some(match => v.name.includes(match))
    );
    if (preferred) utterance.voice = preferred;

    utterance.onstart = () => {
      setIsSpeaking(true);
      isSpeakingRef.current = true;
    };
    utterance.onend = () => {
      isSpeakingRef.current = false;
      if (speechQueueRef.current.length > 0) {
        const next = speechQueueRef.current.shift()!;
        speakText(next);
      } else {
        setIsSpeaking(false);
      }
    };
    utterance.onerror = () => {
      isSpeakingRef.current = false;
      setIsSpeaking(false);
    };

    window.speechSynthesis.speak(utterance);
  }, [voiceEnabled, voicePersona]);

  const queueSpeech = useCallback((sentence: string) => {
    if (isSpeakingRef.current) {
      speechQueueRef.current.push(sentence);
    } else {
      speakText(sentence);
    }
  }, [speakText]);

  const stopSpeaking = () => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      speechQueueRef.current = [];
      isSpeakingRef.current = false;
      setIsSpeaking(false);
    }
  };

  // ─── Speech Recognition (STT) ────────────────────────
  const startListening = () => {
    if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
      alert("Speech recognition not supported in this browser. Please use Chrome.");
      return;
    }

    stopSpeaking();

    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.continuous = liveMode;
    recognition.interimResults = true;

    recognition.onstart = () => setIsListening(true);

    recognition.onresult = (event: any) => {
      let finalTranscript = "";
      let interimTranscript = "";
      
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      if (finalTranscript) {
        setInput("");
        handleSendMessage(finalTranscript);
      } else if (interimTranscript) {
        setInput(interimTranscript);
      }
    };

    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => {
      setIsListening(false);
      if (liveMode && recognitionRef.current) {
        setTimeout(() => {
          try { recognition.start(); } catch {}
        }, 500);
      }
    };

    recognition.start();
    recognitionRef.current = recognition;
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsListening(false);
  };

  // ─── Live Mode Toggle ────────────────────────────────
  const toggleLiveMode = () => {
    if (liveMode) {
      stopListening();
      stopSpeaking();
      setLiveMode(false);
    } else {
      setLiveMode(true);
      setVoiceEnabled(true);
      startListening();
    }
  };

  // ─── Send Message ────────────────────────────────────
  const handleSendMessage = async (overrideText?: string) => {
    const text = overrideText || input.trim();
    if (!text || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: text,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    stopSpeaking();

    const assistantId = (Date.now() + 1).toString();
    const assistantMessage: Message = {
      id: assistantId,
      role: "assistant",
      content: "",
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, assistantMessage]);

    try {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();

      const allMessages = [...messages, userMessage].map(m => ({
        role: m.role,
        content: m.content,
      }));

      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          messages: allMessages,
          patientContext: patientContextRef.current,
          category: activeCategory,
          callMode: liveMode,
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) throw new Error("Failed to get response");

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No response stream");

      const decoder = new TextDecoder();
      let fullContent = "";
      let sentenceBuffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n").filter(l => l.trim());

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            if (data === "[DONE]") continue;

            try {
              const parsed = JSON.parse(data);
              if (parsed.content) {
                fullContent += parsed.content;
                sentenceBuffer += parsed.content;

                setMessages(prev =>
                  prev.map(m =>
                    m.id === assistantId ? { ...m, content: fullContent } : m
                  )
                );

                if (voiceEnabled) {
                  const sentenceEnd = sentenceBuffer.match(/[.!?]\s/);
                  if (sentenceEnd) {
                    const idx = sentenceEnd.index! + 1;
                    const sentence = sentenceBuffer.substring(0, idx).trim();
                    sentenceBuffer = sentenceBuffer.substring(idx);
                    if (sentence) queueSpeech(sentence);
                  }
                }
              }
            } catch {}
          }
        }
      }

      if (voiceEnabled && sentenceBuffer.trim()) {
        queueSpeech(sentenceBuffer.trim());
      }
    } catch (error: any) {
      if (error.name !== "AbortError") {
        setMessages(prev =>
          prev.map(m =>
            m.id === assistantId
              ? { ...m, content: "I'm having trouble connecting right now. Please try again in a moment. 💙" }
              : m
          )
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = () => handleSendMessage();

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const quickSuggestions = [
    "Am I at risk for anything?",
    "Are my medications safe?",
    "What should I eat today?",
    "I'm feeling anxious",
    "Check my health summary",
    "Any symptom warnings?",
  ];

  const activeCatMeta = getCategoryMeta(activeCategory);

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gradient-to-b dark:from-[#0A0A0F] dark:to-[#0F0F1A]">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        
        <main className="flex-1 overflow-hidden flex">
          {/* ─── Sessions Sidebar ─────────────────────── */}
          <AnimatePresence>
            {showSessions && (
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 320, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="h-full border-r border-white/10 bg-[#0a0a14]/80 backdrop-blur-xl overflow-hidden flex flex-col"
              >
                <div className="p-4 border-b border-white/10">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-white">Sessions</h2>
                    <button onClick={() => setShowSessions(false)} className="p-1.5 rounded-lg hover:bg-white/10 transition">
                      <ChevronLeft className="w-4 h-4 text-gray-400" />
                    </button>
                  </div>
                  <button
                    onClick={() => setShowCategoryPicker(true)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-cyan-500/30 text-cyan-400 font-medium hover:from-cyan-500/30 hover:to-purple-500/30 transition-all shadow-lg shadow-cyan-500/5"
                  >
                    <Plus className="w-4 h-4" />
                    New Session
                  </button>
                </div>

                {/* Session List */}
                <div className="flex-1 overflow-y-auto p-3 space-y-2 hide-scrollbar">
                  {sessions.map((session) => {
                    const catMeta = getCategoryMeta(session.category);
                    const isActive = session.id === activeSessionId;
                    const CatIcon = catMeta.icon;
                    return (
                      <motion.div
                        key={session.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={`group relative p-3.5 rounded-xl cursor-pointer transition-all ${
                          isActive
                            ? "bg-gradient-to-r from-cyan-500/15 to-purple-500/15 border border-cyan-500/25 shadow-lg shadow-cyan-500/5"
                            : "hover:bg-white/5 border border-transparent"
                        }`}
                        onClick={() => switchToSession(session)}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${catMeta.color} flex items-center justify-center flex-shrink-0 opacity-80`}>
                            <CatIcon className="w-4 h-4 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-medium truncate ${isActive ? "text-white" : "text-gray-300"}`}>
                              {session.title}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className={`text-[10px] px-1.5 py-0.5 rounded-full bg-gradient-to-r ${catMeta.color} text-white font-medium`}>
                                {catMeta.label}
                              </span>
                            </div>
                            <p className="text-[11px] text-gray-500 mt-1 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {new Date(session.updatedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                              {' · '}
                              {session.messages.length} msgs
                            </p>
                          </div>
                          <button
                            onClick={(e) => { e.stopPropagation(); deleteSession(session.id); }}
                            className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-red-500/20 text-gray-500 hover:text-red-400 transition-all"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </motion.div>
                    );
                  })}
                  {sessions.length === 0 && (
                    <div className="text-center py-8">
                      <MessageSquare className="w-10 h-10 text-gray-600 mx-auto mb-3" />
                      <p className="text-sm text-gray-500">No sessions yet</p>
                      <p className="text-xs text-gray-600 mt-1">Start a new session to begin</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ─── Category Picker Modal ────────────────── */}
          <AnimatePresence>
            {showCategoryPicker && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
                onClick={() => setShowCategoryPicker(false)}
              >
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  transition={{ type: "spring", damping: 25 }}
                  className="w-full max-w-lg p-6 mx-4 rounded-2xl bg-[#0e0e1a]/95 backdrop-blur-xl border border-white/10 shadow-2xl"
                  onClick={(e) => e.stopPropagation()}
                >
                  <h3 className="text-xl font-bold text-white mb-2">Choose Focus Area</h3>
                  <p className="text-sm text-gray-400 mb-6">Select the type of assistance you need for this session</p>
                  <div className="grid grid-cols-2 gap-3">
                    {FOCUS_CATEGORIES.map((cat) => {
                      const CatIcon = cat.icon;
                      return (
                        <motion.button
                          key={cat.id}
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                          onClick={() => createNewSession(cat.id)}
                          className={`p-5 rounded-xl bg-gradient-to-br ${cat.color} bg-opacity-10 border border-white/10 hover:border-white/20 text-left transition-all group relative overflow-hidden`}
                        >
                          <div className={`absolute inset-0 bg-gradient-to-br ${cat.color} opacity-10 group-hover:opacity-20 transition-opacity`} />
                          <div className="relative">
                            <CatIcon className="w-8 h-8 text-white mb-3" />
                            <h4 className="text-white font-semibold text-sm">{cat.label}</h4>
                            <p className="text-white/60 text-xs mt-1">{cat.description}</p>
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ─── Voice Settings Modal ─────────────────── */}
          <AnimatePresence>
            {showVoiceSettings && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
                onClick={() => setShowVoiceSettings(false)}
              >
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  className="w-full max-w-md p-6 mx-4 rounded-2xl bg-[#0e0e1a]/95 backdrop-blur-xl border border-white/10 shadow-2xl"
                  onClick={(e) => e.stopPropagation()}
                >
                  <h3 className="text-xl font-bold text-white mb-2">Voice Persona</h3>
                  <p className="text-sm text-gray-400 mb-5">Choose how your AI companion sounds</p>
                  <div className="space-y-3">
                    {VOICE_PERSONAS.map((persona) => (
                      <button
                        key={persona.id}
                        onClick={() => { setVoicePersona(persona); setShowVoiceSettings(false); }}
                        className={`w-full p-4 rounded-xl text-left transition-all ${
                          voicePersona.id === persona.id
                            ? "bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-cyan-500/30"
                            : "bg-white/5 border border-white/10 hover:bg-white/10"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            voicePersona.id === persona.id ? "bg-cyan-500/20" : "bg-white/10"
                          }`}>
                            <Volume2 className={`w-5 h-5 ${voicePersona.id === persona.id ? "text-cyan-400" : "text-gray-400"}`} />
                          </div>
                          <div>
                            <p className={`font-medium ${voicePersona.id === persona.id ? "text-white" : "text-gray-300"}`}>
                              {persona.name}
                            </p>
                            <p className="text-xs text-gray-500">{persona.description}</p>
                          </div>
                          {voicePersona.id === persona.id && (
                            <div className="ml-auto w-2 h-2 rounded-full bg-cyan-400" />
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ─── Main Chat Area ───────────────────────── */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Chat Header */}
            <div className="border-b border-gray-200 dark:border-white/10 px-6 py-3 bg-white/50 dark:bg-[#0a0a14]/60 backdrop-blur-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setShowSessions(!showSessions)}
                    className="p-2 rounded-lg hover:bg-white/10 transition text-gray-400 hover:text-white"
                  >
                    {showSessions ? <ChevronLeft className="w-5 h-5" /> : <MessageSquare className="w-5 h-5" />}
                  </button>
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${activeCatMeta.color} flex items-center justify-center shadow-lg`}>
                    <Brain className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h1 className="text-lg font-bold text-gray-900 dark:text-white">AI Companion</h1>
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full bg-gradient-to-r ${activeCatMeta.color} text-white font-medium`}>
                        {activeCatMeta.label}
                      </span>
                      <span className="text-xs text-gray-500">
                        {liveMode ? "🎙️ Live Mode" : "💙 Always here"}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {/* Voice Settings */}
                  <button
                    onClick={() => setShowVoiceSettings(true)}
                    className="p-2 rounded-lg hover:bg-white/10 transition text-gray-400 hover:text-white"
                    title="Voice persona"
                  >
                    <Settings2 className="w-4 h-4" />
                  </button>

                  {/* Live Mode Button */}
                  <button
                    onClick={toggleLiveMode}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all ${
                      liveMode
                        ? "bg-green-500/20 border border-green-500/40 text-green-400"
                        : "bg-white/5 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-500 dark:text-gray-400 hover:text-white"
                    }`}
                  >
                    {liveMode ? (
                      <>
                        <PhoneOff className="w-4 h-4" />
                        <span className="text-xs font-medium hidden sm:inline">End Call</span>
                      </>
                    ) : (
                      <>
                        <Phone className="w-4 h-4" />
                        <span className="text-xs font-medium hidden sm:inline">Live Talk</span>
                      </>
                    )}
                  </button>

                  {/* Voice Toggle */}
                  <button
                    onClick={() => {
                      if (isSpeaking) stopSpeaking();
                      setVoiceEnabled(!voiceEnabled);
                    }}
                    className={`p-2 rounded-lg transition ${
                      voiceEnabled ? "hover:bg-white/10 text-cyan-400" : "hover:bg-white/10 text-gray-500"
                    }`}
                  >
                    {voiceEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                  </button>

                  {/* Status */}
                  <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-green-500/20">
                    <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                    <span className="text-xs text-green-400">Active</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Live Mode Indicator with Voice Orb */}
            <AnimatePresence>
              {liveMode && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="flex flex-col items-center justify-center py-6 bg-gradient-to-r from-green-500/5 to-cyan-500/5 border-b border-green-500/20">
                    {/* Animated Voice Orb */}
                    <div className="relative w-20 h-20 mb-3">
                      {/* Outer glow rings */}
                      <motion.div
                        className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan-500/30 to-purple-500/30"
                        animate={{
                          scale: isListening ? [1, 1.4, 1] : isSpeaking ? [1, 1.3, 1] : [1, 1.05, 1],
                          opacity: isListening ? [0.6, 0, 0.6] : isSpeaking ? [0.4, 0, 0.4] : [0.2, 0.1, 0.2],
                        }}
                        transition={{ duration: isListening ? 0.8 : 1.5, repeat: Infinity }}
                      />
                      <motion.div
                        className="absolute inset-1 rounded-full bg-gradient-to-r from-green-500/30 to-cyan-500/30"
                        animate={{
                          scale: isListening ? [1, 1.3, 1] : isSpeaking ? [1, 1.2, 1] : [1, 1.03, 1],
                          opacity: isListening ? [0.5, 0, 0.5] : isSpeaking ? [0.3, 0, 0.3] : [0.15, 0.08, 0.15],
                        }}
                        transition={{ duration: isListening ? 1 : 2, repeat: Infinity, delay: 0.2 }}
                      />
                      {/* Core orb */}
                      <motion.div
                        className={`absolute inset-3 rounded-full flex items-center justify-center shadow-2xl ${
                          isListening
                            ? "bg-gradient-to-br from-green-400 to-cyan-500 shadow-green-500/40"
                            : isSpeaking
                              ? "bg-gradient-to-br from-cyan-400 to-purple-500 shadow-cyan-500/40"
                              : "bg-gradient-to-br from-gray-600 to-gray-700 shadow-gray-500/20"
                        }`}
                        animate={{
                          scale: isListening ? [1, 1.08, 1] : isSpeaking ? [1, 1.05, 1] : 1,
                        }}
                        transition={{ duration: 0.6, repeat: Infinity }}
                      >
                        {isListening ? (
                          <Mic className="w-6 h-6 text-white" />
                        ) : isSpeaking ? (
                          <Volume2 className="w-6 h-6 text-white" />
                        ) : (
                          <Phone className="w-6 h-6 text-white/60" />
                        )}
                      </motion.div>
                    </div>
                    {/* Audio waveform bars */}
                    <div className="flex gap-1 mb-2">
                      {[0, 1, 2, 3, 4, 5, 6].map(i => (
                        <motion.div
                          key={i}
                          className={`w-1 rounded-full ${
                            isListening ? "bg-green-400" : isSpeaking ? "bg-cyan-400" : "bg-gray-600"
                          }`}
                          animate={{
                            height: isListening
                              ? [6, 18 + Math.random() * 10, 6]
                              : isSpeaking
                                ? [4, 14 + Math.random() * 8, 4]
                                : [3, 5, 3],
                          }}
                          transition={{
                            duration: isListening ? 0.3 + Math.random() * 0.3 : 0.5 + Math.random() * 0.5,
                            repeat: Infinity,
                            delay: i * 0.08,
                          }}
                        />
                      ))}
                    </div>
                    <span className="text-sm font-medium text-gray-400">
                      {isListening ? (
                        <span className="text-green-400">🎙️ Listening...</span>
                      ) : isSpeaking ? (
                        <span className="text-cyan-400">🔊 Speaking...</span>
                      ) : (
                        <span className="text-gray-500">Ready — speak anytime</span>
                      )}
                    </span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.map((message, idx) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div className={`flex gap-3 max-w-[80%] ${message.role === "user" ? "flex-row-reverse" : ""}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      message.role === "user" 
                        ? "bg-gradient-to-br from-cyan-500 to-purple-600" 
                        : "bg-white/10"
                    }`}>
                      {message.role === "user" ? (
                        <Smile className="w-4 h-4 text-white" />
                      ) : (
                        <Sparkles className="w-4 h-4 text-cyan-400" />
                      )}
                    </div>
                    <div className={`p-4 rounded-2xl ${
                      message.role === "user"
                        ? "bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-cyan-500/30"
                        : "glass"
                    }`}>
                      <p className="text-gray-900 dark:text-white text-sm whitespace-pre-wrap">{message.content}</p>
                      {message.content && (
                        <p className="text-xs text-gray-500 mt-2">
                          {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
              
              {isLoading && messages[messages.length - 1]?.content === "" && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start"
                >
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                      <Sparkles className="w-4 h-4 text-cyan-400" />
                    </div>
                    <div className="glass p-4 rounded-2xl">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce" />
                        <div className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: "0.15s" }} />
                        <div className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: "0.3s" }} />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Suggestions */}
            {!liveMode && (
              <div className="px-6 py-3 border-t border-gray-200 dark:border-white/10">
                <div className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar">
                  {quickSuggestions.map((suggestion, idx) => (
                    <button
                      key={idx}
                      onClick={() => setInput(suggestion)}
                      className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-gray-600 dark:text-gray-300 text-sm whitespace-nowrap hover:bg-white/10 hover:border-white/20 transition"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input Area */}
            <div className="p-4 sm:p-6 border-t border-gray-200 dark:border-white/10 bg-white/30 dark:bg-[#0a0a14]/40 backdrop-blur-md">
              <div className="flex gap-3">
                <button
                  onClick={isListening ? stopListening : startListening}
                  className={`p-3 rounded-xl transition ${
                    isListening
                      ? "bg-red-500/20 border border-red-500/30 text-red-400 animate-pulse"
                      : "bg-white/5 border border-gray-200 dark:border-white/10 text-gray-500 dark:text-gray-400 hover:text-white hover:border-white/20"
                  }`}
                >
                  {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                </button>
                
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder={liveMode ? "Live mode active — just speak!" : "Type your message or click the mic..."}
                  className="flex-1 p-3 rounded-xl bg-white/50 dark:bg-white/5 text-gray-900 dark:text-white placeholder:text-gray-500 outline-none resize-none border border-gray-200 dark:border-white/10 focus:border-cyan-500 transition backdrop-blur-sm"
                  rows={1}
                  style={{ minHeight: "48px", maxHeight: "120px" }}
                />
                
                <button
                  onClick={sendMessage}
                  disabled={!input.trim() || isLoading}
                  className="p-3 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 text-white hover:shadow-lg hover:shadow-cyan-500/20 transition disabled:opacity-50"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
              
              <p className="text-center text-xs text-gray-500 mt-3">
                AI companion provides health guidance — consult your doctor for medical decisions
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
