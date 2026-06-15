import { z } from "zod";

export const eventSchema = z.object({
  name: z.string().min(2, "Name is required."),
  type: z.string().min(2, "Event type is required."),
  budget: z.coerce.number().positive("Budget must be greater than zero."),
  guest_count: z.coerce.number().int().positive("Guest count must be greater than zero."),
  location: z.string().min(2, "Location is required."),
  duration: z.string().min(2, "Duration is required."),
  vibe_level: z.enum(["chill", "balanced", "turn_up", "chaos_mode"]),
  event_date: z.string().min(8, "Date is required."),
  music_genres: z.array(z.string()).min(1, "Choose at least one genre."),
});

export type EventFormValues = z.infer<typeof eventSchema>;
