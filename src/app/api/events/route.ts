import { NextResponse } from "next/server";
import { getUserFromToken, createSupabaseAdminClient } from "@/lib/supabase/server";
import { eventSchema } from "@/lib/validations";
import type { EventPlan } from "@/lib/database.types";

export async function POST(request: Request) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) {
      return NextResponse.json({ error: "Authentication is required." }, { status: 401 });
    }

    const body = (await request.json()) as { event?: unknown; plan?: EventPlan; userId?: string };
    const parsed = eventSchema.safeParse(body.event);
    if (!parsed.success || !body.plan || !body.userId) {
      return NextResponse.json({ error: "Invalid event payload." }, { status: 400 });
    }

    const user = await getUserFromToken(token);
    const supabaseAdmin = createSupabaseAdminClient();

    const { data: event, error: eventError } = await supabaseAdmin
      .from("events")
      .insert({ ...parsed.data, user_id: user.id })
      .select("id")
      .single();

    if (eventError || !event) {
      return NextResponse.json({ error: eventError?.message ?? "Could not save event." }, { status: 500 });
    }

    const { error: planError } = await supabaseAdmin.from("event_plans").insert({
      event_id: event.id,
      ai_response: body.plan,
    });

    if (planError) {
      return NextResponse.json({ error: planError.message }, { status: 500 });
    }

    return NextResponse.json({ eventId: event.id });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not save event.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
