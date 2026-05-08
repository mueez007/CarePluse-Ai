import { NextRequest } from 'next/server';

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

const HEALTH_INTELLIGENCE_PROMPT = `You are CarePulse AI, an expert health risk prediction engine. Given a patient's complete health profile, analyze their data and predict health risks.

You MUST respond with ONLY valid JSON (no markdown, no code blocks, no explanation outside JSON). Use this exact format:

{
  "overallHealthScore": <number 0-100>,
  "riskPredictions": [
    {
      "condition": "Diabetes",
      "riskPercentage": <number 0-100>,
      "riskLevel": "low|medium|high|very-high",
      "confidence": "high|medium|low",
      "keyFactors": ["factor1", "factor2"],
      "prediction": "Brief 1-2 sentence prediction about this risk",
      "preventionTips": ["tip1", "tip2", "tip3"]
    },
    {
      "condition": "Hypertension",
      "riskPercentage": <number>,
      "riskLevel": "low|medium|high|very-high",
      "confidence": "high|medium|low",
      "keyFactors": [],
      "prediction": "",
      "preventionTips": []
    },
    {
      "condition": "Heart Disease",
      "riskPercentage": <number>,
      "riskLevel": "low|medium|high|very-high",
      "confidence": "high|medium|low",
      "keyFactors": [],
      "prediction": "",
      "preventionTips": []
    },
    {
      "condition": "Anemia",
      "riskPercentage": <number>,
      "riskLevel": "low|medium|high|very-high",
      "confidence": "high|medium|low",
      "keyFactors": [],
      "prediction": "",
      "preventionTips": []
    }
  ],
  "healthInsights": [
    "insight1 about their overall health pattern",
    "insight2 about diet/lifestyle connection",
    "insight3 about medication considerations"
  ],
  "urgentWarnings": ["any urgent warning if applicable, or empty array"],
  "dietaryAdvice": ["advice1 based on their food history and conditions", "advice2"],
  "lifestyleRecommendations": ["recommendation1", "recommendation2", "recommendation3"],
  "nextCheckups": ["checkup1 they should schedule", "checkup2"]
}

IMPORTANT RULES:
- Base predictions on the actual patient data provided (age, BMI, conditions, medications, food history)
- Be evidence-based but compassionate
- If patient has existing conditions like diabetes, their related risk should be higher
- Factor in BMI, age, gender, medications, and food patterns
- If food history shows unhealthy patterns (high-risk foods), factor that into predictions
- Consider medication interactions and side effects
- Respond ONLY with the JSON object, nothing else`;

export async function POST(request: NextRequest) {
  try {
    if (!GROQ_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'GROQ_API_KEY not configured' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const { patientContext } = await request.json();

    if (!patientContext) {
      return new Response(
        JSON.stringify({ error: 'Patient context is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: HEALTH_INTELLIGENCE_PROMPT },
          { role: 'user', content: `Analyze this patient's health profile and predict their health risks:\n\n${patientContext}` },
        ],
        temperature: 0.3,
        max_tokens: 2000,
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Groq API error:', errorText);
      return new Response(
        JSON.stringify({ error: 'AI service unavailable' }),
        { status: 502, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      return new Response(
        JSON.stringify({ error: 'No analysis generated' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Parse the JSON response
    let analysis;
    try {
      analysis = JSON.parse(content);
    } catch {
      console.error('Failed to parse AI response:', content);
      return new Response(
        JSON.stringify({ error: 'Failed to parse AI analysis' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        analysis,
        timestamp: new Date().toISOString(),
        disclaimer: 'This AI-powered health analysis is for informational purposes only. Always consult a healthcare professional for medical decisions.',
      }),
      { headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Health intelligence error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to generate health analysis' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
