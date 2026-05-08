import { NextRequest, NextResponse } from 'next/server';

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

const SYMPTOM_ANALYSIS_PROMPT = `You are CarePulse AI, an expert medical symptom analyzer. Given a patient's symptoms along with their complete health profile, provide a thorough analysis.

You MUST respond with ONLY valid JSON (no markdown, no code blocks). Use this exact format:

{
  "urgencyLevel": "low|moderate|high|emergency",
  "urgencyScore": <number 1-10>,
  "possibleConditions": [
    {
      "name": "condition name",
      "likelihood": "low|moderate|high",
      "description": "Brief explanation of why this condition matches"
    }
  ],
  "immediateActions": ["action1", "action2"],
  "selfCareTips": ["tip1", "tip2", "tip3"],
  "medicationWarnings": ["any warning about current medications interacting with symptoms or conditions"],
  "shouldSeeDoctor": true/false,
  "doctorTimeframe": "immediately|within 24 hours|within a week|routine checkup",
  "relatedToExistingConditions": "explanation of how symptoms may relate to their existing health conditions, or empty string if no known conditions",
  "followUpQuestions": ["question AI would ask to narrow down diagnosis"]
}

IMPORTANT:
- Cross-reference symptoms with the patient's existing health conditions
- Check if symptoms could be side effects of their current medications
- Consider age, gender, BMI, and medical history
- Be thorough but compassionate
- Flag medication interactions or warnings
- If the patient has diabetes and reports dizziness, consider blood sugar issues
- If the patient is on BP medication and reports fatigue, consider medication effects
- Provide ONLY JSON, nothing else`;

export async function POST(request: NextRequest) {
  try {
    const { symptoms, duration, severity, patientContext } = await request.json();

    if (!symptoms || symptoms.length === 0) {
      return NextResponse.json(
        { error: 'Symptoms are required' },
        { status: 400 }
      );
    }

    // If Groq API is available, use AI analysis
    if (GROQ_API_KEY) {
      try {
        const userMessage = `Analyze these symptoms for the following patient:

SYMPTOMS: ${symptoms.join(', ')}
DURATION: ${duration || 'Not specified'}
SEVERITY: ${severity || 'moderate'}

${patientContext || 'No patient profile data available.'}`;

        const response = await fetch(GROQ_API_URL, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${GROQ_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'llama-3.3-70b-versatile',
            messages: [
              { role: 'system', content: SYMPTOM_ANALYSIS_PROMPT },
              { role: 'user', content: userMessage },
            ],
            temperature: 0.3,
            max_tokens: 1500,
            response_format: { type: 'json_object' },
          }),
        });

        if (response.ok) {
          const data = await response.json();
          const content = data.choices?.[0]?.message?.content;

          if (content) {
            const analysis = JSON.parse(content);
            return NextResponse.json({
              success: true,
              analysis,
              aiPowered: true,
              disclaimer: 'This is an AI-powered symptom analysis for informational purposes only. It is NOT a medical diagnosis. Please consult a healthcare professional for proper medical advice.',
              timestamp: new Date().toISOString(),
            });
          }
        }
      } catch (aiError) {
        console.error('AI analysis failed, falling back to rule-based:', aiError);
      }
    }

    // Fallback: rule-based analysis if AI is unavailable
    const analysis = fallbackAnalysis(symptoms, severity);

    return NextResponse.json({
      success: true,
      analysis,
      aiPowered: false,
      disclaimer: 'This is a basic symptom analysis for informational purposes only. It is NOT a medical diagnosis.',
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Symptom analysis error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze symptoms' },
      { status: 500 }
    );
  }
}

// Fallback rule-based analysis when AI is unavailable
function fallbackAnalysis(symptoms: string[], severity: string) {
  const lowerSymptoms = symptoms.map(s => s.toLowerCase());

  const emergencyKeywords = ['chest pain', 'difficulty breathing', 'severe headache', 'loss of consciousness', 'paralysis'];
  const isEmergency = emergencyKeywords.some(k => lowerSymptoms.some(s => s.includes(k)));

  const urgencyLevel = isEmergency ? 'emergency' : severity === 'severe' ? 'high' : severity === 'moderate' ? 'moderate' : 'low';
  const urgencyScore = isEmergency ? 9 : severity === 'severe' ? 7 : severity === 'moderate' ? 5 : 3;

  return {
    urgencyLevel,
    urgencyScore,
    possibleConditions: [
      {
        name: 'General Health Assessment Needed',
        likelihood: 'moderate',
        description: `Based on symptoms: ${symptoms.join(', ')}. A doctor can provide proper evaluation.`,
      },
    ],
    immediateActions: isEmergency
      ? ['Call emergency services immediately', 'Do not drive yourself']
      : ['Monitor your symptoms', 'Rest and stay hydrated'],
    selfCareTips: [
      'Stay hydrated and rest adequately',
      'Monitor your symptoms for any changes',
      'Avoid self-medication without doctor advice',
    ],
    medicationWarnings: [],
    shouldSeeDoctor: severity !== 'mild',
    doctorTimeframe: isEmergency ? 'immediately' : severity === 'severe' ? 'within 24 hours' : 'within a week',
    relatedToExistingConditions: '',
    followUpQuestions: [
      'Have you experienced these symptoms before?',
      'Are you currently taking any medications?',
    ],
  };
}
