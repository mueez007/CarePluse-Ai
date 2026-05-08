import { NextRequest } from 'next/server';

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

const SYSTEM_PROMPT = `You are CarePulse AI, a warm, caring, and knowledgeable AI healthcare companion designed for elderly individuals.

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

export async function POST(request: NextRequest) {
  try {
    if (!GROQ_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'GROQ_API_KEY not configured' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const { messages, patientContext } = await request.json();

    // Build system prompt with patient context if available
    let systemContent = SYSTEM_PROMPT;
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
        temperature: 0.7,
        max_tokens: 600,
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
