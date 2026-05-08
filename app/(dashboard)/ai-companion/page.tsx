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
  Loader2,
  Phone,
  PhoneOff
} from "lucide-react";
import Sidebar from "@/components/dashboard/Sidebar";
import Header from "@/components/dashboard/Header";
import { buildPatientContext, getFullHealthProfile } from "@/lib/health-data";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export default function AICompanionPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "Hello! I'm your CarePulse AI companion. How are you feeling today? 💙",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [liveMode, setLiveMode] = useState(false);
  const [aiModel, setAiModel] = useState<"groq" | "nvidia">("groq");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const speechQueueRef = useRef<string[]>([]);
  const isSpeakingRef = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const patientContextRef = useRef<string>("");

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Build patient context on mount
  useEffect(() => {
    const profile = getFullHealthProfile();
    patientContextRef.current = buildPatientContext();
    
    // Personalize greeting
    if (profile.basicDetails?.name) {
      setMessages([{
        id: "1",
        role: "assistant",
        content: `Hello ${profile.basicDetails.name}! I'm your CarePulse AI companion. I have access to your health profile${profile.healthConditions.length > 0 ? ` and I'm aware of your health conditions` : ''}. How can I help you today? 💙`,
        timestamp: new Date(),
      }]);
    }
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // ─── Speech Synthesis (TTS) ───────────────────────────
  const speakText = useCallback((text: string) => {
    if (!voiceEnabled || !("speechSynthesis" in window)) return;

    // Clean emojis and markdown for cleaner speech
    const cleanText = text
      .replace(/[\u{1F600}-\u{1F9FF}]/gu, "")
      .replace(/[*_~`#]/g, "")
      .trim();

    if (!cleanText) return;

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = "en-US";
    utterance.rate = 0.95;
    utterance.pitch = 1.05;
    
    // Try to pick a good voice
    const voices = window.speechSynthesis.getVoices();
    const preferred = voices.find(
      v => v.name.includes("Samantha") || v.name.includes("Google") || v.name.includes("Female")
    );
    if (preferred) utterance.voice = preferred;

    utterance.onstart = () => {
      setIsSpeaking(true);
      isSpeakingRef.current = true;
    };
    utterance.onend = () => {
      isSpeakingRef.current = false;
      // Speak next in queue
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
  }, [voiceEnabled]);

  // Queue a sentence for live speech
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

    stopSpeaking(); // Stop speaking when user wants to talk

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
        // Always auto-send when speech is finalized — true voice assistant behavior
        setInput("");
        handleSendMessage(finalTranscript);
      } else if (interimTranscript) {
        // Show interim text as visual feedback while speaking
        setInput(interimTranscript);
      }
    };

    recognition.onerror = (e: any) => {
      console.log("Speech recognition error:", e.error);
      setIsListening(false);
    };
    recognition.onend = () => {
      setIsListening(false);
      // In live mode, auto-restart listening after a pause
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
      // Turn off
      stopListening();
      stopSpeaking();
      setLiveMode(false);
    } else {
      // Turn on
      setLiveMode(true);
      setVoiceEnabled(true);
      startListening();
    }
  };

  // ─── Send Message with Groq Streaming ────────────────
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

    // Create assistant message placeholder
    const assistantId = (Date.now() + 1).toString();
    const assistantMessage: Message = {
      id: assistantId,
      role: "assistant",
      content: "",
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, assistantMessage]);

    try {
      // Cancel any previous request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();

      const allMessages = [...messages, userMessage].map(m => ({
        role: m.role,
        content: m.content,
      }));

      const chatEndpoint = aiModel === "nvidia" ? "/api/ai/nvidia" : "/api/ai/chat";
      const response = await fetch(chatEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          messages: allMessages,
          patientContext: patientContextRef.current,
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error("Failed to get response");
      }

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

                // Update the message in real-time
                setMessages(prev =>
                  prev.map(m =>
                    m.id === assistantId ? { ...m, content: fullContent } : m
                  )
                );

                // Live speak: queue each sentence as it completes
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

      // Speak any remaining text
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

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gradient-to-b dark:from-[#0A0A0F] dark:to-[#0F0F1A]">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        
        <main className="flex-1 overflow-hidden flex flex-col">
          {/* Chat Header */}
          <div className="glass border-b border-gray-200 dark:border-white/10 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center">
                  <Brain className="w-5 h-5 text-gray-900 dark:text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900 dark:text-white">AI Companion</h1>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {aiModel === "nvidia" ? "DeepSeek R1" : "Groq Llama 3.3"} • {liveMode ? "🎙️ Live Mode" : "Always here for you 💙"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {/* Model Switcher */}
                <select
                  value={aiModel}
                  onChange={(e) => setAiModel(e.target.value as "groq" | "nvidia")}
                  className="px-2 py-1.5 rounded-lg bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300 text-xs focus:outline-none focus:border-cyan-500 cursor-pointer"
                >
                  <option value="groq">⚡ Groq</option>
                  <option value="nvidia">🟢 DeepSeek</option>
                </select>
                {/* Live Mode Button */}
                <button
                  onClick={toggleLiveMode}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all ${
                    liveMode
                      ? "bg-green-500/20 border border-green-500/40 text-green-400"
                      : "glass text-gray-500 dark:text-gray-400 hover:text-white"
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

          {/* Live Mode Indicator */}
          <AnimatePresence>
            {liveMode && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="flex items-center justify-center gap-3 py-3 bg-gradient-to-r from-green-500/10 to-cyan-500/10 border-b border-green-500/20">
                  <div className="flex gap-1">
                    {[0, 1, 2, 3, 4].map(i => (
                      <motion.div
                        key={i}
                        className="w-1 bg-green-400 rounded-full"
                        animate={{
                          height: isListening ? [8, 20, 8] : [4, 4, 4],
                        }}
                        transition={{
                          duration: 0.5,
                          repeat: Infinity,
                          delay: i * 0.1,
                        }}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-green-400 font-medium">
                    {isListening ? "Listening..." : isSpeaking ? "Speaking..." : "Ready — speak anytime"}
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
                transition={{ delay: idx === messages.length - 1 ? 0 : 0 }}
                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div className={`flex gap-3 max-w-[80%] ${message.role === "user" ? "flex-row-reverse" : ""}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    message.role === "user" 
                      ? "bg-gradient-to-br from-cyan-500 to-purple-600" 
                      : "bg-white/10"
                  }`}>
                    {message.role === "user" ? (
                      <Smile className="w-4 h-4 text-gray-900 dark:text-white" />
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
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
                    className="px-3 py-1.5 rounded-full glass text-gray-600 dark:text-gray-300 text-sm whitespace-nowrap hover:bg-white/10 transition"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input Area */}
          <div className="p-6 border-t border-gray-200 dark:border-white/10">
            <div className="flex gap-3">
              <button
                onClick={isListening ? stopListening : startListening}
                className={`p-3 rounded-xl transition ${
                  isListening
                    ? "bg-red-500/20 border border-red-500/30 text-red-400 animate-pulse"
                    : "glass text-gray-500 dark:text-gray-400 hover:text-white"
                }`}
              >
                {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>
              
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder={liveMode ? "Live mode active — just speak!" : "Type your message or click the mic..."}
                className="flex-1 p-3 rounded-xl glass text-gray-900 dark:text-white placeholder:text-gray-500 outline-none resize-none border border-gray-200 dark:border-white/10 focus:border-cyan-500 transition"
                rows={1}
                style={{ minHeight: "48px", maxHeight: "120px" }}
              />
              
              <button
                onClick={sendMessage}
                disabled={!input.trim() || isLoading}
                className="p-3 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 text-gray-900 dark:text-white hover:shadow-lg transition disabled:opacity-50"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
            
            <p className="text-center text-xs text-gray-500 mt-4">
              *AI companion provides emotional support and general wellness suggestions, not medical advice
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}
