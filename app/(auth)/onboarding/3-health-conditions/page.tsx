"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Droplets, 
  Activity, 
  CircleDot, 
  Heart, 
  Wind, 
  Bone, 
  Smile,
  AlertCircle,
  CheckCircle2
} from "lucide-react";

interface HealthConditionsProps {
  onNext: () => void;
}

interface Condition {
  id: string;
  name: string;
  icon: any;
  color: string;
}

const conditions: Condition[] = [
  { id: "diabetes", name: "Diabetes", icon: Droplets, color: "from-blue-500 to-cyan-500" },
  { id: "bp", name: "High BP", icon: Activity, color: "from-red-500 to-orange-500" },
  { id: "kidney", name: "Kidney Disease", icon: CircleDot, color: "from-purple-500 to-pink-500" },
  { id: "heart", name: "Heart Disease", icon: Heart, color: "from-rose-500 to-red-500" },
  { id: "asthma", name: "Asthma", icon: Wind, color: "from-green-500 to-teal-500" },
  { id: "arthritis", name: "Arthritis", icon: Bone, color: "from-yellow-500 to-orange-500" },
  { id: "allergies", name: "Allergies", icon: AlertCircle, color: "from-pink-500 to-rose-500" },
  { id: "other", name: "Other", icon: Smile, color: "from-gray-500 to-gray-600" },
];

export default function HealthConditionsScreen({ onNext }: HealthConditionsProps) {
  const [selectedConditions, setSelectedConditions] = useState<string[]>([]);

  const toggleCondition = (conditionId: string) => {
    setSelectedConditions(prev =>
      prev.includes(conditionId)
        ? prev.filter(id => id !== conditionId)
        : [...prev, conditionId]
    );
  };

  const handleSubmit = () => {
    localStorage.setItem("onboarding_health_conditions", JSON.stringify(selectedConditions));
    onNext();
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-20">
      <div className="max-w-4xl w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
            Health Conditions
          </h1>
          <p className="text-gray-400">
            Select any health conditions you have (optional)
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {conditions.map((condition, idx) => {
            const isSelected = selectedConditions.includes(condition.id);
            const Icon = condition.icon;
            
            return (
              <motion.button
                key={condition.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.05 }}
                onClick={() => toggleCondition(condition.id)}
                className={`relative p-6 rounded-2xl transition-all duration-300 ${
                  isSelected 
                    ? `bg-gradient-to-br ${condition.color} shadow-lg scale-105` 
                    : "glass hover:bg-white/10"
                }`}
              >
                {isSelected && (
                  <div className="absolute top-2 right-2">
                    <CheckCircle2 className="w-5 h-5 text-white" />
                  </div>
                )}
                
                <div className="flex flex-col items-center gap-3">
                  <div className={`w-14 h-14 rounded-xl flex items-center justify-center transition-all ${
                    isSelected ? "bg-white/20" : "bg-white/5"
                  }`}>
                    <Icon className={`w-8 h-8 ${isSelected ? "text-white" : "text-cyan-400"}`} />
                  </div>
                  <span className={`font-medium ${isSelected ? "text-white" : "text-gray-300"}`}>
                    {condition.name}
                  </span>
                </div>

                {/* Animated glow effect when selected */}
                {isSelected && (
                  <motion.div
                    className="absolute inset-0 rounded-2xl"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    style={{
                      background: "radial-gradient(circle at center, rgba(255,255,255,0.2) 0%, transparent 70%)",
                    }}
                  />
                )}
              </motion.button>
            );
          })}
        </div>

        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          onClick={handleSubmit}
          className="w-full mt-10 py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-semibold hover:shadow-lg hover:shadow-cyan-500/25 transition-all"
        >
          Continue to Medications
        </motion.button>
      </div>
    </div>
  );
}
