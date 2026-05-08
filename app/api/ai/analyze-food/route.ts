import { NextRequest, NextResponse } from 'next/server';

// This would use Google Gemini API in production
// import { GoogleGenerativeAI } from '@google/generative-ai';

// const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(request: NextRequest) {
  try {
    const { image, userProfile } = await request.json();

    if (!image) {
      return NextResponse.json(
        { error: 'Image is required' },
        { status: 400 }
      );
    }

    // In production with Gemini Vision:
    /*
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const prompt = `Analyze this food image and provide:
    1. Food name
    2. Estimated health score (0-100)
    3. Risk level (Low/Medium/High/Very High)
    4. Brief explanation
    5. 3 recommendations based on user health profile
    
    User has: ${JSON.stringify(userProfile)}
    
    IMPORTANT: Provide estimates, not exact nutritional values. Be honest about limitations.`;
    
    const result = await model.generateContent([prompt, { inlineData: { data: image.split(',')[1], mimeType: 'image/jpeg' } }]);
    const response = await result.response;
    const text = response.text();
    */

    // Mock response for development
    const mockAnalysis = {
      foodName: "Masala Dosa with Sambar and Coconut Chutney",
      healthScore: 65,
      riskLevel: "medium",
      explanation: "This meal contains moderate carbohydrates from the rice and potato filling. The sambar adds protein from lentils, but coconut chutney is high in saturated fats.",
      recommendations: [
        "Ask for less oil/ghee on the dosa",
        "Skip or reduce the coconut chutney portion",
        "Add a side of fresh vegetables for fiber"
      ],
      detectedIngredients: ["Rice batter", "Fermented lentils", "Potato", "Onions", "Coconut", "Lentils", "Spices"],
      estimatedNutrition: {
        calories: "450-550",
        carbs: "High",
        protein: "Medium",
        fat: "Medium-High"
      }
    };

    // Check for high-risk conditions
    let isHighRisk = false;
    let riskReason = "";

    if (userProfile?.conditions) {
      if (userProfile.conditions.includes("Diabetes") && mockAnalysis.healthScore < 70) {
        isHighRisk = true;
        riskReason = "High carbohydrate content may affect blood sugar levels";
      }
      if (userProfile.conditions.includes("BP") && mockAnalysis.estimatedNutrition.fat === "Medium-High") {
        isHighRisk = true;
        riskReason = "High fat content may affect blood pressure";
      }
      if (userProfile.conditions.includes("Kidney Disease") && mockAnalysis.estimatedNutrition.protein === "High") {
        isHighRisk = true;
        riskReason = "High protein content may strain kidneys";
      }
    }

    return NextResponse.json({
      ...mockAnalysis,
      isHighRisk,
      riskReason,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Food analysis error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze food image' },
      { status: 500 }
    );
  }
}

// Helper function to extract user health conditions from profile
function extractHealthConditions(userProfile: any): string[] {
  const conditions: string[] = [];
  
  if (userProfile?.healthConditions) {
    return userProfile.healthConditions;
  }
  
  if (userProfile?.conditions) {
    return userProfile.conditions;
  }
  
  return [];
}
