"use client";

import { useEffect, useState } from "react";
import { useSupabase } from "@/components/supabase-provider";
import { Button } from "@/components/ui/button";

export function SpotifyConnectButton({ userId }: { userId: string }) {
  const supabase = useSupabase();
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function checkStatus() {
      if (!supabase) return;
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
  }, [supabase]);

  if (isLoading) {
    return <Button variant="secondary" disabled>Loading...</Button>;
  }

  if (isConnected) {
    return (
      <div className="flex gap-3 flex-wrap">
        <Button variant="secondary" className="text-green-500 border-green-500 hover:bg-green-50" disabled>
          Connected to Spotify
        </Button>
        <Button 
          variant="secondary"
          onClick={() => {
            window.location.href = `/api/spotify/login?userId=${userId}`;
          }}
        >
          Reconnect Spotify
        </Button>
      </div>
    );
  }

  return (
    <Button 
      variant="primary"
      className="bg-[#1DB954] hover:bg-[#1ed760] text-white"
      onClick={() => {
        window.location.href = `/api/spotify/login?userId=${userId}`;
      }}
    >
      Connect Spotify
    </Button>
  );
}
