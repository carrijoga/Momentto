import { openDB, type IDBPDatabase } from "idb"
import type { CountdownEntry } from "@/lib/types"

const DB_NAME = "mytrip-db"
const DB_VERSION = 1

export interface PendingOp {
  id?: number
  type: "create" | "update" | "delete"
  payload: Partial<CountdownEntry> & { id: string }
  tempId?: string
}

type MyTripDB = {
  countdowns: {
    key: string
    value: CountdownEntry
  }
  pending_ops: {
    key: number
    value: PendingOp
  }
}

let dbPromise: Promise<IDBPDatabase<MyTripDB>> | null = null

function getDB() {
  if (!dbPromise) {
    dbPromise = openDB<MyTripDB>(DB_NAME, DB_VERSION, {
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
  const MIGRATED_KEY = "mytrip-idb-migrated"
  const CACHE_KEY = "mytrip-countdowns-cache"
  try {
    if (localStorage.getItem(MIGRATED_KEY)) return
    const raw = localStorage.getItem(CACHE_KEY)
    if (raw) {
      const entries = JSON.parse(raw) as CountdownEntry[]
      for (const entry of entries) {
        await upsertCountdownToDB(entry)
      }
      localStorage.removeItem(CACHE_KEY)
    }
    localStorage.setItem(MIGRATED_KEY, "1")
  } catch {
    // silently ignore
  }
}
