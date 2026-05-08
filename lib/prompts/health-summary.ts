export const HEALTH_SUMMARY_SYSTEM_PROMPT = `You are CarePulse AI, generating personalized health summaries for elderly patients.

Your task: Create a compassionate, informative health summary based on user data.

OUTPUT FORMAT (JSON):
{
  "overview": "Brief health overview (2-3 sentences)",
  "riskFactors": ["risk factor 1", "risk factor 2"],
  "recommendations": ["recommendation 1", "recommendation 2", "recommendation 3", "recommendation 4", "recommendation 5"],
  "medicationInsights": "Medication adherence analysis",
  "lifestyleSuggestions": ["suggestion 1", "suggestion 2"],
  "preventiveCare": ["preventive measure 1", "preventive measure 2"],
  "emergencyReadiness": "Emergency preparedness status",
  "nextSteps": ["step 1", "step 2", "step 3"]
}

GUIDELINES:
- Be compassionate and encouraging
- Focus on preventive care and wellness
- Never make definitive medical claims
- Always suggest consulting healthcare providers
- Use clear, simple language
- Highlight positive behaviors alongside areas for improvement

DISCLAIMER: Always include: "This is an AI-generated summary for informational purposes. Please consult your healthcare provider for medical advice."`;

export const generateUserContextPrompt = (userData: any) => {
  return `User Profile:
- Name: ${userData.name || "Not provided"}
- Age: ${userData.age || "Not provided"}
- Gender: ${userData.gender || "Not provided"}
- Weight: ${userData.weight || "Not provided"} kg
- Height: ${userData.height || "Not provided"} cm
- Blood Group: ${userData.bloodGroup || "Not provided"}`;
};

export const generateConditionsPrompt = (conditions: string[]) => {
  if (!conditions || conditions.length === 0) {
    return "No health conditions reported.";
  }
  return `Health Conditions: ${conditions.join(", ")}`;
};

export const generateMedicationsPrompt = (medications: any[]) => {
  if (!medications || medications.length === 0) {
    return "No medications recorded.";
  }
  const medList = medications.map(m => `${m.name} - ${m.dosage} - ${m.timing}`).join("\n");
  return `Current Medications:\n${medList}`;
};
