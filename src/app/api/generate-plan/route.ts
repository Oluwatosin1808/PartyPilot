import { NextResponse } from "next/server";
import { generateEventPlan } from "@/lib/ai/gemini";
import { eventSchema } from "@/lib/validations";

export async function POST(request: Request) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) {
      return NextResponse.json({ error: "Authentication is required." }, { status: 401 });
    }

    const body = await request.json();
    const parsed = eventSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid event data." }, { status: 400 });
    }

    const plan = await generateEventPlan(parsed.data);
    return NextResponse.json({ plan });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not generate event plan.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
