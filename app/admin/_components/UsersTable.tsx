"use client"

import { useState, useMemo } from "react"
import { maskEmail, formatDate } from "./utils"

export interface AdminUser {
  id: string
  email: string | null
  created_at: string
  confirmed_at: string | null
  is_anonymous: boolean
  last_sign_in_at: string | null
}

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100]

function Badge({ confirmed, anonymous }: { confirmed: boolean; anonymous: boolean }) {
  if (anonymous)
    return (
      <span className="inline-flex items-center rounded-full bg-zinc-700/50 px-2 py-0.5 text-xs font-medium text-zinc-500">
        Anonymous
      </span>
    )
  if (confirmed)
    return (
      <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-400">
        Confirmed
      </span>
    )
  return (
    <span className="inline-flex items-center rounded-full bg-amber-500/10 px-2 py-0.5 text-xs font-medium text-amber-400">
      Pending
    </span>
  )
}

export function UsersTable({ users }: { users: AdminUser[] }) {
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | "confirmed" | "pending" | "anonymous">("all")
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(25)

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return users.filter((u) => {
      if (q && !u.email?.toLowerCase().includes(q)) return false
      if (statusFilter === "anonymous") return u.is_anonymous
      if (statusFilter === "confirmed") return !u.is_anonymous && !!u.confirmed_at
      if (statusFilter === "pending") return !u.is_anonymous && !u.confirmed_at
      return true
    })
  }, [users, search, statusFilter])

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const safePage = Math.min(page, totalPages)
  const paged = filtered.slice((safePage - 1) * pageSize, safePage * pageSize)

  function handleSearch(v: string) {
    setSearch(v)
    setPage(1)
  }
  function handleStatus(v: typeof statusFilter) {
    setStatusFilter(v)
    setPage(1)
  }
  function handlePageSize(v: number) {
    setPageSize(v)
    setPage(1)
  }

  return (
    <section>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-zinc-500">
          Users
          <span className="ml-2 font-normal normal-case text-zinc-600">
            {filtered.length} of {users.length}
          </span>
        </h2>
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="search"
            placeholder="Search email…"
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="h-8 rounded-lg border border-zinc-700 bg-zinc-800 px-3 text-xs text-zinc-200 placeholder:text-zinc-600 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 w-48"
          />
          <select
            value={statusFilter}
            onChange={(e) => handleStatus(e.target.value as typeof statusFilter)}
            className="h-8 rounded-lg border border-zinc-700 bg-zinc-800 px-2 text-xs text-zinc-300 focus:border-zinc-500 focus:outline-none"
          >
            <option value="all">All statuses</option>
            <option value="confirmed">Confirmed</option>
            <option value="pending">Pending</option>
            <option value="anonymous">Anonymous</option>
          </select>
          <select
            value={pageSize}
            onChange={(e) => handlePageSize(Number(e.target.value))}
            className="h-8 rounded-lg border border-zinc-700 bg-zinc-800 px-2 text-xs text-zinc-300 focus:border-zinc-500 focus:outline-none"
          >
            {PAGE_SIZE_OPTIONS.map((n) => (
              <option key={n} value={n}>
                {n} / page
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-zinc-800">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-800 bg-zinc-900/60">
              <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500">Email</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500">Created</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 hidden sm:table-cell">
                Last Sign In
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/60">
            {paged.map((user) => (
              <tr key={user.id} className="bg-zinc-900 transition-colors hover:bg-zinc-800/50">
                <td className="px-4 py-3 font-mono text-xs text-zinc-300">
                  {user.email ? (
                    maskEmail(user.email)
                  ) : (
                    <span className="text-zinc-600">—</span>
                  )}
                </td>
                <td className="px-4 py-3 text-xs text-zinc-400">
                  {formatDate(user.created_at)}
                </td>
                <td className="hidden px-4 py-3 text-xs text-zinc-500 sm:table-cell">
                  {user.last_sign_in_at ? formatDate(user.last_sign_in_at) : "—"}
                </td>
                <td className="px-4 py-3">
                  <Badge confirmed={!!user.confirmed_at} anonymous={user.is_anonymous} />
                </td>
              </tr>
            ))}
            {paged.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-xs text-zinc-600">
                  No users match the current filters
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <Pagination page={safePage} totalPages={totalPages} onChange={setPage} />
      )}
    </section>
  )
}

function Pagination({
  page,
  totalPages,
  onChange,
}: {
  page: number
  totalPages: number
  onChange: (p: number) => void
}) {
  const pages = buildPageNumbers(page, totalPages)

  return (
    <div className="mt-3 flex items-center justify-end gap-1">
      <button
        onClick={() => onChange(page - 1)}
        disabled={page === 1}
        className="flex h-7 w-7 items-center justify-center rounded-lg border border-zinc-700 bg-zinc-800 text-xs text-zinc-400 transition-colors hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-40"
        aria-label="Previous page"
      >
        ‹
      </button>
      {pages.map((p, i) =>
        p === "…" ? (
          <span key={`ellipsis-${i}`} className="px-1 text-xs text-zinc-600">
            …
          </span>
        ) : (
          <button
            key={p}
            onClick={() => onChange(p as number)}
            className={`flex h-7 w-7 items-center justify-center rounded-lg border text-xs transition-colors ${
              p === page
                ? "border-zinc-500 bg-zinc-700 text-white"
                : "border-zinc-700 bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
            }`}
          >
            {p}
          </button>
        )
      )}
      <button
        onClick={() => onChange(page + 1)}
        disabled={page === totalPages}
        className="flex h-7 w-7 items-center justify-center rounded-lg border border-zinc-700 bg-zinc-800 text-xs text-zinc-400 transition-colors hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-40"
        aria-label="Next page"
      >
        ›
      </button>
    </div>
  )
}

function buildPageNumbers(current: number, total: number): (number | "…")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  const pages: (number | "…")[] = [1]
  if (current > 3) pages.push("…")
  for (let p = Math.max(2, current - 1); p <= Math.min(total - 1, current + 1); p++) {
    pages.push(p)
  }
  if (current < total - 2) pages.push("…")
  pages.push(total)
  return pages
}
