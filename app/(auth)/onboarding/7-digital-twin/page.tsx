"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Heart, Brain, Shield, Activity, Sparkles, CheckCircle } from "lucide-react";

interface DigitalTwinScreenProps {
  onComplete: () => void;
}

export default function DigitalTwinScreen({ onComplete }: DigitalTwinScreenProps) {
  const router = useRouter();
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [completed, setCompleted] = useState(false);

  const steps = [
    { icon: Brain, title: "Analyzing health profile", message: "Processing your medical history..." },
    { icon: Activity, title: "Synthesizing health data", message: "Creating personalized insights..." },
    { icon: Heart, title: "Building AI intelligence", message: "Training your digital twin..." },
    { icon: Shield, title: "Finalizing security protocols", message: "Encrypting health data..." },
    { icon: Sparkles, title: "Digital Twin Ready!", message: "Your AI companion is ready to assist..." },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setCompleted(true);
          setTimeout(() => {
            onComplete();
          }, 2000);
          return 100;
        }
        // Update step based on progress
        const newProgress = prev + 2;
        const newStep = Math.floor((newProgress / 100) * steps.length);
        if (newStep !== currentStep && newStep < steps.length) {
          setCurrentStep(newStep);
        }
        return newProgress;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [currentStep, steps.length, onComplete]);

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-20">
      <div className="max-w-2xl w-full text-center">
        {/* Main Animation Container */}
        <div className="relative mb-12">
          {/* Glowing Background */}
          <motion.div
            className="absolute inset-0 rounded-full bg-cyan-500/20 blur-3xl"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
            }}
          />

          {/* Neural Network Visualization */}
          <div className="relative w-48 h-48 mx-auto">
            {/* Pulsing rings */}
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute inset-0 rounded-full border-2 border-cyan-500/30"
                animate={{
                  scale: [1, 1.5, 2],
                  opacity: [0.5, 0.2, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.5,
                }}
              />
            ))}

            {/* Center orb */}
            <motion.div
              className="absolute inset-0 rounded-full bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center"
              animate={{
                boxShadow: [
                  "0 0 20px rgba(0,240,255,0.3)",
                  "0 0 60px rgba(0,240,255,0.8)",
                  "0 0 20px rgba(0,240,255,0.3)",
                ],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
              }}
            >
              {completed ? (
                <CheckCircle className="w-20 h-20 text-white" />
              ) : (
                <Heart className="w-20 h-20 text-white animate-pulse" fill="white" />
              )}
            </motion.div>

            {/* Floating particles */}
            {[...Array(12)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 rounded-full bg-cyan-400"
                initial={{
                  x: 0,
                  y: 0,
                  opacity: 0,
                }}
                animate={{
                  x: [0, Math.cos(i * 30) * 80, Math.cos(i * 30) * 100],
                  y: [0, Math.sin(i * 30) * 80, Math.sin(i * 30) * 100],
                  opacity: [0, 1, 0],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  delay: i * 0.2,
                }}
              />
            ))}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-gray-400 mb-2">
            <span>Creating your digital twin...</span>
            <span>{progress}%</span>
          </div>
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-cyan-500 to-purple-600 rounded-full"
              initial={{ width: "0%" }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        {/* Status Messages */}
        <div className="space-y-4">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            const isActive = idx === currentStep;
            const isCompleted = idx < currentStep;
            
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ 
                  opacity: isActive || isCompleted ? 1 : 0.4,
                  x: 0
                }}
                className={`p-4 rounded-xl text-left transition-all ${
                  isActive ? "glass border-cyan-500" : "glass"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    isActive ? "bg-cyan-500/20" : "bg-white/5"
                  }`}>
                    <Icon className={`w-5 h-5 ${
                      isCompleted ? "text-green-400" : isActive ? "text-cyan-400 animate-pulse" : "text-gray-500"
                    }`} />
                  </div>
                  <div className="flex-1">
                    <div className={`font-medium ${
                      isCompleted ? "text-green-400" : isActive ? "text-white" : "text-gray-500"
                    }`}>
                      {step.title}
                    </div>
                    <div className={`text-sm ${
                      isActive ? "text-gray-400" : "text-gray-600"
                    }`}>
                      {step.message}
                    </div>
                  </div>
                  {isCompleted && (
                    <CheckCircle className="w-5 h-5 text-green-400" />
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Completion Animation */}
        {completed && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 p-4 rounded-xl bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30"
          >
            <div className="flex items-center justify-center gap-3">
              <CheckCircle className="w-6 h-6 text-green-400" />
              <span className="text-green-400 font-semibold">
                Health Intelligence Profile Created Successfully!
              </span>
            </div>
            <p className="text-sm text-gray-400 mt-2">
              Your AI digital twin is now ready to assist you with personalized health insights.
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
