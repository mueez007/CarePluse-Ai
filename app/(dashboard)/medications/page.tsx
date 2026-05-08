"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Pill, 
  Plus, 
  Clock, 
  Bell, 
  CheckCircle, 
  AlertCircle,
  Calendar,
  Upload,
  Camera,
  Trash2,
  Phone,
  Loader2,
  FileText,
  Sparkles,
  X,
  ImageIcon
} from "lucide-react";
import Sidebar from "@/components/dashboard/Sidebar";
import Header from "@/components/dashboard/Header";

interface Medication {
  id: string;
  name: string;
  dosage: string;
  timing: string;
  frequency: string;
  status: "active" | "completed" | "missed";
  purpose?: string;
}

export default function MedicationsPage() {
  const [medications, setMedications] = useState<Medication[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showPrescriptionUpload, setShowPrescriptionUpload] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState("");
  const [uploadError, setUploadError] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [extractedMeds, setExtractedMeds] = useState<any[]>([]);
  const [showExtractedPreview, setShowExtractedPreview] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [newMed, setNewMed] = useState({
    name: "",
    dosage: "",
    timing: "",
    frequency: "daily",
    purpose: "",
  });

  useEffect(() => {
    // Load medications from localStorage
    const savedMeds = localStorage.getItem("medications");
    if (savedMeds) {
      setMedications(JSON.parse(savedMeds));
    } else {
      const onboardingMeds = localStorage.getItem("onboarding_medications");
      if (onboardingMeds) {
        const parsed = JSON.parse(onboardingMeds);
        const formatted = parsed.map((m: any) => ({ ...m, id: m.id || Date.now().toString(), status: "active" }));
        setMedications(formatted);
      }
    }
  }, []);

  // Save medications to localStorage whenever they change
  useEffect(() => {
    if (medications.length > 0) {
      localStorage.setItem("medications", JSON.stringify(medications));
    }
  }, [medications]);

  const timings = [
    "Before Breakfast",
    "After Breakfast",
    "Before Lunch",
    "After Lunch",
    "Before Dinner",
    "After Dinner",
    "Bedtime",
  ];

  const addMedication = () => {
    if (newMed.name && newMed.dosage && newMed.timing) {
      const medication: Medication = {
        id: Date.now().toString(),
        ...newMed,
        status: "active",
      };
      setMedications([...medications, medication]);
      setNewMed({ name: "", dosage: "", timing: "", frequency: "daily", purpose: "" });
      setShowAddModal(false);
    }
  };

  const removeMedication = (id: string) => {
    setMedications(medications.filter(m => m.id !== id));
  };

  const markAsTaken = (id: string) => {
    setMedications(medications.map(m =>
      m.id === id ? { ...m, status: "completed" as const } : m
    ));
  };

  // ─── Prescription Upload with Gemini Vision ───────────
  const handlePrescriptionUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show preview
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setIsUploading(true);
    setUploadError("");
    setUploadProgress("Uploading prescription image...");

    try {
      const formData = new FormData();
      formData.append("file", file);

      setUploadProgress("🔍 AI is reading your prescription (handwritten & printed)...");

      const response = await fetch("/api/ai/prescription", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 429 && data.retryAfter) {
          throw new Error(`AI is busy. Please wait ${data.retryAfter} seconds and try again.`);
        }
        throw new Error(data.error || "Failed to analyze prescription");
      }

      if (data.medications && data.medications.length > 0) {
        setUploadProgress(`✅ Found ${data.medications.length} medication(s) using ${data.model || 'Gemini'}!`);
        setExtractedMeds(data.medications);
        setShowExtractedPreview(true);
      } else {
        setUploadProgress("");
        setUploadError("Could not find any medications in this image. Please try a clearer photo.");
      }
    } catch (error: any) {
      console.error("Prescription upload error:", error);
      setUploadProgress("");
      setUploadError(error.message || "Failed to analyze prescription. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const confirmExtractedMeds = () => {
    const newMeds: Medication[] = extractedMeds.map((m, i) => ({
      id: (Date.now() + i).toString(),
      name: m.name,
      dosage: m.dosage || "As prescribed",
      timing: m.timing || "After Breakfast",
      frequency: m.frequency || "daily",
      status: "active" as const,
      purpose: m.purpose || "",
    }));
    setMedications([...medications, ...newMeds]);
    setShowPrescriptionUpload(false);
    setShowExtractedPreview(false);
    setExtractedMeds([]);
    setPreviewUrl(null);
    setUploadProgress("");
    setUploadError("");
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case "missed":
        return <AlertCircle className="w-5 h-5 text-red-400" />;
      default:
        return <Clock className="w-5 h-5 text-cyan-400" />;
    }
  };

  const todaySchedule = medications.filter(m => m.status === "active");
  const completedCount = medications.filter(m => m.status === "completed").length;
  const adherenceRate = medications.length > 0 ? Math.round((completedCount / medications.length) * 100) : 0;

  return (
    <div className="flex h-screen bg-gradient-to-b from-[#0A0A0F] to-[#0F0F1A]">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4"
            >
              <div>
                <h1 className="text-3xl font-bold text-white">Medications</h1>
                <p className="text-gray-400 mt-1">Manage your medicines and reminders</p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowPrescriptionUpload(true);
                    setUploadError("");
                    setUploadProgress("");
                    setPreviewUrl(null);
                    setExtractedMeds([]);
                    setShowExtractedPreview(false);
                  }}
                  className="px-4 py-2 rounded-xl glass text-white hover:bg-white/10 transition flex items-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  Upload Prescription
                </button>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-medium flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Medicine
                </button>
              </div>
            </motion.div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="glass rounded-xl p-5"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Active Medications</p>
                    <p className="text-3xl font-bold text-white">{todaySchedule.length}</p>
                  </div>
                  <Pill className="w-10 h-10 text-purple-400 opacity-50" />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="glass rounded-xl p-5"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Today&apos;s Completed</p>
                    <p className="text-3xl font-bold text-white">{completedCount}</p>
                  </div>
                  <CheckCircle className="w-10 h-10 text-green-400 opacity-50" />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="glass rounded-xl p-5"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Adherence Rate</p>
                    <p className="text-3xl font-bold text-white">{adherenceRate}%</p>
                  </div>
                  <div className="w-10 h-10 rounded-full border-2 border-cyan-400 flex items-center justify-center">
                    <span className="text-sm text-cyan-400">{adherenceRate}</span>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Today's Schedule */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="glass rounded-2xl p-6"
            >
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-cyan-400" />
                Today&apos;s Schedule
              </h2>
              
              {medications.length === 0 ? (
                <div className="text-center py-12">
                  <Pill className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400">No medications added yet</p>
                  <div className="flex gap-3 justify-center mt-4">
                    <button
                      onClick={() => setShowAddModal(true)}
                      className="px-4 py-2 rounded-xl bg-cyan-500/20 text-cyan-400 text-sm"
                    >
                      Add manually
                    </button>
                    <button
                      onClick={() => setShowPrescriptionUpload(true)}
                      className="px-4 py-2 rounded-xl bg-purple-500/20 text-purple-400 text-sm flex items-center gap-2"
                    >
                      <Camera className="w-4 h-4" />
                      Scan prescription
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {medications.map((med, idx) => (
                    <motion.div
                      key={med.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
                        med.status === "completed"
                          ? "bg-green-500/5 border-green-500/20"
                          : "bg-white/5 border-white/10"
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                          med.status === "completed" ? "bg-green-500/20" : "bg-purple-500/20"
                        }`}>
                          <Pill className={`w-6 h-6 ${
                            med.status === "completed" ? "text-green-400" : "text-purple-400"
                          }`} />
                        </div>
                        <div>
                          <h3 className={`font-semibold ${
                            med.status === "completed" ? "text-green-300 line-through" : "text-white"
                          }`}>{med.name}</h3>
                          <p className="text-sm text-gray-400">{med.dosage} • {med.timing} • {med.frequency}</p>
                          {med.purpose && (
                            <p className="text-xs text-cyan-400 mt-1">{med.purpose}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {med.status === "active" && (
                          <button
                            onClick={() => markAsTaken(med.id)}
                            className="px-4 py-2 rounded-lg bg-green-500/20 text-green-400 text-sm hover:bg-green-500/30 transition"
                          >
                            Mark Taken
                          </button>
                        )}
                        {getStatusIcon(med.status)}
                        <button
                          onClick={() => removeMedication(med.id)}
                          className="p-2 rounded-lg hover:bg-red-500/10 transition"
                        >
                          <Trash2 className="w-4 h-4 text-red-400" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Voice Call Reminder Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mt-6 glass rounded-2xl p-6"
            >
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <Phone className="w-5 h-5 text-cyan-400" />
                Voice Call Reminders
              </h2>
              <p className="text-gray-400 text-sm mb-4">
                Enable automated voice calls for medicine reminders
              </p>
              <button className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-medium flex items-center gap-2">
                <Bell className="w-4 h-4" />
                Enable Voice Reminders
              </button>
            </motion.div>
          </div>
        </main>
      </div>

      {/* Add Medication Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass rounded-2xl p-6 max-w-md w-full"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white">Add Medication</h2>
                <button onClick={() => setShowAddModal(false)} className="p-1 rounded-lg hover:bg-white/10">
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Medicine name"
                  value={newMed.name}
                  onChange={(e) => setNewMed({ ...newMed, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-gray-500 focus:outline-none focus:border-cyan-500"
                />
                <input
                  type="text"
                  placeholder="Dosage (e.g., 500mg)"
                  value={newMed.dosage}
                  onChange={(e) => setNewMed({ ...newMed, dosage: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-gray-500 focus:outline-none focus:border-cyan-500"
                />
                <select
                  value={newMed.timing}
                  onChange={(e) => setNewMed({ ...newMed, timing: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="">Select timing</option>
                  {timings.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
                <input
                  type="text"
                  placeholder="Purpose (optional)"
                  value={newMed.purpose}
                  onChange={(e) => setNewMed({ ...newMed, purpose: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-gray-500 focus:outline-none focus:border-cyan-500"
                />
                <div className="flex gap-3">
                  <button
                    onClick={addMedication}
                    className="flex-1 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-medium"
                  >
                    Add
                  </button>
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="px-6 py-3 rounded-xl glass text-gray-400 hover:text-white"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Prescription Upload Modal */}
      <AnimatePresence>
        {showPrescriptionUpload && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass rounded-2xl p-6 max-w-lg w-full"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <FileText className="w-5 h-5 text-cyan-400" />
                  Upload Prescription
                </h2>
                <button
                  onClick={() => {
                    setShowPrescriptionUpload(false);
                    setPreviewUrl(null);
                    setUploadError("");
                    setUploadProgress("");
                    setShowExtractedPreview(false);
                  }}
                  className="p-1 rounded-lg hover:bg-white/10"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              {/* Extracted Medications Preview */}
              {showExtractedPreview && extractedMeds.length > 0 ? (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="w-5 h-5 text-green-400" />
                    <p className="text-green-400 font-medium">
                      Found {extractedMeds.length} medication(s)
                    </p>
                  </div>
                  <div className="space-y-2 max-h-60 overflow-y-auto mb-4">
                    {extractedMeds.map((med, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10"
                      >
                        <Pill className="w-5 h-5 text-purple-400 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-medium truncate">{med.name}</p>
                          <p className="text-xs text-gray-400">
                            {med.dosage} • {med.timing} • {med.frequency}
                            {med.purpose && ` • ${med.purpose}`}
                          </p>
                        </div>
                        <button
                          onClick={() => setExtractedMeds(extractedMeds.filter((_, idx) => idx !== i))}
                          className="p-1 rounded hover:bg-red-500/10"
                        >
                          <X className="w-4 h-4 text-red-400" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={confirmExtractedMeds}
                      className="flex-1 py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white font-medium flex items-center justify-center gap-2"
                    >
                      <CheckCircle className="w-5 h-5" />
                      Add All Medications
                    </button>
                    <button
                      onClick={() => {
                        setShowExtractedPreview(false);
                        setExtractedMeds([]);
                        setPreviewUrl(null);
                        setUploadProgress("");
                      }}
                      className="px-4 py-3 rounded-xl glass text-gray-400"
                    >
                      Retry
                    </button>
                  </div>
                </div>
              ) : isUploading ? (
                /* Loading State */
                <div className="py-8 text-center">
                  {previewUrl && (
                    <div className="mb-4 rounded-xl overflow-hidden border border-white/10 max-h-40 mx-auto w-fit">
                      <img src={previewUrl} alt="Prescription" className="max-h-40 object-contain" />
                    </div>
                  )}
                  <div className="w-16 h-16 mx-auto mb-4 relative">
                    <div className="absolute inset-0 rounded-full border-2 border-cyan-500/30 animate-ping" />
                    <div className="w-full h-full rounded-full bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center">
                      <Loader2 className="w-8 h-8 text-white animate-spin" />
                    </div>
                  </div>
                  <p className="text-white font-medium">{uploadProgress}</p>
                  <p className="text-xs text-gray-500 mt-2">
                    Powered by Gemini Vision AI — reads handwritten &amp; printed prescriptions
                  </p>
                </div>
              ) : (
                /* Upload Area */
                <>
                  {uploadError && (
                    <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      {uploadError}
                    </div>
                  )}
                  <label className="cursor-pointer block">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={handlePrescriptionUpload}
                      className="hidden"
                    />
                    <div className="border-2 border-dashed border-white/20 rounded-xl p-8 hover:border-cyan-500 transition text-center">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20 flex items-center justify-center">
                        <Camera className="w-8 h-8 text-cyan-400" />
                      </div>
                      <p className="text-white font-medium mb-1">
                        Upload or take a photo of your prescription
                      </p>
                      <p className="text-sm text-gray-400 mb-3">
                        Works with handwritten &amp; printed prescriptions
                      </p>
                      <div className="flex items-center justify-center gap-4 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <ImageIcon className="w-3 h-3" /> JPG, PNG
                        </span>
                        <span className="flex items-center gap-1">
                          <Sparkles className="w-3 h-3" /> AI-powered OCR
                        </span>
                      </div>
                    </div>
                  </label>
                  <button
                    onClick={() => {
                      setShowPrescriptionUpload(false);
                      setPreviewUrl(null);
                    }}
                    className="mt-4 w-full px-6 py-2 rounded-xl glass text-gray-400 hover:text-white text-center"
                  >
                    Cancel
                  </button>
                </>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
