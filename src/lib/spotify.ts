const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const SPOTIFY_REDIRECT_URI = process.env.SPOTIFY_REDIRECT_URI || "http://localhost:3000/api/spotify/callback";

function basicAuth(): string {
  return Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString("base64");
}

export function getAuthUrl(userId: string): string {
  const scopes = ["playlist-modify-public", "playlist-modify-private", "user-read-private", "user-read-email"];
  const params = new URLSearchParams({
    response_type: "code",
    client_id: SPOTIFY_CLIENT_ID!,
    scope: scopes.join(" "),
    redirect_uri: SPOTIFY_REDIRECT_URI,
    state: userId,
  });
  return `https://accounts.spotify.com/authorize?${params.toString()}`;
}

export async function exchangeCodeForToken(code: string): Promise<{
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}> {
  console.log("[Spotify] Exchanging code for token");
  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${basicAuth()}`,
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: SPOTIFY_REDIRECT_URI,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("[Spotify] Token exchange failed:", response.status, errorText);
    throw new Error(`Failed to exchange code: ${response.status} ${errorText}`);
  }

  const data = await response.json();
  console.log("[Spotify] Token exchange successful");
  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresIn: data.expires_in,
  };
}

export async function refreshAccessToken(refreshToken: string): Promise<{
  accessToken: string;
  expiresIn: number;
  refreshToken?: string;
}> {
  console.log("[Spotify] Refreshing access token");
  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${basicAuth()}`,
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("[Spotify] Refresh token failed:", response.status, errorText);
    throw new Error(`Failed to refresh token: ${response.status} ${errorText}`);
  }

  const data = await response.json();
  console.log("[Spotify] Refresh successful");
  return {
    accessToken: data.access_token,
    expiresIn: data.expires_in,
    refreshToken: data.refresh_token || undefined,
  };
}

export async function getSpotifyUserProfile(accessToken: string): Promise<any> {
  console.log("[Spotify] Getting user profile");
  const response = await fetch("https://api.spotify.com/v1/me", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("[Spotify] Get profile failed:", response.status, errorText);
    throw new Error(`Failed to get profile: ${response.status} ${errorText}`);
  }

  return await response.json();
}

export async function createPlaylist(
  accessToken: string,
  playlistName: string,
  description: string = ""
): Promise<any> {
  console.log("[Spotify] Creating playlist");
  const user = await getSpotifyUserProfile(accessToken);
  const response = await fetch(`https://api.spotify.com/v1/users/${user.id}/playlists`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: playlistName,
      description,
      public: false,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("[Spotify] Create playlist failed:", response.status, errorText);
    throw new Error(`Failed to create playlist: ${response.status} ${errorText}`);
  }

  const data = await response.json();
  console.log("[Spotify] Playlist created:", data.id);
  return data;
}

export async function searchTracks(
  accessToken: string,
  query: string,
  limit: number = 1
): Promise<any[]> {
  console.log("[Spotify] Searching tracks:", query);
  const params = new URLSearchParams({ q: query, type: "track", limit: String(limit) });
  const response = await fetch(`https://api.spotify.com/v1/search?${params.toString()}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("[Spotify] Search tracks failed:", response.status, errorText);
    return [];
  }

  const data = await response.json();
  return data.tracks?.items || [];
}

export async function addTracksToPlaylist(
  accessToken: string,
  playlistId: string,
  uris: string[]
): Promise<void> {
  console.log("[Spotify] Adding tracks to playlist:", uris.length);
  // Spotify allows max 100 tracks per request
  for (let i = 0; i < uris.length; i += 100) {
    const chunk = uris.slice(i, i + 100);
    const response = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ uris: chunk }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[Spotify] Add tracks failed:", response.status, errorText);
      throw new Error(`Failed to add tracks: ${response.status} ${errorText}`);
    }
  }
}

export async function searchTrackUris(
  accessToken: string,
  songQueries: string[]
): Promise<string[]> {
  const uris: string[] = [];
  for (const query of songQueries) {
    const tracks = await searchTracks(accessToken, query);
    if (tracks.length > 0) {
      uris.push(tracks[0].uri);
    }
  }
  return uris;
}

export async function createPartyPlaylist(
  accessToken: string,
  eventName: string,
  eventType: string,
  songList: string[]
): Promise<string> {
  // Step 1: Create playlist
  const playlist = await createPlaylist(
    accessToken,
    `${eventName} Playlist`,
    `Music for ${eventName} - a ${eventType} generated by PartyPilot`
  );
  
  // Step 2: Search for tracks
  const trackUris = await searchTrackUris(accessToken, songList);
  
  // Step 3: Add tracks to playlist
  if (trackUris.length > 0) {
    await addTracksToPlaylist(accessToken, playlist.id, trackUris);
  }
  
  return playlist.external_urls.spotify;
}
