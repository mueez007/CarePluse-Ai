"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { 
  Upload, 
  Camera, 
  FileText, 
  PenTool, 
  Plus, 
  Trash2,
  Pill,
  Clock,
  AlertCircle,
  X
} from "lucide-react";

interface Medication {
  id: string;
  name: string;
  dosage: string;
  timing: string;
  frequency: string;
}

interface MedicationsScreenProps {
  onNext: () => void;
}

export default function MedicationsScreen({ onNext }: MedicationsScreenProps) {
  const [medications, setMedications] = useState<Medication[]>([]);
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [uploadMethod, setUploadMethod] = useState<"prescription" | "image" | "report" | null>(null);
  const [newMed, setNewMed] = useState({
    name: "",
    dosage: "",
    timing: "",
    frequency: "daily",
  });
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const timings = [
    "Before Breakfast",
    "After Breakfast",
    "Before Lunch",
    "After Lunch",
    "Before Dinner",
    "After Dinner",
    "Bedtime",
  ];

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsAnalyzing(true);
    
    // Simulate AI analysis with holographic effect
    setTimeout(() => {
      // Mock extracted medications
      const mockMedications: Medication[] = [
        { id: Date.now().toString(), name: "Amlodipine", dosage: "5mg", timing: "After Breakfast", frequency: "daily" },
        { id: (Date.now() + 1).toString(), name: "Metformin", dosage: "500mg", timing: "After Dinner", frequency: "daily" },
      ];
      setMedications(prev => [...prev, ...mockMedications]);
      setIsAnalyzing(false);
      setUploadMethod(null);
    }, 3000);
  };

  const addMedication = () => {
    if (newMed.name && newMed.dosage && newMed.timing) {
      setMedications([
        ...medications,
        { ...newMed, id: Date.now().toString() },
      ]);
      setNewMed({ name: "", dosage: "", timing: "", frequency: "daily" });
      setShowManualEntry(false);
    }
  };

  const removeMedication = (id: string) => {
    setMedications(medications.filter(med => med.id !== id));
  };

  const handleSubmit = () => {
    localStorage.setItem("onboarding_medications", JSON.stringify(medications));
    onNext();
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-20">
      <div className="max-w-2xl w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
            Medication Details
          </h1>
          <p className="text-gray-400">
            Add your medications so we can remind you
          </p>
        </motion.div>

        {/* Upload Options */}
        {!showManualEntry && medications.length === 0 && !uploadMethod && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
          >
            <button
              onClick={() => { setUploadMethod("prescription"); fileInputRef.current?.click(); }}
              className="glass rounded-xl p-6 text-center hover:bg-white/10 transition-all group"
            >
              <FileText className="w-12 h-12 text-cyan-400 mx-auto mb-3 group-hover:scale-110 transition" />
              <div className="font-medium text-white">Upload Prescription</div>
              <div className="text-sm text-gray-500 mt-1">AI will extract details</div>
            </button>

            <button
              onClick={() => { setUploadMethod("image"); fileInputRef.current?.click(); }}
              className="glass rounded-xl p-6 text-center hover:bg-white/10 transition-all group"
            >
              <Camera className="w-12 h-12 text-purple-400 mx-auto mb-3 group-hover:scale-110 transition" />
              <div className="font-medium text-white">Medicine Image</div>
              <div className="text-sm text-gray-500 mt-1">Take a photo of your medicine</div>
            </button>

            <button
              onClick={() => setShowManualEntry(true)}
              className="glass rounded-xl p-6 text-center hover:bg-white/10 transition-all group"
            >
              <PenTool className="w-12 h-12 text-green-400 mx-auto mb-3 group-hover:scale-110 transition" />
              <div className="font-medium text-white">Manual Entry</div>
              <div className="text-sm text-gray-500 mt-1">Add medications manually</div>
            </button>
          </motion.div>
        )}

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,application/pdf"
          onChange={handleFileUpload}
          className="hidden"
        />

        {/* AI Analysis Animation */}
        {isAnalyzing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="glass rounded-2xl p-8 text-center relative overflow-hidden mb-8"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 animate-pulse" />
            <div className="relative z-10">
              <div className="w-20 h-20 mx-auto mb-4 relative">
                <div className="absolute inset-0 rounded-full border-2 border-cyan-500/30 animate-pulse-ring" />
                <div className="absolute inset-2 rounded-full border-2 border-purple-500/30 animate-pulse-ring delay-300" />
                <div className="w-full h-full rounded-full bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center">
                  <FileText className="w-10 h-10 text-white" />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                AI Analyzing Prescription...
              </h3>
              <p className="text-gray-400">Extracting medicine names, dosages, and timings</p>
              
              {/* Holographic scan line */}
              <div className="relative h-1 bg-white/10 rounded-full mt-6 overflow-hidden">
                <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-scan-line" />
              </div>
            </div>
          </motion.div>
        )}

        {/* Manual Entry Form */}
        {showManualEntry && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass rounded-xl p-6 mb-6"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-white">Add Medication</h3>
              <button onClick={() => setShowManualEntry(false)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <input
                type="text"
                placeholder="Medicine name"
                value={newMed.name}
                onChange={(e) => setNewMed({ ...newMed, name: e.target.value })}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-cyan-500"
              />
              <input
                type="text"
                placeholder="Dosage (e.g., 500mg)"
                value={newMed.dosage}
                onChange={(e) => setNewMed({ ...newMed, dosage: e.target.value })}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-cyan-500"
              />
              <select
                value={newMed.timing}
                onChange={(e) => setNewMed({ ...newMed, timing: e.target.value })}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="">Select timing</option>
                {timings.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
              <button
                onClick={addMedication}
                className="w-full py-3 rounded-xl bg-cyan-500/20 border border-cyan-500 text-cyan-400 font-medium hover:bg-cyan-500/30 transition"
              >
                <Plus className="w-5 h-5 inline mr-2" />
                Add Medication
              </button>
            </div>
          </motion.div>
        )}

        {/* Medication List */}
        {medications.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-3 mb-8"
          >
            <h3 className="text-lg font-semibold text-white">Your Medications</h3>
            {medications.map((med, idx) => (
              <motion.div
                key={med.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="glass rounded-xl p-4 flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center">
                    <Pill className="w-5 h-5 text-cyan-400" />
                  </div>
                  <div>
                    <div className="font-medium text-white">{med.name}</div>
                    <div className="text-sm text-gray-400">{med.dosage} • {med.timing}</div>
                  </div>
                </div>
                <button onClick={() => removeMedication(med.id)} className="text-red-400 hover:text-red-300">
                  <Trash2 className="w-5 h-5" />
                </button>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Add More Button */}
        {!showManualEntry && medications.length > 0 && (
          <button
            onClick={() => setShowManualEntry(true)}
            className="w-full mb-8 py-3 rounded-xl border border-dashed border-white/20 text-gray-400 hover:text-white hover:border-white/40 transition"
          >
            <Plus className="w-5 h-5 inline mr-2" />
            Add Another Medication
          </button>
        )}

        {/* Continue Button */}
        {(medications.length > 0 || uploadMethod === null) && (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={handleSubmit}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-semibold hover:shadow-lg hover:shadow-cyan-500/25 transition-all"
          >
            Continue to Language Setup
          </motion.button>
        )}
      </div>
    </div>
  );
}
