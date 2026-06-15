"use client";

import { CalendarPlus, LayoutDashboard, LogOut } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button, LinkButton } from "@/components/ui/button";
import { useSupabase } from "@/components/supabase-provider";

export function AppShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const supabase = useSupabase();

  async function signOut() {
    await supabase?.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <main className="min-h-screen bg-white text-black">
      <header className="sticky top-0 z-20 flex flex-wrap items-center justify-between gap-4 border-b-4 border-black bg-yellow-300 px-5 py-4 sm:px-8">
        <Link href="/dashboard" className="text-2xl font-black">PartyPilot</Link>
        <nav className="flex flex-wrap items-center gap-3">
          <LinkButton href="/dashboard" variant="secondary" className="min-h-10 px-4 py-2 text-sm shadow-[4px_4px_0_#000]">
            <LayoutDashboard className="mr-2 h-4 w-4" /> Dashboard
          </LinkButton>
          <LinkButton href="/events/new" className="min-h-10 px-4 py-2 text-sm shadow-[4px_4px_0_#000]">
            <CalendarPlus className="mr-2 h-4 w-4" /> New Event
          </LinkButton>
          <Button type="button" variant="black" className="min-h-10 px-4 py-2 text-sm shadow-[4px_4px_0_#000]" onClick={signOut}>
            <LogOut className="mr-2 h-4 w-4" /> Logout
          </Button>
        </nav>
      </header>
      {children}
    </main>
  );
}
