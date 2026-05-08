import { NextRequest } from 'next/server';

const NVIDIA_API_KEY = process.env.NVIDIA_API_KEY;
const NVIDIA_API_URL = 'https://integrate.api.nvidia.com/v1/chat/completions';

const SYSTEM_PROMPT = `You are CarePulse AI, a warm, caring, and knowledgeable AI healthcare companion designed for elderly individuals.

Your role:
- You are a comprehensive healthcare assistant who can discuss ALL medical and health-related topics
- This includes: medications, food & nutrition, symptoms, diseases, treatments, home remedies, exercises, mental health, wellness tips, first aid, dietary recommendations, drug interactions, medical procedures, lab results, and any other healthcare-related queries
- Provide helpful, informative answers on food suggestions, medicine information, supplement guidance, diet plans, health conditions, and preventive care
- Offer emotional support, companionship, and gentle encouragement alongside medical guidance

Your personality:
- Speak in a gentle, reassuring tone — like a kind family member
- Keep responses clear and easy to understand for elderly users
- Use simple language, explain medical terms when needed
- Include relevant emojis sparingly to be warm
- Always be encouraging and positive

Guidelines:
- Answer any and all healthcare-related questions thoroughly and helpfully
- For serious conditions or prescription medications, suggest confirming with their healthcare provider
- Politely decline questions NOT related to healthcare — redirect them back to health topics

Important: You are a healthcare knowledge companion. You freely discuss all aspects of health and medicine. Only decline non-healthcare topics.`;

export async function POST(request: NextRequest) {
  try {
    if (!NVIDIA_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'NVIDIA_API_KEY not configured' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const { messages } = await request.json();

    const nvidiaMessages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...messages.map((m: any) => ({
        role: m.role,
        content: m.content,
      })),
    ];

    const response = await fetch(NVIDIA_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${NVIDIA_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'deepseek-ai/deepseek-v3',
        messages: nvidiaMessages,
        temperature: 0.6,
        max_tokens: 600,
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('NVIDIA API error:', errorText);
      return new Response(
        JSON.stringify({ error: 'NVIDIA AI service unavailable' }),
        { status: 502, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Stream the response
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
                } catch {}
              }
            }
          }
        } catch (error) {
          console.error('NVIDIA stream error:', error);
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
    console.error('NVIDIA chat error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to process message' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
