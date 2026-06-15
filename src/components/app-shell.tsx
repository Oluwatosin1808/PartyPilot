"use client";

import { useState } from "react";
import { CalendarPlus, LayoutDashboard, LogOut, Menu, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button, LinkButton } from "@/components/ui/button";
import { useSupabase } from "@/components/supabase-provider";

export function AppShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const supabase = useSupabase();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  async function signOut() {
    await supabase?.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <main className="min-h-screen bg-white text-black">
      <header className="sticky top-0 z-50 flex items-center justify-between border-b-4 border-black bg-yellow-300 px-5 py-4 sm:px-8">
        <Link href="/dashboard" className="text-2xl font-black">PartyPilot</Link>
        
        {/* Desktop Nav */}
        <nav className="hidden flex-wrap items-center gap-3 md:flex">
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
        
        {/* Mobile Menu Button */}
        <Button 
          variant="secondary"
          className="md:hidden min-h-10 w-10 px-3 py-2"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </header>
      
      {/* Mobile Nav Menu */}
      {isMenuOpen && (
        <div className="md:hidden border-b-4 border-black bg-yellow-200 px-5 py-4">
          <nav className="flex flex-col gap-3">
            <LinkButton 
              href="/dashboard" 
              variant="secondary" 
              className="w-full justify-start text-left shadow-[4px_4px_0_#000]"
              onClick={() => setIsMenuOpen(false)}
            >
              <LayoutDashboard className="mr-2 h-4 w-4" /> Dashboard
            </LinkButton>
            <LinkButton 
              href="/events/new" 
              className="w-full justify-start text-left shadow-[4px_4px_0_#000]"
              onClick={() => setIsMenuOpen(false)}
            >
              <CalendarPlus className="mr-2 h-4 w-4" /> New Event
            </LinkButton>
            <Button 
              type="button" 
              variant="black" 
              className="w-full justify-start text-left shadow-[4px_4px_0_#000]" 
              onClick={() => {
                setIsMenuOpen(false);
                signOut();
              }}
            >
              <LogOut className="mr-2 h-4 w-4" /> Logout
            </Button>
          </nav>
        </div>
      )}
      
      {children}
    </main>
  );
}
