import { NextResponse } from 'next/server';
import { getAuthUrl } from '@/lib/spotify';

export async function GET(request: Request) {
  console.log('[Spotify Login] Request received');
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    console.error('[Spotify Login] Missing userId');
    return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
  }

  console.log('[Spotify Login] Generating auth URL for userId:', userId);
  const authUrl = getAuthUrl(userId);
  console.log('[Spotify Login] Redirecting to:', authUrl);
  return NextResponse.redirect(authUrl);
}
