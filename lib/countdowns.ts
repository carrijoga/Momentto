import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import {
  getAllCountdownsFromDB,
  upsertCountdownToDB,
  removeCountdownFromDB,
  addPendingOp,
  getPendingOps,
  clearPendingOpsForId,
  getAllSavedFromDB,
  upsertSavedToDB,
  removeSavedFromDB,
  upsertSavedCache,
  removeSavedCache,
} from "@/lib/db"
import type { CountdownEntry, SavedCountdownEntry, ShareExpiresMode } from "@/lib/types"
import { resolveShareIds } from "@/app/actions"

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

function getExpiresAt(eventDate: string, mode: ShareExpiresMode): string | null {
  if (mode === "never") return null
  const days = mode === "30d" ? 30 : 5

  // Anchor off the event date so the link lives N days past the event
  const eventBased = new Date(eventDate + "T23:59:59")
  eventBased.setDate(eventBased.getDate() + days)

  // But always guarantee at least N days from now — covers past/same-day events
  const nowBased = new Date()
  nowBased.setDate(nowBased.getDate() + days)

  return (eventBased > nowBased ? eventBased : nowBased).toISOString()
}

export async function generateShareLink(
  entry: CountdownEntry,
  mode: ShareExpiresMode = "5d"
): Promise<CountdownEntry> {
  if (entry.share_id) return entry

  const shareId = generateShareId()
  const expiresAt = getExpiresAt(entry.date, mode)

  const supabase = getSupabaseBrowserClient()
  const { data, error } = await supabase
    .from("countdowns")
    .update({
      share_id: shareId,
      expires_at: expiresAt,
      share_expires_mode: mode,
    })
    .eq("id", entry.id)
    .select()
    .single()

  if (error) throw new Error(error.message)

  const updated = data as CountdownEntry
  await upsertCountdownToDB(updated)
  return updated
}

export async function revokeShareLink(entry: CountdownEntry): Promise<CountdownEntry> {
  if (!entry.share_id) return entry

  // Optimistic local update
  const optimistic: CountdownEntry = { ...entry, share_id: null, expires_at: null, share_expires_mode: null }
  await upsertCountdownToDB(optimistic)

  try {
    const supabase = getSupabaseBrowserClient()
    const { data, error } = await supabase
      .from("countdowns")
      .update({ share_id: null, expires_at: null, share_expires_mode: "5d" })
      .eq("id", entry.id)
      .select()
      .single()

    if (error) throw new Error(error.message)

    const updated = data as CountdownEntry
    await upsertCountdownToDB(updated)
    return updated
  } catch {
    return optimistic
  }
}

// ── Saved countdowns ───────────────────────────────────────────────────────

export async function fetchSavedCountdowns(): Promise<SavedCountdownEntry[]> {
  const local = await getAllSavedFromDB()
  if (!navigator.onLine) return local

  try {
    const supabase = getSupabaseBrowserClient()
    const { data, error } = await supabase
      .from("saved_countdowns")
      .select("id, share_id, saved_at")
      .order("saved_at", { ascending: false })

    if (error) throw new Error(error.message)

    const rows = (data ?? []) as { id: string; share_id: string; saved_at: string }[]
    const shareIds = rows.map((r) => r.share_id)

    // Resolve live data for each share_id in batch
    const resolved = shareIds.length > 0 ? await resolveShareIds(shareIds) : []
    const resolvedMap = new Map(resolved.map((r) => [r.share_id, r]))

    const entries: SavedCountdownEntry[] = []
    const revokedIds: string[] = []

    for (const row of rows) {
      const live = resolvedMap.get(row.share_id)
      if (!live) {
        // Link revoked — remove from server and local
        revokedIds.push(row.id)
        await removeSavedFromDB(row.id)
        await removeSavedCache(row.share_id)
        continue
      }
      const entry: SavedCountdownEntry = {
        id: row.id,
        share_id: row.share_id,
        saved_at: row.saved_at,
        title: live.title,
        date: live.date,
        category: live.category,
        expires_at: live.expires_at ?? null,
      }
      await upsertSavedToDB(entry)
      await upsertSavedCache(entry)
      entries.push(entry)
    }

    // Clean up revoked from server
    if (revokedIds.length > 0) {
      await supabase.from("saved_countdowns").delete().in("id", revokedIds)
      // Dispatch event so UI can show toast
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("saved-countdowns-revoked", { detail: { revokedIds } }))
      }
    }

    return entries
  } catch {
    return local
  }
}

export async function saveCountdown(shareId: string, resolvedData: {
  title: string
  date: string
  category: string
  expires_at?: string | null
}): Promise<SavedCountdownEntry> {
  const tempId = `saved_temp_${crypto.randomUUID().replace(/-/g, "")}`
  const now = new Date().toISOString()
  const optimistic: SavedCountdownEntry = {
    id: tempId,
    share_id: shareId,
    saved_at: now,
    title: resolvedData.title,
    date: resolvedData.date,
    category: resolvedData.category,
    expires_at: resolvedData.expires_at ?? null,
  }

  await upsertSavedToDB(optimistic)
  await upsertSavedCache(optimistic)

  try {
    const supabase = getSupabaseBrowserClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Not authenticated")

    const { data, error } = await supabase
      .from("saved_countdowns")
      .upsert(
        { user_id: user.id, share_id: shareId, saved_at: now },
        { onConflict: "user_id,share_id" }
      )
      .select()
      .single()

    if (error) throw new Error(error.message)

    const saved: SavedCountdownEntry = {
      id: data.id,
      share_id: data.share_id,
      saved_at: data.saved_at,
      title: resolvedData.title,
      date: resolvedData.date,
      category: resolvedData.category,
      expires_at: resolvedData.expires_at ?? null,
    }
    await removeSavedFromDB(tempId)
    await upsertSavedToDB(saved)
    await upsertSavedCache(saved)
    return saved
  } catch {
    return optimistic
  }
}

export async function unsaveCountdown(id: string, shareId: string): Promise<void> {
  await removeSavedFromDB(id)
  await removeSavedCache(shareId)

  if (!navigator.onLine || id.startsWith("saved_temp_")) return

  try {
    const supabase = getSupabaseBrowserClient()
    await supabase.from("saved_countdowns").delete().eq("id", id)
  } catch {
    // best-effort
  }
}
