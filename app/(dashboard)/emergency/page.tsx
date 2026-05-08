"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  AlertTriangle, 
  Phone, 
  Mail, 
  Users, 
  Shield, 
  Bell,
  Heart,
  MapPin,
  Clock,
  CheckCircle,
  Plus,
  Trash2,
  Edit2
} from "lucide-react";
import Sidebar from "@/components/dashboard/Sidebar";
import Header from "@/components/dashboard/Header";

interface EmergencyContact {
  id: string;
  name: string;
  relation: string;
  phone: string;
  email: string;
  isPrimary: boolean;
}

export default function EmergencyPage() {
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [sosActive, setSosActive] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [newContact, setNewContact] = useState({
    name: "",
    relation: "",
    phone: "",
    email: "",
  });

  useEffect(() => {
    // Load contacts from localStorage
    const savedContacts = localStorage.getItem("onboarding_emergency_contacts");
    if (savedContacts) {
      setContacts(JSON.parse(savedContacts));
    }
  }, []);

  useEffect(() => {
    if (sosActive && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (sosActive && countdown === 0) {
      triggerEmergencyAlert();
    }
  }, [sosActive, countdown]);

  const triggerEmergencyAlert = async () => {
    // Simulate sending alerts to caregivers
    console.log("Emergency alert triggered!");
    alert("Emergency alert sent to all caregivers!");
    setSosActive(false);
    setCountdown(5);
  };

  const cancelSOS = () => {
    setSosActive(false);
    setCountdown(5);
  };

  const addContact = () => {
    if (newContact.name && newContact.relation && newContact.phone) {
      const isFirstContact = contacts.length === 0;
      const contact: EmergencyContact = {
        id: Date.now().toString(),
        ...newContact,
        isPrimary: isFirstContact,
      };
      const updatedContacts = [...contacts, contact];
      setContacts(updatedContacts);
      localStorage.setItem("emergency_contacts", JSON.stringify(updatedContacts));
      setNewContact({ name: "", relation: "", phone: "", email: "" });
      setShowAddForm(false);
    }
  };

  const removeContact = (id: string) => {
    const updatedContacts = contacts.filter(c => c.id !== id);
    setContacts(updatedContacts);
    localStorage.setItem("emergency_contacts", JSON.stringify(updatedContacts));
  };

  const setPrimaryContact = (id: string) => {
    const updatedContacts = contacts.map(c => ({
      ...c,
      isPrimary: c.id === id,
    }));
    setContacts(updatedContacts);
    localStorage.setItem("emergency_contacts", JSON.stringify(updatedContacts));
  };

  const testAlert = (contact: EmergencyContact) => {
    alert(`Test alert sent to ${contact.name} at ${contact.phone}`);
  };

  const primaryContact = contacts.find(c => c.isPrimary);

  return (
    <div className="flex h-screen bg-gradient-to-b from-[#0A0A0F] to-[#0F0F1A]">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <h1 className="text-3xl font-bold text-white">Emergency</h1>
              <p className="text-gray-400 mt-1">Manage emergency contacts and alerts</p>
            </motion.div>

            {/* SOS Button */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-8"
            >
              {!sosActive ? (
                <button
                  onClick={() => setSosActive(true)}
                  className="w-full py-8 rounded-2xl bg-gradient-to-r from-red-600 to-red-700 text-white font-bold text-xl flex items-center justify-center gap-4 hover:shadow-2xl hover:shadow-red-500/30 transition-all animate-pulse"
                >
                  <AlertTriangle className="w-8 h-8" />
                  EMERGENCY SOS
                  <Heart className="w-8 h-8" />
                </button>
              ) : (
                <div className="glass rounded-2xl p-8 text-center border-red-500/30">
                  <div className="relative w-32 h-32 mx-auto mb-4">
                    <div className="absolute inset-0 rounded-full bg-red-500/20 animate-pulse-ring" />
                    <div className="absolute inset-0 rounded-full bg-red-500/40 animate-pulse-ring delay-500" />
                    <div className="w-full h-full rounded-full bg-red-500 flex items-center justify-center">
                      <span className="text-4xl font-bold text-white">{countdown}</span>
                    </div>
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2">Emergency Alert in {countdown}s</h2>
                  <p className="text-gray-400 mb-6">
                    Alert will be sent to {primaryContact?.name || "your emergency contacts"}
                  </p>
                  <button
                    onClick={cancelSOS}
                    className="px-6 py-3 rounded-xl glass text-white hover:bg-white/10 transition"
                  >
                    Cancel SOS
                  </button>
                </div>
              )}
            </motion.div>

            {/* Primary Caregiver Card */}
            {primaryContact && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="glass rounded-2xl p-6 mb-6 border-cyan-500/30"
              >
                <div className="flex items-center gap-3 mb-4">
                  <Shield className="w-6 h-6 text-cyan-400" />
                  <h2 className="text-xl font-semibold text-white">Primary Caregiver</h2>
                </div>
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div>
                    <p className="text-white font-medium text-lg">{primaryContact.name}</p>
                    <p className="text-gray-400">{primaryContact.relation}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-sm text-gray-400 flex items-center gap-1">
                        <Phone className="w-3 h-3" /> {primaryContact.phone}
                      </span>
                      {primaryContact.email && (
                        <span className="text-sm text-gray-400 flex items-center gap-1">
                          <Mail className="w-3 h-3" /> {primaryContact.email}
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => testAlert(primaryContact)}
                    className="px-4 py-2 rounded-xl bg-cyan-500/20 text-cyan-400 text-sm hover:bg-cyan-500/30 transition"
                  >
                    Test Alert
                  </button>
                </div>
              </motion.div>
            )}

            {/* Emergency Contacts List */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="glass rounded-2xl p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Users className="w-6 h-6 text-purple-400" />
                  <h2 className="text-xl font-semibold text-white">Emergency Contacts</h2>
                </div>
                <button
                  onClick={() => setShowAddForm(true)}
                  className="px-3 py-1.5 rounded-lg bg-cyan-500/20 text-cyan-400 text-sm flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  Add Contact
                </button>
              </div>

              {contacts.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400">No emergency contacts added yet</p>
                  <button
                    onClick={() => setShowAddForm(true)}
                    className="mt-4 px-4 py-2 rounded-xl bg-cyan-500/20 text-cyan-400 text-sm"
                  >
                    Add your first contact
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {contacts.map((contact, idx) => (
                    <motion.div
                      key={contact.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className={`flex items-center justify-between p-4 rounded-xl ${
                        contact.isPrimary ? "bg-cyan-500/10 border border-cyan-500/20" : "bg-white/5"
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-white font-medium">{contact.name}</p>
                          {contact.isPrimary && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400">
                              Primary
                            </span>
                          )}
                          <span className="text-sm text-gray-400">({contact.relation})</span>
                        </div>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-sm text-gray-400 flex items-center gap-1">
                            <Phone className="w-3 h-3" /> {contact.phone}
                          </span>
                          {contact.email && (
                            <span className="text-sm text-gray-400 flex items-center gap-1">
                              <Mail className="w-3 h-3" /> {contact.email}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {!contact.isPrimary && (
                          <button
                            onClick={() => setPrimaryContact(contact.id)}
                            className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 transition"
                          >
                            <Shield className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => testAlert(contact)}
                          className="p-2 rounded-lg bg-green-500/10 text-green-400 hover:bg-green-500/20 transition"
                        >
                          <Phone className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => removeContact(contact.id)}
                          className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Emergency Instructions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-6 glass rounded-2xl p-6"
            >
              <h2 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                <Bell className="w-5 h-5 text-yellow-400" />
                Emergency Instructions
              </h2>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>• Press the SOS button for immediate assistance</li>
                <li>• Emergency contacts will receive SMS and call alerts</li>
                <li>• Your location will be shared with emergency contacts</li>
                <li>• Keep your phone accessible at all times</li>
                <li>• Update emergency contacts if any details change</li>
              </ul>
            </motion.div>
          </div>
        </main>
      </div>

      {/* Add Contact Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass rounded-2xl p-6 max-w-md w-full"
          >
            <h2 className="text-xl font-bold text-white mb-4">Add Emergency Contact</h2>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Full name"
                value={newContact.name}
                onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-gray-500 focus:outline-none focus:border-cyan-500"
              />
              <select
                value={newContact.relation}
                onChange={(e) => setNewContact({ ...newContact, relation: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="">Select relation</option>
                <option value="Spouse">Spouse</option>
                <option value="Son">Son</option>
                <option value="Daughter">Daughter</option>
                <option value="Parent">Parent</option>
                <option value="Sibling">Sibling</option>
                <option value="Friend">Friend</option>
                <option value="Neighbor">Neighbor</option>
                <option value="Nurse">Nurse</option>
              </select>
              <input
                type="tel"
                placeholder="Phone number"
                value={newContact.phone}
                onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-gray-500 focus:outline-none focus:border-cyan-500"
              />
              <input
                type="email"
                placeholder="Email (optional)"
                value={newContact.email}
                onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-gray-500 focus:outline-none focus:border-cyan-500"
              />
              <div className="flex gap-3">
                <button
                  onClick={addContact}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-medium"
                >
                  Add Contact
                </button>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="px-6 py-3 rounded-xl glass text-gray-400 hover:text-white"
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
