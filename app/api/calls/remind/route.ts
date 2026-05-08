import { NextRequest, NextResponse } from 'next/server';

// In production, uncomment and configure Twilio
// import twilio from 'twilio';
// const twilioClient = twilio(
//   process.env.TWILIO_ACCOUNT_SID,
//   process.env.TWILIO_AUTH_TOKEN
// );

export async function POST(request: NextRequest) {
  try {
    const { phoneNumber, medicationName, dosage, timing, userName } = await request.json();

    if (!phoneNumber || !medicationName) {
      return NextResponse.json(
        { error: 'Phone number and medication name are required' },
        { status: 400 }
      );
    }

    // Generate the voice message
    const message = `Hello ${userName || "there"}, this is your CarePulse AI assistant. 
    This is a friendly reminder to take your ${medicationName} ${dosage || ""} 
    ${timing ? `which is scheduled for ${timing}` : ""}. 
    Please take your medication as prescribed by your doctor. 
    Stay healthy and take care!`;

    // In production with Twilio:
    /*
    const call = await twilioClient.calls.create({
      twiml: `<Response><Say voice="Polly.Aditi" language="hi-IN">${message}</Say></Response>`,
      to: phoneNumber,
      from: process.env.TWILIO_PHONE_NUMBER,
    });
    
    return NextResponse.json({
      success: true,
      callSid: call.sid,
      message: "Reminder call initiated"
    });
    */

    // Mock response for development
    console.log(`[Mock Call] To: ${phoneNumber}, Message: ${message}`);
    
    return NextResponse.json({
      success: true,
      message: "Reminder call initiated (mock)",
      mock: true
    });
  } catch (error) {
    console.error('Twilio call error:', error);
    return NextResponse.json(
      { error: 'Failed to initiate reminder call' },
      { status: 500 }
    );
  }
}

// GET endpoint to check call status
export async function GET(request: NextRequest) {
  const callSid = request.nextUrl.searchParams.get('callSid');
  
  if (!callSid) {
    return NextResponse.json({ error: 'Call SID required' }, { status: 400 });
  }

  // Mock response
  return NextResponse.json({
    status: 'completed',
    duration: '45 seconds',
    callSid
  });
}
