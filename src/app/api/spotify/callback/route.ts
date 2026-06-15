import { NextResponse } from 'next/server';
import { exchangeSpotifyCode } from '@/lib/spotify';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const userId = searchParams.get('state');

  if (!code || !userId) {
    return NextResponse.json({ error: 'Missing code or state (userId)' }, { status: 400 });
  }

  try {
    const tokenData = await exchangeSpotifyCode(code);
    
    // We use the service role key to bypass RLS and insert the token safely from the server
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const expiresAt = new Date();
    expiresAt.setSeconds(expiresAt.getSeconds() + tokenData.expires_in);

    const { error } = await supabaseAdmin
      .from('spotify_tokens')
      .upsert({
        user_id: userId,
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token,
        expires_at: expiresAt.toISOString(),
        updated_at: new Date().toISOString(),
      });

    if (error) {
      console.error('Error saving spotify token:', error);
      return NextResponse.json({ error: 'Failed to save token' }, { status: 500 });
    }

    return NextResponse.redirect(new URL('/dashboard', request.url));
  } catch (err) {
    console.error('Spotify callback error:', err);
    return NextResponse.json({ error: 'Failed to authenticate with Spotify' }, { status: 500 });
  }
}
