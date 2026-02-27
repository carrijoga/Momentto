import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import {
  getPendingOps,
  removePendingOp,
  upsertCountdownToDB,
  removeCountdownFromDB,
  getAllCountdownsFromDB,
} from "@/lib/db"
import type { CountdownEntry } from "@/lib/types"

let isSyncing = false

/**
 * Updates the user_id of all local IDB entries that belonged to an anonymous
 * session so they are correctly attributed to the new named account.
 */
export async function migrateLocalData(
  oldUserId: string,
  newUserId: string
): Promise<void> {
  const all = await getAllCountdownsFromDB()
  for (const entry of all) {
    if (!entry.user_id || entry.user_id === oldUserId) {
      await upsertCountdownToDB({ ...entry, user_id: newUserId })
    }
  }
}

export async function syncPendingOps(userId: string): Promise<void> {
  if (isSyncing) return
  if (!navigator.onLine) return

  isSyncing = true
  const supabase = getSupabaseBrowserClient()

  try {
    const ops = await getPendingOps()

    for (const op of ops) {
      try {
        if (op.type === "create") {
          const entry = op.payload as CountdownEntry

          const { data, error } = await supabase
            .from("countdowns")
            .insert({
              user_id: userId,
              category: entry.category,
              title: entry.title,
              date: entry.date,
              time: entry.time ?? null,
              created_at: entry.created_at,
            })
            .select()
            .single()

          if (error) continue // keep op, retry next time

          const real = data as CountdownEntry
          // Swap temp entry for real server entry
          await removeCountdownFromDB(entry.id)
          await upsertCountdownToDB(real)
          await removePendingOp(op.id)
        } else if (op.type === "update") {
          const { id, ...patch } = op.payload

          // Skip updates for temp entries that are still pending create
          if (id?.startsWith("temp_")) {
            await removePendingOp(op.id)
            continue
          }

          const { error } = await supabase
            .from("countdowns")
            .update(patch)
            .eq("id", id!)

          if (error) continue
          await removePendingOp(op.id)
        } else if (op.type === "delete") {
          const { id } = op.payload

          // Skip deletes for temp entries — they were never on server
          if (id?.startsWith("temp_")) {
            await removePendingOp(op.id)
            continue
          }

          const { error } = await supabase
            .from("countdowns")
            .delete()
            .eq("id", id!)

          // PGRST116 = row not found → already deleted, that's fine
          if (error && error.code !== "PGRST116") continue
          await removePendingOp(op.id)
        }
      } catch {
        // Keep op in queue for next attempt
      }
    }
  } finally {
    isSyncing = false
    window.dispatchEvent(new Event("countdowns-synced"))
  }
}
