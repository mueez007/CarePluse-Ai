"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Droplets, Heart, Activity, AlertCircle, CheckCircle, Baby } from "lucide-react";

interface AnemiaRiskInputs {
  age: number;
  gender: 'male' | 'female';
  pregnancyStatus?: boolean;
  menstrualHistory?: 'regular' | 'heavy' | 'irregular' | 'menopause';
  dietType: 'vegetarian' | 'non-vegetarian';
  fatigue: boolean;
  paleSkin: boolean;
  dizziness: boolean;
}

interface RiskResult {
  score: number;
  riskLevel: 'low' | 'medium' | 'high' | 'very-high';
  percentage: number;
  recommendations: string[];
  factors: string[];
}

export default function AnemiaRiskCalculator() {
  const [inputs, setInputs] = useState<AnemiaRiskInputs>({
    age: 35,
    gender: 'female',
    pregnancyStatus: false,
    menstrualHistory: 'regular',
    dietType: 'vegetarian',
    fatigue: false,
    paleSkin: false,
    dizziness: false
  });
  const [result, setResult] = useState<RiskResult | null>(null);
  const [loading, setLoading] = useState(false);

  const calculateRisk = async () => {
    setLoading(true);
    
    const response = await fetch('/api/ai/calculate-risk', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ riskType: 'anemia', inputs })
    });
    
    const data = await response.json();
    setResult(data);
    setLoading(false);
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'low': return 'text-green-400';
      case 'medium': return 'text-yellow-400';
      case 'high': return 'text-orange-400';
      case 'very-high': return 'text-red-400';
      default: return 'text-gray-500 dark:text-gray-400';
    }
  };

  const getRiskBg = (level: string) => {
    switch (level) {
      case 'low': return 'bg-green-500/10 border-green-500/20';
      case 'medium': return 'bg-yellow-500/10 border-yellow-500/20';
      case 'high': return 'bg-orange-500/10 border-orange-500/20';
      case 'very-high': return 'bg-red-500/10 border-red-500/20';
      default: return 'bg-gray-100 dark:bg-white/5';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-2xl p-6"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-red-400 to-pink-500 flex items-center justify-center">
          <Droplets className="w-5 h-5 text-gray-900 dark:text-white" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Anemia Risk Calculator</h2>
      </div>

      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="text-sm text-gray-500 dark:text-gray-400 block mb-2">Age</label>
          <input
            type="number"
            value={inputs.age}
            onChange={(e) => setInputs({ ...inputs, age: parseInt(e.target.value) })}
            className="w-full px-4 py-2 rounded-xl bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white"
          />
        </div>

        <div>
          <label className="text-sm text-gray-500 dark:text-gray-400 block mb-2">Gender</label>
          <select
            value={inputs.gender}
            onChange={(e) => setInputs({ ...inputs, gender: e.target.value as 'male' | 'female' })}
            className="w-full px-4 py-2 rounded-xl bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white"
          >
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </div>

        <div>
          <label className="text-sm text-gray-500 dark:text-gray-400 block mb-2">Diet Type</label>
          <select
            value={inputs.dietType}
            onChange={(e) => setInputs({ ...inputs, dietType: e.target.value as 'vegetarian' | 'non-vegetarian' })}
            className="w-full px-4 py-2 rounded-xl bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white"
          >
            <option value="vegetarian">Vegetarian</option>
            <option value="non-vegetarian">Non-Vegetarian</option>
          </select>
        </div>

        {inputs.gender === 'female' && (
          <>
            <div>
              <label className="text-sm text-gray-500 dark:text-gray-400 block mb-2">Menstrual History</label>
              <select
                value={inputs.menstrualHistory}
                onChange={(e) => setInputs({ ...inputs, menstrualHistory: e.target.value as any })}
                className="w-full px-4 py-2 rounded-xl bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white"
              >
                <option value="regular">Regular</option>
                <option value="heavy">Heavy Bleeding</option>
                <option value="irregular">Irregular</option>
                <option value="menopause">Menopause</option>
              </select>
            </div>

            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={inputs.pregnancyStatus}
                onChange={(e) => setInputs({ ...inputs, pregnancyStatus: e.target.checked })}
                className="w-4 h-4"
              />
              <span className="text-sm text-gray-600 dark:text-gray-300 flex items-center gap-1">
                <Baby className="w-4 h-4" /> Currently pregnant
              </span>
            </label>
          </>
        )}

        <div className="md:col-span-2">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">Symptoms (Check all that apply)</p>
          <div className="flex flex-wrap gap-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={inputs.fatigue}
                onChange={(e) => setInputs({ ...inputs, fatigue: e.target.checked })}
                className="w-4 h-4"
              />
              <span className="text-sm text-gray-600 dark:text-gray-300">Fatigue / Weakness</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={inputs.paleSkin}
                onChange={(e) => setInputs({ ...inputs, paleSkin: e.target.checked })}
                className="w-4 h-4"
              />
              <span className="text-sm text-gray-600 dark:text-gray-300">Pale skin</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={inputs.dizziness}
                onChange={(e) => setInputs({ ...inputs, dizziness: e.target.checked })}
                className="w-4 h-4"
              />
              <span className="text-sm text-gray-600 dark:text-gray-300">Dizziness</span>
            </label>
          </div>
        </div>
      </div>

      <button
        onClick={calculateRisk}
        disabled={loading}
        className="w-full py-3 rounded-xl bg-gradient-to-r from-red-500 to-pink-500 text-gray-900 dark:text-white font-semibold hover:shadow-lg transition disabled:opacity-50"
      >
        {loading ? 'Calculating...' : 'Calculate Anemia Risk'}
      </button>

      {result && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mt-6 p-5 rounded-xl ${getRiskBg(result.riskLevel)}`}
        >
          <div className="text-center mb-4">
            <div className={`text-5xl font-bold ${getRiskColor(result.riskLevel)}`}>
              {result.percentage}%
            </div>
            <div className={`text-xl font-semibold ${getRiskColor(result.riskLevel)} mt-1`}>
              {result.riskLevel.toUpperCase()} RISK
            </div>
          </div>

          <div className="mb-4">
            <p className="text-gray-900 dark:text-white font-medium mb-2">Risk Factors:</p>
            <ul className="space-y-1">
              {result.factors.slice(0, 4).map((factor, idx) => (
                <li key={idx} className="text-sm text-gray-600 dark:text-gray-300 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                  {factor}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-gray-900 dark:text-white font-medium mb-2">Recommendations:</p>
            <ul className="space-y-1">
              {result.recommendations.slice(0, 4).map((rec, idx) => (
                <li key={idx} className="text-sm text-gray-600 dark:text-gray-300 flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                  {rec}
                </li>
              ))}
            </ul>
          </div>

          <p className="text-xs text-gray-500 mt-4 text-center">{result.disclaimer}</p>
        </motion.div>
      )}
    </motion.div>
  );
}
