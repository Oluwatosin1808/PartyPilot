import { GoogleGenAI } from "@google/genai";
import type { EventInput, EventPlan } from "@/lib/database.types";

const emptyPlan: EventPlan = {
  summary: "",
  playlist: [],
  food_recommendations: [],
  activities: [],
  timeline: [],
  budget_breakdown: [],
  tips: [],
};

export async function generateEventPlan(input: EventInput): Promise<EventPlan> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured.");
  }

  const ai = new GoogleGenAI({ apiKey });
  const prompt = `You are a professional DJ and event planner.

Generate songs for:
- Arrival
- Warm Up
- Peak Energy
- Wind Down

Requirements:
- Include artist name
- Include song title
- Prioritize popular and danceable tracks
- Match the selected vibe level

Also generate a complete event plan.

Return valid JSON only.

Event input:
${JSON.stringify(input, null, 2)}

JSON structure:
{
  "summary": "",
  "playlist": {
    "arrival": [],
    "warm_up": [],
    "peak_energy": [],
    "wind_down": []
  },
  "food_recommendations": [],
  "activities": [],
  "timeline": [],
  "budget_breakdown": [],
  "tips": []
}

Provide highly practical recommendations. Adapt every recommendation based on vibe level.`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
  });

  const text = response.text?.trim() ?? "";
  const cleaned = text.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```$/i, "").trim();
  
  let parsed;
  try {
    parsed = JSON.parse(cleaned) as Partial<EventPlan>;
  } catch (jsonError) {
    console.error("Error parsing Gemini JSON response:", jsonError);
    throw new Error("Failed to parse event plan. Please try again later.");
  }

  // Flatten playlist array for backward compatibility
  const flatPlaylist: string[] = [];
  if (parsed.playlist) {
    if (Array.isArray(parsed.playlist)) {
      flatPlaylist.push(...parsed.playlist);
    } else {
      const playlistObj = parsed.playlist as any;
      if (playlistObj.arrival) flatPlaylist.push(...playlistObj.arrival);
      if (playlistObj.warm_up) flatPlaylist.push(...playlistObj.warm_up);
      if (playlistObj.peak_energy) flatPlaylist.push(...playlistObj.peak_energy);
      if (playlistObj.wind_down) flatPlaylist.push(...playlistObj.wind_down);
    }
  }

  return {
    ...emptyPlan,
    ...parsed,
    playlist: flatPlaylist,
    food_recommendations: parsed.food_recommendations ?? [],
    activities: parsed.activities ?? [],
    timeline: parsed.timeline ?? [],
    budget_breakdown: parsed.budget_breakdown ?? [],
    tips: parsed.tips ?? [],
  };
}
