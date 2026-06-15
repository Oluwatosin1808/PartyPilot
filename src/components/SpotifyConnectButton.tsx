"use client";

import { useEffect, useState } from "react";
import { useSupabase } from "../supabase-provider";
import { Button } from "../ui/button";

export function SpotifyConnectButton({ userId }: { userId: string }) {
  const { supabase } = useSupabase();
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function checkStatus() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;
        
        const res = await fetch("/api/spotify/status", {
          headers: {
            "Authorization": `Bearer ${session.access_token}`
          }
        });
        if (res.ok) {
          const data = await res.json();
          setIsConnected(!!data.connected);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    
    checkStatus();
  }, [supabase.auth]);

  if (isLoading) {
    return <Button variant="outline" disabled>Loading...</Button>;
  }

  if (isConnected) {
    return (
      <Button variant="outline" className="text-green-500 border-green-500 hover:bg-green-50" disabled>
        Connected to Spotify
      </Button>
    );
  }

  return (
    <Button 
      variant="default"
      className="bg-[#1DB954] hover:bg-[#1ed760] text-white"
      onClick={() => {
        window.location.href = `/api/spotify/login?userId=${userId}`;
      }}
    >
      Connect Spotify
    </Button>
  );
}
