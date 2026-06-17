"use client";

import { Download, Printer } from "lucide-react";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { AuthGate } from "@/components/auth/auth-gate";
import { Button } from "@/components/ui/button";
import { BrutalCard } from "@/components/ui/card";
import { useSupabase } from "@/components/supabase-provider";
import type { Database, EventPlan } from "@/lib/database.types";

type EventRow = Database["public"]["Tables"]["events"]["Row"];

export function EventReport() {
  return <AuthGate>{() => <ReportContent />}</AuthGate>;
}

function ReportContent() {
  const params = useParams<{ id: string }>();
  const supabase = useSupabase();
  const [event, setEvent] = useState<EventRow | null>(null);
  const [plan, setPlan] = useState<EventPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [playlistUrl, setPlaylistUrl] = useState<string | null>(null);
  const [creatingPlaylist, setCreatingPlaylist] = useState(false);

  useEffect(() => {
    if (!supabase || !params.id) return;

    async function load() {
      const { data: eventData, error: eventError } = await supabase!.from("events").select("*").eq("id", params.id).single();
      if (eventError || !eventData) {
        setError(eventError?.message ?? "Event not found.");
        setLoading(false);
        return;
      }

      const { data: planData, error: planError } = await supabase!
        .from("event_plans")
        .select("ai_response, spotify_playlist_url")
        .eq("event_id", params.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (planError || !planData) {
        setError(planError?.message ?? "Plan not found.");
        setLoading(false);
        return;
      }

      setEvent(eventData);
      setPlan(planData.ai_response);
      setPlaylistUrl(planData.spotify_playlist_url);
      setLoading(false);
    }

    load();
  }, [params.id, supabase]);

  return (
    <AppShell>
      <section className="px-5 py-10 print:px-0 print:py-0 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-6xl print:max-w-none">
          {loading ? <BrutalCard><p className="text-2xl font-black">Loading event plan...</p></BrutalCard> : null}
          {error ? <BrutalCard className="bg-blue-400"><p className="text-2xl font-black">{error}</p></BrutalCard> : null}
          {event && plan ? (
            <div className="space-y-8">
              <div className="flex flex-wrap items-start justify-between gap-5 print:hidden">
                <div>
                  <p className="text-sm font-black uppercase">Saved event plan</p>
                  <h1 className="text-5xl font-black leading-none">{event.name}</h1>
                </div>
                <div className="flex gap-3">
                  <Button type="button" variant="secondary" onClick={() => window.print()}><Printer className="mr-2 h-5 w-5" /> Print</Button>
                  <Button type="button" onClick={() => window.print()}><Download className="mr-2 h-5 w-5" /> PDF Export</Button>
                </div>
              </div>

              <BrutalCard className="bg-yellow-300 print:shadow-none">
                <h2 className="text-4xl font-black">{event.name}</h2>
                <p className="mt-4 text-xl font-bold">{plan.summary}</p>
                <div className="mt-6 grid gap-4 md:grid-cols-4">
          <Meta label="Date" value={new Date(event.event_date).toLocaleDateString()} />
          <Meta label="Guests" value={String(event.guest_count)} />
          <Meta label="Budget" value={`₦${event.budget.toLocaleString()}`} />
          <Meta label="Vibe" value={event.vibe_level.replaceAll("_", " ")} />
        </div>
              </BrutalCard>

              <div className="grid gap-6 lg:grid-cols-2">
                <PlanSection title="Playlist" items={plan.playlist}>
                  {playlistUrl ? (
                    <a href={playlistUrl} target="_blank" rel="noreferrer" className="mt-4 inline-block rounded-xl border-4 border-black bg-[#1DB954] px-4 py-2 font-black text-white hover:bg-[#1ed760] transition-colors">
                      Open in Spotify
                    </a>
                  ) : (
                    <div className="space-y-3">
                      <Button 
                        className="mt-4 bg-[#1DB954] hover:bg-[#1ed760] text-white"
                        disabled={creatingPlaylist}
                        onClick={async () => {
                          setCreatingPlaylist(true);
                          try {
                            const { data: { session } } = await supabase!.auth.getSession();
                            const res = await fetch("/api/spotify/playlist", {
                              method: "POST",
                              headers: {
                                "Content-Type": "application/json",
                                "Authorization": `Bearer ${session?.access_token}`
                              },
                              body: JSON.stringify({
                                eventId: event.id,
                                eventName: event.name,
                                eventType: event.type,
                                songs: plan.playlist.map((s: unknown) => {
                                  if (typeof s === "string") return s;
                                  if (s && typeof s === "object" && "name" in s) {
                                    const obj = s as Record<string, unknown>;
                                    return obj.artists_to_include ? `${obj.name} ${obj.artists_to_include}` : String(obj.name);
                                  }
                                  return String(s);
                                })
                              })
                            });
                            const data = await res.json();
                            if (data.playlistUrl) setPlaylistUrl(data.playlistUrl);
                            else {
                              let errorMsg = data.error || "Failed to create playlist";
                              if (errorMsg.includes("Missing Spotify scopes")) {
                                errorMsg = "Missing permissions! Click 'Reconnect Spotify' in your dashboard and accept all permissions when prompted!";
                              }
                              alert(errorMsg);
                            }
                          } catch (err) {
                            alert("Failed to create playlist");
                          } finally {
                            setCreatingPlaylist(false);
                          }
                        }}
                      >
                        {creatingPlaylist ? "Creating..." : "Create Spotify Playlist"}
                      </Button>
                    </div>
                  )}
                </PlanSection>
                <PlanSection title="Food" items={plan.food_recommendations} />
                <PlanSection title="Activities" items={plan.activities} />
                <PlanSection title="Timeline" items={plan.timeline} />
                <PlanSection title="Budget Breakdown" items={plan.budget_breakdown} />
                <PlanSection title="Tips" items={plan.tips} />
              </div>
            </div>
          ) : null}
        </div>
      </section>
    </AppShell>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return <div className="rounded-xl border-4 border-black bg-white p-4"><p className="text-xs font-black uppercase">{label}</p><p className="mt-1 text-xl font-black capitalize">{value}</p></div>;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function itemToString(item: any): string {
  if (typeof item === "string") return item;
  if (item && typeof item === "object") {
    // Handle structured playlist items from AI (e.g. { name, artists_to_include, genres })
    if (item.name) {
      const parts = [item.name];
      if (item.artists_to_include) parts.push(`by ${item.artists_to_include}`);
      if (item.description) parts.push(`— ${item.description}`);
      return parts.join(" ");
    }
    // Handle food items like { item, description, vibe_adaptation }
    if (item.item) {
      const parts = [item.item];
      if (item.description) parts.push(`— ${item.description}`);
      return parts.join(" ");
    }
    // Handle budget breakdown items (e.g. { category, amount })
    if (item.category) {
      const parts = [item.category];
      if (item.amount) parts.push(String(item.amount));
      if (item.description) parts.push(`— ${item.description}`);
      return parts.join(": ");
    }
    // Handle timeline items (e.g. { time, activity })
    if (item.time || item.activity) {
      const parts: string[] = [];
      if (item.time) parts.push(String(item.time));
      if (item.activity) parts.push(String(item.activity));
      if (item.description) parts.push(`— ${item.description}`);
      return parts.join(" — ");
    }
    // Handle any other object with common fields we might want to display
    const parts: string[] = [];
    for (const key of ["title", "name", "item", "category", "amount", "time", "activity", "description", "tip"]) {
      if (item[key]) {
        parts.push(String(item[key]));
      }
    }
    if (parts.length > 0) {
      return parts.join(" — ");
    }
    // Fallback to stringify if nothing else matches
    return JSON.stringify(item);
  }
  return String(item);
}

function PlanSection({ title, items, children }: { title: string; items: unknown[]; children?: React.ReactNode }) {
  return (
    <BrutalCard className="print:shadow-none">
      <h3 className="text-3xl font-black">{title}</h3>
      <ul className="mt-5 space-y-3">
        {items.map((item, i) => {
          const display = itemToString(item);
          return (
            <li key={`${title}-${i}`} className="rounded-xl border-4 border-black bg-white p-4 font-bold">{display}</li>
          );
        })}
      </ul>
      {children}
    </BrutalCard>
  );
}
