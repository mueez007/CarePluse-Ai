"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Phone,
  PhoneOff,
  Minus,
  AlertCircle,
  Loader2,
  Mic,
  Sparkles,
  Volume2,
} from "lucide-react";
import type { CallMode } from "@/hooks/useVoiceReminder";

const RETELL_ORB_URL =
  "https://agent.retellai.com/orb/agent_2ae8cd0c01281f35db761a2cc3?token=f22a9766666be60eb8424e73a165400a";

interface VoiceReminderWidgetProps {
  isActive: boolean;
  isConnecting: boolean;
  error: string | null;
  callStatus: "idle" | "connecting" | "active" | "error";
  isAgentSpeaking: boolean;
  callMode: CallMode;
  endCall: () => void;
  minimize: () => void;
}

export default function VoiceReminderWidget({
  isActive,
  isConnecting,
  error,
  callStatus,
  isAgentSpeaking,
  callMode,
  endCall,
  minimize,
}: VoiceReminderWidgetProps) {
  const [iframeLoading, setIframeLoading] = useState(true);

  useEffect(() => {
    if (callMode === "iframe") {
      setIframeLoading(true);
    }
  }, [callMode]);

  if (!isActive) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 50 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: 50 }}
      drag
      dragConstraints={{
        top: 20,
        left: 20,
        right: typeof window !== "undefined" ? window.innerWidth - 400 : 600,
        bottom: typeof window !== "undefined" ? window.innerHeight - 560 : 400,
      }}
      dragElastic={0.1}
      dragMomentum={false}
      className="fixed bottom-6 right-6 z-50 w-full max-w-[380px] rounded-2xl overflow-hidden border border-[#2A2A40] shadow-[0_0_40px_rgba(168,85,247,0.15)] bg-[#0A0A10]/95 backdrop-blur-2xl flex flex-col cursor-grab active:cursor-grabbing select-none"
      style={{ height: callMode === "iframe" ? 520 : 480 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/5 bg-white/[0.02]">
        <div className="flex items-center gap-2">
          <div className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500" />
          </div>
          <span className="text-sm font-semibold text-white tracking-wide flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            CarePulse Voice Assistant
          </span>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            minimize();
          }}
          className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition"
          title="Minimize"
        >
          <Minus className="w-4 h-4" />
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 relative flex flex-col items-center justify-center p-5 bg-gradient-to-b from-transparent to-[#0F0F20]/50 overflow-hidden">
        {/* ── Error State ── */}
        {error ? (
          <div className="flex flex-col items-center text-center p-4">
            <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mb-4 border border-red-500/30">
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
            <h3 className="text-white font-semibold mb-2">Microphone Required</h3>
            <p className="text-xs text-gray-400 leading-relaxed mb-6">{error}</p>
            <button
              onClick={endCall}
              className="px-6 py-2.5 rounded-xl bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 transition text-sm font-semibold"
            >
              Close
            </button>
          </div>
        ) : isConnecting || callStatus === "connecting" ? (
          /* ── Connecting Spinner ── */
          <div className="flex flex-col items-center justify-center text-center w-full h-full">
            <div className="relative mb-8">
              <div className="absolute inset-[-20px] rounded-full border border-cyan-500/20 animate-[ping_1.5s_infinite]" />
              <div className="absolute inset-[-10px] rounded-full border border-purple-500/30 animate-[ping_2s_infinite]" />
              <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-cyan-500 to-purple-600 flex items-center justify-center shadow-[0_0_25px_rgba(6,182,212,0.3)]">
                <Phone className="w-8 h-8 text-white animate-pulse" />
              </div>
            </div>
            <h3 className="text-white font-medium tracking-wide text-lg">Connecting...</h3>
            <p className="text-xs text-cyan-400/80 mt-1 font-mono">Setting up secure voice stream</p>
            <div className="mt-8 flex gap-1">
              <span className="w-1.5 h-6 bg-cyan-500 rounded-full animate-[pulse_0.8s_infinite]" />
              <span className="w-1.5 h-6 bg-purple-500 rounded-full animate-[pulse_0.8s_infinite_0.15s]" />
              <span className="w-1.5 h-6 bg-cyan-500 rounded-full animate-[pulse_0.8s_infinite_0.3s]" />
            </div>
          </div>
        ) : callMode === "iframe" ? (
          /* ── Iframe Fallback Mode ── */
          <div className="w-full h-full flex flex-col">
            <div className="w-full flex-1 relative rounded-xl overflow-hidden bg-black/40 border border-white/5">
              {iframeLoading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0B0B14] z-10">
                  <Loader2 className="w-8 h-8 text-cyan-400 animate-spin mb-2" />
                  <p className="text-xs text-gray-500">Loading Voice Assistant...</p>
                </div>
              )}
              <iframe
                src={RETELL_ORB_URL}
                allow="microphone"
                onLoad={() => setIframeLoading(false)}
                className="w-full h-full border-none pointer-events-auto"
                style={{ background: "transparent" }}
              />
            </div>
            <p className="text-[10px] text-gray-500 text-center mt-2 leading-snug">
              Click the orb above, then press <strong className="text-cyan-400">&quot;Talk to Retell AI&quot;</strong> to start
            </p>
            <button
              onClick={(e) => {
                e.stopPropagation();
                endCall();
              }}
              className="w-full mt-3 py-3 rounded-xl bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white font-semibold flex items-center justify-center gap-2 transition-all shadow-[0_4px_20px_rgba(239,68,68,0.25)] border border-red-500/20 active:scale-[0.98]"
            >
              <PhoneOff className="w-4 h-4" />
              End Session
            </button>
          </div>
        ) : (
          /* ── SDK Mode — Custom Animated Orb ── */
          <div className="w-full h-full flex flex-col items-center justify-between">
            {/* Visual Voice Orb */}
            <div className="flex-1 w-full flex flex-col items-center justify-center relative">
              {/* Pulsing Aura */}
              {isAgentSpeaking ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  <motion.div
                    animate={{ scale: [1.1, 1.4, 1.1], opacity: [0.15, 0.4, 0.15] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute w-44 h-44 rounded-full bg-gradient-to-r from-purple-500/30 to-pink-500/30 blur-2xl"
                  />
                  <motion.div
                    animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.5, 0.2] }}
                    transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
                    className="absolute w-36 h-36 rounded-full bg-gradient-to-r from-cyan-500/20 to-purple-500/20 blur-xl"
                  />
                </div>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <motion.div
                    animate={{ scale: [1, 1.12, 1], opacity: [0.1, 0.25, 0.1] }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute w-40 h-40 rounded-full bg-cyan-500/10 blur-2xl"
                  />
                </div>
              )}

              {/* Core Orb */}
              <motion.div
                animate={
                  isAgentSpeaking
                    ? { scale: [1, 1.05, 0.98, 1.03, 1], rotate: 360 }
                    : { scale: [1, 1.02, 1], rotate: 360 }
                }
                transition={
                  isAgentSpeaking
                    ? {
                        scale: { duration: 1.8, repeat: Infinity, ease: "easeInOut" },
                        rotate: { duration: 12, repeat: Infinity, ease: "linear" },
                      }
                    : {
                        scale: { duration: 3, repeat: Infinity, ease: "easeInOut" },
                        rotate: { duration: 25, repeat: Infinity, ease: "linear" },
                      }
                }
                className="w-32 h-32 rounded-full relative bg-gradient-to-tr from-cyan-500 via-purple-600 to-pink-500 p-[1.5px] shadow-[0_0_35px_rgba(168,85,247,0.35)] flex items-center justify-center"
              >
                <div className="w-full h-full rounded-full bg-[#07070F]/90 backdrop-blur-xl flex flex-col items-center justify-center overflow-hidden relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 via-transparent to-purple-500/20 opacity-60" />
                  {isAgentSpeaking ? (
                    <Volume2 className="w-8 h-8 text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.5)] animate-[bounce_1.5s_infinite]" />
                  ) : (
                    <Mic className="w-8 h-8 text-purple-400 drop-shadow-[0_0_8px_rgba(168,85,247,0.5)] animate-pulse" />
                  )}
                  <Sparkles className="w-4 h-4 text-white/50 absolute top-6 right-6 animate-pulse" />
                </div>
              </motion.div>

              {/* Label */}
              <div className="mt-8 text-center">
                <motion.h3
                  key={isAgentSpeaking ? "speaking" : "listening"}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-white font-medium text-base tracking-wide"
                >
                  {isAgentSpeaking ? "AI Assistant Speaking..." : "Listening..."}
                </motion.h3>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                  {isAgentSpeaking
                    ? "Giving you personalized voice reminders"
                    : "Speak naturally, I am here to assist you"}
                </p>
              </div>
            </div>

            {/* Soundwave + End Call */}
            <div className="w-full flex flex-col items-center">
              <div className="flex items-end gap-1 h-6 justify-center mb-4">
                <span
                  className={`w-1 rounded-full bg-cyan-400 transition-all duration-150 ${
                    isAgentSpeaking ? "animate-[soundwave_0.8s_ease-in-out_infinite_0.1s]" : "h-1.5"
                  }`}
                />
                <span
                  className={`w-1 rounded-full bg-purple-400 transition-all duration-150 ${
                    isAgentSpeaking ? "animate-[soundwave_0.5s_ease-in-out_infinite_0.3s]" : "h-1"
                  }`}
                />
                <span
                  className={`w-1 rounded-full bg-cyan-400 transition-all duration-150 ${
                    isAgentSpeaking ? "animate-[soundwave_0.9s_ease-in-out_infinite_0.5s]" : "h-2"
                  }`}
                />
                <span
                  className={`w-1 rounded-full bg-purple-400 transition-all duration-150 ${
                    isAgentSpeaking ? "animate-[soundwave_0.6s_ease-in-out_infinite_0.2s]" : "h-1.5"
                  }`}
                />
                <span
                  className={`w-1 rounded-full bg-cyan-400 transition-all duration-150 ${
                    isAgentSpeaking ? "animate-[soundwave_0.7s_ease-in-out_infinite_0.4s]" : "h-1"
                  }`}
                />
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  endCall();
                }}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white font-semibold flex items-center justify-center gap-2.5 transition-all shadow-[0_4px_20px_rgba(239,68,68,0.25)] border border-red-500/20 active:scale-[0.98]"
              >
                <PhoneOff className="w-4 h-4" />
                End Call Session
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Keyframe animations */}
      <style jsx global>{`
        @keyframes soundwave {
          0%,
          100% {
            height: 6px;
          }
          50% {
            height: 22px;
          }
        }
      `}</style>
    </motion.div>
  );
}
