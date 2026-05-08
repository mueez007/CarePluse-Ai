"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Camera,
  Pill,
  MessageCircle,
  AlertTriangle,
  User,
  Settings,
  Heart,
  LogOut,
  MoreVertical,
  X,
  Shield,
  Stethoscope
} from "lucide-react";
import { useRouter } from "next/navigation";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  { icon: Camera, label: "Food Scanner", href: "/food-scanner" },
  { icon: Pill, label: "Medications", href: "/medications" },
  { icon: Shield, label: "Risk Screening", href: "/risk-screening" },
  { icon: Stethoscope, label: "Symptom Checker", href: "/symptom-checker" },
  { icon: MessageCircle, label: "AI Companion", href: "/ai-companion" },
  { icon: AlertTriangle, label: "Emergency", href: "/emergency" },
  { icon: User, label: "Profile", href: "/profile" },
  { icon: Settings, label: "Settings", href: "/settings" },
];

export default function Sidebar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const sidebarRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (open && sidebarRef.current && !sidebarRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  // Close on route change
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Close on Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, []);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    localStorage.removeItem("carepulse_user");
    localStorage.removeItem("onboarding_completed");
    router.push("/login");
  };

  return (
    <>
      {/* 3-dot trigger button — always visible */}
      <button
        onClick={() => setOpen(true)}
        className="fixed top-4 left-4 z-50 p-2.5 rounded-xl glass-white border border-gray-200 dark:border-gray-200 dark:border-white/10 hover:bg-white/10 transition-all group"
        aria-label="Open navigation menu"
      >
        <MoreVertical className="w-5 h-5 text-gray-600 dark:text-gray-300 group-hover:text-white transition" />
      </button>

      {/* Backdrop overlay */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            onClick={() => setOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar panel */}
      <AnimatePresence>
        {open && (
          <motion.aside
            ref={sidebarRef}
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 250 }}
            className="fixed left-0 top-0 h-full w-72 z-50 border-r border-gray-200 dark:border-gray-200 dark:border-gray-200 dark:border-white/10 bg-white/95 dark:bg-[#0a0a14]/98 backdrop-blur-xl"
          >
            <div className="flex flex-col h-full">
              {/* Header with close button */}
              <div className="p-5 border-b border-gray-200 dark:border-gray-200 dark:border-white/10 flex items-center justify-between">
                <Link href="/dashboard" className="flex items-center gap-3" onClick={() => setOpen(false)}>
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-purple-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
                    <Heart className="w-6 h-6 text-gray-900 dark:text-white" fill="white" />
                  </div>
                  <span className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                    CarePulse AI
                  </span>
                </Link>
                <button
                  onClick={() => setOpen(false)}
                  className="p-2 rounded-lg hover:bg-white/10 transition"
                >
                  <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                </button>
              </div>

              {/* Navigation */}
              <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
                {navItems.map((item, idx) => {
                  const isActive = pathname === item.href;
                  const Icon = item.icon;

                  return (
                    <motion.div
                      key={item.href}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.04 }}
                    >
                      <Link href={item.href} onClick={() => setOpen(false)}>
                        <div
                          className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all cursor-pointer ${
                            isActive
                              ? "bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-cyan-500/30 shadow-lg shadow-cyan-500/5"
                              : "hover:bg-gray-100 dark:bg-white/5"
                          }`}
                        >
                          <Icon className={`w-5 h-5 ${isActive ? "text-cyan-400" : "text-gray-500 dark:text-gray-400"}`} />
                          <span className={`font-medium ${isActive ? "text-white" : "text-gray-600 dark:text-gray-300"}`}>
                            {item.label}
                          </span>
                          {isActive && (
                            <div className="ml-auto w-1.5 h-1.5 rounded-full bg-cyan-400" />
                          )}
                        </div>
                      </Link>
                    </motion.div>
                  );
                })}
              </nav>

              {/* Logout */}
              <div className="p-3 border-t border-gray-200 dark:border-gray-200 dark:border-white/10">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-500/10 transition text-red-400"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="font-medium">Logout</span>
                </button>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}
