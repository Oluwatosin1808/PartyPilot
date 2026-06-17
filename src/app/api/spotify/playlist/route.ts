import { NextResponse } from 'next/server';
import { createRouteSupabaseClient } from '@/lib/supabase/server';
import { createClient } from '@supabase/supabase-js';
import { 
  refreshAccessToken, 
  createPartyPlaylist,
  getSpotifyUserProfile
} from '@/lib/spotify';

export async function POST(request: Request) {
  console.log('[Spotify Playlist] Starting request');
  
  const token = request.headers.get('authorization')?.replace('Bearer ', '');
  if (!token) {
    console.error('[Spotify Playlist] No auth token');
    return NextResponse.json({ error: 'Authentication is required.' }, { status: 401 });
  }

  try {
    const body = await request.json();
    console.log('[Spotify Playlist] Request body:', body);
    const { eventId, eventName, eventType, songs } = body;

    if (!eventId || !eventName || !eventType || !songs || !Array.isArray(songs)) {
      console.error('[Spotify Playlist] Invalid payload');
      return NextResponse.json({ error: 'Invalid payload.' }, { status: 400 });
    }

    const supabase = await createRouteSupabaseClient(token);
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      console.error('[Spotify Playlist] User not found:', userError);
      return NextResponse.json({ error: 'User not found.' }, { status: 401 });
    }
    console.log('[Spotify Playlist] User ID:', user.id);

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: tokenData, error: tokenError } = await supabaseAdmin
      .from('spotify_tokens')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (tokenError || !tokenData) {
      console.error('[Spotify Playlist] Token not found:', tokenError);
      return NextResponse.json({ error: 'Spotify account not connected. Please reconnect your Spotify account.' }, { status: 400 });
    }
    console.log('[Spotify Playlist] Found token data');

    let accessToken = tokenData.access_token;
    console.log('[Spotify Playlist] Current token expires at:', tokenData.expires_at);
    
    if (new Date(tokenData.expires_at) <= new Date()) {
      console.log('[Spotify Playlist] Token expired, refreshing...');
      try {
        const refreshed = await refreshAccessToken(tokenData.refresh_token);
        accessToken = refreshed.accessToken;
        const newExpiresAt = new Date();
        newExpiresAt.setSeconds(newExpiresAt.getSeconds() + refreshed.expiresIn);

        await supabaseAdmin
          .from('spotify_tokens')
          .update({
            access_token: accessToken,
            ...(refreshed.refreshToken ? { refresh_token: refreshed.refreshToken } : {}),
            expires_at: newExpiresAt.toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user.id);
        console.log('[Spotify Playlist] Token refreshed successfully');
      } catch (err) {
        console.error('[Spotify Playlist] Failed to refresh token:', err);
        return NextResponse.json({ error: 'Failed to refresh Spotify token. Please reconnect your account.' }, { status: 401 });
      }
    }

    // Verify the access token works by getting the user profile first
    console.log('[Spotify Playlist] Verifying access token...');
    const spotifyUser = await getSpotifyUserProfile(accessToken);
    console.log('[Spotify Playlist] Spotify user:', spotifyUser.id);

    const playlistUrl = await createPartyPlaylist(
      accessToken,
      eventName,
      eventType,
      songs
    );
    console.log('[Spotify Playlist] Playlist created:', playlistUrl);

    await supabaseAdmin
      .from('event_plans')
      .update({ spotify_playlist_url: playlistUrl })
      .eq('event_id', eventId);

    return NextResponse.json({ playlistUrl });

  } catch (error) {
    console.error('[Spotify Playlist Error] Full error:', error);
    
    // Extract more details from Spotify error
    let message = 'Could not create playlist.';
    if (error instanceof Error) {
      // Check if it's a SpotifyWebApi error
      if ('body' in error && typeof error.body === 'object') {
        const spotifyError = error.body as any;
        console.error('[Spotify Playlist] Spotify error body:', spotifyError);
        message = spotifyError?.error?.message || message;
      } else {
        message = error.message;
      }
    }
    
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
