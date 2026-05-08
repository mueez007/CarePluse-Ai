"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { 
  UserPlus, 
  Phone, 
  Mail, 
  Users, 
  Shield, 
  AlertTriangle,
  Check,
  Plus,
  Trash2
} from "lucide-react";

interface EmergencyContact {
  id: string;
  name: string;
  relation: string;
  phone: string;
  email: string;
  isPrimary: boolean;
}

interface EmergencyScreenProps {
  onNext: () => void;
}

const relations = ["Spouse", "Son", "Daughter", "Parent", "Sibling", "Friend", "Neighbor", "Nurse", "Doctor"];

export default function EmergencyScreen({ onNext }: EmergencyScreenProps) {
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [newContact, setNewContact] = useState({
    name: "",
    relation: "",
    phone: "",
    email: "",
  });

  const addContact = () => {
    if (newContact.name && newContact.relation && newContact.phone) {
      const isFirstContact = contacts.length === 0;
      setContacts([
        ...contacts,
        {
          ...newContact,
          id: Date.now().toString(),
          isPrimary: isFirstContact,
        },
      ]);
      setNewContact({ name: "", relation: "", phone: "", email: "" });
      setShowForm(false);
    }
  };

  const removeContact = (id: string) => {
    setContacts(contacts.filter(c => c.id !== id));
  };

  const setPrimaryContact = (id: string) => {
    setContacts(contacts.map(c => ({
      ...c,
      isPrimary: c.id === id,
    })));
  };

  const handleSubmit = () => {
    if (contacts.length > 0) {
      localStorage.setItem("onboarding_emergency_contacts", JSON.stringify(contacts));
      onNext();
    }
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
            Emergency Contacts
          </h1>
          <p className="text-gray-400">
            Add people who will be notified in case of emergency
          </p>
        </motion.div>

        {/* Warning Message */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-6 p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex items-start gap-3"
        >
          <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-yellow-400">
            <span className="font-semibold">Important:</span> These contacts will receive alerts for:
            <ul className="list-disc list-inside mt-1 text-gray-400">
              <li>High-risk food detection</li>
              <li>Missed medication reminders</li>
              <li>Unusual health patterns</li>
              <li>Emergency situations</li>
            </ul>
          </div>
        </motion.div>

        {/* Contacts List */}
        {contacts.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-3 mb-6"
          >
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-cyan-400" />
              Your Care Team ({contacts.length})
            </h3>
            {contacts.map((contact, idx) => (
              <motion.div
                key={contact.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className={`glass rounded-xl p-4 ${
                  contact.isPrimary ? "border-cyan-500 shadow-lg shadow-cyan-500/20" : ""
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-white">{contact.name}</span>
                      {contact.isPrimary && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400">
                          Primary
                        </span>
                      )}
                      <span className="text-sm text-gray-400">({contact.relation})</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-400 mt-2">
                      <span className="flex items-center gap-1">
                        <Phone className="w-3 h-3" /> {contact.phone}
                      </span>
                      {contact.email && (
                        <span className="flex items-center gap-1">
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
                        title="Set as primary"
                      >
                        <Shield className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => removeContact(contact.id)}
                      className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Add Contact Form */}
        {showForm ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass rounded-xl p-6 mb-6"
          >
            <h3 className="text-lg font-semibold text-white mb-4">Add Emergency Contact</h3>
            
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Full name"
                value={newContact.name}
                onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-cyan-500"
              />
              
              <select
                value={newContact.relation}
                onChange={(e) => setNewContact({ ...newContact, relation: e.target.value })}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="">Select relation</option>
                {relations.map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
              
              <input
                type="tel"
                placeholder="Phone number (with country code)"
                value={newContact.phone}
                onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-cyan-500"
              />
              
              <input
                type="email"
                placeholder="Email address (optional)"
                value={newContact.email}
                onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-cyan-500"
              />
              
              <div className="flex gap-3">
                <button
                  onClick={addContact}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-medium"
                >
                  Add Contact
                </button>
                <button
                  onClick={() => setShowForm(false)}
                  className="px-6 py-3 rounded-xl glass text-gray-400 hover:text-white"
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={() => setShowForm(true)}
            className="w-full mb-6 py-4 rounded-xl glass border border-dashed border-white/20 text-gray-400 hover:text-white hover:border-white/40 transition flex items-center justify-center gap-2"
          >
            <UserPlus className="w-5 h-5" />
            Add Emergency Contact
          </motion.button>
        )}

        {/* Continue Button */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          onClick={handleSubmit}
          disabled={contacts.length === 0}
          className="w-full py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-semibold hover:shadow-lg hover:shadow-cyan-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {contacts.length === 0 ? "Add at least one contact to continue" : "Continue to Create Digital Twin"}
        </motion.button>
      </div>
    </div>
  );
}
