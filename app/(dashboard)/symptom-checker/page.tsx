"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Stethoscope, Brain, Send, AlertTriangle, CheckCircle, Activity,
  Loader2, Sparkles, RefreshCw, ThermometerSun, Pill, Clock,
  Phone, ShieldAlert, Heart
} from "lucide-react";
import Sidebar from "@/components/dashboard/Sidebar";
import Header from "@/components/dashboard/Header";
import { buildPatientContext, getFullHealthProfile } from "@/lib/health-data";

interface SymptomAnalysis {
  urgencyLevel: string;
  urgencyScore: number;
  possibleConditions: {
    name: string;
    likelihood: string;
    description: string;
  }[];
  immediateActions: string[];
  selfCareTips: string[];
  medicationWarnings: string[];
  shouldSeeDoctor: boolean;
  doctorTimeframe: string;
  relatedToExistingConditions: string;
  followUpQuestions: string[];
}

const commonSymptoms = [
  { id: "headache", label: "Headache", icon: "🤕" },
  { id: "fever", label: "Fever", icon: "🤒" },
  { id: "fatigue", label: "Fatigue", icon: "😴" },
  { id: "chest_pain", label: "Chest Pain", icon: "💔" },
  { id: "breathless", label: "Shortness of Breath", icon: "😮‍💨" },
  { id: "dizziness", label: "Dizziness", icon: "😵" },
  { id: "nausea", label: "Nausea", icon: "🤢" },
  { id: "joint_pain", label: "Joint Pain", icon: "🦴" },
  { id: "cough", label: "Cough", icon: "🤧" },
  { id: "stomach", label: "Stomach Pain", icon: "🤢" },
  { id: "vision", label: "Vision Issues", icon: "👁️" },
  { id: "numbness", label: "Numbness/Tingling", icon: "✋" },
  { id: "weakness", label: "Weakness", icon: "💤" },
  { id: "swelling", label: "Swelling", icon: "🫧" },
  { id: "rash", label: "Skin Rash", icon: "🔴" },
  { id: "anxiety", label: "Anxiety", icon: "😰" },
];

