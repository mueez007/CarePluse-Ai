"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Heart, 
  Pill, 
  Apple, 
  Smile, 
  Bell, 
  Activity,
  Calendar,
  Clock,
  TrendingUp,
  AlertTriangle,
  ChevronRight,
  Phone,
  MessageCircle,
  Brain
} from "lucide-react";
import Sidebar from "@/components/dashboard/Sidebar";
import Header from "@/components/dashboard/Header";
import DigitalTwinAvatar from "@/components/dashboard/DigitalTwinAvatar";
import HealthScoreRing from "@/components/dashboard/HealthScoreRing";
import MedicineReminderWidget from "@/components/dashboard/MedicineReminderWidget";
import FoodAlertWidget from "@/components/dashboard/FoodAlertWidget";
import EmotionalInsightWidget from "@/components/dashboard/EmotionalInsightWidget";

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [healthScore, setHealthScore] = useState(78);
  const [greeting, setGreeting] = useState("");
  const [currentTime, setCurrentTime] = useState("");

  useEffect(() => {
    // Get greeting based on time
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good Morning");
    else if (hour < 18) setGreeting("Good Afternoon");
    else setGreeting("Good Evening");

    // Format current time
    setCurrentTime(new Date().toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    }));

    // Get user data from API or localStorage
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/auth/me");
        const data = await res.json();
        if (data.authenticated && data.user) {
          setUser(data.user);
        } else {
          // Fallback to localStorage
          const stored = localStorage.getItem("carepulse_user");
          if (stored) setUser(JSON.parse(stored));
        }
      } catch {
        const stored = localStorage.getItem("carepulse_user");
        if (stored) setUser(JSON.parse(stored));
      }
    };
    fetchUser();
  }, []);

  const quickActions = [
    { icon: Apple, label: "Scan Food", color: "from-cyan-500 to-blue-500", href: "/food-scanner" },
    { icon: Pill, label: "Medications", color: "from-purple-500 to-pink-500", href: "/medications" },
    { icon: Smile, label: "AI Companion", color: "from-green-500 to-teal-500", href: "/ai-companion" },
    { icon: Bell, label: "Emergency", color: "from-red-500 to-orange-500", href: "/emergency" },
  ];

  const stats = [
    { label: "Medication Adherence", value: "94%", change: "+5%", icon: Pill, color: "text-purple-400" },
    { label: "Food Safety Score", value: "82%", change: "+2%", icon: Apple, color: "text-cyan-400" },
    { label: "Emotional Wellness", value: "76%", change: "-3%", icon: Smile, color: "text-green-400" },
    { label: "Health Risk Index", value: "Low", change: "Stable", icon: Activity, color: "text-yellow-400" },
  ];

  const upcomingReminders = [
    { id: 1, name: "Blood Pressure", time: "08:00 AM", status: "upcoming" },
    { id: 2, name: "Diabetes Medication", time: "09:30 PM", status: "upcoming" },
    { id: 3, name: "Vitamin D", time: "Yesterday", status: "missed" },
  ];

  const recentAlerts = [
    { id: 1, type: "warning", message: "High sugar food detected", time: "2 hours ago" },
    { id: 2, type: "info", message: "Medicine reminder sent", time: "4 hours ago" },
    { id: 3, type: "success", message: "Emotional check-in completed", time: "Yesterday" },
  ];

  return (
    <div className="flex h-screen bg-gradient-to-b from-[#0A0A0F] to-[#0F0F1A]">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header user={user} />
        
        <main className="flex-1 overflow-y-auto p-6">
          {/* Welcome Section */}
          <div className="mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-between items-start"
            >
              <div>
                <h1 className="text-3xl font-bold text-white">
                  {greeting}, {user?.name || "there"}! 👋
                </h1>
                <p className="text-gray-400 mt-1">
                  {currentTime} • Your health summary is ready
                </p>
              </div>
              <div className="glass rounded-xl px-4 py-2">
                <div className="flex items-center gap-2">
                  <Brain className="w-4 h-4 text-cyan-400" />
                  <span className="text-sm text-gray-300">AI Active</span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {stats.map((stat, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="glass rounded-xl p-5"
              >
                <div className="flex items-center justify-between mb-3">
                  <stat.icon className={`w-8 h-8 ${stat.color}`} />
                  <span className={`text-sm ${
                    stat.change.startsWith("+") ? "text-green-400" : 
                    stat.change.startsWith("-") ? "text-red-400" : "text-gray-400"
                  }`}>
                    {stat.change}
                  </span>
                </div>
                <div className="text-2xl font-bold text-white">{stat.value}</div>
                <div className="text-sm text-gray-400 mt-1">{stat.label}</div>
              </motion.div>
            ))}
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Health Score & Quick Actions */}
            <div className="space-y-6">
              <HealthScoreRing score={healthScore} />
              
              <div className="glass rounded-xl p-5">
                <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
                <div className="grid grid-cols-2 gap-3">
                  {quickActions.map((action, idx) => (
                    <motion.a
                      key={idx}
                      href={action.href}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.2 + idx * 0.1 }}
                      className={`p-4 rounded-xl bg-gradient-to-br ${action.color} hover:shadow-lg transition-all group cursor-pointer`}
                    >
                      <action.icon className="w-6 h-6 text-white mb-2" />
                      <div className="text-white font-medium text-sm">{action.label}</div>
                    </motion.a>
                  ))}
                </div>
              </div>

              <DigitalTwinAvatar />
            </div>

            {/* Middle Column - Reminders & Alerts */}
            <div className="space-y-6">
              <MedicineReminderWidget reminders={upcomingReminders} />
              
              <div className="glass rounded-xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">Recent Alerts</h3>
                  <button className="text-sm text-cyan-400 hover:text-cyan-300">
                    View All
                  </button>
                </div>
                <div className="space-y-3">
                  {recentAlerts.map((alert) => (
                    <div key={alert.id} className="flex items-start gap-3 p-3 rounded-lg bg-white/5">
                      {alert.type === "warning" && <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0" />}
                      {alert.type === "info" && <Bell className="w-5 h-5 text-cyan-400 flex-shrink-0" />}
                      {alert.type === "success" && <Smile className="w-5 h-5 text-green-400 flex-shrink-0" />}
                      <div className="flex-1">
                        <p className="text-sm text-white">{alert.message}</p>
                        <p className="text-xs text-gray-500 mt-1">{alert.time}</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-500" />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column - Emotional Insights & Emergency */}
            <div className="space-y-6">
              <EmotionalInsightWidget />
              
              <div className="glass rounded-xl p-5">
                <h3 className="text-lg font-semibold text-white mb-4">Emergency Ready</h3>
                <div className="space-y-3">
                  <button className="w-full p-4 rounded-xl bg-red-500/20 border border-red-500/30 text-red-400 font-medium hover:bg-red-500/30 transition flex items-center justify-center gap-3">
                    <Phone className="w-5 h-5" />
                    Emergency SOS
                  </button>
                  <button className="w-full p-4 rounded-xl glass text-gray-300 hover:text-white transition flex items-center justify-center gap-3">
                    <MessageCircle className="w-5 h-5" />
                    Message Caregiver
                  </button>
                </div>
                <div className="mt-4 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-yellow-400" />
                    <span className="text-xs text-yellow-400">Primary Caregiver: Priya (Daughter)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
