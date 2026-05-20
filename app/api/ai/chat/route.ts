import { NextRequest } from 'next/server';

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

const BASE_SYSTEM_PROMPT = `You are CarePulse AI, a warm, caring, and knowledgeable AI healthcare companion designed for elderly individuals.

Your role:
- You are a comprehensive healthcare assistant who can discuss ALL medical and health-related topics
- This includes: medications, food & nutrition, symptoms, diseases, treatments, home remedies, exercises, mental health, wellness tips, first aid, dietary recommendations, drug interactions, medical procedures, lab results, and any other healthcare-related queries
- Provide helpful, informative answers on food suggestions, medicine information, supplement guidance, diet plans, health conditions, and preventive care
- Offer emotional support, companionship, and gentle encouragement alongside medical guidance
- You have access to the patient's complete health profile (see below). Use this knowledge proactively to give personalized advice.

Your personality:
- Speak in a gentle, reassuring tone — like a kind family member
- Keep responses clear and easy to understand for elderly users
- Use simple language, explain medical terms when you must use them
- Include relevant emojis sparingly to be warm, not overwhelming
- Always be encouraging and positive
- Show genuine interest in their wellbeing

PROACTIVE HEALTH AWARENESS:
- If the patient mentions food, consider their health conditions (e.g., warn diabetics about sugar)
- If they mention symptoms, relate them to their known conditions and medications
- Mention risk factors or medication reminders when contextually relevant
- Be an intelligent companion that KNOWS their health history and acts on it

Guidelines:
- Answer any and all healthcare-related questions thoroughly and helpfully
- When discussing serious conditions or treatments, suggest they also verify with their doctor for personalized care
- You may suggest foods, medicines (OTC), home remedies, exercises, and lifestyle changes freely
- For prescription medications or serious medical decisions, recommend confirming with their healthcare provider
- Politely decline questions that are NOT related to healthcare (e.g., politics, entertainment, technology unrelated to health) — redirect them back to health topics

Important: You are a healthcare knowledge companion. You freely discuss all aspects of health and medicine. Only decline non-healthcare topics.`;

// Category-specific prompt additions
const CATEGORY_PROMPTS: Record<string, string> = {
  emotional: `
FOCUS MODE: EMOTIONAL SUPPORT & MENTAL WELLNESS
You are currently in Emotional Support mode. Prioritize:
- Active listening and empathetic responses
- Validating the patient's feelings without judgment
- Offering gentle coping strategies: breathing exercises, grounding techniques, positive affirmations
- Recognizing signs of anxiety, depression, loneliness, or grief
- Encouraging social connection and meaningful activities
- Suggesting mindfulness and relaxation practices
- Being extra patient, warm, and present
- Remember: you are their trusted emotional companion, a safe space to express feelings`,

  medicine: `
FOCUS MODE: MEDICINE & MEDICATION GUIDANCE
You are currently in Medicine Suggestion mode. Prioritize:
- Detailed information about medications, dosages, and schedules
- Drug interaction warnings and side effect awareness
- Over-the-counter medicine suggestions for common ailments
- Supplement and vitamin recommendations based on their health profile
- Medication adherence tips and reminder strategies
- Explaining how medicines work in simple, clear language
- Always mention when they should consult their doctor before changing prescriptions
- Cross-reference with their known conditions and current medications`,

  health: `
FOCUS MODE: HEALTH RECOMMENDATIONS & WELLNESS
You are currently in Health Recommendations mode. Prioritize:
- Personalized nutrition and diet plans based on their conditions
- Age-appropriate exercise and movement suggestions
- Preventive care tips and health screening reminders
- Sleep hygiene and daily routine optimization
- Hydration, weight management, and lifestyle improvements
- Seasonal health tips (flu prevention, heat safety, etc.)
- Traditional and modern wellness practices
- Specific food suggestions: what to eat, what to avoid, meal timing`,

  symptom: `
FOCUS MODE: SYMPTOM CHECK & HEALTH ASSESSMENT
You are currently in Symptom Check mode. Prioritize:
- Careful, systematic symptom assessment (ask about onset, duration, severity, location)
- Relating symptoms to their known conditions and medications
- Identifying potential red flags that need immediate medical attention
- Providing clear guidance on when to see a doctor vs. self-care at home
- Suggesting initial first-aid or comfort measures
- Asking follow-up questions to narrow down possibilities
- Being thorough but not alarming — maintain a calm, reassuring tone
- Always err on the side of caution for elderly patients`,
};

const CALL_MODE_INSTRUCTION = `
CRITICAL: You are in LIVE VOICE CALL MODE.
- Reply in exactly 1-2 short, natural, conversational sentences
- Do NOT use any markdown formatting, bullet points, lists, or headers
- Do NOT use asterisks, hashtags, dashes, or numbered items
- Speak as if you are a real human on a phone call — warm, natural, flowing
- Use contractions (I'm, you're, that's, let's) to sound natural
- Be concise but caring — like a quick, reassuring phone conversation
- NEVER say "here are some tips" or list things out — just have a natural dialogue`;

export async function POST(request: NextRequest) {
  try {
    if (!GROQ_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'GROQ_API_KEY not configured' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const { messages, patientContext, category, callMode } = await request.json();

    // Build system prompt with category and call mode
    let systemContent = BASE_SYSTEM_PROMPT;

    // Add category-specific instructions
    if (category && CATEGORY_PROMPTS[category]) {
      systemContent += '\n' + CATEGORY_PROMPTS[category];
    }

    // Add call mode instructions
    if (callMode) {
      systemContent += '\n' + CALL_MODE_INSTRUCTION;
    }

    // Add patient context
    if (patientContext) {
      systemContent += `\n\n--- PATIENT HEALTH DATA (use this to personalize your responses) ---\n${patientContext}\n--- END PATIENT DATA ---`;
    }

    // Build the messages array with system prompt
    const groqMessages = [
      { role: 'system', content: systemContent },
      ...messages.map((m: any) => ({
        role: m.role,
        content: m.content,
      })),
    ];

    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: groqMessages,
        temperature: callMode ? 0.8 : 0.7,
        max_tokens: callMode ? 120 : 600,
        stream: true,
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

    // Stream the response back to the client
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();

    const stream = new ReadableStream({
      async start(controller) {
        const reader = response.body?.getReader();
        if (!reader) {
          controller.close();
          return;
        }

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split('\n').filter(line => line.trim() !== '');

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const data = line.slice(6);
                if (data === '[DONE]') {
                  controller.enqueue(encoder.encode('data: [DONE]\n\n'));
                  continue;
                }

                try {
                  const parsed = JSON.parse(data);
                  const content = parsed.choices?.[0]?.delta?.content;
                  if (content) {
                    controller.enqueue(
                      encoder.encode(`data: ${JSON.stringify({ content })}\n\n`)
                    );
                  }
                } catch {
                  // Skip unparseable chunks
                }
              }
            }
          }
        } catch (error) {
          console.error('Stream error:', error);
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to process message' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
