import { NextResponse } from 'next/server';
import { getUserFromToken, createSupabaseAdminClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const token = request.headers.get('authorization')?.replace('Bearer ', '');
  if (!token) {
    return NextResponse.json({ error: 'Authentication is required.' }, { status: 401 });
  }

  try {
    const user = await getUserFromToken(token);
    const supabaseAdmin = createSupabaseAdminClient();
    
    const { data, error } = await supabaseAdmin
      .from('spotify_tokens')
      .select('user_id')
      .eq('user_id', user.id)
      .single();

    if (error || !data) {
      return NextResponse.json({ connected: false });
    }

    return NextResponse.json({ connected: true });
  } catch (err) {
    console.error('[Spotify Status] Error:', err);
    return NextResponse.json({ connected: false });
  }
}
