import { NextRequest, NextResponse } from 'next/server';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

async function fetchWithRetry(url: string, options: RequestInit, maxRetries = 3): Promise<Response> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    const response = await fetch(url, options);
    if (response.ok) return response;
    if (response.status === 429 || response.status === 503) {
      const waitMs = Math.min(2000 * Math.pow(2, attempt), 15000);
      console.log(`Gemini rate limited (attempt ${attempt + 1}/${maxRetries}), waiting ${waitMs}ms...`);
      await new Promise(resolve => setTimeout(resolve, waitMs));
      continue;
    }
    return response;
  }
  return fetch(url, options);
}

export async function POST(request: NextRequest) {
  try {
    if (!GEMINI_API_KEY) {
      return NextResponse.json({ error: 'GEMINI_API_KEY not configured' }, { status: 500 });
    }

    const { image, userConditions } = await request.json();

    if (!image) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 });
    }

    // Extract base64 data from data URL
    const base64Match = image.match(/^data:(.+);base64,(.+)$/);
    if (!base64Match) {
      return NextResponse.json({ error: 'Invalid image format' }, { status: 400 });
    }

    const mimeType = base64Match[1];
    const base64Data = base64Match[2];

    const conditionsContext = userConditions?.length > 0
      ? `The user has the following health conditions: ${userConditions.join(', ')}. Factor these conditions into your health assessment and recommendations.`
      : 'No specific health conditions reported.';

    const prompt = `You are a food nutrition and health analysis AI. Analyze this food image carefully.

Identify EXACTLY what food this is. Be specific and accurate — look at the color, texture, shape, and cooking method. Do NOT guess randomly. If it's chicken, say chicken. If it's a curry, identify the type. If it's rice, say rice. Be precise.

${conditionsContext}

Provide your analysis in this EXACT JSON format (no other text):
{
  "foodName": "Exact name of the food (e.g., 'Grilled Chicken Breast', 'Masala Dosa', 'Caesar Salad')",
  "healthScore": 75,
  "riskLevel": "low",
  "calories": "approximate calories per serving",
  "protein": "approximate grams",
  "carbs": "approximate grams",
  "fat": "approximate grams",
  "fiber": "approximate grams",
  "explanation": "2-3 sentence explanation of the nutritional value and health impact",
  "ingredients": ["ingredient1", "ingredient2", "ingredient3"],
  "recommendations": ["recommendation 1", "recommendation 2", "recommendation 3"],
  "allergens": ["any common allergens detected"],
  "dietaryInfo": ["vegan", "gluten-free", etc. — whatever applies]
}

Rules for healthScore (0-100):
- 80-100: Very healthy (salads, fruits, lean proteins, whole grains)
- 60-79: Moderately healthy (balanced meals, some processed foods)
- 40-59: Less healthy (fried foods, high sugar/salt)
- 0-39: Unhealthy (deep fried, excessive sugar, junk food)

Rules for riskLevel: "low", "medium", "high", or "very-high"

Be ACCURATE about the food identification. Do not confuse chicken with dosa or rice with bread.`;

    const models = ['gemini-2.5-flash-lite', 'gemini-2.5-flash', 'gemini-2.5-flash-preview-04-17'];

    for (const model of models) {
      try {
        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`;

        const payload = {
          contents: [{
            parts: [
              { text: prompt },
              { inline_data: { mime_type: mimeType, data: base64Data } }
            ]
          }],
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 2048,
          }
        };

        console.log(`Food analysis: trying ${model}`);

        const response = await fetchWithRetry(geminiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }, 2);

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`Food analysis ${model} error:`, errorText);
          continue;
        }

        const data = await response.json();
        const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

        // Parse JSON from response
        let analysis;
        try {
          let cleanJson = responseText
            .replace(/```json\n?/g, '')
            .replace(/```\n?/g, '')
            .trim();
          analysis = JSON.parse(cleanJson);
        } catch {
          const jsonMatch = responseText.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            try { analysis = JSON.parse(jsonMatch[0]); } catch { continue; }
          } else continue;
        }

        return NextResponse.json({
          success: true,
          analysis,
          model,
        });
      } catch (err: any) {
        console.error(`Food analysis ${model} failed:`, err.message);
        continue;
      }
    }

    return NextResponse.json(
      { error: 'AI service is temporarily busy. Please try again in 30 seconds.', retryAfter: 30 },
      { status: 429 }
    );
  } catch (error: any) {
    console.error('Food analysis error:', error);
    return NextResponse.json({ error: error.message || 'Failed to analyze food' }, { status: 500 });
  }
}
