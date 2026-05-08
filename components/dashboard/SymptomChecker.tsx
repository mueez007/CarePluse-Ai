"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Activity, 
  Search, 
  AlertTriangle, 
  CheckCircle, 
  Heart,
  Brain,
  Stethoscope,
  Clock,
  Phone
} from "lucide-react";

interface SymptomAnalysisResult {
  analysis: {
    possibleConditions: string[];
    urgencyLevel: 'low' | 'medium' | 'high' | 'emergency';
    recommendedActions: string[];
    selfCareTips: string[];
    emergencyWarning: string | null;
  };
  disclaimer: string;
}

const commonSymptoms = [
  "Frequent urination", "Excessive thirst", "Unexplained weight loss", "Fatigue",
  "Headache", "Dizziness", "Blurred vision", "Chest pain",
  "Shortness of breath", "Pale skin", "Cold hands and feet", "Joint pain",
  "Memory loss", "Irregular periods", "Heavy bleeding", "Nausea"
];

export default function SymptomChecker() {
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [age, setAge] = useState<string>("");
  const [gender, setGender] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SymptomAnalysisResult | null>(null);

  const toggleSymptom = (symptom: string) => {
    setSelectedSymptoms(prev =>
      prev.includes(symptom)
        ? prev.filter(s => s !== symptom)
        : [...prev, symptom]
    );
  };

  const analyzeSymptoms = async () => {
    if (selectedSymptoms.length === 0) return;
    
    setLoading(true);
    
    const response = await fetch('/api/ai/analyze-symptoms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        symptoms: selectedSymptoms,
        age: age ? parseInt(age) : undefined,
        gender: gender || undefined
      })
    });
    
    const data = await response.json();
    setResult(data);
    setLoading(false);
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'low': return 'text-green-400 bg-green-500/10 border-green-500/20';
      case 'medium': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
      case 'high': return 'text-orange-400 bg-orange-500/10 border-orange-500/20';
      case 'emergency': return 'text-red-400 bg-red-500/10 border-red-500/20 animate-pulse';
      default: return 'text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-white/5';
    }
  };

  const getUrgencyIcon = (urgency: string) => {
    switch (urgency) {
      case 'low': return <CheckCircle className="w-5 h-5" />;
      case 'medium': return <Clock className="w-5 h-5" />;
      case 'high': return <AlertTriangle className="w-5 h-5" />;
      case 'emergency': return <Phone className="w-5 h-5" />;
      default: return <Activity className="w-5 h-5" />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-2xl p-6"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-teal-500 to-green-500 flex items-center justify-center">
          <Stethoscope className="w-5 h-5 text-gray-900 dark:text-white" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">AI Symptom Checker</h2>
      </div>

      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="text-sm text-gray-500 dark:text-gray-400 block mb-2">Age (optional)</label>
          <input
            type="number"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            placeholder="Enter your age"
            className="w-full px-4 py-2 rounded-xl bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white placeholder:text-gray-500"
          />
        </div>
        <div>
          <label className="text-sm text-gray-500 dark:text-gray-400 block mb-2">Gender (optional)</label>
          <select
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            className="w-full px-4 py-2 rounded-xl bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white"
          >
            <option value="">Select gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>

      <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">Select your symptoms:</p>
      <div className="flex flex-wrap gap-2 mb-6 max-h-40 overflow-y-auto">
        {commonSymptoms.map((symptom) => (
          <button
            key={symptom}
            onClick={() => toggleSymptom(symptom)}
            className={`px-3 py-1.5 rounded-full text-sm transition ${
              selectedSymptoms.includes(symptom)
                ? 'bg-cyan-500 text-white'
                : 'bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-300 hover:bg-white/10'
            }`}
          >
            {symptom}
          </button>
        ))}
      </div>

      {selectedSymptoms.length > 0 && (
        <div className="mb-6">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Selected symptoms:</p>
          <div className="flex flex-wrap gap-2">
            {selectedSymptoms.map((symptom) => (
              <span
                key={symptom}
                className="px-2 py-1 rounded-full bg-cyan-500/20 text-cyan-400 text-xs flex items-center gap-1"
              >
                {symptom}
                <button
                  onClick={() => toggleSymptom(symptom)}
                  className="hover:text-white"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      <button
        onClick={analyzeSymptoms}
        disabled={loading || selectedSymptoms.length === 0}
        className="w-full py-3 rounded-xl bg-gradient-to-r from-teal-500 to-green-500 text-gray-900 dark:text-white font-semibold hover:shadow-lg transition disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Analyzing...
          </>
        ) : (
          <>
            <Search className="w-5 h-5" />
            Analyze Symptoms
          </>
        )}
      </button>

      {result && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 space-y-4"
        >
          {/* Urgency Level */}
          <div className={`p-4 rounded-xl ${getUrgencyColor(result.analysis.urgencyLevel)}`}>
            <div className="flex items-center gap-3">
              {getUrgencyIcon(result.analysis.urgencyLevel)}
              <div>
                <p className="font-semibold">Urgency Level: {result.analysis.urgencyLevel.toUpperCase()}</p>
                {result.analysis.emergencyWarning && (
                  <p className="text-sm mt-1 font-medium">{result.analysis.emergencyWarning}</p>
                )}
              </div>
            </div>
          </div>

          {/* Possible Conditions */}
          {result.analysis.possibleConditions.length > 0 && (
            <div className="p-4 rounded-xl bg-gray-100 dark:bg-white/5">
              <p className="text-gray-900 dark:text-white font-medium mb-2 flex items-center gap-2">
                <Brain className="w-4 h-4" /> Possible conditions to discuss with doctor:
              </p>
              <ul className="space-y-1">
                {result.analysis.possibleConditions.map((condition, idx) => (
                  <li key={idx} className="text-sm text-gray-600 dark:text-gray-300 flex items-start gap-2">
                    <Heart className="w-3 h-3 text-cyan-400 mt-1" />
                    {condition}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Recommended Actions */}
          <div className="p-4 rounded-xl bg-gray-100 dark:bg-white/5">
            <p className="text-gray-900 dark:text-white font-medium mb-2">Recommended Actions:</p>
            <ul className="space-y-1">
              {result.analysis.recommendedActions.map((action, idx) => (
                <li key={idx} className="text-sm text-gray-600 dark:text-gray-300 flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400 mt-0.5" />
                  {action}
                </li>
              ))}
            </ul>
          </div>

          {/* Self Care Tips */}
          <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
            <p className="text-cyan-400 font-medium mb-2">Self Care Tips:</p>
            <ul className="space-y-1">
              {result.analysis.selfCareTips.map((tip, idx) => (
                <li key={idx} className="text-sm text-gray-600 dark:text-gray-300 flex items-start gap-2">
                  <Activity className="w-3 h-3 text-cyan-400 mt-1" />
                  {tip}
                </li>
              ))}
            </ul>
          </div>

          <p className="text-xs text-gray-500 text-center">{result.disclaimer}</p>
        </motion.div>
      )}
    </motion.div>
  );
}
