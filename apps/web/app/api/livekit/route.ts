import { NextResponse } from "next/server";

/**
 * POST /api/livekit
 *
 * Generates a LiveKit access token for the requesting user.
 * In production this would use `livekit-server-sdk` to sign a JWT.
 *
 * Required body: { identity: string, room: string }
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { identity, room } = body as { identity?: string; room?: string };

    if (!identity || !room) {
      return NextResponse.json(
        { error: "Missing identity or room" },
        { status: 400 }
      );
    }

    const apiKey = process.env.LIVEKIT_API_KEY;
    const apiSecret = process.env.LIVEKIT_API_SECRET;

    if (!apiKey || !apiSecret) {
      return NextResponse.json(
        { error: "LiveKit credentials not configured" },
        { status: 500 }
      );
    }

    // In production, use the livekit-server-sdk to generate a real JWT:
    //
    // import { AccessToken } from 'livekit-server-sdk';
    // const token = new AccessToken(apiKey, apiSecret, { identity });
    // token.addGrant({ roomJoin: true, room });
    // const jwt = await token.toJwt();
    //
    // For local development without a running LiveKit server,
    // return a placeholder response:
    const devToken = Buffer.from(
      JSON.stringify({
        iss: apiKey,
        sub: identity,
        room,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 3600,
      })
    ).toString("base64");

    return NextResponse.json({
      token: devToken,
      url: process.env.NEXT_PUBLIC_LIVEKIT_URL ?? "ws://localhost:7880",
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to generate token" },
      { status: 500 }
    );
  }
}
