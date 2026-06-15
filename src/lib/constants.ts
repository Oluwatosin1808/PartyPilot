import type { EventPlan, VibeLevel } from "@/lib/database.types";

export const vibeLevels: Array<{
  value: VibeLevel;
  label: string;
  icon: string;
  description: string;
}> = [
  { value: "chill", label: "Chill", icon: "😌", description: "Easy pacing, mellow tracks, relaxed hosting." },
  { value: "balanced", label: "Balanced", icon: "🕺", description: "Polished flow with energy peaks and breathing room." },
  { value: "turn_up", label: "Turn Up", icon: "🔥", description: "High-energy moments, bold food, bigger activities." },
  { value: "chaos_mode", label: "Chaos Mode", icon: "🚀", description: "Maximum momentum, wild prompts, late-night fuel." },
];

export const eventTypes = ["Birthday", "House Party", "Dinner", "Launch", "Wedding", "Game Night"];

export const samplePlan: EventPlan = {
  summary:
    "A 4-hour rooftop birthday with a warm arrival window, shared plates, three music energy shifts, and one memorable group game before cake.",
  playlist: ["Kaytranada - Lite Spots", "Dua Lipa - Houdini", "Burna Boy - City Boys", "Disclosure - Latch"],
  food_recommendations: ["Mini sliders", "Jollof rice cups", "Citrus mocktail bar", "Late-night suya skewers"],
  activities: ["Polaroid guest wall", "Two-truths roast round", "Cake countdown", "After-dark dance block"],
  timeline: ["6:00 PM arrivals", "6:45 PM food opens", "7:30 PM activity round", "8:30 PM cake", "9:00 PM dance"],
  budget_breakdown: ["Food 42%", "Drinks 18%", "Decor 14%", "Entertainment 16%", "Buffer 10%"],
  tips: ["Put drinks near the playlist zone", "Keep one table clear for gifts", "Print the timeline for helpers"],
};
