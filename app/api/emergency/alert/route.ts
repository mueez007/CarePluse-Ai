import { NextRequest, NextResponse } from 'next/server';

interface EmergencyContact {
  name: string;
  phone: string;
  email?: string;
  relation: string;
}

export async function POST(request: NextRequest) {
  try {
    const { 
      userId, 
      userName, 
      alertType, 
      message, 
      contacts, 
      location,
      healthData 
    } = await request.json();

    if (!contacts || contacts.length === 0) {
      return NextResponse.json(
        { error: 'No emergency contacts provided' },
        { status: 400 }
      );
    }

    const alertTypes = {
      high_risk_food: "⚠️ High Risk Food Detected",
      missed_medication: "💊 Missed Medication Alert",
      emergency_sos: "🆘 EMERGENCY SOS",
      abnormal_health: "❤️ Abnormal Health Reading",
      stress_alert: "😔 High Stress Detected"
    };

    const alertTitle = alertTypes[alertType as keyof typeof alertTypes] || "CarePulse Alert";
    const timestamp = new Date().toISOString();

    // Prepare SMS message
    const smsMessage = `${alertTitle}

${userName ? `Patient: ${userName}` : ""}
${message || "Immediate attention required"}
Time: ${new Date(timestamp).toLocaleString()}
${location ? `Location: ${location}` : ""}

Please take appropriate action immediately.

- CarePulse AI`;

    // Prepare email content
    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #00F0FF, #B400FF); padding: 20px; text-align: center; color: white; border-radius: 10px 10px 0 0; }
          .content { background: #1a1a2e; padding: 20px; border-radius: 0 0 10px 10px; }
          .alert-box { background: rgba(255,0,0,0.1); border-left: 4px solid red; padding: 15px; margin: 15px 0; }
          .button { display: inline-block; padding: 12px 24px; background: #00F0FF; color: #000; text-decoration: none; border-radius: 5px; margin-top: 15px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>🚨 ${alertTitle}</h2>
          </div>
          <div class="content">
            <div class="alert-box">
              <p><strong>Patient:</strong> ${userName || "Unknown"}</p>
              <p><strong>Time:</strong> ${new Date(timestamp).toLocaleString()}</p>
              ${location ? `<p><strong>Location:</strong> ${location}</p>` : ""}
              ${healthData ? `<p><strong>Health Data:</strong> ${JSON.stringify(healthData)}</p>` : ""}
            </div>
            <p><strong>Message:</strong></p>
            <p>${message || "Emergency alert triggered. Please check on the patient immediately."}</p>
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/emergency" class="button">View in Dashboard</a>
            <hr style="margin: 20px 0; border-color: #333;">
            <p style="font-size: 12px; color: #666;">This is an automated alert from CarePulse AI. Please do not reply to this message.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Send alerts to all contacts
    const results = [];
    
    for (const contact of contacts) {
      // Mock SMS sending
      console.log(`[Mock SMS] To: ${contact.phone}, Message: ${smsMessage}`);
      
      // Mock email sending
      if (contact.email) {
        console.log(`[Mock Email] To: ${contact.email}, Subject: ${alertTitle}`);
      }
      
      results.push({
        contact: contact.name,
        phone: contact.phone,
        email: contact.email,
        status: "sent",
        method: "mock"
      });
    }

    // Log the alert for audit trail
    console.log(`Emergency alert triggered: ${alertType} for ${userName} at ${timestamp}`);

    return NextResponse.json({
      success: true,
      alertId: Date.now().toString(),
      timestamp,
      contactsNotified: results.length,
      results
    });

  } catch (error) {
    console.error('Emergency alert error:', error);
    return NextResponse.json(
      { error: 'Failed to send emergency alerts' },
      { status: 500 }
    );
  }
}
