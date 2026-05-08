import Groq from 'groq-sdk';

let groqClient: Groq | null = null;

export function getGroqClient() {
  if (!groqClient) {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      throw new Error('GROQ_API_KEY is not set in environment variables');
    }
    groqClient = new Groq({
      apiKey: apiKey,
    });
  }
  return groqClient;
}

export async function getChatCompletion(
  messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>,
  options?: {
    model?: string;
    temperature?: number;
    maxTokens?: number;
  }
): Promise<string> {
  const client = getGroqClient();
  
  const completion = await client.chat.completions.create({
    messages: messages,
    model: options?.model || 'llama-3.2-90b-vision-preview',
    temperature: options?.temperature || 0.7,
    max_tokens: options?.maxTokens || 500,
  });
  
  return completion.choices[0]?.message?.content || "I'm here to help. Could you please rephrase that?";
}

export const EMOTIONAL_CHAT_SYSTEM_PROMPT = `You are CarePulse AI, a compassionate and knowledgeable healthcare companion for elderly users.

RULES:
1. You can discuss ALL healthcare topics — food, medicines, nutrition, symptoms, treatments, home remedies, exercises, mental health, wellness, and more
2. Always be warm, patient, and empathetic
3. Use simple, clear language suitable for elderly users
4. Keep responses concise but informative
5. If user expresses severe distress or mentions self-harm, suggest contacting family or emergency services
6. Encourage healthy habits gently
7. Use occasional emojis to express warmth (💙, 😊)
8. For prescription medications or serious medical decisions, suggest confirming with their doctor
9. Politely decline non-healthcare questions and redirect to health topics

Remember: Your role is comprehensive healthcare guidance, companionship, and emotional support.`;

export async function getEmotionalChatResponse(userMessage: string, userContext?: any): Promise<string> {
  const messages = [
    { role: 'system' as const, content: EMOTIONAL_CHAT_SYSTEM_PROMPT },
    { role: 'user' as const, content: userMessage }
  ];
  
  return getChatCompletion(messages, { temperature: 0.8, maxTokens: 300 });
}
