import { NextRequest, NextResponse } from "next/server";
import Retell from "retell-sdk";

const RETELL_API_KEY = process.env.RETELL_API_KEY;
const RETELL_AGENT_ID = "agent_2ae8cd0c01281f35db761a2cc3";

export async function POST(req: NextRequest) {
  if (!RETELL_API_KEY) {
    return NextResponse.json(
      { error: "RETELL_API_KEY is not configured. Add it to your .env.local file." },
      { status: 500 }
    );
  }

  try {
    const client = new Retell({ apiKey: RETELL_API_KEY });

    const webCallResponse = await client.call.createWebCall({
      agent_id: RETELL_AGENT_ID,
    });

    return NextResponse.json({
      accessToken: webCallResponse.access_token,
      callId: webCallResponse.call_id,
    });
  } catch (error: any) {
    console.error("Retell createWebCall error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create Retell web call" },
      { status: 500 }
    );
  }
}
