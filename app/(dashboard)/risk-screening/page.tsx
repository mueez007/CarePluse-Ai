"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Activity, Heart, Droplets, Brain, Shield, Sparkles,
  RefreshCw, AlertTriangle, CheckCircle, TrendingUp,
  Loader2, Zap, Eye, Stethoscope, Apple, Pill
} from "lucide-react";
import Sidebar from "@/components/dashboard/Sidebar";
import Header from "@/components/dashboard/Header";
import { buildPatientContext, getFullHealthProfile, saveRiskAssessment } from "@/lib/health-data";

interface RiskPrediction {
  condition: string;
  riskPercentage: number;
  riskLevel: string;
  confidence: string;
  keyFactors: string[];
  prediction: string;
  preventionTips: string[];
}

interface HealthAnalysis {
  overallHealthScore: number;
  riskPredictions: RiskPrediction[];
  healthInsights: string[];
  urgentWarnings: string[];
  dietaryAdvice: string[];
  lifestyleRecommendations: string[];
  nextCheckups: string[];
}

export default function RiskScreeningPage() {
  const [analysis, setAnalysis] = useState<HealthAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedRisk, setSelectedRisk] = useState<RiskPrediction | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>("");
  const [hasProfile, setHasProfile] = useState(true);

  useEffect(() => {
    runAnalysis();
  }, []);

  const runAnalysis = async () => {
    setLoading(true);
    setError("");

    const profile = getFullHealthProfile();
    
    // Check if user has basic profile data
    if (!profile.basicDetails) {
      setHasProfile(false);
      setLoading(false);
      return;
    }

    setHasProfile(true);
    const patientContext = buildPatientContext();

    try {
      const response = await fetch('/api/ai/health-intelligence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ patientContext }),
      });

      const data = await response.json();
      
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Analysis failed');
      }

      setAnalysis(data.analysis);
      setLastUpdated(new Date().toLocaleString());
      
      // Save risk assessments to history
      if (data.analysis.riskPredictions) {
        data.analysis.riskPredictions.forEach((pred: RiskPrediction) => {
          const typeMap: Record<string, 'diabetes' | 'hypertension' | 'heart' | 'anemia'> = {
            'Diabetes': 'diabetes',
            'Hypertension': 'hypertension',
            'Heart Disease': 'heart',
            'Anemia': 'anemia',
          };
          const type = typeMap[pred.condition];
          if (type) {
            saveRiskAssessment({
              type,
              riskLevel: pred.riskLevel,
              percentage: pred.riskPercentage,
              factors: pred.keyFactors,
              recommendations: pred.preventionTips,
            });
          }
        });
      }

      // Auto-select first prediction
      if (data.analysis.riskPredictions?.length > 0) {
        setSelectedRisk(data.analysis.riskPredictions[0]);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to analyze health data');
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'low': return 'text-emerald-400';
      case 'medium': return 'text-yellow-400';
      case 'high': return 'text-orange-400';
      case 'very-high': return 'text-red-400';
      default: return 'text-gray-500 dark:text-gray-400';
    }
  };

  const getRiskBg = (level: string) => {
    switch (level) {
      case 'low': return 'from-emerald-500/20 to-green-500/10 border-emerald-500/30';
      case 'medium': return 'from-yellow-500/20 to-amber-500/10 border-yellow-500/30';
      case 'high': return 'from-orange-500/20 to-red-500/10 border-orange-500/30';
      case 'very-high': return 'from-red-500/20 to-rose-500/10 border-red-500/30';
      default: return 'from-white/5 to-white/5 border-gray-200 dark:border-white/10';
    }
  };

  const getRiskIcon = (condition: string) => {
    switch (condition) {
      case 'Diabetes': return Activity;
      case 'Hypertension': return Heart;
      case 'Heart Disease': return Shield;
      case 'Anemia': return Droplets;
      default: return Activity;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-400';
    if (score >= 60) return 'text-yellow-400';
    if (score >= 40) return 'text-orange-400';
    return 'text-red-400';
  };

  const getScoreGlow = (score: number) => {
    if (score >= 80) return 'shadow-[0_0_40px_rgba(52,211,153,0.4)]';
    if (score >= 60) return 'shadow-[0_0_40px_rgba(250,204,21,0.4)]';
    if (score >= 40) return 'shadow-[0_0_40px_rgba(251,146,60,0.4)]';
    return 'shadow-[0_0_40px_rgba(248,113,113,0.4)]';
  };

  // No profile state
  if (!hasProfile && !loading) {
    return (
      <div className="flex h-screen bg-gray-50 dark:bg-gradient-to-b dark:from-[#0A0A0F] dark:to-[#0F0F1A]">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
          <main className="flex-1 overflow-y-auto p-6 flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-md text-center"
            >
              <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-purple-600/20 border border-cyan-500/30 flex items-center justify-center">
                <Brain className="w-10 h-10 text-cyan-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Complete Your Profile First</h2>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                AI Risk Screening needs your health profile data to make predictions. 
                Please complete the onboarding or update your profile with basic details (age, weight, height, health conditions).
              </p>
              <a href="/profile" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 text-gray-900 dark:text-white font-semibold hover:shadow-lg transition">
                Go to Profile
              </a>
            </motion.div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gradient-to-b dark:from-[#0A0A0F] dark:to-[#0F0F1A]">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.3)]">
                    <Brain className="w-6 h-6 text-gray-900 dark:text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">AI Health Predictions</h1>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">
                      Powered by AI • Auto-analyzed from your health profile
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {lastUpdated && (
                    <span className="text-xs text-gray-500">Updated: {lastUpdated}</span>
                  )}
                  <button
                    onClick={runAnalysis}
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl glass border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300 hover:text-white hover:bg-white/10 transition disabled:opacity-50"
                  >
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    <span className="text-sm">Re-analyze</span>
                  </button>
                </div>
              </div>
            </motion.div>

            {/* Loading State */}
            <AnimatePresence>
              {loading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center py-20"
                >
                  <div className="relative w-24 h-24 mb-6">
                    <div className="absolute inset-0 rounded-full border-2 border-cyan-500/30 animate-ping" />
                    <div className="absolute inset-3 rounded-full border-2 border-purple-500/30 animate-ping" style={{ animationDelay: '0.5s' }} />
                    <div className="w-full h-full rounded-full bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center shadow-[0_0_40px_rgba(6,182,212,0.4)]">
                      <Brain className="w-12 h-12 text-gray-900 dark:text-white animate-pulse" />
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">AI Analyzing Your Health Data...</h3>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">Predicting risks from your profile, medications, and food history</p>
                  <div className="relative h-1 w-64 bg-white/10 rounded-full mt-6 overflow-hidden">
                    <motion.div 
                      className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full"
                      animate={{ left: ['-33%', '100%'] }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Error State */}
            {error && !loading && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0" />
                <div>
                  <p className="text-red-400 font-medium">Analysis Failed</p>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">{error}</p>
                </div>
                <button onClick={runAnalysis} className="ml-auto px-4 py-2 rounded-lg bg-red-500/20 text-red-400 text-sm hover:bg-red-500/30 transition">
                  Retry
                </button>
              </motion.div>
            )}

            {/* Analysis Results */}
            {analysis && !loading && (
              <>
                {/* Overall Health Score + Urgent Warnings */}
                <div className="grid lg:grid-cols-3 gap-6 mb-8">
                  {/* Health Score */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white/80 dark:bg-white/[0.03] backdrop-blur-xl p-6 text-center relative overflow-hidden"
                  >
                    <div className="absolute -top-10 -right-10 w-32 h-32 bg-cyan-500/10 rounded-full blur-3xl" />
                    <p className="text-gray-500 dark:text-gray-400 text-sm mb-3">Overall Health Score</p>
                    <div className={`text-6xl font-bold ${getScoreColor(analysis.overallHealthScore)} ${getScoreGlow(analysis.overallHealthScore)} rounded-full w-28 h-28 mx-auto flex items-center justify-center bg-gray-100 dark:bg-white/5`}>
                      {analysis.overallHealthScore}
                    </div>
                    <p className="text-gray-500 dark:text-gray-400 text-xs mt-3">out of 100</p>
                  </motion.div>

                  {/* Urgent Warnings */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 }}
                    className="lg:col-span-2 rounded-2xl border border-gray-200 dark:border-white/10 bg-white/80 dark:bg-white/[0.03] backdrop-blur-xl p-6 relative overflow-hidden"
                  >
                    <div className="absolute -top-10 -left-10 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                      <Zap className="w-5 h-5 text-cyan-400" />
                      AI Health Insights
                    </h3>
                    
                    {analysis.urgentWarnings.length > 0 && (
                      <div className="mb-4 space-y-2">
                        {analysis.urgentWarnings.map((warning, idx) => (
                          <div key={idx} className="flex items-start gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                            <AlertTriangle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                            <p className="text-red-300 text-sm">{warning}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="space-y-2">
                      {analysis.healthInsights.slice(0, 3).map((insight, idx) => (
                        <div key={idx} className="flex items-start gap-2">
                          <Sparkles className="w-4 h-4 text-cyan-400 mt-0.5 flex-shrink-0" />
                          <p className="text-gray-600 dark:text-gray-300 text-sm">{insight}</p>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                </div>

                {/* Risk Prediction Cards */}
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-cyan-400" />
                  Disease Risk Predictions
                </h3>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                  {analysis.riskPredictions.map((pred, idx) => {
                    const Icon = getRiskIcon(pred.condition);
                    const isSelected = selectedRisk?.condition === pred.condition;
                    
                    return (
                      <motion.button
                        key={idx}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        onClick={() => setSelectedRisk(pred)}
                        className={`p-5 rounded-2xl text-left transition-all border ${
                          isSelected
                            ? `bg-gradient-to-br ${getRiskBg(pred.riskLevel)} shadow-lg`
                            : 'bg-white/80 dark:bg-white/[0.03] border-gray-200 dark:border-white/10 hover:bg-white/[0.06]'
                        }`}
                      >
                        <Icon className={`w-8 h-8 mb-3 ${getRiskColor(pred.riskLevel)}`} />
                        <h4 className="text-gray-900 dark:text-white font-semibold text-sm mb-1">{pred.condition}</h4>
                        <div className={`text-3xl font-bold ${getRiskColor(pred.riskLevel)} mb-1`}>
                          {pred.riskPercentage}%
                        </div>
                        <p className={`text-xs uppercase font-medium ${getRiskColor(pred.riskLevel)}`}>
                          {pred.riskLevel.replace('-', ' ')} risk
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Confidence: {pred.confidence}
                        </p>
                      </motion.button>
                    );
                  })}
                </div>

                {/* Selected Risk Detail */}
                <AnimatePresence mode="wait">
                  {selectedRisk && (
                    <motion.div
                      key={selectedRisk.condition}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="grid lg:grid-cols-2 gap-6 mb-8"
                    >
                      {/* Prediction + Factors */}
                      <div className={`rounded-2xl border p-6 bg-gradient-to-br ${getRiskBg(selectedRisk.riskLevel)}`}>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                          <Eye className="w-5 h-5 text-cyan-400" />
                          {selectedRisk.condition} — AI Prediction
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300 mb-4">{selectedRisk.prediction}</p>
                        
                        <h4 className="text-gray-900 dark:text-white font-medium mb-2 text-sm">Key Risk Factors:</h4>
                        <ul className="space-y-1.5 mb-4">
                          {selectedRisk.keyFactors.map((factor, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300">
                              <AlertTriangle className="w-3.5 h-3.5 text-yellow-400 mt-0.5 flex-shrink-0" />
                              {factor}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Prevention Tips */}
                      <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white/80 dark:bg-white/[0.03] backdrop-blur-xl p-6">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                          <Shield className="w-5 h-5 text-emerald-400" />
                          Prevention Plan
                        </h3>
                        <ul className="space-y-2">
                          {selectedRisk.preventionTips.map((tip, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300">
                              <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                              {tip}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Dietary Advice + Lifestyle + Checkups */}
                <div className="grid lg:grid-cols-3 gap-6 mb-8">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white/80 dark:bg-white/[0.03] backdrop-blur-xl p-5"
                  >
                    <h3 className="text-gray-900 dark:text-white font-semibold mb-3 flex items-center gap-2">
                      <Apple className="w-5 h-5 text-green-400" />
                      Dietary Advice
                    </h3>
                    <ul className="space-y-2">
                      {analysis.dietaryAdvice.map((advice, idx) => (
                        <li key={idx} className="text-sm text-gray-600 dark:text-gray-300 flex items-start gap-2">
                          <span className="text-green-400 mt-0.5">•</span>
                          {advice}
                        </li>
                      ))}
                    </ul>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white/80 dark:bg-white/[0.03] backdrop-blur-xl p-5"
                  >
                    <h3 className="text-gray-900 dark:text-white font-semibold mb-3 flex items-center gap-2">
                      <Activity className="w-5 h-5 text-cyan-400" />
                      Lifestyle Tips
                    </h3>
                    <ul className="space-y-2">
                      {analysis.lifestyleRecommendations.map((rec, idx) => (
                        <li key={idx} className="text-sm text-gray-600 dark:text-gray-300 flex items-start gap-2">
                          <span className="text-cyan-400 mt-0.5">•</span>
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white/80 dark:bg-white/[0.03] backdrop-blur-xl p-5"
                  >
                    <h3 className="text-gray-900 dark:text-white font-semibold mb-3 flex items-center gap-2">
                      <Stethoscope className="w-5 h-5 text-purple-400" />
                      Recommended Checkups
                    </h3>
                    <ul className="space-y-2">
                      {analysis.nextCheckups.map((checkup, idx) => (
                        <li key={idx} className="text-sm text-gray-600 dark:text-gray-300 flex items-start gap-2">
                          <span className="text-purple-400 mt-0.5">•</span>
                          {checkup}
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                </div>

                {/* Disclaimer */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="p-4 rounded-xl bg-yellow-500/5 border border-yellow-500/20 flex items-start gap-3"
                >
                  <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="text-yellow-400 font-medium">AI Prediction Disclaimer</p>
                    <p className="text-gray-500 dark:text-gray-400 text-xs mt-1">
                      These predictions are generated by AI based on your profile data and are for awareness purposes only. 
                      They are NOT medical diagnoses. Always consult a qualified healthcare professional for medical decisions.
                    </p>
                  </div>
                </motion.div>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
