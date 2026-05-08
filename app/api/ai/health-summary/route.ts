import { NextRequest, NextResponse } from 'next/server';

// This would use Google Gemini API in production
// import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(request: NextRequest) {
  try {
    const { userData, healthConditions, medications, reports } = await request.json();

    if (!userData) {
      return NextResponse.json(
        { error: 'User data is required' },
        { status: 400 }
      );
    }

    // Generate a comprehensive health summary
    const summary = {
      overview: generateOverview(userData, healthConditions),
      riskFactors: generateRiskFactors(healthConditions, medications),
      recommendations: generateRecommendations(healthConditions, userData),
      insights: generateInsights(healthConditions, medications),
      createdAt: new Date().toISOString(),
      version: "1.0"
    };

    return NextResponse.json(summary);
  } catch (error) {
    console.error('Health summary error:', error);
    return NextResponse.json(
      { error: 'Failed to generate health summary' },
      { status: 500 }
    );
  }
}

function generateOverview(userData: any, healthConditions: string[]): string {
  const age = userData.age || "unknown";
  const name = userData.name || "Patient";
  const conditionList = healthConditions?.length ? healthConditions.join(", ") : "no reported conditions";
  
  return `${name} is ${age} years old with ${conditionList}. Based on the health profile, they require monitoring of ${healthConditions?.join(", ") || "general health parameters"}.`;
}

function generateRiskFactors(healthConditions: string[], medications: any[]): string[] {
  const risks: string[] = [];
  
  if (healthConditions?.includes("Diabetes")) {
    risks.push("Blood sugar fluctuations - regular monitoring recommended");
    risks.push("Dietary carbohydrate intake needs careful management");
  }
  if (healthConditions?.includes("BP") || healthConditions?.includes("High BP")) {
    risks.push("Blood pressure variability - consistent medication adherence critical");
    risks.push("Sodium intake should be monitored");
  }
  if (healthConditions?.includes("Heart Disease")) {
    risks.push("Cardiovascular events - regular check-ups essential");
    risks.push("Physical activity should be moderated");
  }
  if (healthConditions?.includes("Kidney Disease")) {
    risks.push("Kidney function deterioration - fluid and protein intake monitoring");
  }
  
  if (medications?.length === 0) {
    risks.push("No medications recorded - medication adherence tracking recommended");
  }
  
  return risks.length ? risks : ["No significant risk factors identified based on available data"];
}

function generateRecommendations(healthConditions: string[], userData: any): string[] {
  const recommendations: string[] = [];
  
  recommendations.push("Take medications as prescribed at the scheduled times");
  recommendations.push("Maintain regular health check-ups every 3-6 months");
  
  if (healthConditions?.includes("Diabetes")) {
    recommendations.push("Monitor blood sugar levels daily");
    recommendations.push("Follow a low-glycemic index diet");
  }
  if (healthConditions?.includes("BP")) {
    recommendations.push("Monitor blood pressure twice daily");
    recommendations.push("Reduce sodium intake to less than 1500mg per day");
  }
  if (healthConditions?.includes("Heart Disease")) {
    recommendations.push("Light exercise like walking for 20-30 minutes daily");
    recommendations.push("Avoid stress and practice relaxation techniques");
  }
  
  recommendations.push("Stay hydrated - drink 6-8 glasses of water daily");
  recommendations.push("Get adequate sleep of 7-8 hours each night");
  
  return recommendations;
}

function generateInsights(healthConditions: string[], medications: any[]): any {
  const insights = {
    medicationAdherence: medications?.length > 0 ? "Ready for tracking" : "No medications to track",
    lifestyleFactors: "Moderate activity level recommended",
    preventiveCare: "Annual health screening suggested",
    emergencyReadiness: "⚠️ Emergency contacts not fully configured",
    aiRecommendations: "Enable voice reminders for better medication adherence"
  };
  
  return insights;
}
