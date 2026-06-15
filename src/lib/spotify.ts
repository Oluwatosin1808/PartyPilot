const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const SPOTIFY_REDIRECT_URI = process.env.NEXT_PUBLIC_APP_URL 
  ? `${process.env.NEXT_PUBLIC_APP_URL}/api/spotify/callback`
  : 'http://localhost:3000/api/spotify/callback';

const SPOTIFY_ACCOUNTS_URL = 'https://accounts.spotify.com';
const SPOTIFY_API_URL = 'https://api.spotify.com/v1';

export function getSpotifyAuthUrl(userId: string) {
  const scope = 'playlist-modify-public playlist-modify-private user-read-private user-read-email';
  const queryParams = new URLSearchParams({
    response_type: 'code',
    client_id: SPOTIFY_CLIENT_ID || '',
    scope: scope,
    redirect_uri: SPOTIFY_REDIRECT_URI,
    state: userId,
  });

  return `${SPOTIFY_ACCOUNTS_URL}/authorize?${queryParams.toString()}`;
}

export async function exchangeSpotifyCode(code: string) {
  const credentials = Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString('base64');

  const response = await fetch(`${SPOTIFY_ACCOUNTS_URL}/api/token`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code: code,
      redirect_uri: SPOTIFY_REDIRECT_URI,
    }),
    cache: 'no-store'
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to exchange token: ${errorText}`);
  }

  return response.json(); // { access_token, refresh_token, expires_in }
}

export async function refreshSpotifyToken(refreshToken: string) {
  const credentials = Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString('base64');

  const response = await fetch(`${SPOTIFY_ACCOUNTS_URL}/api/token`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    }),
    cache: 'no-store'
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to refresh token: ${errorText}`);
  }

  return response.json(); // { access_token, expires_in, refresh_token (optional) }
}

export async function searchSpotifyTrack(query: string, accessToken: string) {
  const response = await fetch(`${SPOTIFY_API_URL}/search?q=${encodeURIComponent(query)}&type=track&limit=1`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) return null;
  const data = await response.json();
  if (data.tracks && data.tracks.items.length > 0) {
    return data.tracks.items[0]; // Returns the first track object
  }
  return null;
}

export async function getSpotifyUserProfile(accessToken: string) {
  const response = await fetch(`${SPOTIFY_API_URL}/me`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch user profile');
  }
  return response.json();
}

export async function createSpotifyPlaylist(spotifyUserId: string, name: string, description: string, accessToken: string) {
  const response = await fetch(`${SPOTIFY_API_URL}/users/${spotifyUserId}/playlists`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name,
      description,
      public: false,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to create playlist: ${errorText}`);
  }

  return response.json(); // Returns playlist object
}

export async function addTracksToPlaylist(playlistId: string, uris: string[], accessToken: string) {
  if (uris.length === 0) return;
  
  // Spotify allows max 100 uris per request
  for (let i = 0; i < uris.length; i += 100) {
    const chunk = uris.slice(i, i + 100);
    const response = await fetch(`${SPOTIFY_API_URL}/playlists/${playlistId}/tracks`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        uris: chunk,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to add tracks to playlist: ${errorText}`);
    }
  }
}
