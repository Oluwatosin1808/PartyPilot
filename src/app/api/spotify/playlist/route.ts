import { NextResponse } from 'next/server';
import { createRouteSupabaseClient } from '@/lib/supabase/server';
import { createClient } from '@supabase/supabase-js';
import { 
  refreshAccessToken, 
  createPartyPlaylist 
} from '@/lib/spotify';

export async function POST(request: Request) {
  const token = request.headers.get('authorization')?.replace('Bearer ', '');
  if (!token) {
    return NextResponse.json({ error: 'Authentication is required.' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { eventId, eventName, eventType, songs } = body;

    if (!eventId || !eventName || !eventType || !songs || !Array.isArray(songs)) {
      return NextResponse.json({ error: 'Invalid payload.' }, { status: 400 });
    }

    const supabase = createRouteSupabaseClient(token);
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: 'User not found.' }, { status: 401 });
    }

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
      return NextResponse.json({ error: 'Spotify account not connected. Please reconnect your Spotify account.' }, { status: 400 });
    }

    let accessToken = tokenData.access_token;
    
    if (new Date(tokenData.expires_at) <= new Date()) {
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
      } catch (err) {
        return NextResponse.json({ error: 'Failed to refresh Spotify token. Please reconnect your account.' }, { status: 401 });
      }
    }

    const playlistUrl = await createPartyPlaylist(
      accessToken,
      eventName,
      eventType,
      songs
    );

    await supabaseAdmin
      .from('event_plans')
      .update({ spotify_playlist_url: playlistUrl })
      .eq('event_id', eventId);

    return NextResponse.json({ playlistUrl });

  } catch (error) {
    console.error('[Spotify Playlist Error] Full error:', error);
    const message = error instanceof Error ? error.message : 'Could not create playlist.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
