import { GoogleGenerativeAI, GenerativeModel, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';

let genAI: GoogleGenerativeAI | null = null;
let visionModel: GenerativeModel | null = null;
let textModel: GenerativeModel | null = null;

export function getGeminiClient() {
  if (!genAI) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not set in environment variables');
    }
    genAI = new GoogleGenerativeAI(apiKey);
  }
  return genAI;
}

export function getVisionModel() {
  if (!visionModel) {
    const client = getGeminiClient();
    visionModel = client.getGenerativeModel({
      model: "gemini-2.5-flash",
      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
      ],
    });
  }
  return visionModel;
}

export function getTextModel() {
  if (!textModel) {
    const client = getGeminiClient();
    textModel = client.getGenerativeModel({
      model: "gemini-2.5-flash",
    });
  }
  return textModel;
}

export async function analyzeFoodImage(imageBase64: string, prompt: string): Promise<string> {
  const model = getVisionModel();

  const result = await model.generateContent([
    prompt,
    {
      inlineData: {
        data: imageBase64.split(',')[1] || imageBase64,
        mimeType: "image/jpeg"
      }
    }
  ]);

  const response = await result.response;
  return response.text();
}

export async function extractTextFromImage(imageBase64: string, prompt: string): Promise<string> {
  return analyzeFoodImage(imageBase64, prompt);
}

export async function generateText(prompt: string): Promise<string> {
  const model = getTextModel();
  const result = await model.generateContent(prompt);
  const response = await result.response;
  return response.text();
}
