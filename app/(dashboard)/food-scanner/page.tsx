"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Webcam from "react-webcam";
import { 
  Camera, Upload, X, AlertTriangle, CheckCircle,
  Loader2, History, Scan, Heart, Activity, Apple,
  Flame, Drumstick, Wheat, Droplets, Leaf, ShieldAlert
} from "lucide-react";
import Sidebar from "@/components/dashboard/Sidebar";
import Header from "@/components/dashboard/Header";
import { saveFoodScan, getFoodHistory, type FoodScanRecord } from "@/lib/health-data";

interface AnalysisResult {
  foodName: string;
  healthScore: number;
  riskLevel: "low" | "medium" | "high" | "very-high";
  calories?: string;
  protein?: string;
  carbs?: string;
  fat?: string;
  fiber?: string;
  explanation: string;
  recommendations: string[];
  ingredients: string[];
  allergens?: string[];
  dietaryInfo?: string[];
}

export default function FoodScannerPage() {
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzeProgress, setAnalyzeProgress] = useState("");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [scanHistory, setScanHistory] = useState<AnalysisResult[]>([]);
  const [error, setError] = useState("");
  const webcamRef = useRef<Webcam>(null);

  // Load saved food history on mount
  useEffect(() => {
    const history = getFoodHistory();
    if (history.length > 0) {
      setScanHistory(history.map(h => ({
        foodName: h.foodName,
        healthScore: h.healthScore,
        riskLevel: h.riskLevel as any,
        calories: h.calories,
        protein: h.protein,
        carbs: h.carbs,
        fat: h.fat,
        explanation: h.explanation,
        recommendations: h.recommendations,
        ingredients: h.ingredients,
        allergens: h.allergens,
      })).slice(0, 5));
    }
  }, []);

  const capturePhoto = () => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) { setCapturedImage(imageSrc); setResult(null); setError(""); }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => { setCapturedImage(reader.result as string); setResult(null); setError(""); };
      reader.readAsDataURL(file);
    }
  };

  const analyzeFood = async () => {
    if (!capturedImage) return;
    setIsAnalyzing(true);
    setError("");
    setAnalyzeProgress("🔍 Identifying your food...");

    try {
      const conditions = localStorage.getItem("onboarding_health_conditions");
      const userConditions = conditions ? JSON.parse(conditions) : [];

      const response = await fetch("/api/ai/food", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: capturedImage, userConditions }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to analyze");

      if (data.analysis) {
        const r: AnalysisResult = {
          foodName: data.analysis.foodName || "Unknown Food",
          healthScore: data.analysis.healthScore || 50,
          riskLevel: data.analysis.riskLevel || "medium",
          calories: data.analysis.calories,
          protein: data.analysis.protein,
          carbs: data.analysis.carbs,
          fat: data.analysis.fat,
          fiber: data.analysis.fiber,
          explanation: data.analysis.explanation || "",
          recommendations: data.analysis.recommendations || [],
          ingredients: data.analysis.ingredients || [],
          allergens: data.analysis.allergens || [],
          dietaryInfo: data.analysis.dietaryInfo || [],
        };
        setResult(r);
        setScanHistory(prev => [r, ...prev].slice(0, 5));
        
        // Persist to health data service
        saveFoodScan({
          foodName: r.foodName,
          healthScore: r.healthScore,
          riskLevel: r.riskLevel,
          calories: r.calories,
          protein: r.protein,
          carbs: r.carbs,
          fat: r.fat,
          explanation: r.explanation,
          recommendations: r.recommendations,
          ingredients: r.ingredients,
          allergens: r.allergens,
        });
      }
    } catch (err: any) {
      setError(err.message || "Analysis failed");
    } finally {
      setIsAnalyzing(false);
      setAnalyzeProgress("");
    }
  };

  const resetScanner = () => { setCapturedImage(null); setResult(null); setError(""); };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-400";
    if (score >= 60) return "text-yellow-400";
    if (score >= 40) return "text-orange-400";
    return "text-red-400";
  };
  const getScoreGlow = (score: number) => {
    if (score >= 80) return "shadow-[0_0_30px_rgba(52,211,153,0.4)]";
    if (score >= 60) return "shadow-[0_0_30px_rgba(250,204,21,0.4)]";
    if (score >= 40) return "shadow-[0_0_30px_rgba(251,146,60,0.4)]";
    return "shadow-[0_0_30px_rgba(248,113,113,0.4)]";
  };
  const getScoreGradient = (score: number) => {
    if (score >= 80) return "from-emerald-500 to-green-600";
    if (score >= 60) return "from-yellow-500 to-amber-600";
    if (score >= 40) return "from-orange-500 to-red-600";
    return "from-red-500 to-rose-700";
  };
  const getRiskBg = (risk: string) => {
    switch (risk) {
      case "low": return "border-emerald-500/30 bg-emerald-500/5";
      case "medium": return "border-yellow-500/30 bg-yellow-500/5";
      case "high": return "border-orange-500/30 bg-orange-500/5";
      default: return "border-red-500/30 bg-red-500/5";
    }
  };
  const getRiskColor = (risk: string) => {
    switch (risk) { case "low": return "text-emerald-400"; case "medium": return "text-yellow-400"; case "high": return "text-orange-400"; default: return "text-red-400"; }
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gradient-to-b dark:from-[#0A0A0F] dark:to-[#0F0F1A]">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-6xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.3)]">
                  <Scan className="w-6 h-6 text-gray-900 dark:text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">AI Food Scanner</h1>
                  <p className="text-gray-500 dark:text-gray-400 mt-0.5">Powered by Gemini Vision • Real-time food analysis</p>
                </div>
              </div>
            </motion.div>

            <div className="grid lg:grid-cols-2 gap-6">
              {/* Camera Section */}
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white/80 dark:bg-white/[0.03] backdrop-blur-xl p-6 relative overflow-hidden">
                <div className="absolute -top-20 -right-20 w-40 h-40 bg-cyan-500/10 rounded-full blur-3xl" />
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Camera className="w-5 h-5 text-cyan-400" /> Capture Food
                </h2>
                {!capturedImage ? (
                  <>
                    <div className="relative rounded-xl overflow-hidden bg-black/50 mb-4 border border-gray-200 dark:border-white/10">
                      <Webcam ref={webcamRef} screenshotFormat="image/jpeg" className="w-full h-auto"
                        videoConstraints={{ facingMode: "environment" }} />
                      <div className="absolute inset-0 pointer-events-none">
                        <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-cyan-400 rounded-tl-lg" />
                        <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-cyan-400 rounded-tr-lg" />
                        <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-cyan-400 rounded-bl-lg" />
                        <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-cyan-400 rounded-br-lg" />
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <button onClick={capturePhoto}
                        className="flex-1 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 text-gray-900 dark:text-white font-medium flex items-center justify-center gap-2 hover:shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all">
                        <Camera className="w-5 h-5" /> Capture
                      </button>
                      <label className="flex-1 cursor-pointer">
                        <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                        <div className="py-3 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-100 dark:bg-white/5 text-gray-900 dark:text-white font-medium flex items-center justify-center gap-2 hover:bg-white/10 transition-all">
                          <Upload className="w-5 h-5" /> Upload
                        </div>
                      </label>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="relative rounded-xl overflow-hidden mb-4 border border-gray-200 dark:border-white/10">
                      <img src={capturedImage} alt="Food" className="w-full h-auto" />
                      <button onClick={resetScanner} className="absolute top-2 right-2 p-2 rounded-full bg-black/60 hover:bg-black/80 transition">
                        <X className="w-5 h-5 text-gray-900 dark:text-white" />
                      </button>
                      {result && (
                        <div className={`absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent`}>
                          <p className="text-gray-900 dark:text-white font-bold text-lg">{result.foodName}</p>
                        </div>
                      )}
                    </div>
                    {error && (
                      <div className="mb-3 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 flex-shrink-0" /> {error}
                      </div>
                    )}
                    <button onClick={analyzeFood} disabled={isAnalyzing}
                      className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 text-gray-900 dark:text-white font-medium flex items-center justify-center gap-2 disabled:opacity-50 hover:shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all">
                      {isAnalyzing ? (<><Loader2 className="w-5 h-5 animate-spin" /> {analyzeProgress}</>) : (<><Scan className="w-5 h-5" /> Analyze Food</>)}
                    </button>
                  </>
                )}
              </motion.div>

              {/* Results Section */}
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                {/* Analyzing Animation */}
                <AnimatePresence>
                  {isAnalyzing && (
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                      className="rounded-2xl border border-cyan-500/20 bg-white/80 dark:bg-white/[0.03] backdrop-blur-xl p-8 text-center relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-purple-500/5 to-cyan-500/5 animate-pulse" />
                      <div className="relative">
                        <div className="w-20 h-20 mx-auto mb-4 relative">
                          <div className="absolute inset-0 rounded-full border-2 border-cyan-500/30 animate-ping" />
                          <div className="absolute inset-2 rounded-full border-2 border-purple-500/30 animate-ping" style={{ animationDelay: "0.5s" }} />
                          <div className="w-full h-full rounded-full bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center shadow-[0_0_30px_rgba(6,182,212,0.4)]">
                            <Scan className="w-10 h-10 text-gray-900 dark:text-white animate-pulse" />
                          </div>
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">AI Analyzing Your Meal...</h3>
                        <p className="text-gray-500 dark:text-gray-400 text-sm">Identifying ingredients and nutritional content</p>
                        <div className="relative h-1 bg-white/10 rounded-full mt-6 overflow-hidden">
                          <motion.div className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full"
                            animate={{ left: ["-33%", "100%"] }} transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }} />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Result Card */}
                <AnimatePresence>
                  {result && !isAnalyzing && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      className={`rounded-2xl border p-6 ${getRiskBg(result.riskLevel)} backdrop-blur-xl relative overflow-hidden`}>
                      <div className="absolute -top-10 -right-10 w-32 h-32 bg-cyan-500/5 rounded-full blur-2xl" />
                      
                      {/* Food Name + Score */}
                      <div className="flex items-center justify-between mb-6">
                        <div>
                          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{result.foodName}</h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">AI Analysis Complete</p>
                        </div>
                        <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${getScoreGradient(result.healthScore)} flex flex-col items-center justify-center ${getScoreGlow(result.healthScore)}`}>
                          <span className="text-2xl font-bold text-gray-900 dark:text-white">{result.healthScore}</span>
                          <span className="text-[10px] text-white/80 uppercase">score</span>
                        </div>
                      </div>

                      {/* Macros */}
                      {(result.calories || result.protein) && (
                        <div className="grid grid-cols-4 gap-2 mb-5">
                          {[
                            { label: "Calories", value: result.calories, icon: Flame, color: "text-orange-400" },
                            { label: "Protein", value: result.protein, icon: Drumstick, color: "text-red-400" },
                            { label: "Carbs", value: result.carbs, icon: Wheat, color: "text-amber-400" },
                            { label: "Fat", value: result.fat, icon: Droplets, color: "text-blue-400" },
                          ].map((m, i) => (
                            <div key={i} className="text-center p-2 rounded-xl bg-gray-100 dark:bg-white/5 border border-white/5">
                              <m.icon className={`w-4 h-4 ${m.color} mx-auto mb-1`} />
                              <p className="text-gray-900 dark:text-white text-sm font-bold">{m.value || "—"}</p>
                              <p className="text-[10px] text-gray-500">{m.label}</p>
                            </div>
                          ))}
                        </div>
                      )}

                      <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">{result.explanation}</p>

                      {/* Ingredients */}
                      <div className="mb-4">
                        <h4 className="text-gray-900 dark:text-white font-medium mb-2 text-sm">Detected Ingredients</h4>
                        <div className="flex flex-wrap gap-1.5">
                          {result.ingredients.map((ing, i) => (
                            <span key={i} className="px-2 py-1 rounded-full bg-white/10 text-gray-600 dark:text-gray-300 text-xs border border-white/5">{ing}</span>
                          ))}
                        </div>
                      </div>

                      {/* Recommendations */}
                      <div>
                        <h4 className="text-gray-900 dark:text-white font-medium mb-2 text-sm">Recommendations</h4>
                        <ul className="space-y-1.5">
                          {result.recommendations.map((rec, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-gray-500 dark:text-gray-400">
                              <CheckCircle className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" /> {rec}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Allergens */}
                      {result.allergens && result.allergens.length > 0 && (
                        <div className="mt-4 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center gap-2">
                          <ShieldAlert className="w-4 h-4 text-amber-400 flex-shrink-0" />
                          <p className="text-amber-400 text-xs">Allergens: {result.allergens.join(", ")}</p>
                        </div>
                      )}

                      {(result.riskLevel === "high" || result.riskLevel === "very-high") && (
                        <div className="mt-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center gap-3">
                          <AlertTriangle className="w-5 h-5 text-red-400" />
                          <div>
                            <p className="text-red-400 text-sm font-medium">High Risk Alert</p>
                            <p className="text-xs text-red-300/80">This food may not be suitable for your health conditions.</p>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Scan History */}
                {scanHistory.length > 0 && (
                  <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white/80 dark:bg-white/[0.03] backdrop-blur-xl p-5">
                    <div className="flex items-center gap-2 mb-4">
                      <History className="w-5 h-5 text-cyan-400" />
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Scans</h3>
                    </div>
                    <div className="space-y-2">
                      {scanHistory.map((scan, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-gray-100 dark:bg-white/5 border border-white/5">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${getScoreGradient(scan.healthScore)} flex items-center justify-center`}>
                              <span className="text-xs font-bold text-gray-900 dark:text-white">{scan.healthScore}</span>
                            </div>
                            <span className="text-gray-900 dark:text-white text-sm">{scan.foodName}</span>
                          </div>
                          <span className={`text-xs px-2 py-1 rounded-full border ${getRiskBg(scan.riskLevel)} ${getRiskColor(scan.riskLevel)}`}>
                            {scan.riskLevel}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
