import { NextResponse } from 'next/server';
import { createRouteSupabaseClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const token = request.headers.get('authorization')?.replace('Bearer ', '');
  if (!token) {
    return NextResponse.json({ error: 'Authentication is required.' }, { status: 401 });
  }

  try {
    const supabase = createRouteSupabaseClient(token);
    
    // Get current user id
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: 'User not found.' }, { status: 401 });
    }

    const { data, error } = await supabase
      .from('spotify_tokens')
      .select('user_id')
      .eq('user_id', user.id)
      .single();

    if (error || !data) {
      return NextResponse.json({ connected: false });
    }

    return NextResponse.json({ connected: true });
  } catch (err) {
    return NextResponse.json({ connected: false });
  }
}
