"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface BasicDetails {
  name: string;
  age: string;
  gender: string;
  weight: string;
  height: string;
  bloodGroup: string;
}

interface HealthConditions {
  conditions: string[];
}

interface Medication {
  id: string;
  name: string;
  dosage: string;
  timing: string;
  frequency: string;
}

interface LanguageVoice {
  language: string;
  voiceType: string;
  reminderStyle: string;
}

interface EmergencyContact {
  id: string;
  name: string;
  relation: string;
  phone: string;
  email: string;
  isPrimary: boolean;
}

interface OnboardingState {
  currentStep: number;
  basicDetails: BasicDetails | null;
  healthConditions: HealthConditions | null;
  medications: Medication[];
  languageVoice: LanguageVoice | null;
  emergencyContacts: EmergencyContact[];
  isComplete: boolean;
  
  // Actions
  setCurrentStep: (step: number) => void;
  setBasicDetails: (details: BasicDetails) => void;
  setHealthConditions: (conditions: HealthConditions) => void;
  addMedication: (medication: Medication) => void;
  removeMedication: (id: string) => void;
  setMedications: (medications: Medication[]) => void;
  setLanguageVoice: (preferences: LanguageVoice) => void;
  addEmergencyContact: (contact: EmergencyContact) => void;
  removeEmergencyContact: (id: string) => void;
  setEmergencyContacts: (contacts: EmergencyContact[]) => void;
  completeOnboarding: () => void;
  resetOnboarding: () => void;
}

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set) => ({
      currentStep: 0,
      basicDetails: null,
      healthConditions: null,
      medications: [],
      languageVoice: null,
      emergencyContacts: [],
      isComplete: false,

      setCurrentStep: (step) => set({ currentStep: step }),
      
      setBasicDetails: (details) => set({ basicDetails: details }),
      
      setHealthConditions: (conditions) => set({ healthConditions: conditions }),
      
      addMedication: (medication) => set((state) => ({
        medications: [...state.medications, medication]
      })),
      
      removeMedication: (id) => set((state) => ({
        medications: state.medications.filter(m => m.id !== id)
      })),
      
      setMedications: (medications) => set({ medications }),
      
      setLanguageVoice: (preferences) => set({ languageVoice: preferences }),
      
      addEmergencyContact: (contact) => set((state) => ({
        emergencyContacts: [...state.emergencyContacts, contact]
      })),
      
      removeEmergencyContact: (id) => set((state) => ({
        emergencyContacts: state.emergencyContacts.filter(c => c.id !== id)
      })),
      
      setEmergencyContacts: (contacts) => set({ emergencyContacts: contacts }),
      
      completeOnboarding: () => set({ isComplete: true }),
      
      resetOnboarding: () => set({
        currentStep: 0,
        basicDetails: null,
        healthConditions: null,
        medications: [],
        languageVoice: null,
        emergencyContacts: [],
        isComplete: false,
      }),
    }),
    {
      name: "carepulse-onboarding-storage",
    }
  )
);
