import { NextResponse } from 'next/server';
import { exchangeCodeForToken } from '@/lib/spotify';
import { createSupabaseAdminClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  console.log('[Spotify Callback] Request received');
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const userId = searchParams.get('state');
  const error = searchParams.get('error');

  if (error) {
    console.error('[Spotify Callback] Error from Spotify:', error);
    return NextResponse.redirect(new URL('/dashboard?error=spotify_auth', request.url));
  }

  if (!code || !userId) {
    console.error('[Spotify Callback] Missing code or userId:', { code: !!code, userId: !!userId });
    return NextResponse.redirect(new URL('/dashboard?error=missing_params', request.url));
  }

  console.log('[Spotify Callback] Exchanging code for token');
  try {
    const tokenData = await exchangeCodeForToken(code);
    console.log('[Spotify Callback] Token exchange successful');
    
    // Use admin client to bypass RLS
    const supabaseAdmin = createSupabaseAdminClient();

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
      return NextResponse.redirect(new URL('/dashboard?error=save_token', request.url));
    }

    console.log('[Spotify Callback] Token saved successfully, redirecting to dashboard');
    return NextResponse.redirect(new URL('/dashboard', request.url));
  } catch (err) {
    console.error('[Spotify Callback] Full error:', err);
    return NextResponse.redirect(new URL('/dashboard?error=spotify_auth', request.url));
  }
}
