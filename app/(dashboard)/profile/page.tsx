"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  User, Heart, Activity, Calendar, Weight, Ruler, Droplet, Mail, Phone,
  Edit2, Download, Share2, Shield, Award, Clock, Save, X, Check
} from "lucide-react";
import Sidebar from "@/components/dashboard/Sidebar";
import Header from "@/components/dashboard/Header";

export default function ProfilePage() {
  const [userData, setUserData] = useState<any>(null);
  const [authUser, setAuthUser] = useState<any>(null);
  const [healthConditions, setHealthConditions] = useState<string[]>([]);
  const [medications, setMedications] = useState<any[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<any>({});
  const [saveMsg, setSaveMsg] = useState("");

  useEffect(() => {
    // Fetch auth user
    fetch("/api/auth/me").then(r => r.json()).then(d => {
      if (d.user) setAuthUser(d.user);
    }).catch(() => {});

    // Load onboarding data
    const basicDetails = localStorage.getItem("onboarding_basic_details");
    const conditions = localStorage.getItem("onboarding_health_conditions");
    const medicationsData = localStorage.getItem("medications") || localStorage.getItem("onboarding_medications");
    
    if (basicDetails) {
      const parsed = JSON.parse(basicDetails);
      setUserData(parsed);
      setEditData(parsed);
    }
    if (conditions) setHealthConditions(JSON.parse(conditions));
    if (medicationsData) setMedications(JSON.parse(medicationsData));
  }, []);

  const startEditing = () => {
    setEditData({ ...userData });
    setIsEditing(true);
  };

  const saveProfile = () => {
    setUserData(editData);
    localStorage.setItem("onboarding_basic_details", JSON.stringify(editData));
    setIsEditing(false);
    setSaveMsg("Profile updated!");
    setTimeout(() => setSaveMsg(""), 2000);
  };

  const healthMetrics = [
    { label: "Blood Pressure", value: "118/76", status: "Normal", icon: Activity, color: "text-emerald-400" },
    { label: "Heart Rate", value: "72", unit: "bpm", status: "Normal", icon: Heart, color: "text-emerald-400" },
    { label: "Blood Sugar", value: "110", unit: "mg/dL", status: "Elevated", icon: Droplet, color: "text-yellow-400" },
    { label: "BMI", value: userData?.weight && userData?.height ? (parseFloat(userData.weight) / Math.pow(parseFloat(userData.height) / 100, 2)).toFixed(1) : "—", unit: "kg/m²", status: "Healthy", icon: Activity, color: "text-emerald-400" },
  ];

  const achievements = [
    { title: "7 Day Streak", description: "Logged in for 7 consecutive days", icon: Calendar, earned: true },
    { title: "Medication Master", description: "100% adherence for a week", icon: Award, earned: medications.length > 0 },
    { title: "Food Safety Expert", description: "Scanned 10+ meals", icon: Activity, earned: false },
    { title: "Wellness Warrior", description: "Completed 5 emotional check-ins", icon: Heart, earned: true },
  ];

  const displayName = userData?.name || authUser?.name || "User";
  const displayEmail = authUser?.email || "Not set";

  const fields = [
    { key: "name", label: "Full Name", icon: User },
    { key: "age", label: "Age", icon: Calendar, suffix: "years" },
    { key: "gender", label: "Gender", icon: Heart },
    { key: "weight", label: "Weight", icon: Weight, suffix: "kg" },
    { key: "height", label: "Height", icon: Ruler, suffix: "cm" },
    { key: "bloodGroup", label: "Blood Group", icon: Droplet },
  ];

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gradient-to-b dark:from-[#0A0A0F] dark:to-[#0F0F1A]">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-6xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Health Profile</h1>
              <p className="text-gray-500 dark:text-gray-400 mt-1">Your complete health overview</p>
            </motion.div>

            <div className="grid lg:grid-cols-3 gap-6">
              {/* Left — Profile Card */}
              <div className="space-y-6">
                {/* Avatar + Name */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white/80 dark:bg-white/[0.03] backdrop-blur-xl p-6 text-center relative overflow-hidden">
                  <div className="absolute -top-10 -right-10 w-32 h-32 bg-cyan-500/10 rounded-full blur-3xl" />
                  <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center text-3xl font-bold text-gray-900 dark:text-white shadow-[0_0_30px_rgba(6,182,212,0.3)] mb-4">
                    {displayName.charAt(0).toUpperCase()}
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">{displayName}</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center justify-center gap-1 mt-1">
                    <Mail className="w-3 h-3" /> {displayEmail}
                  </p>
                  <div className="mt-3 flex items-center justify-center gap-2">
                    <span className="px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 text-xs border border-cyan-500/20">
                      Premium Member
                    </span>
                  </div>
                </motion.div>

                {/* Basic Info */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                  className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white/80 dark:bg-white/[0.03] backdrop-blur-xl p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Basic Information</h3>
                    {!isEditing ? (
                      <button onClick={startEditing} className="p-2 rounded-lg hover:bg-white/10 transition">
                        <Edit2 className="w-4 h-4 text-cyan-400" />
                      </button>
                    ) : (
                      <div className="flex gap-2">
                        <button onClick={saveProfile} className="p-2 rounded-lg bg-green-500/20 hover:bg-green-500/30 transition">
                          <Check className="w-4 h-4 text-green-400" />
                        </button>
                        <button onClick={() => setIsEditing(false)} className="p-2 rounded-lg hover:bg-white/10 transition">
                          <X className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="space-y-3">
                    {fields.map(f => (
                      <div key={f.key} className="flex items-center gap-3">
                        <f.icon className="w-4 h-4 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                        <div className="flex-1">
                          <p className="text-xs text-gray-500">{f.label}</p>
                          {isEditing ? (
                            <input type="text" value={editData?.[f.key] || ""}
                              onChange={e => setEditData({ ...editData, [f.key]: e.target.value })}
                              className="w-full mt-0.5 px-2 py-1 rounded bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-cyan-500" />
                          ) : (
                            <p className="text-gray-900 dark:text-white">
                              {userData?.[f.key] || "Not set"}{userData?.[f.key] && f.suffix ? ` ${f.suffix}` : ""}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </div>

              {/* Middle — Metrics & Conditions */}
              <div className="space-y-6">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                  className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white/80 dark:bg-white/[0.03] backdrop-blur-xl p-5">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Health Metrics</h3>
                  <div className="space-y-3">
                    {healthMetrics.map((m, i) => (
                      <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-gray-100 dark:bg-white/5 border border-white/5">
                        <div className="flex items-center gap-3">
                          <m.icon className={`w-5 h-5 ${m.color}`} />
                          <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{m.label}</p>
                            <p className="text-gray-900 dark:text-white font-medium">{m.value} {m.unit || ""}</p>
                          </div>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          m.status === "Normal" || m.status === "Healthy" ? "bg-emerald-500/20 text-emerald-400" : "bg-yellow-500/20 text-yellow-400"
                        }`}>{m.status}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                  className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white/80 dark:bg-white/[0.03] backdrop-blur-xl p-5">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Health Conditions</h3>
                  {healthConditions.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {healthConditions.map((c, i) => (
                        <span key={i} className="px-3 py-1.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-sm">{c}</span>
                      ))}
                    </div>
                  ) : <p className="text-gray-500 text-sm">No health conditions added</p>}
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                  className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white/80 dark:bg-white/[0.03] backdrop-blur-xl p-5">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Active Medications</h3>
                  {medications.length > 0 ? (
                    <div className="space-y-2">
                      {medications.slice(0, 5).map((m, i) => (
                        <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-gray-100 dark:bg-white/5">
                          <div>
                            <p className="text-gray-900 dark:text-white text-sm">{m.name}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{m.dosage} • {m.timing}</p>
                          </div>
                          <Clock className="w-4 h-4 text-cyan-400" />
                        </div>
                      ))}
                    </div>
                  ) : <p className="text-gray-500 text-sm">No medications added</p>}
                </motion.div>
              </div>

              {/* Right — Achievements & Actions */}
              <div className="space-y-6">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
                  className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white/80 dark:bg-white/[0.03] backdrop-blur-xl p-5">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Achievements</h3>
                  <div className="space-y-3">
                    {achievements.map((a, i) => {
                      const Icon = a.icon;
                      return (
                        <div key={i} className={`flex items-center gap-3 p-3 rounded-lg ${a.earned ? "bg-cyan-500/10 border border-cyan-500/10" : "bg-gray-100 dark:bg-white/5 opacity-50"}`}>
                          <Icon className={`w-5 h-5 ${a.earned ? "text-cyan-400" : "text-gray-500"}`} />
                          <div className="flex-1">
                            <p className="text-gray-900 dark:text-white text-sm">{a.title}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{a.description}</p>
                          </div>
                          {a.earned && <div className="w-5 h-5 rounded-full bg-cyan-400 flex items-center justify-center"><Check className="w-3 h-3 text-gray-900 dark:text-white" /></div>}
                        </div>
                      );
                    })}
                  </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
                  className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white/80 dark:bg-white/[0.03] backdrop-blur-xl p-5">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
                  <div className="space-y-3">
                    <button className="w-full p-3 rounded-xl bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white hover:bg-white/10 transition flex items-center justify-center gap-2 text-sm">
                      <Download className="w-4 h-4" /> Download Health Report
                    </button>
                    <button className="w-full p-3 rounded-xl bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white hover:bg-white/10 transition flex items-center justify-center gap-2 text-sm">
                      <Share2 className="w-4 h-4" /> Share with Doctor
                    </button>
                    <button onClick={startEditing}
                      className="w-full p-3 rounded-xl bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30 transition flex items-center justify-center gap-2 text-sm">
                      <Edit2 className="w-4 h-4" /> Update Health Profile
                    </button>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Save Toast */}
      <AnimatePresence>
        {saveMsg && (
          <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-6 right-6 px-4 py-2 rounded-xl bg-green-500/20 border border-green-500/30 text-green-400 text-sm shadow-[0_0_20px_rgba(52,211,153,0.2)]">
            ✓ {saveMsg}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