export default function SymptomCheckerPage() {
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [customSymptom, setCustomSymptom] = useState("");
  const [customSymptoms, setCustomSymptoms] = useState<string[]>([]);
  const [duration, setDuration] = useState("");
  const [severity, setSeverity] = useState("moderate");
  const [analysis, setAnalysis] = useState<SymptomAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    setProfile(getFullHealthProfile());
  }, []);

  const toggleSymptom = (id: string) => {
    setSelectedSymptoms(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const addCustomSymptom = () => {
    if (customSymptom.trim() && !customSymptoms.includes(customSymptom.trim())) {
      setCustomSymptoms(prev => [...prev, customSymptom.trim()]);
      setCustomSymptom("");
    }
  };

  const analyzeSymptoms = async () => {
    const allSymptoms = [
      ...selectedSymptoms.map(id => commonSymptoms.find(s => s.id === id)?.label || id),
      ...customSymptoms,
    ];

    if (allSymptoms.length === 0) return;

    setLoading(true);
    setError("");
    setAnalysis(null);

    const patientContext = buildPatientContext();

    try {
      const response = await fetch('/api/ai/analyze-symptoms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symptoms: allSymptoms,
          duration,
          severity,
          patientContext,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Analysis failed');
      }

      setAnalysis(data.analysis);
    } catch (err: any) {
      setError(err.message || 'Failed to analyze symptoms');
    } finally {
      setLoading(false);
    }
  };

  const resetChecker = () => {
    setSelectedSymptoms([]);
    setCustomSymptoms([]);
    setCustomSymptom("");
    setDuration("");
    setSeverity("moderate");
    setAnalysis(null);
    setError("");
  };

  const getUrgencyColor = (level: string) => {
    switch (level?.toLowerCase()) {
      case 'low': return 'text-emerald-400';
      case 'moderate': return 'text-yellow-400';
      case 'high': return 'text-orange-400';
      case 'emergency': return 'text-red-400';
      default: return 'text-gray-500 dark:text-gray-400';
    }
  };

  const getUrgencyBg = (level: string) => {
    switch (level?.toLowerCase()) {
      case 'low': return 'bg-emerald-500/10 border-emerald-500/20';
      case 'moderate': return 'bg-yellow-500/10 border-yellow-500/20';
      case 'high': return 'bg-orange-500/10 border-orange-500/20';
      case 'emergency': return 'bg-red-500/10 border-red-500/20';
      default: return 'bg-gray-100 dark:bg-white/5 border-gray-200 dark:border-white/10';
    }
  };

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
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-teal-500 to-green-600 flex items-center justify-center shadow-[0_0_20px_rgba(20,184,166,0.3)]">
                    <Stethoscope className="w-6 h-6 text-gray-900 dark:text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">AI Symptom Analyzer</h1>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">
                      Powered by AI • Analyzes with your complete health context
                    </p>
                  </div>
                </div>
                {analysis && (
                  <button onClick={resetChecker} className="flex items-center gap-2 px-4 py-2 rounded-xl glass border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300 hover:text-white transition">
                    <RefreshCw className="w-4 h-4" />
                    <span className="text-sm">New Analysis</span>
                  </button>
                )}
              </div>

              {/* Patient context notice */}
              {profile?.basicDetails && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-4 p-3 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center gap-2"
                >
                  <Brain className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                  <p className="text-cyan-300 text-xs">
                    <span className="font-medium">AI Context Active:</span> Analyzing as {profile.basicDetails.name}, age {profile.basicDetails.age}
                    {profile.healthConditions.length > 0 && ` • Known conditions: ${profile.healthConditions.join(', ')}`}
                    {profile.medications.length > 0 && ` • ${profile.medications.length} medication(s)`}
                  </p>
                </motion.div>
              )}
            </motion.div>

            <div className="grid lg:grid-cols-2 gap-6">
              {/* Left — Symptom Selection */}
              <div className="space-y-6">
                {/* Common Symptoms Grid */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white/80 dark:bg-white/[0.03] backdrop-blur-xl p-6"
                >
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Select Your Symptoms</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {commonSymptoms.map((symptom) => {
                      const isSelected = selectedSymptoms.includes(symptom.id);
                      return (
                        <button
                          key={symptom.id}
                          onClick={() => toggleSymptom(symptom.id)}
                          className={`p-3 rounded-xl text-left transition-all text-sm flex items-center gap-2 ${
                            isSelected
                              ? 'bg-cyan-500/20 border border-cyan-500/40 text-white'
                              : 'bg-gray-100 dark:bg-white/5 border border-white/5 text-gray-600 dark:text-gray-300 hover:bg-white/10'
                          }`}
                        >
                          <span>{symptom.icon}</span>
                          <span>{symptom.label}</span>
                          {isSelected && <CheckCircle className="w-4 h-4 text-cyan-400 ml-auto" />}
                        </button>
                      );
                    })}
                  </div>

                  {/* Custom symptom */}
                  <div className="mt-4 flex gap-2">
                    <input
                      type="text"
                      value={customSymptom}
                      onChange={(e) => setCustomSymptom(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && addCustomSymptom()}
                      placeholder="Other symptom..."
                      className="flex-1 px-4 py-2 rounded-xl bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white text-sm placeholder:text-gray-500 focus:outline-none focus:border-cyan-500"
                    />
                    <button onClick={addCustomSymptom} className="px-4 py-2 rounded-xl bg-cyan-500/20 text-cyan-400 text-sm hover:bg-cyan-500/30 transition">
                      Add
                    </button>
                  </div>

                  {customSymptoms.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {customSymptoms.map((s, i) => (
                        <span key={i} className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs border border-purple-500/30 flex items-center gap-1">
                          {s}
                          <button onClick={() => setCustomSymptoms(prev => prev.filter((_, idx) => idx !== i))} className="ml-1 hover:text-white">×</button>
                        </span>
                      ))}
                    </div>
                  )}
                </motion.div>

                {/* Duration & Severity */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                  className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white/80 dark:bg-white/[0.03] backdrop-blur-xl p-6"
                >
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm text-gray-600 dark:text-gray-300 mb-2 block flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                        Duration
                      </label>
                      <select
                        value={duration}
                        onChange={(e) => setDuration(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-cyan-500"
                      >
                        <option value="">Select duration</option>
                        <option value="just started">Just started (today)</option>
                        <option value="1-2 days">1-2 days</option>
                        <option value="3-7 days">3-7 days</option>
                        <option value="1-2 weeks">1-2 weeks</option>
                        <option value="more than 2 weeks">More than 2 weeks</option>
                        <option value="chronic/recurring">Chronic / Recurring</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-sm text-gray-600 dark:text-gray-300 mb-2 block flex items-center gap-2">
                        <ThermometerSun className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                        Severity
                      </label>
                      <div className="flex gap-2">
                        {['mild', 'moderate', 'severe'].map((s) => (
                          <button
                            key={s}
                            onClick={() => setSeverity(s)}
                            className={`flex-1 py-2 rounded-xl text-sm capitalize transition ${
                              severity === s
                                ? s === 'severe' ? 'bg-red-500/20 border border-red-500/40 text-red-400'
                                : s === 'moderate' ? 'bg-yellow-500/20 border border-yellow-500/40 text-yellow-400'
                                : 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-400'
                                : 'bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-500 dark:text-gray-400 hover:bg-white/10'
                            }`}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Analyze Button */}
                  <button
                    onClick={analyzeSymptoms}
                    disabled={loading || (selectedSymptoms.length === 0 && customSymptoms.length === 0)}
                    className="w-full mt-6 py-3 rounded-xl bg-gradient-to-r from-teal-500 to-green-600 text-gray-900 dark:text-white font-semibold flex items-center justify-center gap-2 hover:shadow-[0_0_20px_rgba(20,184,166,0.3)] transition disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        AI Analyzing with Your Health Context...
                      </>
                    ) : (
                      <>
                        <Brain className="w-5 h-5" />
                        Analyze Symptoms with AI
                      </>
                    )}
                  </button>
                </motion.div>
              </div>

              {/* Right — Analysis Results */}
              <div className="space-y-6">
                {/* Loading */}
                <AnimatePresence>
                  {loading && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="rounded-2xl border border-teal-500/20 bg-white/80 dark:bg-white/[0.03] backdrop-blur-xl p-8 text-center"
                    >
                      <div className="w-20 h-20 mx-auto mb-4 relative">
                        <div className="absolute inset-0 rounded-full border-2 border-teal-500/30 animate-ping" />
                        <div className="w-full h-full rounded-full bg-gradient-to-br from-teal-500 to-green-600 flex items-center justify-center shadow-[0_0_30px_rgba(20,184,166,0.4)]">
                          <Stethoscope className="w-10 h-10 text-gray-900 dark:text-white animate-pulse" />
                        </div>
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">AI Analyzing Symptoms...</h3>
                      <p className="text-gray-500 dark:text-gray-400 text-sm">Cross-referencing with your health profile, conditions, and medications</p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Error */}
                {error && (
                  <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-3">
                    <AlertTriangle className="w-5 h-5 text-red-400" />
                    <p className="text-red-400 text-sm">{error}</p>
                  </div>
                )}

                {/* Results */}
                <AnimatePresence>
                  {analysis && !loading && (
                    <>
                      {/* Urgency Banner */}
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`rounded-2xl border p-5 ${getUrgencyBg(analysis.urgencyLevel)}`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h3 className={`text-lg font-bold ${getUrgencyColor(analysis.urgencyLevel)}`}>
                            {analysis.urgencyLevel?.toUpperCase()} URGENCY
                          </h3>
                          <div className={`text-3xl font-bold ${getUrgencyColor(analysis.urgencyLevel)}`}>
                            {analysis.urgencyScore}/10
                          </div>
                        </div>
                        {analysis.shouldSeeDoctor && (
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            <span className="font-medium">Recommendation:</span> See a doctor {analysis.doctorTimeframe}
                          </p>
                        )}
                      </motion.div>

                      {/* Existing Conditions Link */}
                      {analysis.relatedToExistingConditions && (
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.1 }}
                          className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-start gap-3"
                        >
                          <Heart className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-purple-300 text-sm font-medium">Connection to Your Health Profile</p>
                            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{analysis.relatedToExistingConditions}</p>
                          </div>
                        </motion.div>
                      )}

                      {/* Possible Conditions */}
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15 }}
                        className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white/80 dark:bg-white/[0.03] backdrop-blur-xl p-5"
                      >
                        <h3 className="text-gray-900 dark:text-white font-semibold mb-3 flex items-center gap-2">
                          <Activity className="w-5 h-5 text-cyan-400" />
                          Possible Conditions
                        </h3>
                        <div className="space-y-3">
                          {analysis.possibleConditions?.map((cond, idx) => (
                            <div key={idx} className="p-3 rounded-xl bg-gray-100 dark:bg-white/5 border border-white/5">
                              <div className="flex items-center justify-between mb-1">
                                <h4 className="text-gray-900 dark:text-white font-medium text-sm">{cond.name}</h4>
                                <span className={`text-xs px-2 py-0.5 rounded-full ${
                                  cond.likelihood === 'high' ? 'bg-red-500/20 text-red-400' :
                                  cond.likelihood === 'moderate' ? 'bg-yellow-500/20 text-yellow-400' :
                                  'bg-emerald-500/20 text-emerald-400'
                                }`}>{cond.likelihood} likelihood</span>
                              </div>
                              <p className="text-gray-500 dark:text-gray-400 text-xs">{cond.description}</p>
                            </div>
                          ))}
                        </div>
                      </motion.div>

                      {/* Medication Warnings */}
                      {analysis.medicationWarnings?.length > 0 && (
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.2 }}
                          className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20"
                        >
                          <h4 className="text-amber-400 font-medium text-sm mb-2 flex items-center gap-2">
                            <Pill className="w-4 h-4" />
                            Medication Considerations
                          </h4>
                          <ul className="space-y-1">
                            {analysis.medicationWarnings.map((w, i) => (
                              <li key={i} className="text-gray-600 dark:text-gray-300 text-xs flex items-start gap-2">
                                <span className="text-amber-400">•</span> {w}
                              </li>
                            ))}
                          </ul>
                        </motion.div>
                      )}

                      {/* Immediate Actions + Self Care */}
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.25 }}
                        className="grid grid-cols-2 gap-4"
                      >
                        <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white/80 dark:bg-white/[0.03] p-4">
                          <h4 className="text-gray-900 dark:text-white font-medium text-sm mb-2 flex items-center gap-2">
                            <ShieldAlert className="w-4 h-4 text-orange-400" />
                            Immediate Actions
                          </h4>
                          <ul className="space-y-1.5">
                            {analysis.immediateActions?.map((action, i) => (
                              <li key={i} className="text-gray-600 dark:text-gray-300 text-xs flex items-start gap-2">
                                <CheckCircle className="w-3 h-3 text-orange-400 mt-0.5 flex-shrink-0" />
                                {action}
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white/80 dark:bg-white/[0.03] p-4">
                          <h4 className="text-gray-900 dark:text-white font-medium text-sm mb-2 flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-emerald-400" />
                            Self Care
                          </h4>
                          <ul className="space-y-1.5">
                            {analysis.selfCareTips?.map((tip, i) => (
                              <li key={i} className="text-gray-600 dark:text-gray-300 text-xs flex items-start gap-2">
                                <CheckCircle className="w-3 h-3 text-emerald-400 mt-0.5 flex-shrink-0" />
                                {tip}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </motion.div>

                      {/* Emergency warning */}
                      {analysis.urgencyLevel?.toLowerCase() === 'emergency' && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="p-4 rounded-xl bg-red-500/20 border border-red-500/30"
                        >
                          <div className="flex items-center gap-3 mb-2">
                            <Phone className="w-5 h-5 text-red-400" />
                            <p className="text-red-400 font-semibold">Seek Immediate Medical Help</p>
                          </div>
                          <p className="text-red-300 text-sm">Call emergency services or go to the nearest hospital immediately.</p>
                          <a href="tel:112" className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500 text-gray-900 dark:text-white text-sm font-medium">
                            <Phone className="w-4 h-4" /> Call Emergency
                          </a>
                        </motion.div>
                      )}

                      {/* Disclaimer */}
                      <div className="p-3 rounded-xl bg-yellow-500/5 border border-yellow-500/20">
                        <p className="text-gray-500 dark:text-gray-400 text-xs">
                          <span className="text-yellow-400 font-medium">Disclaimer:</span> This AI analysis is not a medical diagnosis. Always consult a healthcare professional for accurate diagnosis and treatment.
                        </p>
                      </div>
                    </>
                  )}
                </AnimatePresence>

                {/* Empty State */}
                {!analysis && !loading && !error && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white/80 dark:bg-white/[0.03] backdrop-blur-xl p-8 text-center"
                  >
                    <Stethoscope className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Select Your Symptoms</h3>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">
                      Choose from common symptoms or add your own. 
                      The AI will analyze them in context of your health profile, 
                      medications, and medical history.
                    </p>
                  </motion.div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
