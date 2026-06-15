import Link from "next/link";
import { ClipboardList, DollarSign, Music, Sparkles, Users } from "lucide-react";
import { samplePlan } from "@/lib/constants";
import { BrutalCard, SectionShell } from "@/components/ui/card";
import { LinkButton } from "@/components/ui/button";

const steps = [
  ["Tell PartyPilot the event shape", "Type, date, guests, budget, music, and vibe."],
  ["Generate the operating plan", "Gemini turns the inputs into a practical run-of-show."],
  ["Save, revisit, print", "Keep every plan ready for vendors, friends, and day-of helpers."],
];

export function LandingPage() {
  return (
    <main className="min-h-screen bg-white text-black">
      <header className="flex items-center justify-between border-b-4 border-black px-5 py-5 sm:px-8 lg:px-12">
        <Link href="/" className="text-2xl font-black">PartyPilot</Link>
        <nav className="hidden items-center gap-6 text-sm font-black uppercase md:flex">
          <a href="#how">How it works</a>
          <a href="#examples">Plan</a>
          <a href="#pricing">Pricing</a>
        </nav>
        <LinkButton href="/login" variant="secondary" className="min-h-10 px-4 py-2 text-sm shadow-[4px_4px_0_#000]">
          Login
        </LinkButton>
      </header>

      <section className="grid min-h-[calc(100vh-88px)] items-center gap-10 px-5 py-10 sm:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:px-12">
        <div>
          <div className="mb-6 inline-flex rounded-full border-4 border-black bg-blue-400 px-4 py-2 text-sm font-black uppercase">
            AI event plans without the spreadsheet spiral
          </div>
          <h1 className="max-w-5xl text-6xl font-black leading-[0.9] sm:text-7xl lg:text-8xl">
            Plan unforgettable events in minutes.
          </h1>
          <p className="mt-7 max-w-2xl text-xl font-bold leading-relaxed">
            PartyPilot uses AI to generate playlists, timelines, activities, food ideas, and budget plans tailored to your event.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <LinkButton href="/signup">Plan My Event</LinkButton>
            <LinkButton href="#examples" variant="secondary">See Example</LinkButton>
          </div>
        </div>

        <BrutalCard className="rotate-1 bg-yellow-300 p-5">
          <div className="rounded-xl border-4 border-black bg-white p-5">
            <div className="flex items-center justify-between border-b-4 border-black pb-4">
              <div>
                <p className="text-sm font-black uppercase">Generated Plan</p>
                <h2 className="text-3xl font-black">Rooftop Birthday</h2>
              </div>
              <Sparkles className="h-10 w-10" aria-hidden />
            </div>
            <div className="grid gap-4 pt-5 sm:grid-cols-2">
              {[
                [Music, "Playlist", "4 energy arcs"],
                [ClipboardList, "Timeline", "Minute-by-minute"],
                [DollarSign, "Budget", "5 allocations"],
                [Users, "Guests", "48-person flow"],
              ].map(([Icon, title, text]) => (
                <div key={String(title)} className="rounded-xl border-4 border-black bg-white p-4 shadow-[4px_4px_0_#000]">
                  <Icon className="mb-3 h-7 w-7" aria-hidden />
                  <p className="text-lg font-black">{String(title)}</p>
                  <p className="font-bold">{String(text)}</p>
                </div>
              ))}
            </div>
          </div>
        </BrutalCard>
      </section>

      <SectionShell id="how" className="bg-yellow-300">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-5xl font-black">How it works</h2>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {steps.map(([title, text], index) => (
              <BrutalCard key={title}>
                <p className="text-5xl font-black text-blue-500">0{index + 1}</p>
                <h3 className="mt-4 text-2xl font-black">{title}</h3>
                <p className="mt-3 font-bold leading-relaxed">{text}</p>
              </BrutalCard>
            ))}
          </div>
        </div>
      </SectionShell>

      <SectionShell>
        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <h2 className="text-5xl font-black">Event types</h2>
            <p className="mt-4 text-lg font-bold">Birthdays, dinners, launches, weddings, game nights, house parties, and the weird ones that do not fit a template.</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {["House Party", "Dinner", "Launch", "Wedding", "Birthday", "Game Night"].map((type) => (
              <div key={type} className="rounded-xl border-4 border-black bg-white p-5 text-2xl font-black shadow-[5px_5px_0_#000]">
                {type}
              </div>
            ))}
          </div>
        </div>
      </SectionShell>

      <SectionShell id="examples" className="bg-blue-400">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-5xl font-black">Example generated plan</h2>
          <div className="mt-8 grid gap-6 lg:grid-cols-3">
            {Object.entries(samplePlan).map(([key, value]) => (
              <BrutalCard key={key} className={key === "summary" ? "lg:col-span-3" : ""}>
                <h3 className="mb-3 text-xl font-black capitalize">{key.replaceAll("_", " ")}</h3>
                {Array.isArray(value) ? (
                  <ul className="space-y-2 font-bold">
                    {value.map((item) => <li key={item}>• {item}</li>)}
                  </ul>
                ) : (
                  <p className="text-lg font-bold leading-relaxed">{value}</p>
                )}
              </BrutalCard>
            ))}
          </div>
        </div>
      </SectionShell>

      <SectionShell>
        <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-3">
          {["It planned a dinner flow I could actually run.", "The budget split saved my launch night.", "Chaos Mode understood the assignment."].map((quote) => (
            <BrutalCard key={quote}>
              <p className="text-2xl font-black leading-tight">“{quote}”</p>
              <p className="mt-5 font-black uppercase">PartyPilot user</p>
            </BrutalCard>
          ))}
        </div>
      </SectionShell>

      <SectionShell id="pricing" className="bg-yellow-300">
        <div className="mx-auto grid max-w-6xl items-center gap-8 lg:grid-cols-2">
          <div>
            <h2 className="text-5xl font-black">Simple launch pricing</h2>
            <p className="mt-4 text-xl font-bold">Start free. Upgrade when PartyPilot is part of every weekend.</p>
          </div>
          <BrutalCard>
            <p className="text-sm font-black uppercase">Pilot</p>
            <p className="mt-2 text-6xl font-black">$9</p>
            <p className="mt-3 text-lg font-bold">Unlimited saved events, PDF export, and premium planning prompts.</p>
            <LinkButton href="/signup" className="mt-6 w-full">Plan My Event</LinkButton>
          </BrutalCard>
        </div>
      </SectionShell>
    </main>
  );
}
