"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  Search,
  User,
  Settings,
  LogOut,
  Moon,
  Sun,
  ChevronDown,
  Heart,
  Activity
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useTheme } from "@/lib/theme-context";

interface HeaderProps {
  user?: any;
}

export default function Header({ user }: HeaderProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();

  const notifications = [
    { id: 1, title: "Medication Reminder", message: "Time to take your BP medication", time: "5 min ago", read: false, type: "reminder" },
    { id: 2, title: "Food Alert", message: "High sugar detected in your breakfast", time: "1 hour ago", read: false, type: "alert" },
    { id: 3, title: "Wellness Check", message: "How are you feeling today?", time: "2 hours ago", read: true, type: "checkin" },
  ];

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    localStorage.removeItem("carepulse_user");
    localStorage.removeItem("onboarding_completed");
    router.push("/login");
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "reminder":
        return <Bell className="w-4 h-4 text-cyan-400" />;
      case "alert":
        return <Activity className="w-4 h-4 text-red-400" />;
      default:
        return <Heart className="w-4 h-4 text-green-400" />;
    }
  };

  return (
    <header className="glass border-b border-gray-200 dark:border-gray-200 dark:border-white/10 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Search Bar */}
        <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-gray-200 dark:border-white/10 w-96">
          <Search className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          <input
            type="text"
            placeholder="Search health insights, medications..."
            className="bg-transparent text-gray-900 dark:text-white placeholder:text-gray-500 outline-none flex-1"
          />
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-4 ml-auto">
          {/* Dark Mode Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-white/10 dark:hover:bg-white/10 hover:bg-gray-200 transition"
          >
            {theme === "dark" ? (
              <Sun className="w-5 h-5 text-yellow-400" />
            ) : (
              <Moon className="w-5 h-5 text-gray-600" />
            )}
          </button>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-lg hover:bg-white/10 transition"
            >
              <Bell className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] text-gray-900 dark:text-white flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>

            <AnimatePresence>
              {showNotifications && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute right-0 top-12 w-80 glass rounded-xl border border-gray-200 dark:border-gray-200 dark:border-white/10 shadow-2xl z-50"
                >
                  <div className="p-4 border-b border-gray-200 dark:border-gray-200 dark:border-white/10">
                    <h3 className="text-gray-900 dark:text-white font-semibold">Notifications</h3>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.map((notif) => (
                      <div
                        key={notif.id}
                        className={`p-4 border-b border-gray-200 dark:border-white/5 hover:bg-gray-100 dark:bg-gray-100 dark:bg-white/5 transition cursor-pointer ${
                          !notif.read ? "bg-cyan-500/5" : ""
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                            {getNotificationIcon(notif.type)}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm text-gray-900 dark:text-white font-medium">{notif.title}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{notif.message}</p>
                            <p className="text-xs text-gray-500 mt-1">{notif.time}</p>
                          </div>
                          {!notif.read && (
                            <div className="w-2 h-2 rounded-full bg-cyan-400" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="p-3 border-t border-gray-200 dark:border-gray-200 dark:border-white/10">
                    <button className="text-sm text-cyan-400 hover:text-cyan-300 w-full text-center">
                      Mark all as read
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-100 dark:bg-gray-100 dark:bg-white/5 transition"
            >
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-cyan-400 to-purple-600 flex items-center justify-center">
                <span className="text-gray-900 dark:text-white text-sm font-medium">
                  {user?.name?.charAt(0) || "U"}
                </span>
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm text-gray-900 dark:text-white font-medium">
                  {user?.name || "User"}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Premium Member</p>
              </div>
              <ChevronDown className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            </button>

            <AnimatePresence>
              {showUserMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute right-0 top-14 w-56 glass rounded-xl border border-gray-200 dark:border-gray-200 dark:border-white/10 shadow-2xl z-50"
                >
                  <div className="p-3 border-b border-gray-200 dark:border-gray-200 dark:border-white/10">
                    <p className="text-sm text-gray-900 dark:text-white font-medium">
                      {user?.name || "User"}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{user?.email}</p>
                  </div>
                  <div className="p-2">
                    <button className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 dark:bg-gray-100 dark:bg-white/5 transition text-gray-600 dark:text-gray-300">
                      <User className="w-4 h-4" />
                      <span className="text-sm">Profile</span>
                    </button>
                    <button className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 dark:bg-gray-100 dark:bg-white/5 transition text-gray-600 dark:text-gray-300">
                      <Settings className="w-4 h-4" />
                      <span className="text-sm">Settings</span>
                    </button>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-red-500/10 transition text-red-400"
                    >
                      <LogOut className="w-4 h-4" />
                      <span className="text-sm">Logout</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  );
}
