"use client";

import { CalendarDays, DollarSign, Users, type LucideIcon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { AppShell } from "@/components/app-shell";
import { AuthGate } from "@/components/auth/auth-gate";
import { BrutalCard } from "@/components/ui/card";
import { LinkButton } from "@/components/ui/button";
import { useSupabase } from "@/components/supabase-provider";
import type { Database } from "@/lib/database.types";

type EventRow = Database["public"]["Tables"]["events"]["Row"];

import { SpotifyConnectButton } from "@/components/SpotifyConnectButton";

export function DashboardClient() {
  return <AuthGate>{(user) => <DashboardContent user={user} />}</AuthGate>;
}

function DashboardContent({ user }: { user: User }) {
  const supabase = useSupabase();
  const [events, setEvents] = useState<EventRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!supabase) return;
    supabase
      .from("events")
      .select("*")
      .order("event_date", { ascending: true })
      .then(({ data, error: queryError }) => {
        if (queryError) setError(queryError.message);
        setEvents(data ?? []);
        setLoading(false);
      });
  }, [supabase]);

  const stats = useMemo(() => {
    const totalGuests = events.reduce((sum, event) => sum + event.guest_count, 0);
    const avgBudget = events.length ? Math.round(events.reduce((sum, event) => sum + event.budget, 0) / events.length) : 0;
    return { totalGuests, avgBudget };
  }, [events]);

  const upcoming = events.filter((event) => new Date(event.event_date) >= new Date()).slice(0, 3);
  const statCards: Array<[LucideIcon, string, string | number]> = [
    [CalendarDays, "Events Created", events.length],
    [Users, "Total Guests Planned", stats.totalGuests],
    [DollarSign, "Average Budget", `$${stats.avgBudget.toLocaleString()}`],
  ];

  return (
    <AppShell>
      <section className="px-5 py-10 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <BrutalCard className="bg-yellow-300">
              <p className="text-sm font-black uppercase">Dashboard</p>
              <h1 className="mt-3 text-5xl font-black leading-none">Welcome{user.user_metadata?.full_name ? `, ${user.user_metadata.full_name}` : ""}.</h1>
              <p className="mt-4 max-w-2xl text-lg font-bold">Create a complete plan, save it, and keep the day-of details within reach.</p>
              <div className="mt-6 flex flex-wrap gap-4">
                <LinkButton href="/events/new">Quick Create Event</LinkButton>
                <SpotifyConnectButton userId={user.id} />
              </div>
            </BrutalCard>
            <BrutalCard>
              <h2 className="text-2xl font-black">Upcoming events</h2>
              <div className="mt-5 space-y-3">
                {loading ? <p className="font-black">Loading events...</p> : null}
                {!loading && upcoming.length === 0 ? <p className="font-bold">No upcoming events yet.</p> : null}
                {upcoming.map((event) => (
                  <a key={event.id} href={`/events/${event.id}`} className="block rounded-xl border-4 border-black bg-white p-4 font-bold shadow-[4px_4px_0_#000] transition-transform hover:-translate-y-1">
                    <span className="block text-xl font-black">{event.name}</span>
                    {new Date(event.event_date).toLocaleDateString()} • {event.guest_count} guests
                  </a>
                ))}
              </div>
            </BrutalCard>
          </div>

          {error ? <div className="mt-6 rounded-xl border-4 border-black bg-blue-400 p-4 font-black">{error}</div> : null}

          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {statCards.map(([Icon, label, value]) => (
              <BrutalCard key={String(label)}>
                <Icon className="h-8 w-8" aria-hidden />
                <p className="mt-4 text-sm font-black uppercase">{String(label)}</p>
                <p className="mt-2 text-4xl font-black">{String(value)}</p>
              </BrutalCard>
            ))}
          </div>

          <BrutalCard className="mt-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <h2 className="text-3xl font-black">Recent events</h2>
              <LinkButton href="/events/new" variant="secondary">Create</LinkButton>
            </div>
            <div className="mt-6 divide-y-4 divide-black border-y-4 border-black">
              {events.length === 0 && !loading ? <p className="py-6 font-bold">Your saved plans will appear here.</p> : null}
              {events.slice(0, 8).map((event) => (
                <a key={event.id} href={`/events/${event.id}`} className="grid gap-2 py-5 font-bold transition-colors hover:bg-yellow-100 md:grid-cols-4">
                  <span className="text-xl font-black">{event.name}</span>
                  <span>{event.type}</span>
                  <span>{event.location}</span>
                  <span>{new Date(event.event_date).toLocaleDateString()}</span>
                </a>
              ))}
            </div>
          </BrutalCard>
        </div>
      </section>
    </AppShell>
  );
}
