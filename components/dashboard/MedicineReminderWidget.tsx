"use client";

import { motion } from "framer-motion";
import { Pill, Clock, CheckCircle, AlertCircle, Bell, ChevronRight } from "lucide-react";
import { useState } from "react";

interface Reminder {
  id: number;
  name: string;
  time: string;
  status: "upcoming" | "missed" | "taken";
}

interface MedicineReminderWidgetProps {
  reminders: Reminder[];
}

export default function MedicineReminderWidget({ reminders }: MedicineReminderWidgetProps) {
  const [localReminders, setLocalReminders] = useState(reminders);

  const handleMarkAsTaken = (id: number) => {
    setLocalReminders(prev =>
      prev.map(r =>
        r.id === id ? { ...r, status: "taken" as const } : r
      )
    );
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "taken":
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case "missed":
        return <AlertCircle className="w-5 h-5 text-red-400" />;
      default:
        return <Clock className="w-5 h-5 text-cyan-400" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "taken":
        return "Taken";
      case "missed":
        return "Missed";
      default:
        return "Pending";
    }
  };

  const upcomingCount = localReminders.filter(r => r.status === "upcoming").length;
  const takenCount = localReminders.filter(r => r.status === "taken").length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-xl p-5"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
            <Pill className="w-4 h-4 text-purple-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Medicine Reminders</h3>
        </div>
        <button className="text-sm text-cyan-400 hover:text-cyan-300">
          View All
        </button>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="text-center p-2 rounded-lg bg-gray-100 dark:bg-white/5">
          <div className="text-xl font-bold text-gray-900 dark:text-white">{upcomingCount}</div>
          <div className="text-xs text-gray-500">Upcoming</div>
        </div>
        <div className="text-center p-2 rounded-lg bg-gray-100 dark:bg-white/5">
          <div className="text-xl font-bold text-gray-900 dark:text-white">{takenCount}</div>
          <div className="text-xs text-gray-500">Taken</div>
        </div>
        <div className="text-center p-2 rounded-lg bg-gray-100 dark:bg-white/5">
          <div className="text-xl font-bold text-gray-900 dark:text-white">{localReminders.length}</div>
          <div className="text-xs text-gray-500">Total</div>
        </div>
      </div>

      {/* Reminders List */}
      <div className="space-y-3">
        {localReminders.map((reminder, idx) => (
          <motion.div
            key={reminder.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
            className={`flex items-center justify-between p-3 rounded-xl transition-all ${
              reminder.status === "missed"
                ? "bg-red-500/10 border border-red-500/20"
                : reminder.status === "taken"
                ? "bg-green-500/10 border border-green-500/20"
                : "bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10"
            }`}
          >
            <div className="flex items-center gap-3 flex-1">
              <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
                {getStatusIcon(reminder.status)}
              </div>
              <div className="flex-1">
                <p className="text-gray-900 dark:text-white font-medium text-sm">{reminder.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{reminder.time}</p>
              </div>
            </div>
            
            {reminder.status === "upcoming" && (
              <div className="flex gap-2">
                <button
                  onClick={() => handleMarkAsTaken(reminder.id)}
                  className="px-3 py-1.5 rounded-lg bg-green-500/20 text-green-400 text-xs hover:bg-green-500/30 transition"
                >
                  Take
                </button>
                <button className="p-1.5 rounded-lg hover:bg-white/10 transition">
                  <Bell className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                </button>
              </div>
            )}
            
            {reminder.status === "taken" && (
              <span className="text-xs text-green-400">Completed</span>
            )}
            
            {reminder.status === "missed" && (
              <span className="text-xs text-red-400">Missed</span>
            )}
          </motion.div>
        ))}
      </div>

      {/* Add Medicine Button */}
      <button className="w-full mt-4 py-2 rounded-xl border border-dashed border-white/20 text-gray-500 dark:text-gray-400 hover:text-white hover:border-white/40 transition text-sm flex items-center justify-center gap-2">
        <Pill className="w-4 h-4" />
        Add Medicine Reminder
      </button>
    </motion.div>
  );
}
