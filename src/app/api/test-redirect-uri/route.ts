import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const spotifyRedirectUri = process.env.SPOTIFY_REDIRECT_URI;
  console.log("[Test] SPOTIFY_REDIRECT_URI:", spotifyRedirectUri);
  
  return NextResponse.json({
    spotifyRedirectUri,
    expectedRedirectUri: `${new URL(request.url).origin}/api/spotify/callback`
  });
}
