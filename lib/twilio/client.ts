import twilio from 'twilio';

let twilioClient: twilio.Twilio | null = null;

export function getTwilioClient() {
  if (!twilioClient) {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    
    if (!accountSid || !authToken) {
      console.warn('Twilio credentials not configured. Voice calls will be mocked.');
      return null;
    }
    
    twilioClient = twilio(accountSid, authToken);
  }
  return twilioClient;
}

export async function makeVoiceCall(
  to: string,
  message: string,
  options?: {
    from?: string;
    language?: 'en' | 'hi' | 'ta' | 'te' | 'kn';
  }
): Promise<{ success: boolean; callSid?: string; error?: string }> {
  const client = getTwilioClient();
  
  if (!client) {
    // Mock call for development
    console.log(`[MOCK CALL] To: ${to}, Message: ${message}`);
    return { success: true, callSid: `mock_${Date.now()}` };
  }
  
  try {
    const voiceLanguage = {
      en: 'Polly.Joanna',
      hi: 'Polley.Aditi',
      ta: 'Polly.Kajal',
      te: 'Polly.Madhur',
      kn: 'Polly.Arpita'
    };
    
    const voice = voiceLanguage[options?.language || 'en'];
    
    const call = await client.calls.create({
      twiml: `<Response><Say voice="${voice}">${message}</Say></Response>`,
      to: to,
      from: options?.from || process.env.TWILIO_PHONE_NUMBER!,
    });
    
    return { success: true, callSid: call.sid };
  } catch (error) {
    console.error('Twilio call error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function sendSMS(
  to: string,
  message: string,
  from?: string
): Promise<{ success: boolean; messageSid?: string; error?: string }> {
  const client = getTwilioClient();
  
  if (!client) {
    console.log(`[MOCK SMS] To: ${to}, Message: ${message}`);
    return { success: true, messageSid: `mock_${Date.now()}` };
  }
  
  try {
    const sms = await client.messages.create({
      body: message,
      to: to,
      from: from || process.env.TWILIO_PHONE_NUMBER!,
    });
    
    return { success: true, messageSid: sms.sid };
  } catch (error) {
    console.error('Twilio SMS error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export function generateReminderMessage(
  medicationName: string,
  dosage: string,
  userName: string,
  language: string = 'en'
): string {
  const messages: Record<string, Record<string, string>> = {
    en: {
      greeting: `Hello ${userName},`,
      reminder: `this is your CarePulse AI assistant with a friendly reminder to take your ${medicationName}`,
      dosage: `${dosage}`,
      closing: `Please take your medication as prescribed. Stay healthy and take care!`
    },
    hi: {
      greeting: `नमस्ते ${userName},`,
      reminder: `आपके ${medicationName} की याद दिलाने के लिए केयरपल्स एआई सहायक बोल रहा है`,
      dosage: `${dosage}`,
      closing: `कृपया निर्देशानुसार दवा लें। स्वस्थ रहें!`
    }
  };
  
  const langMessages = messages[language] || messages.en;
  return `${langMessages.greeting} ${langMessages.reminder} ${langMessages.dosage}. ${langMessages.closing}`;
}
