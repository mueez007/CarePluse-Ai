"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Heart, Activity, Droplets, Wind, AlertCircle, CheckCircle } from "lucide-react";

interface HeartRiskInputs {
  age: number;
  gender: 'male' | 'female';
  smoker: boolean;
  diabetes: boolean;
  hypertension: boolean;
  totalCholesterol: number;
  hdlCholesterol: number;
  systolicBP: number;
  bmi: number;
}

interface RiskResult {
  score: number;
  riskLevel: 'low' | 'medium' | 'high' | 'very-high';
  percentage: number;
  recommendations: string[];
  factors: string[];
}

export default function HeartRiskCalculator() {
  const [inputs, setInputs] = useState<HeartRiskInputs>({
    age: 50,
    gender: 'male',
    smoker: false,
    diabetes: false,
    hypertension: false,
    totalCholesterol: 180,
    hdlCholesterol: 45,
    systolicBP: 120,
    bmi: 25
  });
  const [result, setResult] = useState<RiskResult | null>(null);
  const [loading, setLoading] = useState(false);

  const calculateRisk = async () => {
    setLoading(true);
    
    const response = await fetch('/api/ai/calculate-risk', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ riskType: 'heart', inputs })
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

  const getCholesterolStatus = (total: number, hdl: number) => {
    const ratio = total / hdl;
    if (ratio < 3.5) return 'Good';
    if (ratio < 5) return 'Borderline';
    return 'High';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-2xl p-6"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
          <Heart className="w-5 h-5 text-gray-900 dark:text-white" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Heart Disease Risk Calculator</h2>
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
          <label className="text-sm text-gray-500 dark:text-gray-400 block mb-2">Total Cholesterol (mg/dL)</label>
          <input
            type="number"
            value={inputs.totalCholesterol}
            onChange={(e) => setInputs({ ...inputs, totalCholesterol: parseInt(e.target.value) })}
            className="w-full px-4 py-2 rounded-xl bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white"
          />
          <p className="text-xs text-gray-500 mt-1">Normal: &lt;200 mg/dL</p>
        </div>

        <div>
          <label className="text-sm text-gray-500 dark:text-gray-400 block mb-2">HDL Cholesterol (mg/dL)</label>
          <input
            type="number"
            value={inputs.hdlCholesterol}
            onChange={(e) => setInputs({ ...inputs, hdlCholesterol: parseInt(e.target.value) })}
            className="w-full px-4 py-2 rounded-xl bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white"
          />
          <p className="text-xs text-gray-500 mt-1">Good: &gt;40 mg/dL (Male) / &gt;50 mg/dL (Female)</p>
        </div>

        <div>
          <label className="text-sm text-gray-500 dark:text-gray-400 block mb-2">Systolic BP (mmHg)</label>
          <input
            type="number"
            value={inputs.systolicBP}
            onChange={(e) => setInputs({ ...inputs, systolicBP: parseInt(e.target.value) })}
            className="w-full px-4 py-2 rounded-xl bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white"
          />
          <p className="text-xs text-gray-500 mt-1">Normal: &lt;120 mmHg</p>
        </div>

        <div>
          <label className="text-sm text-gray-500 dark:text-gray-400 block mb-2">BMI</label>
          <input
            type="number"
            step="0.1"
            value={inputs.bmi}
            onChange={(e) => setInputs({ ...inputs, bmi: parseFloat(e.target.value) })}
            className="w-full px-4 py-2 rounded-xl bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white"
          />
        </div>

        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={inputs.smoker}
            onChange={(e) => setInputs({ ...inputs, smoker: e.target.checked })}
            className="w-4 h-4"
          />
          <span className="text-sm text-gray-600 dark:text-gray-300">Current smoker</span>
        </label>

        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={inputs.diabetes}
            onChange={(e) => setInputs({ ...inputs, diabetes: e.target.checked })}
            className="w-4 h-4"
          />
          <span className="text-sm text-gray-600 dark:text-gray-300">Have diabetes</span>
        </label>

        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={inputs.hypertension}
            onChange={(e) => setInputs({ ...inputs, hypertension: e.target.checked })}
            className="w-4 h-4"
          />
          <span className="text-sm text-gray-600 dark:text-gray-300">Have hypertension</span>
        </label>
      </div>

      <div className="mb-4 p-3 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
        <p className="text-sm text-cyan-400">
          📊 Your Cholesterol Ratio: {(inputs.totalCholesterol / inputs.hdlCholesterol).toFixed(1)} - {getCholesterolStatus(inputs.totalCholesterol, inputs.hdlCholesterol)}
        </p>
      </div>

      <button
        onClick={calculateRisk}
        disabled={loading}
        className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-gray-900 dark:text-white font-semibold hover:shadow-lg transition disabled:opacity-50"
      >
        {loading ? 'Calculating...' : 'Calculate Heart Risk'}
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
