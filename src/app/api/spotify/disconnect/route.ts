import { NextResponse } from 'next/server';
import { getUserFromToken, createSupabaseAdminClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  const token = request.headers.get('authorization')?.replace('Bearer ', '');
  if (!token) {
    return NextResponse.json({ error: 'Authentication is required.' }, { status: 401 });
  }

  try {
    const user = await getUserFromToken(token);
    const supabaseAdmin = createSupabaseAdminClient();

    // Delete the Spotify token record
    await supabaseAdmin
      .from('spotify_tokens')
      .delete()
      .eq('user_id', user.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Spotify Disconnect] Error:', error);
    return NextResponse.json({ error: 'Failed to disconnect Spotify.' }, { status: 500 });
  }
}
