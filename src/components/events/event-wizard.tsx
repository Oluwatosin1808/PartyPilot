"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { AppShell } from "@/components/app-shell";
import { AuthGate } from "@/components/auth/auth-gate";
import { Button } from "@/components/ui/button";
import { BrutalCard } from "@/components/ui/card";
import { Input, Label, Select } from "@/components/ui/field";
import { eventTypes, vibeLevels } from "@/lib/constants";
import { eventSchema, type EventFormValues } from "@/lib/validations";
import { useSupabase } from "@/components/supabase-provider";
import type { EventPlan } from "@/lib/database.types";

const genres = ["Afrobeats", "House", "Pop", "Hip-Hop", "R&B", "Amapiano", "Disco", "Latin"];
const steps = ["Basic Details", "Guests and Budget", "Music Preferences", "Vibe Selection", "Generate Plan"];

const initialValues: EventFormValues = {
  name: "",
  type: "Birthday",
  budget: 1500,
  guest_count: 40,
  location: "",
  duration: "4 hours",
  vibe_level: "balanced",
  event_date: "",
  music_genres: ["Afrobeats"],
};

export function EventWizard() {
  return <AuthGate>{(user) => <EventWizardContent user={user} />}</AuthGate>;
}

function EventWizardContent({ user }: { user: User }) {
  const router = useRouter();
  const supabase = useSupabase();
  const [step, setStep] = useState(0);
  const [values, setValues] = useState<EventFormValues>(initialValues);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function update<Key extends keyof EventFormValues>(key: Key, value: EventFormValues[Key]) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  function toggleGenre(genre: string) {
    setValues((current) => ({
      ...current,
      music_genres: current.music_genres.includes(genre)
        ? current.music_genres.filter((item) => item !== genre)
        : [...current.music_genres, genre],
    }));
  }

  async function generateAndSave() {
    setError("");
    const parsed = eventSchema.safeParse(values);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Check your event details.");
      return;
    }
    if (!supabase) {
      setError("Supabase is not configured.");
      return;
    }

    setLoading(true);
    const token = (await supabase.auth.getSession()).data.session?.access_token;
    if (!token) {
      setError("Your session expired. Please log in again.");
      setLoading(false);
      return;
    }

    const planResponse = await fetch("/api/generate-plan", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(parsed.data),
    });

    const planBody = (await planResponse.json()) as { plan?: EventPlan; error?: string };
    if (!planResponse.ok || !planBody.plan) {
      setError(planBody.error ?? "Could not generate the plan.");
      setLoading(false);
      return;
    }

    const saveResponse = await fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ event: parsed.data, plan: planBody.plan, userId: user.id }),
    });
    const saveBody = (await saveResponse.json()) as { eventId?: string; error?: string };
    setLoading(false);

    if (!saveResponse.ok || !saveBody.eventId) {
      setError(saveBody.error ?? "Could not save the event.");
      return;
    }

    router.push(`/events/${saveBody.eventId}`);
  }

  return (
    <AppShell>
      <section className="px-5 py-10 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-5xl">
          <div className="mb-8">
            <p className="text-sm font-black uppercase">Create event</p>
            <h1 className="text-5xl font-black leading-none">Build the plan.</h1>
          </div>

          <div className="mb-8 grid gap-3 md:grid-cols-5">
            {steps.map((label, index) => (
              <div key={label} className={`rounded-xl border-4 border-black p-3 text-sm font-black ${index <= step ? "bg-yellow-300" : "bg-white"}`}>
                {index + 1}. {label}
              </div>
            ))}
          </div>

          <BrutalCard>
            {step === 0 ? (
              <div className="grid gap-5 md:grid-cols-2">
                <Field label="Event name"><Input value={values.name} onChange={(event) => update("name", event.target.value)} placeholder="Maya's rooftop birthday" /></Field>
                <Field label="Event type"><Select value={values.type} onChange={(event) => update("type", event.target.value)}>{eventTypes.map((type) => <option key={type}>{type}</option>)}</Select></Field>
                <Field label="Date"><Input type="date" value={values.event_date} onChange={(event) => update("event_date", event.target.value)} /></Field>
                <Field label="Location"><Input value={values.location} onChange={(event) => update("location", event.target.value)} placeholder="Brooklyn rooftop" /></Field>
              </div>
            ) : null}

            {step === 1 ? (
              <div className="grid gap-5 md:grid-cols-3">
                <Field label="Guest count"><Input type="number" value={values.guest_count} onChange={(event) => update("guest_count", Number(event.target.value))} /></Field>
                <Field label="Budget"><Input type="number" value={values.budget} onChange={(event) => update("budget", Number(event.target.value))} /></Field>
                <Field label="Duration"><Input value={values.duration} onChange={(event) => update("duration", event.target.value)} /></Field>
              </div>
            ) : null}

            {step === 2 ? (
              <div>
                <h2 className="text-3xl font-black">Pick music lanes</h2>
                <div className="mt-5 grid gap-3 sm:grid-cols-2 md:grid-cols-4">
                  {genres.map((genre) => (
                    <button key={genre} type="button" onClick={() => toggleGenre(genre)} className={`rounded-xl border-4 border-black p-4 text-left font-black shadow-[4px_4px_0_#000] ${values.music_genres.includes(genre) ? "bg-blue-400" : "bg-white"}`}>
                      {genre}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            {step === 3 ? (
              <div className="grid gap-4 md:grid-cols-2">
                {vibeLevels.map((vibe) => (
                  <button key={vibe.value} type="button" onClick={() => update("vibe_level", vibe.value)} className={`rounded-xl border-4 border-black p-5 text-left shadow-[5px_5px_0_#000] ${values.vibe_level === vibe.value ? "bg-yellow-300" : "bg-white"}`}>
                    <span className="text-4xl" aria-hidden>{vibe.icon}</span>
                    <span className="mt-3 block text-2xl font-black">{vibe.label}</span>
                    <span className="mt-2 block font-bold">{vibe.description}</span>
                  </button>
                ))}
              </div>
            ) : null}

            {step === 4 ? (
              <div>
                <h2 className="text-4xl font-black">Ready to generate.</h2>
                <p className="mt-3 text-lg font-bold">PartyPilot will create the plan and save it to your event library.</p>
                <div className="mt-6 rounded-xl border-4 border-black bg-yellow-300 p-5 font-bold">
                  {values.name || "Untitled event"} • {values.guest_count} guests • ${values.budget} • {values.vibe_level.replaceAll("_", " ")}
                </div>
              </div>
            ) : null}

            {error ? <p className="mt-6 rounded-xl border-4 border-black bg-blue-400 p-4 font-black">{error}</p> : null}

            <div className="mt-8 flex flex-wrap justify-between gap-4">
              <Button type="button" variant="secondary" disabled={step === 0 || loading} onClick={() => setStep((current) => Math.max(0, current - 1))}>Back</Button>
              {step < steps.length - 1 ? (
                <Button type="button" onClick={() => setStep((current) => current + 1)}>Next</Button>
              ) : (
                <Button type="button" disabled={loading} onClick={generateAndSave}>{loading ? "Generating..." : "Generate Plan"}</Button>
              )}
            </div>
          </BrutalCard>
        </div>
      </section>
    </AppShell>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-2"><Label>{label}</Label>{children}</div>;
}
