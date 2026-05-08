"use client";

import { motion } from "framer-motion";
import { Apple, AlertTriangle, CheckCircle, TrendingUp, Clock, Camera } from "lucide-react";
import { useState } from "react";

interface FoodScan {
  id: number;
  foodName: string;
  healthScore: number;
  riskLevel: "low" | "medium" | "high";
  time: string;
  date: string;
}

export default function FoodAlertWidget() {
  const [recentScans] = useState<FoodScan[]>([
    { id: 1, foodName: "Masala Dosa", healthScore: 65, riskLevel: "medium", time: "08:30 AM", date: "Today" },
    { id: 2, foodName: "Fruit Salad", healthScore: 92, riskLevel: "low", time: "12:00 PM", date: "Yesterday" },
    { id: 3, foodName: "Biryani", healthScore: 45, riskLevel: "high", time: "07:30 PM", date: "Yesterday" },
  ]);

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "low": return "text-green-400";
      case "medium": return "text-yellow-400";
      case "high": return "text-red-400";
      default: return "text-gray-500 dark:text-gray-400";
    }
  };

  const getRiskBg = (risk: string) => {
    switch (risk) {
      case "low": return "bg-green-500/10 border-green-500/20";
      case "medium": return "bg-yellow-500/10 border-yellow-500/20";
      case "high": return "bg-red-500/10 border-red-500/20";
      default: return "bg-gray-100 dark:bg-white/5";
    }
  };

  const averageScore = Math.round(recentScans.reduce((acc, s) => acc + s.healthScore, 0) / recentScans.length);
  const highRiskCount = recentScans.filter(s => s.riskLevel === "high").length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-xl p-5"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/20 flex items-center justify-center">
            <Apple className="w-4 h-4 text-cyan-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Food Safety Alerts</h3>
        </div>
        <button className="text-sm text-cyan-400 hover:text-cyan-300 flex items-center gap-1">
          <Camera className="w-3 h-3" />
          Scan Now
        </button>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="p-3 rounded-lg bg-gray-100 dark:bg-white/5 text-center">
          <div className="text-2xl font-bold text-gray-900 dark:text-white">{averageScore}</div>
          <div className="text-xs text-gray-500">Avg Health Score</div>
          <div className="flex items-center justify-center gap-1 mt-1">
            <TrendingUp className="w-3 h-3 text-green-400" />
            <span className="text-xs text-green-400">+5% vs last week</span>
          </div>
        </div>
        <div className="p-3 rounded-lg bg-gray-100 dark:bg-white/5 text-center">
          <div className="text-2xl font-bold text-red-400">{highRiskCount}</div>
          <div className="text-xs text-gray-500">High Risk Foods</div>
          <div className="text-xs text-yellow-400 mt-1">⚠️ Need attention</div>
        </div>
      </div>

      {/* Recent Scans */}
      <div className="space-y-2 mb-4">
        <p className="text-xs text-gray-500 mb-2">Recent Scans</p>
        {recentScans.map((scan, idx) => (
          <motion.div
            key={scan.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
            className={`flex items-center justify-between p-3 rounded-xl ${getRiskBg(scan.riskLevel)}`}
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                <Apple className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              </div>
              <div>
                <p className="text-gray-900 dark:text-white text-sm font-medium">{scan.foodName}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <Clock className="w-3 h-3 text-gray-500" />
                  <span className="text-xs text-gray-500">{scan.time}</span>
                  <span className="text-xs text-gray-500">•</span>
                  <span className="text-xs text-gray-500">{scan.date}</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className={`text-sm font-bold ${getRiskColor(scan.riskLevel)}`}>
                {scan.healthScore}
              </div>
              <div className={`text-xs ${getRiskColor(scan.riskLevel)}`}>
                {scan.riskLevel.toUpperCase()} RISK
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Recommendations */}
      <div className="p-3 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
        <div className="flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-gray-900 dark:text-white font-medium">Recommendation</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Based on your diabetes condition, avoid high-carb foods. Try whole grain alternatives.
            </p>
          </div>
        </div>
      </div>

      {/* Quick Action */}
      <button className="w-full mt-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-gray-900 dark:text-white text-sm font-medium hover:shadow-lg transition">
        Scan Food Now
      </button>
    </motion.div>
  );
}
