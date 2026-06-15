"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { BrutalCard } from "@/components/ui/card";
import { useSupabase } from "@/components/supabase-provider";

export function AuthGate({ children }: { children: (user: User) => React.ReactNode }) {
  const router = useRouter();
  const supabase = useSupabase();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const configError = !supabase;

  useEffect(() => {
    if (!supabase) {
      return;
    }

    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        router.replace("/login");
        return;
      }
      setUser(data.user);
      setLoading(false);
    });
  }, [router, supabase]);

  if (configError) {
    return <main className="grid min-h-screen place-items-center bg-yellow-300 p-5"><BrutalCard><p className="text-2xl font-black">Supabase environment variables are missing.</p></BrutalCard></main>;
  }

  if (loading) {
    return <main className="grid min-h-screen place-items-center bg-yellow-300 p-5"><BrutalCard><p className="text-2xl font-black">Loading PartyPilot...</p></BrutalCard></main>;
  }

  if (!user) {
    return null;
  }

  return children(user);
}
