export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type VibeLevel = "chill" | "balanced" | "turn_up" | "chaos_mode";

export interface EventPlan {
  summary: string;
  playlist: string[];
  food_recommendations: string[];
  activities: string[];
  timeline: string[];
  budget_breakdown: string[];
  tips: string[];
}

export interface EventInput {
  name: string;
  type: string;
  budget: number;
  guest_count: number;
  location: string;
  duration: string;
  vibe_level: VibeLevel;
  event_date: string;
  music_genres: string[];
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          email: string;
          created_at: string;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          email: string;
          created_at?: string;
        };
        Update: {
          full_name?: string | null;
          email?: string;
        };
        Relationships: [];
      };
      events: {
        Row: EventInput & {
          id: string;
          user_id: string;
          created_at: string;
        };
        Insert: EventInput & {
          id?: string;
          user_id: string;
          created_at?: string;
        };
        Update: Partial<EventInput>;
        Relationships: [];
      };
      event_plans: {
        Row: {
          id: string;
          event_id: string;
          ai_response: EventPlan;
          created_at: string;
          spotify_playlist_url: string | null;
        };
        Insert: {
          id?: string;
          event_id: string;
          ai_response: EventPlan;
          created_at?: string;
          spotify_playlist_url?: string | null;
        };
        Update: {
          ai_response?: EventPlan;
          spotify_playlist_url?: string | null;
        };
        Relationships: [];
      };
      spotify_tokens: {
        Row: {
          user_id: string;
          access_token: string;
          refresh_token: string;
          expires_at: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          access_token: string;
          refresh_token: string;
          expires_at: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          access_token?: string;
          refresh_token?: string;
          expires_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
