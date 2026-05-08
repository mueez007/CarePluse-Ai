"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Heart, Sparkles, Shield, Brain, Mic, Camera } from "lucide-react";

interface WelcomeScreenProps {
  onNext: () => void;
}

export default function WelcomeScreen({ onNext }: WelcomeScreenProps) {
  const [textIndex, setTextIndex] = useState(0);
  const texts = [
    "Let's build your",
    "personal health intelligence",
    "profile.",
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setTextIndex((prev) => {
        if (prev < texts.length - 1) return prev + 1;
        clearInterval(timer);
        return prev;
      });
    }, 800);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    // Auto-advance after 3 seconds on last text
    if (textIndex === texts.length - 1) {
      const timer = setTimeout(() => {
        onNext();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [textIndex, onNext]);

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      {/* Animated Neural Particles Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {[...Array(50)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-cyan-400/30 rounded-full"
            initial={{
              x: `${Math.random() * 100}%`,
              y: `${Math.random() * 100}%`,
              opacity: 0,
            }}
            animate={{
              y: [null, -100, -200],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: Math.random() * 3 + 2,
              repeat: Infinity,
              delay: Math.random() * 5,
            }}
          />
        ))}
      </div>

      {/* Glowing AI Orb */}
      <div className="relative">
        <motion.div
          className="absolute inset-0 rounded-full bg-cyan-500/20 blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        <motion.div
          className="relative w-48 h-48 rounded-full bg-gradient-to-br from-cyan-400 to-purple-600 flex items-center justify-center shadow-2xl"
          animate={{
            boxShadow: [
              "0 0 20px rgba(0,240,255,0.3)",
              "0 0 60px rgba(0,240,255,0.6)",
              "0 0 20px rgba(0,240,255,0.3)",
            ],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
          }}
        >
          <Heart className="w-24 h-24 text-white" fill="white" />
          
          {/* Orbiting particles */}
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-3 h-3 bg-cyan-400 rounded-full"
              animate={{
                rotate: [0, 360],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                delay: i * 1.3,
              }}
              style={{
                x: 80,
                y: 0,
              }}
            />
          ))}
        </motion.div>

        {/* Feature icons floating around */}
        <motion.div
          className="absolute -top-16 -right-16 w-12 h-12 rounded-full glass flex items-center justify-center"
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <Mic className="w-6 h-6 text-cyan-400" />
        </motion.div>

        <motion.div
          className="absolute -bottom-16 -left-16 w-12 h-12 rounded-full glass flex items-center justify-center"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2.5, repeat: Infinity }}
        >
          <Camera className="w-6 h-6 text-purple-400" />
        </motion.div>

        <motion.div
          className="absolute -top-12 -left-12 w-10 h-10 rounded-full glass flex items-center justify-center"
          animate={{ x: [0, -10, 0], y: [0, -10, 0] }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          <Brain className="w-5 h-5 text-pink-400" />
        </motion.div>

        <motion.div
          className="absolute -bottom-12 -right-12 w-10 h-10 rounded-full glass flex items-center justify-center"
          animate={{ x: [0, 10, 0], y: [0, 10, 0] }}
          transition={{ duration: 3.5, repeat: Infinity }}
        >
          <Shield className="w-5 h-5 text-green-400" />
        </motion.div>
      </div>

      {/* Animated Text */}
      <div className="absolute bottom-32 left-0 right-0 text-center">
        <div className="text-3xl md:text-5xl font-bold text-white">
          {texts.map((text, idx) => (
            <motion.span
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{
                opacity: idx <= textIndex ? 1 : 0,
                y: idx <= textIndex ? 0 : 20,
              }}
              transition={{ duration: 0.5 }}
              className="block"
            >
              {idx === 1 ? (
                <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                  {text}
                </span>
              ) : (
                text
              )}
            </motion.span>
          ))}
        </div>

        {/* Loading dots */}
        {textIndex === texts.length - 1 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex gap-2 justify-center mt-6"
          >
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                className="w-2 h-2 rounded-full bg-cyan-400"
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  delay: i * 0.2,
                }}
              />
            ))}
          </motion.div>
        )}
      </div>

      {/* Skip button */}
      <button
        onClick={onNext}
        className="fixed bottom-8 right-8 text-sm text-gray-400 hover:text-white transition"
      >
        Skip intro →
      </button>
    </div>
  );
}
