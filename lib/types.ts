// Shared types used across the app
export interface CountdownEntry {
  id: string
  user_id?: string
  share_id?: string | null
  category: string
  title: string
  date: string
  time?: string | null
  created_at: string
  expires_at?: string | null
}
