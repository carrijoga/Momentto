import { openDB, type IDBPDatabase } from "idb"
import type { CountdownEntry } from "@/lib/types"

const DB_NAME = "momentto-db"
const DB_VERSION = 1

export interface PendingOp {
  id?: number
  type: "create" | "update" | "delete"
  payload: Partial<CountdownEntry> & { id: string }
  tempId?: string
}

type MomenttoDb = {
  countdowns: {
    key: string
    value: CountdownEntry
  }
  pending_ops: {
    key: number
    value: PendingOp
  }
}

let dbPromise: Promise<IDBPDatabase<MomenttoDb>> | null = null

function getDB() {
  if (!dbPromise) {
    dbPromise = openDB<MomenttoDb>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains("countdowns")) {
          db.createObjectStore("countdowns", { keyPath: "id" })
        }
        if (!db.objectStoreNames.contains("pending_ops")) {
          db.createObjectStore("pending_ops", { autoIncrement: true })
        }
      },
    })
  }
  return dbPromise
}

export async function getAllCountdownsFromDB(): Promise<CountdownEntry[]> {
  const db = await getDB()
  const all = await db.getAll("countdowns")
  return all.sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )
}

export async function upsertCountdownToDB(entry: CountdownEntry): Promise<void> {
  const db = await getDB()
  await db.put("countdowns", entry)
}

export async function removeCountdownFromDB(id: string): Promise<void> {
  const db = await getDB()
  await db.delete("countdowns", id)
}

export async function addPendingOp(op: Omit<PendingOp, "id">): Promise<number> {
  const db = await getDB()
  return db.add("pending_ops", op) as Promise<number>
}

export async function getPendingOps(): Promise<(PendingOp & { id: number })[]> {
  const db = await getDB()
  const values = await db.getAll("pending_ops")
  const keys = await db.getAllKeys("pending_ops")
  return values.map((v, i) => ({ ...v, id: keys[i] as number }))
}

export async function removePendingOp(id: number): Promise<void> {
  const db = await getDB()
  await db.delete("pending_ops", id)
}

export async function clearPendingOpsForId(entryId: string): Promise<void> {
  const db = await getDB()
  const values = await db.getAll("pending_ops")
  const keys = await db.getAllKeys("pending_ops")
  for (let i = 0; i < values.length; i++) {
    const op = values[i]
    if (op.payload.id === entryId || op.tempId === entryId) {
      await db.delete("pending_ops", keys[i] as number)
    }
  }
}

export async function getPendingCount(): Promise<number> {
  const db = await getDB()
  return db.count("pending_ops")
}

/** One-time migration: moves localStorage cache into IndexedDB */
export async function migrateLegacyCache(): Promise<void> {
  const MIGRATED_KEY = "momentto-idb-migrated"
  const LEGACY_MIGRATED_KEY = "mytrip-idb-migrated"
  const CACHE_KEY = "momentto-countdowns-cache"
  const LEGACY_CACHE_KEY = "mytrip-countdowns-cache"
  try {
    if (localStorage.getItem(MIGRATED_KEY) || localStorage.getItem(LEGACY_MIGRATED_KEY)) return
    const raw = localStorage.getItem(CACHE_KEY) ?? localStorage.getItem(LEGACY_CACHE_KEY)
    if (raw) {
      const entries = JSON.parse(raw) as CountdownEntry[]
      for (const entry of entries) {
        await upsertCountdownToDB(entry)
      }
      localStorage.removeItem(CACHE_KEY)
      localStorage.removeItem(LEGACY_CACHE_KEY)
    }
    localStorage.setItem(MIGRATED_KEY, "1")
  } catch {
    // silently ignore
  }
}

/** One-time migration: copies data from the legacy "mytrip-db" IndexedDB to "momentto-db" */
export async function migrateLegacyDb(): Promise<void> {
  if (typeof window === "undefined" || !("indexedDB" in window)) return

  const LEGACY_DB_NAME = "mytrip-db"
  const MIGRATED_MARKER = "momentto-db-migrated"

  try {
    if (localStorage.getItem(MIGRATED_MARKER)) return

    let wasJustCreated = false

    const legacy = await openDB<MomenttoDb>(LEGACY_DB_NAME, DB_VERSION, {
      upgrade(db, oldVersion) {
        if (oldVersion === 0) {
          wasJustCreated = true
          if (!db.objectStoreNames.contains("countdowns")) {
            db.createObjectStore("countdowns", { keyPath: "id" })
          }
          if (!db.objectStoreNames.contains("pending_ops")) {
            db.createObjectStore("pending_ops", { autoIncrement: true })
          }
        }
      },
    })

    if (!wasJustCreated) {
      const allCountdowns = await legacy.getAll("countdowns")
      const allOps = await legacy.getAll("pending_ops")
      legacy.close()

      if (allCountdowns.length > 0 || allOps.length > 0) {
        const newDb = await getDB()
        for (const entry of allCountdowns) {
          const existing = await newDb.get("countdowns", entry.id)
          if (!existing) await newDb.put("countdowns", entry)
        }
        for (const op of allOps) {
          await newDb.add("pending_ops", op)
        }
      }
    } else {
      legacy.close()
    }

    indexedDB.deleteDatabase(LEGACY_DB_NAME)
    localStorage.setItem(MIGRATED_MARKER, "1")
  } catch {
    // silent — don't block app startup
  }
}
