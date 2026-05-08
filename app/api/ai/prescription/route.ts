import { NextRequest, NextResponse } from 'next/server';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GROQ_API_KEY = process.env.GROQ_API_KEY;

// Retry helper with exponential backoff
async function fetchWithRetry(url: string, options: RequestInit, maxRetries = 3): Promise<Response> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    const response = await fetch(url, options);

    if (response.ok) return response;

    // If rate limited, wait and retry
    if (response.status === 429 || response.status === 503) {
      const retryText = await response.text();
      console.log(`Gemini rate limited (attempt ${attempt + 1}/${maxRetries}), retrying...`);

      // Extract retry delay if available, otherwise use exponential backoff
      const waitMs = Math.min(2000 * Math.pow(2, attempt), 15000);
      await new Promise(resolve => setTimeout(resolve, waitMs));
      continue;
    }

    // Non-retryable error
    return response;
  }

  // Final attempt
  return fetch(url, options);
}

export async function POST(request: NextRequest) {
  try {
    if (!GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'GEMINI_API_KEY not configured' },
        { status: 500 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      );
    }

    // Convert file to base64
    const bytes = await file.arrayBuffer();
    const base64 = Buffer.from(bytes).toString('base64');
    const mimeType = file.type || 'image/jpeg';

    const prescriptionPrompt = `You are a medical prescription reader AI. Analyze this prescription image carefully — it may be handwritten, printed, or a mix of both.

Extract ALL medications found in the prescription. For each medication, provide:
1. name: The medicine/drug name
2. dosage: The dosage amount (e.g., "500mg", "10mg", "5ml")
3. timing: When to take it. Map to one of: "Before Breakfast", "After Breakfast", "Before Lunch", "After Lunch", "Before Dinner", "After Dinner", "Bedtime". If the prescription says "morning" use "After Breakfast", if "evening" use "After Dinner", if "night" use "Bedtime", if "twice daily" list it twice with different timings.
4. frequency: How often (e.g., "daily", "twice daily", "weekly", "as needed")
5. purpose: What condition it's for, if mentioned (e.g., "Blood Pressure", "Diabetes", "Pain Relief")

IMPORTANT: 
- If you can read handwriting, even partially, try your best to identify the medicine names
- If the image is unclear, still try to extract what you can
- If you cannot read any medications, return an empty array

Respond ONLY with a valid JSON array. No other text. Example:
[
  {"name": "Amlodipine", "dosage": "5mg", "timing": "After Breakfast", "frequency": "daily", "purpose": "Blood Pressure"},
  {"name": "Metformin", "dosage": "500mg", "timing": "After Dinner", "frequency": "daily", "purpose": "Diabetes"}
]

If you cannot identify ANY medications, respond with: []`;

    // Try multiple Gemini models in order (flash-lite is less likely to be rate limited)
    const models = ['gemini-2.5-flash-lite', 'gemini-2.5-flash', 'gemini-2.5-flash-preview-04-17'];
    let lastError = '';

    for (const model of models) {
      try {
        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`;

        const geminiPayload = {
          contents: [
            {
              parts: [
                { text: prescriptionPrompt },
                {
                  inline_data: {
                    mime_type: mimeType,
                    data: base64,
                  },
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 2048,
          },
        };

        console.log(`Trying Gemini model: ${model}`);

        const geminiResponse = await fetchWithRetry(geminiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(geminiPayload),
        }, 2);

        if (!geminiResponse.ok) {
          const errorText = await geminiResponse.text();
          console.error(`Gemini ${model} error:`, errorText);
          lastError = errorText;
          continue; // Try next model
        }

        const geminiData = await geminiResponse.json();
        const responseText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || '[]';

        // Parse the JSON response
        const medications = parseJsonResponse(responseText);

        return NextResponse.json({
          success: true,
          medications,
          model,
          rawResponse: responseText,
        });
      } catch (modelError: any) {
        console.error(`Gemini ${model} failed:`, modelError.message);
        lastError = modelError.message;
        continue;
      }
    }

    // All Gemini models failed — return meaningful error
    console.error('All Gemini models exhausted. Last error:', lastError);

    return NextResponse.json(
      {
        error: 'AI service is temporarily busy. Please wait 30 seconds and try again.',
        retryAfter: 30
      },
      { status: 429 }
    );
  } catch (error: any) {
    console.error('Prescription scan error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process prescription' },
      { status: 500 }
    );
  }
}

function parseJsonResponse(responseText: string): any[] {
  try {
    // Remove markdown code fences if present
    let cleanJson = responseText
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();

    return JSON.parse(cleanJson);
  } catch {
    // Try to extract JSON array from the response
    const jsonMatch = responseText.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0]);
      } catch {
        return [];
      }
    }
    return [];
  }
}
