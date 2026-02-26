import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import {
  getAllCountdownsFromDB,
  upsertCountdownToDB,
  removeCountdownFromDB,
  addPendingOp,
  getPendingOps,
  clearPendingOpsForId,
} from "@/lib/db"
import type { CountdownEntry } from "@/lib/types"

// ── Read ───────────────────────────────────────────────────────────────────

export async function fetchCountdowns(): Promise<CountdownEntry[]> {
  // Always return IDB data first for instant display
  const local = await getAllCountdownsFromDB()
  if (!navigator.onLine) return local

  try {
    const supabase = getSupabaseBrowserClient()
    const { data, error } = await supabase
      .from("countdowns")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) throw new Error(error.message)

    const entries = (data ?? []) as CountdownEntry[]

    // Sync server entries into IDB
    for (const entry of entries) {
      await upsertCountdownToDB(entry)
    }

    // Remove non-temp local entries that no longer exist on the server
    const serverIds = new Set(entries.map((e) => e.id))
    for (const localEntry of local) {
      if (!localEntry.id.startsWith("temp_") && !serverIds.has(localEntry.id)) {
        await removeCountdownFromDB(localEntry.id)
      }
    }

    return await getAllCountdownsFromDB()
  } catch {
    return local
  }
}

// ── Create ─────────────────────────────────────────────────────────────────

export async function createCountdown(
  entry: Omit<CountdownEntry, "id" | "user_id" | "share_id" | "expires_at">
): Promise<CountdownEntry> {
  const tempId = `temp_${crypto.randomUUID().replace(/-/g, "")}`
  const tempEntry: CountdownEntry = {
    id: tempId,
    category: entry.category,
    title: entry.title,
    date: entry.date,
    time: entry.time ?? null,
    created_at: entry.created_at,
  }

  // Optimistic local save
  await upsertCountdownToDB(tempEntry)

  if (!navigator.onLine) {
    await addPendingOp({ type: "create", payload: tempEntry, tempId })
    return tempEntry
  }

  try {
    const supabase = getSupabaseBrowserClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) throw new Error("Not authenticated")

    const { data, error } = await supabase
      .from("countdowns")
      .insert({
        user_id: user.id,
        category: entry.category,
        title: entry.title,
        date: entry.date,
        time: entry.time ?? null,
        created_at: entry.created_at,
      })
      .select()
      .single()

    if (error) throw new Error(error.message)

    const created = data as CountdownEntry
    // Swap temp entry for the real one
    await removeCountdownFromDB(tempId)
    await upsertCountdownToDB(created)
    return created
  } catch {
    // Couldn't reach server — queue for later
    await addPendingOp({ type: "create", payload: tempEntry, tempId })
    return tempEntry
  }
}

// ── Update ─────────────────────────────────────────────────────────────────

export async function updateCountdown(
  id: string,
  patch: Partial<Pick<CountdownEntry, "category" | "title" | "date" | "time">>
): Promise<CountdownEntry> {
  const allLocal = await getAllCountdownsFromDB()
  const existing = allLocal.find((c) => c.id === id)
  if (!existing) throw new Error("Countdown not found")

  const updated: CountdownEntry = { ...existing, ...patch }
  await upsertCountdownToDB(updated)

  if (!navigator.onLine || id.startsWith("temp_")) {
    await addPendingOp({ type: "update", payload: { id, ...patch } })
    return updated
  }

  try {
    const supabase = getSupabaseBrowserClient()
    const { data, error } = await supabase
      .from("countdowns")
      .update(patch)
      .eq("id", id)
      .select()
      .single()

    if (error) throw new Error(error.message)

    const serverUpdated = data as CountdownEntry
    await upsertCountdownToDB(serverUpdated)
    return serverUpdated
  } catch {
    await addPendingOp({ type: "update", payload: { id, ...patch } })
    return updated
  }
}

// ── Delete ─────────────────────────────────────────────────────────────────

export async function deleteCountdown(id: string): Promise<void> {
  // Problem-3 fix: if a pending create exists for this id, cancel both — never hit the server
  const pendingOps = await getPendingOps()
  const hasPendingCreate = pendingOps.some(
    (op) => op.type === "create" && (op.payload.id === id || op.tempId === id)
  )

  await removeCountdownFromDB(id)

  if (hasPendingCreate) {
    await clearPendingOpsForId(id)
    return
  }

  if (!navigator.onLine) {
    await addPendingOp({ type: "delete", payload: { id } as CountdownEntry })
    return
  }

  try {
    const supabase = getSupabaseBrowserClient()
    const { error } = await supabase.from("countdowns").delete().eq("id", id)
    if (error) throw new Error(error.message)
  } catch {
    await addPendingOp({ type: "delete", payload: { id } as CountdownEntry })
  }
}

// ── Share link ─────────────────────────────────────────────────────────────

function generateShareId(): string {
  return crypto.randomUUID().replace(/-/g, "").slice(0, 8)
}

function getExpiresAt(eventDate: string): string {
  const d = new Date(eventDate + "T23:59:59")
  d.setDate(d.getDate() + 5)
  return d.toISOString()
}

export async function generateShareLink(
  entry: CountdownEntry
): Promise<CountdownEntry> {
  if (entry.share_id) return entry

  const shareId = generateShareId()
  const expiresAt = getExpiresAt(entry.date)

  const supabase = getSupabaseBrowserClient()
  const { data, error } = await supabase
    .from("countdowns")
    .update({ share_id: shareId, expires_at: expiresAt })
    .eq("id", entry.id)
    .select()
    .single()

  if (error) throw new Error(error.message)

  const updated = data as CountdownEntry
  await upsertCountdownToDB(updated)
  return updated
}
