"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { 
  Sparkles, 
  Shield, 
  Heart, 
  Mic, 
  Camera, 
  Bell, 
  ArrowRight,
  Star,
  Users,
  Clock,
  Brain,
  Activity,
  Smile
} from "lucide-react";

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gradient-to-b dark:from-[#0A0A0F] dark:via-[#0F0F1A] dark:to-[#0A0A0F]">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-cyan-500/20 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/20 rounded-full blur-[120px] animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500/10 rounded-full blur-[150px]" />
      </div>

      {/* Navigation */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        scrolled ? "glass py-3" : "bg-transparent py-5"
      }`}>
        <div className="container mx-auto px-6 flex items-center justify-between">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-purple-600 flex items-center justify-center">
              <Heart className="w-6 h-6 text-white" fill="white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              CarePulse AI
            </span>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="hidden md:flex items-center gap-8"
          >
            <a href="#features" className="text-gray-300 hover:text-cyan-400 transition">Features</a>
            <a href="#how-it-works" className="text-gray-300 hover:text-cyan-400 transition">How it Works</a>
            <a href="#about" className="text-gray-300 hover:text-cyan-400 transition">About</a>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex gap-3"
          >
            <Link href="/login">
              <button className="px-4 py-2 text-gray-300 hover:text-white transition">
                Sign In
              </button>
            </Link>
            <Link href="/signup">
              <button className="px-5 py-2 rounded-full bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-medium hover:shadow-lg hover:shadow-cyan-500/25 transition-all">
                Get Started
              </button>
            </Link>
          </motion.div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6">
        <div className="container mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-white mb-6">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span className="text-sm text-cyan-400">AI-Powered Healthcare</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Intelligent Care
              </span>
              <br />
              <span className="text-white">For Your Loved Ones</span>
            </h1>
            
            <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10">
              CarePulse AI combines food safety, medication reminders, emotional support, 
              and emergency alerts into one compassionate AI companion.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/signup">
                <button className="px-8 py-4 rounded-full bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-semibold text-lg hover:shadow-xl hover:shadow-cyan-500/30 transition-all flex items-center gap-2 mx-auto">
                  Start Your Journey
                  <ArrowRight className="w-5 h-5" />
                </button>
              </Link>
              <button className="px-8 py-4 rounded-full glass-white text-white font-semibold text-lg hover:bg-white/10 transition-all">
                Watch Demo
              </button>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto mt-20"
          >
            {[
              { icon: Users, label: "Active Users", value: "10,000+" },
              { icon: Clock, label: "Hours Saved", value: "50K+" },
              { icon: Heart, label: "Health Score", value: "94%" },
              { icon: Star, label: "Rating", value: "4.9/5" },
            ].map((stat, i) => (
              <div key={i} className="glass rounded-2xl p-4 text-center">
                <stat.icon className="w-8 h-8 text-cyan-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">{stat.value}</div>
                <div className="text-sm text-gray-400">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-6">
        <div className="container mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Comprehensive Health Intelligence
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Everything you need to keep your loved ones safe, healthy, and emotionally connected.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Camera, title: "AI Food Scanner", description: "Snap a photo to analyze food safety based on personal health profile", color: "from-cyan-500 to-blue-500" },
              { icon: Bell, title: "Smart Medication", description: "Voice call reminders and adherence tracking for medications", color: "from-purple-500 to-pink-500" },
              { icon: Mic, title: "Emotional AI Companion", description: "24/7 conversational support with sentiment analysis", color: "from-green-500 to-teal-500" },
              { icon: Activity, title: "Health Monitoring", description: "Track vitals and receive real-time health insights", color: "from-orange-500 to-red-500" },
              { icon: Shield, title: "Emergency Alerts", description: "Instant notifications to caregivers and emergency services", color: "from-red-500 to-pink-500" },
              { icon: Brain, title: "Digital Twin", description: "Personalized AI health profile from your medical history", color: "from-indigo-500 to-purple-500" },
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="glass rounded-2xl p-6 hover:scale-105 transition-all duration-300 cursor-pointer group"
              >
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 group-hover:animate-pulse`}>
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section id="how-it-works" className="py-20 px-6">
        <div className="container mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              How CarePulse AI Works
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Getting started is simple. Our AI learns and adapts to your health profile in minutes.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-4 gap-8 max-w-5xl mx-auto">
            {[
              { step: "01", title: "Create Profile", description: "Sign up and complete a quick health questionnaire about conditions, medications, and preferences.", color: "from-cyan-500 to-blue-500" },
              { step: "02", title: "AI Learns You", description: "Our AI builds your digital health twin, understanding your unique needs and risk factors.", color: "from-purple-500 to-pink-500" },
              { step: "03", title: "Get Protected", description: "Receive smart food alerts, medication reminders via voice calls, and 24/7 emotional support.", color: "from-green-500 to-teal-500" },
              { step: "04", title: "Stay Connected", description: "Caregivers get real-time updates, emergency alerts, and health trend reports.", color: "from-orange-500 to-red-500" },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.15, duration: 0.5 }}
                className="text-center relative"
              >
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br ${item.color} mb-4 text-2xl font-bold text-white`}>
                  {item.step}
                </div>
                {i < 3 && (
                  <div className="hidden md:block absolute top-8 left-[60%] w-[80%] h-[2px] bg-gradient-to-r from-white/20 to-transparent" />
                )}
                <h3 className="text-lg font-semibold text-white mb-2">{item.title}</h3>
                <p className="text-gray-400 text-sm">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 px-6">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                Built with <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">Love & AI</span>
              </h2>
              <p className="text-gray-400 mb-4">
                CarePulse AI was born from a simple belief: every elderly person deserves 
                intelligent, compassionate care — available 24/7, in their language, on their terms.
              </p>
              <p className="text-gray-400 mb-6">
                Our team combines expertise in AI, healthcare, and human-centered design to create 
                a companion that truly understands and supports the unique needs of elderly individuals 
                and their caregiving families.
              </p>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: "AI-Powered", value: "Gemini Pro" },
                  { label: "Languages", value: "10+" },
                  { label: "Response Time", value: "<2 sec" },
                  { label: "Uptime", value: "99.9%" },
                ].map((stat, i) => (
                  <div key={i} className="glass rounded-xl p-4">
                    <div className="text-lg font-bold text-cyan-400">{stat.value}</div>
                    <div className="text-sm text-gray-400">{stat.label}</div>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-4"
            >
              {[
                { icon: Heart, title: "Compassion First", description: "Every feature is designed with empathy, understanding that health is deeply personal." },
                { icon: Shield, title: "Privacy & Security", description: "End-to-end encryption, HIPAA-ready architecture, and zero data selling — ever." },
                { icon: Brain, title: "Adaptive Intelligence", description: "Our AI learns from each interaction, getting smarter and more personalized over time." },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                  className="glass rounded-2xl p-6 flex gap-4"
                >
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20 flex items-center justify-center flex-shrink-0">
                    <item.icon className="w-6 h-6 text-cyan-400" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold mb-1">{item.title}</h3>
                    <p className="text-gray-400 text-sm">{item.description}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="glass rounded-3xl p-12 text-center relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 rounded-full blur-3xl" />
            <div className="relative z-10">
              <Smile className="w-16 h-16 text-cyan-400 mx-auto mb-4" />
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Ready to Transform Elderly Care?
              </h2>
              <p className="text-gray-400 max-w-2xl mx-auto mb-8">
                Join thousands of families who trust CarePulse AI for their loved ones' wellbeing.
              </p>
              <Link href="/signup">
                <button className="px-8 py-4 rounded-full bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-semibold text-lg hover:shadow-xl hover:shadow-cyan-500/30 transition-all inline-flex items-center gap-2">
                  Get Started Free
                  <ArrowRight className="w-5 h-5" />
                </button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 px-6 border-t border-white/10">
        <div className="container mx-auto text-center text-gray-500 text-sm">
          <p>&copy; 2025 CarePulse AI. Empowering healthier, happier lives with AI.</p>
          <p className="mt-2">*AI assistant provides suggestions only. Always consult healthcare professionals.</p>
        </div>
      </footer>
    </div>
  );
}
