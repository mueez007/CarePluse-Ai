"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { User, Calendar, VenetianMask, Weight, Ruler, Droplet, Mic, MicOff } from "lucide-react";

interface BasicDetailsProps {
  onNext: () => void;
}

export default function BasicDetailsScreen({ onNext }: BasicDetailsProps) {
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    gender: "",
    weight: "",
    height: "",
    bloodGroup: "",
  });
  const [isListening, setIsListening] = useState(false);
  const [activeField, setActiveField] = useState<string | null>(null);

  const fields = [
    { id: "name", label: "Full Name", icon: User, placeholder: "Enter your full name", type: "text", voiceEnabled: true },
    { id: "age", label: "Age", icon: Calendar, placeholder: "Enter your age", type: "number", voiceEnabled: true },
    { id: "gender", label: "Gender", icon: VenetianMask, placeholder: "Select gender", type: "select", options: ["Male", "Female", "Other"], voiceEnabled: false },
    { id: "weight", label: "Weight (kg)", icon: Weight, placeholder: "Enter weight in kg", type: "number", voiceEnabled: true },
    { id: "height", label: "Height (cm)", icon: Ruler, placeholder: "Enter height in cm", type: "number", voiceEnabled: true },
    { id: "bloodGroup", label: "Blood Group", icon: Droplet, placeholder: "Select blood group", type: "select", options: ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"], voiceEnabled: false },
  ];

  const startVoiceInput = (fieldId: string) => {
    if (!("webkitSpeechRecognition" in window)) {
      alert("Voice input not supported in this browser");
      return;
    }

    setIsListening(true);
    setActiveField(fieldId);
    
    const recognition = new (window as any).webkitSpeechRecognition();
    recognition.lang = "en-US";
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setFormData(prev => ({ ...prev, [fieldId]: transcript }));
      setIsListening(false);
      setActiveField(null);
    };

    recognition.onerror = () => {
      setIsListening(false);
      setActiveField(null);
    };

    recognition.start();
  };

  const handleInputChange = (id: string, value: string) => {
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const isFormValid = () => {
    return formData.name && formData.age && formData.gender && formData.weight && formData.height && formData.bloodGroup;
  };

  const handleSubmit = () => {
    if (isFormValid()) {
      // Save to localStorage for now (will be saved to DB later)
      localStorage.setItem("onboarding_basic_details", JSON.stringify(formData));
      onNext();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-20">
      <div className="max-w-2xl w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
            Tell us about yourself
          </h1>
          <p className="text-gray-400">
            This helps us personalize your health recommendations
          </p>
        </motion.div>

        <div className="space-y-4">
          {fields.map((field, idx) => (
            <motion.div
              key={field.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className={`glass rounded-xl p-4 transition-all duration-300 ${activeField === field.id ? "border-cyan-500 shadow-lg shadow-cyan-500/20" : "border-white/10"}`}
            >
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {field.label}
              </label>
              <div className="relative">
                <field.icon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                
                {field.type === "select" ? (
                  <select
                    value={formData[field.id as keyof typeof formData] as string}
                    onChange={(e) => handleInputChange(field.id, e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-cyan-500 transition appearance-none cursor-pointer"
                  >
                    <option value="" className="bg-[#0A0A0F]">Select {field.label}</option>
                    {field.options?.map(opt => (
                      <option key={opt} value={opt} className="bg-[#0A0A0F]">{opt}</option>
                    ))}
                  </select>
                ) : (
                  <>
                    <input
                      type={field.type}
                      value={formData[field.id as keyof typeof formData] as string}
                      onChange={(e) => handleInputChange(field.id, e.target.value)}
                      placeholder={field.placeholder}
                      className="w-full pl-10 pr-12 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-cyan-500 transition"
                    />
                    {field.voiceEnabled && (
                      <button
                        type="button"
                        onClick={() => startVoiceInput(field.id)}
                        className="absolute right-3 top-1/2 -translate-y-1/2"
                      >
                        {isListening && activeField === field.id ? (
                          <MicOff className="w-5 h-5 text-red-400 animate-pulse" />
                        ) : (
                          <Mic className="w-5 h-5 text-cyan-400 hover:text-cyan-300 transition" />
                        )}
                      </button>
                    )}
                  </>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          onClick={handleSubmit}
          disabled={!isFormValid()}
          className="w-full mt-8 py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-semibold hover:shadow-lg hover:shadow-cyan-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Continue to Health Profile
        </motion.button>
      </div>
    </div>
  );
}
