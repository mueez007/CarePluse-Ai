"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Heart } from "lucide-react";
import WelcomeScreen from "./1-welcome/page";
import BasicDetailsScreen from "./2-basic-details/page";
import HealthConditionsScreen from "./3-health-conditions/page";
import MedicationsScreen from "./4-medications/page";
import LanguageVoiceScreen from "./5-language-voice/page";
import EmergencyScreen from "./6-emergency/page";
import DigitalTwinScreen from "./7-digital-twin/page";

const steps = [
  { id: 0, title: "Welcome", component: WelcomeScreen },
  { id: 1, title: "Basic Details", component: BasicDetailsScreen },
  { id: 2, title: "Health Conditions", component: HealthConditionsScreen },
  { id: 3, title: "Medications", component: MedicationsScreen },
  { id: 4, title: "Language & Voice", component: LanguageVoiceScreen },
  { id: 5, title: "Emergency Contact", component: EmergencyScreen },
  { id: 6, title: "Digital Twin", component: DigitalTwinScreen },
];

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check if user has signed up (via localStorage) or has a session
    const userData = localStorage.getItem("carepulse_user");
    if (!userData) {
      // No user data at all — redirect to signup
      router.push("/signup");
      return;
    }
    setIsReady(true);
  }, [router]);

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
      window.scrollTo(0, 0);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      window.scrollTo(0, 0);
    }
  };

  const handleComplete = () => {
    // Mark onboarding as completed
    localStorage.setItem("onboarding_completed", "true");
    router.push("/dashboard");
  };

  if (!isReady) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0A0A0F] to-[#0F0F1A] flex items-center justify-center">
        <div className="flex gap-2">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-3 h-3 rounded-full bg-cyan-400"
              animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
            />
          ))}
        </div>
      </div>
    );
  }

  const CurrentComponent = steps[currentStep].component;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0A0A0F] to-[#0F0F1A]">
      {/* Progress Bar */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <div className="h-1 bg-white/10">
          <motion.div
            className="h-full bg-gradient-to-r from-cyan-500 to-purple-600"
            initial={{ width: "0%" }}
            animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Header */}
      <div className="fixed top-4 left-0 right-0 z-50 px-6">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-purple-600 flex items-center justify-center">
              <Heart className="w-5 h-5 text-white" fill="white" />
            </div>
            <span className="text-white font-semibold">CarePulse AI</span>
          </div>
          <div className="text-sm text-gray-400">
            Step {currentStep + 1} of {steps.length}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="pt-20 pb-24">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.3 }}
          >
            <CurrentComponent onNext={nextStep} onComplete={handleComplete} />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Buttons (except for first and last screen) */}
      {currentStep < steps.length - 1 && currentStep !== 0 && (
        <div className="fixed bottom-8 left-0 right-0 px-6">
          <div className="container mx-auto flex justify-between">
            <button
              onClick={prevStep}
              className="px-6 py-3 rounded-xl glass-white text-white font-medium hover:bg-white/10 transition-all flex items-center gap-2"
            >
              <ChevronLeft className="w-5 h-5" />
              Back
            </button>
            <button
              onClick={nextStep}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-medium hover:shadow-lg hover:shadow-cyan-500/25 transition-all flex items-center gap-2"
            >
              Continue
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
