"use client";

import { motion } from "framer-motion";
import { TrendingUp, AlertCircle } from "lucide-react";

interface HealthScoreRingProps {
  score: number;
  previousScore?: number;
}

export default function HealthScoreRing({ score, previousScore = 72 }: HealthScoreRingProps) {
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;
  
  const getScoreColor = (score: number) => {
    if (score >= 80) return "url(#gradient-high)";
    if (score >= 60) return "url(#gradient-medium)";
    return "url(#gradient-low)";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return "Excellent";
    if (score >= 60) return "Good";
    if (score >= 40) return "Fair";
    return "Needs Attention";
  };

  const getScoreMessage = (score: number) => {
    if (score >= 80) return "You're doing great! Keep it up!";
    if (score >= 60) return "Good progress. Small improvements possible.";
    if (score >= 40) return "Some areas need attention.";
    return "Please consult your healthcare provider.";
  };

  const scoreChange = score - previousScore;
  const isImproved = scoreChange > 0;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass rounded-xl p-5 text-center"
    >
      <h3 className="text-lg font-semibold text-white mb-4">Overall Health Score</h3>
      
      <div className="relative inline-flex items-center justify-center mb-4">
        <svg width="220" height="220" viewBox="0 0 220 220" className="transform -rotate-90">
          <defs>
            <linearGradient id="gradient-high" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00F0FF" />
              <stop offset="100%" stopColor="#B400FF" />
            </linearGradient>
            <linearGradient id="gradient-medium" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00D4FF" />
              <stop offset="100%" stopColor="#FFB400" />
            </linearGradient>
            <linearGradient id="gradient-low" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FF6B6B" />
              <stop offset="100%" stopColor="#FFB400" />
            </linearGradient>
          </defs>
          
          {/* Background circle */}
          <circle
            cx="110"
            cy="110"
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.1)"
            strokeWidth="12"
          />
          
          {/* Score circle */}
          <motion.circle
            cx="110"
            cy="110"
            r={radius}
            fill="none"
            stroke={getScoreColor(score)}
            strokeWidth="12"
            strokeLinecap="round"
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            style={{
              strokeDasharray: circumference,
            }}
          />
        </svg>
        
        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center"
          >
            <span className="text-4xl font-bold text-white">{score}</span>
            <span className="text-gray-400">/100</span>
          </motion.div>
          <div className="flex items-center gap-1 mt-1">
            {isImproved ? (
              <TrendingUp className="w-4 h-4 text-green-400" />
            ) : (
              <AlertCircle className="w-4 h-4 text-yellow-400" />
            )}
            <span className={`text-xs ${isImproved ? "text-green-400" : "text-yellow-400"}`}>
              {isImproved ? `+${scoreChange}` : `${scoreChange}`}
            </span>
          </div>
        </div>
      </div>
      
      {/* Score Label */}
      <div className="mb-2">
        <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
          score >= 80 ? "bg-green-500/20 text-green-400 border border-green-500/30" :
          score >= 60 ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30" :
          score >= 40 ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30" :
          "bg-red-500/20 text-red-400 border border-red-500/30"
        }`}>
          {getScoreLabel(score)}
        </span>
      </div>
      
      <p className="text-sm text-gray-400">
        {getScoreMessage(score)}
      </p>
      
      {/* Score Breakdown */}
      <div className="mt-4 pt-4 border-t border-white/10">
        <div className="space-y-2 text-left">
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-gray-400">Medication Adherence</span>
              <span className="text-white">94%</span>
            </div>
            <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div className="w-[94%] h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full" />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-gray-400">Food Safety</span>
              <span className="text-white">82%</span>
            </div>
            <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div className="w-[82%] h-full bg-gradient-to-r from-green-500 to-teal-500 rounded-full" />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-gray-400">Emotional Wellness</span>
              <span className="text-white">76%</span>
            </div>
            <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div className="w-[76%] h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full" />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
