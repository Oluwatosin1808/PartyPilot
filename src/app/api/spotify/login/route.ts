import { NextResponse } from 'next/server';
import { getAuthUrl } from '@/lib/spotify';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
  }

  const authUrl = getAuthUrl(userId);
  return NextResponse.redirect(authUrl);
}
