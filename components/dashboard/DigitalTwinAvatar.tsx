"use client";

import { motion } from "framer-motion";
import { Heart, Brain, Activity, Shield, Sparkles } from "lucide-react";
import { useState, useEffect } from "react";

export default function DigitalTwinAvatar() {
  const [healthData, setHealthData] = useState<any>(null);

  useEffect(() => {
    // Load user health data from localStorage
    const basicDetails = localStorage.getItem("onboarding_basic_details");
    const healthConditions = localStorage.getItem("onboarding_health_conditions");
    const medications = localStorage.getItem("onboarding_medications");
    
    if (basicDetails) {
      setHealthData({
        ...JSON.parse(basicDetails),
        conditions: healthConditions ? JSON.parse(healthConditions) : [],
        medications: medications ? JSON.parse(medications) : [],
      });
    }
  }, []);

  const healthMetrics = [
    { label: "Heart Rate", value: "72", unit: "bpm", status: "normal", icon: Heart },
    { label: "Blood Pressure", value: "118/76", unit: "mmHg", status: "normal", icon: Activity },
    { label: "Health Score", value: "84", unit: "%", status: "good", icon: Shield },
    { label: "AI Readiness", value: "96", unit: "%", status: "excellent", icon: Brain },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass rounded-xl p-5 relative overflow-hidden"
    >
      {/* Background Gradient */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 rounded-full blur-2xl" />
      
      {/* Avatar Section */}
      <div className="relative flex flex-col items-center mb-4">
        <div className="relative">
          {/* Pulsing ring */}
          <div className="absolute inset-0 rounded-full bg-cyan-500/20 animate-pulse-ring" />
          
          {/* Avatar circle */}
          <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center">
            <span className="text-4xl font-bold text-white">
              {healthData?.name?.charAt(0) || "R"}
            </span>
          </div>
          
          {/* AI Badge */}
          <div className="absolute -bottom-2 -right-2 w-6 h-6 rounded-full bg-gradient-to-r from-cyan-400 to-purple-500 flex items-center justify-center">
            <Sparkles className="w-3 h-3 text-white" />
          </div>
        </div>
        
        <h3 className="text-lg font-semibold text-white mt-3">
          {healthData?.name || "Rajesh Kumar"}
        </h3>
        <p className="text-sm text-gray-400">Digital Twin Active</p>
      </div>

      {/* Health Metrics Grid */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        {healthMetrics.map((metric, idx) => {
          const Icon = metric.icon;
          const statusColors = {
            normal: "text-green-400",
            good: "text-cyan-400",
            excellent: "text-purple-400",
            warning: "text-yellow-400",
          };
          
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white/5 rounded-lg p-3 text-center"
            >
              <Icon className={`w-4 h-4 ${statusColors[metric.status as keyof typeof statusColors]} mx-auto mb-1`} />
              <div className="text-lg font-bold text-white">{metric.value}</div>
              <div className="text-xs text-gray-500">{metric.label}</div>
            </motion.div>
          );
        })}
      </div>

      {/* Health Conditions */}
      {healthData?.conditions && healthData.conditions.length > 0 && (
        <div className="mb-4">
          <p className="text-xs text-gray-500 mb-2">Health Conditions</p>
          <div className="flex flex-wrap gap-2">
            {healthData.conditions.slice(0, 3).map((condition: string, idx: number) => (
              <span
                key={idx}
                className="text-xs px-2 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
              >
                {condition}
              </span>
            ))}
            {healthData.conditions.length > 3 && (
              <span className="text-xs px-2 py-1 rounded-full bg-white/5 text-gray-400">
                +{healthData.conditions.length - 3}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Medications Summary */}
      {healthData?.medications && healthData.medications.length > 0 && (
        <div className="mb-4">
          <p className="text-xs text-gray-500 mb-2">Active Medications</p>
          <div className="flex items-center gap-2">
            <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: "94%" }}
                className="h-full bg-gradient-to-r from-cyan-500 to-purple-600 rounded-full"
              />
            </div>
            <span className="text-xs text-gray-400">94% adherence</span>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {healthData.medications.length} medications • Next: BP Tablet at 8:00 AM
          </p>
        </div>
      )}

      {/* Last Updated */}
      <div className="text-center pt-3 border-t border-white/10">
        <p className="text-xs text-gray-500 flex items-center justify-center gap-1">
          <Activity className="w-3 h-3 text-green-400 animate-pulse" />
          Last updated: Today, 08:30 AM
        </p>
      </div>
    </motion.div>
  );
}
