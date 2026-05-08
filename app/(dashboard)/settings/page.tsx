"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Settings, Bell, Moon, Sun, Volume2, VolumeX, Globe, Shield,
  Smartphone, Eye, Lock, LogOut, ChevronRight, ToggleLeft, ToggleRight,
  Palette, Languages, HelpCircle, Info, Trash2, AlertTriangle
} from "lucide-react";
import Sidebar from "@/components/dashboard/Sidebar";
import Header from "@/components/dashboard/Header";
import { useRouter } from "next/navigation";

interface SettingToggle {
  label: string;
  description: string;
  icon: any;
  key: string;
}

export default function SettingsPage() {
  const router = useRouter();
  const [settings, setSettings] = useState({
    darkMode: true,
    notifications: true,
    voiceReminders: true,
    soundEffects: true,
    largeText: false,
    highContrast: false,
    autoScan: false,
    shareData: false,
    biometric: false,
    language: "en",
    fontSize: "medium",
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const s = localStorage.getItem("carepulse_settings");
    if (s) setSettings(JSON.parse(s));
  }, []);

  const saveSettings = () => {
    localStorage.setItem("carepulse_settings", JSON.stringify(settings));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const toggle = (key: string) => {
    const newSettings = { ...settings, [key]: !settings[key as keyof typeof settings] };
    setSettings(newSettings);
    localStorage.setItem("carepulse_settings", JSON.stringify(newSettings));
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  };

  const clearData = () => {
    if (confirm("Are you sure? This will clear all local data.")) {
      localStorage.clear();
      alert("Data cleared. You will be logged out.");
      handleLogout();
    }
  };

  const ToggleSwitch = ({ enabled, onToggle }: { enabled: boolean; onToggle: () => void }) => (
    <button onClick={onToggle} className="relative">
      <div className={`w-11 h-6 rounded-full transition-all ${enabled ? "bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.4)]" : "bg-white/10"}`}>
        <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all shadow ${enabled ? "left-[22px]" : "left-0.5"}`} />
      </div>
    </button>
  );

  const sections = [
    {
      title: "Appearance",
      icon: Palette,
      items: [
        { label: "Dark Mode", description: "Use dark theme throughout the app", icon: Moon, key: "darkMode" },
        { label: "Large Text", description: "Increase text size for better readability", icon: Eye, key: "largeText" },
        { label: "High Contrast", description: "Enhance colors for visibility", icon: Sun, key: "highContrast" },
      ]
    },
    {
      title: "Notifications",
      icon: Bell,
      items: [
        { label: "Push Notifications", description: "Receive medication and health reminders", icon: Bell, key: "notifications" },
        { label: "Voice Reminders", description: "Spoken reminders for medications", icon: Volume2, key: "voiceReminders" },
        { label: "Sound Effects", description: "Play sounds for app interactions", icon: Volume2, key: "soundEffects" },
      ]
    },
    {
      title: "AI & Scanner",
      icon: Smartphone,
      items: [
        { label: "Auto-Scan Food", description: "Automatically analyze food when captured", icon: Smartphone, key: "autoScan" },
      ]
    },
    {
      title: "Privacy & Security",
      icon: Shield,
      items: [
        { label: "Share Health Data", description: "Allow AI to learn from your data", icon: Globe, key: "shareData" },
        { label: "Biometric Lock", description: "Require fingerprint/face to open app", icon: Lock, key: "biometric" },
      ]
    },
  ];

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gradient-to-b dark:from-[#0A0A0F] dark:to-[#0F0F1A]">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-3xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.3)]">
                  <Settings className="w-6 h-6 text-gray-900 dark:text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>
                  <p className="text-gray-500 dark:text-gray-400 mt-0.5">Customize your CarePulse experience</p>
                </div>
              </div>
            </motion.div>

            <div className="space-y-6">
              {sections.map((section, si) => (
                <motion.div key={section.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: si * 0.1 }}
                  className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white/80 dark:bg-white/[0.03] backdrop-blur-xl overflow-hidden">
                  <div className="px-5 py-4 border-b border-white/5 flex items-center gap-2">
                    <section.icon className="w-5 h-5 text-cyan-400" />
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{section.title}</h2>
                  </div>
                  <div className="divide-y divide-white/5">
                    {section.items.map((item) => (
                      <div key={item.key} className="flex items-center justify-between px-5 py-4 hover:bg-white/[0.02] transition">
                        <div className="flex items-center gap-3">
                          <item.icon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                          <div>
                            <p className="text-gray-900 dark:text-white text-sm font-medium">{item.label}</p>
                            <p className="text-xs text-gray-500">{item.description}</p>
                          </div>
                        </div>
                        <ToggleSwitch enabled={!!settings[item.key as keyof typeof settings]} onToggle={() => toggle(item.key)} />
                      </div>
                    ))}
                  </div>
                </motion.div>
              ))}

              {/* Language */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white/80 dark:bg-white/[0.03] backdrop-blur-xl p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Languages className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                    <div>
                      <p className="text-gray-900 dark:text-white text-sm font-medium">Language</p>
                      <p className="text-xs text-gray-500">Choose your preferred language</p>
                    </div>
                  </div>
                  <select value={settings.language}
                    onChange={e => setSettings({ ...settings, language: e.target.value })}
                    className="px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-cyan-500">
                    <option value="en">English</option>
                    <option value="hi">Hindi</option>
                    <option value="ur">Urdu</option>
                    <option value="ta">Tamil</option>
                  </select>
                </div>
              </motion.div>

              {/* Danger Zone */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
                className="rounded-2xl border border-red-500/20 bg-red-500/5 p-5 space-y-3">
                <h3 className="text-red-400 font-semibold flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" /> Danger Zone
                </h3>
                <button onClick={clearData}
                  className="w-full p-3 rounded-xl border border-red-500/20 text-red-400 hover:bg-red-500/10 transition flex items-center justify-center gap-2">
                  <Trash2 className="w-4 h-4" /> Clear All Data
                </button>
                <button onClick={handleLogout}
                  className="w-full p-3 rounded-xl border border-red-500/20 text-red-400 hover:bg-red-500/10 transition flex items-center justify-center gap-2">
                  <LogOut className="w-4 h-4" /> Log Out
                </button>
              </motion.div>

              {/* App Info */}
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
                className="text-center py-6 text-gray-600 text-xs">
                <p>CarePulse AI v1.0.0</p>
                <p className="mt-1">Made with ❤️ for elderly care</p>
              </motion.div>
            </div>
          </div>
        </main>
      </div>

      {/* Save indicator */}
      <AnimatePresence>
        {saved && (
          <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-6 right-6 px-4 py-2 rounded-xl bg-green-500/20 border border-green-500/30 text-green-400 text-sm">
            ✓ Settings saved
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
