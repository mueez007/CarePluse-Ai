// Central Health Data Service
// Aggregates all patient data from localStorage into a unified profile
// Used by all features: Risk Screening, Symptom Checker, Chat, Food Scanner

export interface BasicDetails {
  name: string;
  age: string;
  gender: string;
  weight: string;
  height: string;
  bloodGroup: string;
}

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  timing: string;
  frequency?: string;
}

export interface FoodScanRecord {
  foodName: string;
  healthScore: number;
  riskLevel: string;
  calories?: string;
  protein?: string;
  carbs?: string;
  fat?: string;
  explanation: string;
  recommendations: string[];
  ingredients: string[];
  allergens?: string[];
  timestamp: string;
}

export interface RiskAssessmentRecord {
  type: 'diabetes' | 'hypertension' | 'heart' | 'anemia';
  riskLevel: string;
  percentage: number;
  factors: string[];
  recommendations: string[];
  timestamp: string;
}

export interface HealthProfile {
  basicDetails: BasicDetails | null;
  healthConditions: string[];
  medications: Medication[];
  foodHistory: FoodScanRecord[];
  riskHistory: RiskAssessmentRecord[];
  emergencyContacts: any[];
  userName: string;
  bmi: number | null;
}

// ─── Data Retrieval ─────────────────────────────────────

export function getBasicDetails(): BasicDetails | null {
  if (typeof window === 'undefined') return null;
  const data = localStorage.getItem('onboarding_basic_details');
  return data ? JSON.parse(data) : null;
}

export function getHealthConditions(): string[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem('onboarding_health_conditions');
  return data ? JSON.parse(data) : [];
}

export function getMedications(): Medication[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem('onboarding_medications') || localStorage.getItem('medications');
  return data ? JSON.parse(data) : [];
}

export function getEmergencyContacts(): any[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem('onboarding_emergency_contacts');
  return data ? JSON.parse(data) : [];
}

export function getFoodHistory(): FoodScanRecord[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem('carepulse_food_history');
  return data ? JSON.parse(data) : [];
}

export function getRiskHistory(): RiskAssessmentRecord[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem('carepulse_risk_history');
  return data ? JSON.parse(data) : [];
}

export function getUserName(): string {
  if (typeof window === 'undefined') return 'User';
  const details = getBasicDetails();
  if (details?.name) return details.name;
  const user = localStorage.getItem('carepulse_user');
  if (user) return JSON.parse(user).name || 'User';
  return 'User';
}

export function calculateBMI(weight: string, height: string): number | null {
  const w = parseFloat(weight);
  const h = parseFloat(height);
  if (!w || !h || h === 0) return null;
  return parseFloat((w / Math.pow(h / 100, 2)).toFixed(1));
}

// ─── Full Health Profile ────────────────────────────────

export function getFullHealthProfile(): HealthProfile {
  const basicDetails = getBasicDetails();
  const bmi = basicDetails ? calculateBMI(basicDetails.weight, basicDetails.height) : null;

  return {
    basicDetails,
    healthConditions: getHealthConditions(),
    medications: getMedications(),
    foodHistory: getFoodHistory(),
    riskHistory: getRiskHistory(),
    emergencyContacts: getEmergencyContacts(),
    userName: getUserName(),
    bmi,
  };
}

// ─── Data Persistence ───────────────────────────────────

export function saveFoodScan(record: Omit<FoodScanRecord, 'timestamp'>) {
  const history = getFoodHistory();
  const newRecord: FoodScanRecord = {
    ...record,
    timestamp: new Date().toISOString(),
  };
  // Keep last 20 scans
  const updated = [newRecord, ...history].slice(0, 20);
  localStorage.setItem('carepulse_food_history', JSON.stringify(updated));
  return updated;
}

export function saveRiskAssessment(record: Omit<RiskAssessmentRecord, 'timestamp'>) {
  const history = getRiskHistory();
  const newRecord: RiskAssessmentRecord = {
    ...record,
    timestamp: new Date().toISOString(),
  };
  // Keep last assessment per type + last 10 overall
  const updated = [newRecord, ...history.filter(r => r.type !== record.type)].slice(0, 10);
  localStorage.setItem('carepulse_risk_history', JSON.stringify(updated));
  return updated;
}

// ─── AI Context Builder ─────────────────────────────────
// Generates a comprehensive patient summary for AI prompts

export function buildPatientContext(): string {
  const profile = getFullHealthProfile();
  const parts: string[] = [];

  parts.push('=== PATIENT HEALTH PROFILE ===');

  if (profile.basicDetails) {
    const d = profile.basicDetails;
    parts.push(`Patient: ${d.name}, Age: ${d.age}, Gender: ${d.gender}`);
    parts.push(`Weight: ${d.weight}kg, Height: ${d.height}cm, BMI: ${profile.bmi || 'Unknown'}`);
    parts.push(`Blood Group: ${d.bloodGroup}`);
  }

  if (profile.healthConditions.length > 0) {
    parts.push(`\nKnown Health Conditions: ${profile.healthConditions.join(', ')}`);
  } else {
    parts.push('\nNo known health conditions reported.');
  }

  if (profile.medications.length > 0) {
    parts.push('\nCurrent Medications:');
    profile.medications.forEach(m => {
      parts.push(`  - ${m.name} ${m.dosage} (${m.timing})`);
    });
  } else {
    parts.push('\nNo medications currently listed.');
  }

  // Recent food history
  if (profile.foodHistory.length > 0) {
    parts.push('\nRecent Food History (last 5 scans):');
    profile.foodHistory.slice(0, 5).forEach(f => {
      const date = new Date(f.timestamp).toLocaleDateString();
      parts.push(`  - ${f.foodName}: Score ${f.healthScore}/100 (${f.riskLevel} risk) on ${date}`);
      if (f.allergens && f.allergens.length > 0) {
        parts.push(`    Allergens: ${f.allergens.join(', ')}`);
      }
    });
  }

  // Risk assessment history
  if (profile.riskHistory.length > 0) {
    parts.push('\nPrevious Risk Assessments:');
    profile.riskHistory.forEach(r => {
      const date = new Date(r.timestamp).toLocaleDateString();
      parts.push(`  - ${r.type}: ${r.percentage}% (${r.riskLevel}) on ${date}`);
    });
  }

  parts.push('\n=== END PATIENT PROFILE ===');

  return parts.join('\n');
}
