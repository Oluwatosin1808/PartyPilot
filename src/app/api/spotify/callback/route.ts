import { NextResponse } from 'next/server';
import { exchangeCodeForToken } from '@/lib/spotify';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: Request) {
  console.log('[Spotify Callback] Request received');
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const userId = searchParams.get('state');
  const error = searchParams.get('error');

  if (error) {
    console.error('[Spotify Callback] Error from Spotify:', error);
    return NextResponse.json({ error: `Spotify error: ${error}` }, { status: 400 });
  }

  if (!code || !userId) {
    console.error('[Spotify Callback] Missing code or userId:', { code: !!code, userId: !!userId });
    return NextResponse.json({ error: 'Missing code or state (userId)' }, { status: 400 });
  }

  console.log('[Spotify Callback] Exchanging code for token');
  try {
    const tokenData = await exchangeCodeForToken(code);
    console.log('[Spotify Callback] Token exchange successful');
    
    // We use the service role key to bypass RLS and insert the token safely from the server
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const expiresAt = new Date();
    expiresAt.setSeconds(expiresAt.getSeconds() + tokenData.expiresIn);

    console.log('[Spotify Callback] Saving token to Supabase');
    const { error: supabaseError } = await supabaseAdmin
      .from('spotify_tokens')
      .upsert({
        user_id: userId,
        access_token: tokenData.accessToken,
        refresh_token: tokenData.refreshToken,
        expires_at: expiresAt.toISOString(),
        updated_at: new Date().toISOString(),
      });

    if (supabaseError) {
      console.error('[Spotify Callback] Error saving spotify token:', supabaseError);
      return NextResponse.json({ error: 'Failed to save token' }, { status: 500 });
    }

    console.log('[Spotify Callback] Token saved successfully, redirecting to dashboard');
    return NextResponse.redirect(new URL('/dashboard', request.url));
  } catch (err) {
    console.error('[Spotify Callback] Full error:', err);
    const errorMessage = err instanceof Error ? err.message : 'Failed to authenticate with Spotify';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
