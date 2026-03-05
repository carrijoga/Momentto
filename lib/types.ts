// Shared types used across the app
export interface CountdownEntry {
  id: string
  user_id?: string
  share_id?: string | null
  share_expires_mode?: "5d" | "30d" | "never" | null
  category: string
  title: string
  date: string
  time?: string | null
  created_at: string
  expires_at?: string | null
}

export type ShareExpiresMode = "5d" | "30d" | "never"

/**
 * A countdown saved from another user's public share link.
 * Stored as a reference (share_id) + resolved cache fields for offline display.
 */
export interface SavedCountdownEntry {
  /** Local/Supabase UUID — may be "saved_temp_*" while offline */
  id: string
  share_id: string
  saved_at: string
  /** Resolved fields from the countdown (cached for offline) */
  title: string
  date: string
  category: string
  expires_at?: string | null
}
