"use client";

import { motion } from "framer-motion";
import { Smile, Frown, Meh, Heart, TrendingUp, MessageCircle, Activity, Sparkles } from "lucide-react";
import { useState } from "react";

interface EmotionalData {
  mood: "happy" | "neutral" | "sad";
  score: number;
  message: string;
  suggestion: string;
}

export default function EmotionalInsightWidget() {
  const [emotionalData] = useState<EmotionalData>({
    mood: "neutral",
    score: 76,
    message: "You seem a little tired lately.",
    suggestion: "Resting or talking with loved ones may help.",
  });

  const getMoodIcon = (mood: string) => {
    switch (mood) {
      case "happy":
        return <Smile className="w-8 h-8 text-green-400" />;
      case "neutral":
        return <Meh className="w-8 h-8 text-yellow-400" />;
      case "sad":
        return <Frown className="w-8 h-8 text-orange-400" />;
      default:
        return <Heart className="w-8 h-8 text-cyan-400" />;
    }
  };

  const getMoodColor = (mood: string) => {
    switch (mood) {
      case "happy":
        return "from-green-500 to-emerald-500";
      case "neutral":
        return "from-yellow-500 to-orange-500";
      case "sad":
        return "from-orange-500 to-red-500";
      default:
        return "from-cyan-500 to-purple-500";
    }
  };

  const weeklyMoodData = [65, 70, 68, 72, 75, 74, 76];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-xl p-5"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-pink-500/20 flex items-center justify-center">
            <Heart className="w-4 h-4 text-pink-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Emotional Wellness</h3>
        </div>
        <button className="text-sm text-cyan-400 hover:text-cyan-300 flex items-center gap-1">
          <MessageCircle className="w-3 h-3" />
          Chat Now
        </button>
      </div>

      {/* Current Mood */}
      <div className={`p-4 rounded-xl bg-gradient-to-r ${getMoodColor(emotionalData.mood)}/10 border border-${getMoodColor(emotionalData.mood).split(" ")[1]}/20 mb-4`}>
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center">
            {getMoodIcon(emotionalData.mood)}
          </div>
          <div className="flex-1">
            <p className="text-gray-900 dark:text-white font-medium">Current Mood</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {emotionalData.mood === "happy" ? "😊 Happy" : emotionalData.mood === "neutral" ? "😐 Neutral" : "😔 Sad"}
            </p>
            <div className="flex items-center gap-2 mt-1">
              <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${emotionalData.score}%` }}
                  className={`h-full bg-gradient-to-r ${getMoodColor(emotionalData.mood)} rounded-full`}
                />
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-400">{emotionalData.score}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Weekly Trend */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs text-gray-500">Weekly Mood Trend</p>
          <div className="flex items-center gap-1">
            <TrendingUp className="w-3 h-3 text-green-400" />
            <span className="text-xs text-green-400">+11% improvement</span>
          </div>
        </div>
        <div className="flex items-end gap-1 h-16">
          {weeklyMoodData.map((value, idx) => (
            <motion.div
              key={idx}
              initial={{ height: 0 }}
              animate={{ height: `${value * 0.8}%` }}
              transition={{ delay: idx * 0.05 }}
              className="flex-1 bg-gradient-to-t from-cyan-500 to-purple-500 rounded-t-lg"
              style={{ height: `${value * 0.8}%`, maxHeight: "80%" }}
            />
          ))}
        </div>
        <div className="flex justify-between mt-2">
          {["M", "T", "W", "T", "F", "S", "S"].map((day, idx) => (
            <span key={idx} className="text-xs text-gray-500">{day}</span>
          ))}
        </div>
      </div>

      {/* Emotional Insight */}
      <div className="p-3 rounded-lg bg-cyan-500/10 border border-cyan-500/20 mb-4">
        <div className="flex items-start gap-2">
          <Sparkles className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-gray-900 dark:text-white font-medium">{emotionalData.message}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{emotionalData.suggestion}</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-2">
        <button className="py-2 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 text-sm hover:bg-green-500/20 transition flex items-center justify-center gap-2">
          <Activity className="w-4 h-4" />
          Breathing Exercise
        </button>
        <button className="py-2 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400 text-sm hover:bg-purple-500/20 transition flex items-center justify-center gap-2">
          <MessageCircle className="w-4 h-4" />
          Talk to AI
        </button>
      </div>

      {/* Disclaimer */}
      <p className="text-center text-xs text-gray-500 mt-4">
        *AI provides emotional support, not medical advice
      </p>
    </motion.div>
  );
}
