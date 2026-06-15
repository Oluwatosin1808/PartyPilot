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
  const prompt = `You are a world-class event planner.

Generate a complete event plan.
Return valid JSON only.

Event input:
${JSON.stringify(input, null, 2)}

JSON structure:
{
  "summary": "",
  "playlist": [],
  "food_recommendations": [],
  "activities": [],
  "timeline": [],
  "budget_breakdown": [],
  "tips": []
}

Provide highly practical recommendations. Adapt every recommendation based on vibe_level.`;

  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents: prompt,
  });

  const text = response.text?.trim() ?? "";
  const cleaned = text.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```$/i, "").trim();
  const parsed = JSON.parse(cleaned) as Partial<EventPlan>;

  return {
    ...emptyPlan,
    ...parsed,
    playlist: parsed.playlist ?? [],
    food_recommendations: parsed.food_recommendations ?? [],
    activities: parsed.activities ?? [],
    timeline: parsed.timeline ?? [],
    budget_breakdown: parsed.budget_breakdown ?? [],
    tips: parsed.tips ?? [],
  };
}
