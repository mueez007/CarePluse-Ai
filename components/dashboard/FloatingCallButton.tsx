"use client";

import { motion } from "framer-motion";
import { Phone, Sparkles } from "lucide-react";

interface FloatingCallButtonProps {
  isActive: boolean;
  isMinimized: boolean;
  maximize: () => void;
}

export default function FloatingCallButton({
  isActive,
  isMinimized,
  maximize,
}: FloatingCallButtonProps) {
  if (!isActive || !isMinimized) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.5 }}
      drag
      dragConstraints={{ top: 20, left: 20, right: window.innerWidth - 80, bottom: window.innerHeight - 80 }}
      dragElastic={0.1}
      dragMomentum={false}
      onClick={maximize}
      className="fixed bottom-6 right-6 z-50 w-16 h-16 rounded-full bg-gradient-to-tr from-cyan-500 to-purple-600 flex items-center justify-center cursor-pointer shadow-[0_0_25px_rgba(6,182,212,0.4)] border-2 border-white/20 select-none group"
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.95 }}
      title="Voice Reminder Session Active - Click to open"
    >
      {/* Pulsing Outer Rings */}
      <div className="absolute inset-0 rounded-full border border-cyan-400/40 animate-[ping_2s_infinite]" />
      <div className="absolute inset-[-6px] rounded-full border border-purple-500/20 animate-[ping_2.5s_infinite_0.5s]" />

      {/* Floating Orb Core */}
      <div className="relative flex items-center justify-center w-full h-full">
        <Phone className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
        <Sparkles className="w-3.5 h-3.5 text-cyan-200 absolute -top-1 -right-1 animate-pulse" />
      </div>
    </motion.div>
  );
}
