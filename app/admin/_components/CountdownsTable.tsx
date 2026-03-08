"use client"

import { useState, useMemo } from "react"
import { maskEmail, formatDate, CATEGORY_LABELS } from "./utils"

export interface AdminCountdown {
  id: string
  title: string
  date: string
  user_id: string
  created_at: string
  category: string
}

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100]

const ALL_CATEGORIES = [
  "viagem",
  "aniversario",
  "casamento",
  "formatura",
  "festa",
  "bebe",
  "show",
  "conquista",
  "evento",
  "outro",
]

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

export function CountdownsTable({
  countdowns,
  userEmailMap,
}: {
  countdowns: AdminCountdown[]
  userEmailMap: Record<string, string>
}) {
  const [search, setSearch] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(25)

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return countdowns.filter((cd) => {
      if (q) {
        const email = userEmailMap[cd.user_id] ?? ""
        if (
          !cd.title.toLowerCase().includes(q) &&
          !email.toLowerCase().includes(q)
        )
          return false
      }
      if (categoryFilter !== "all" && cd.category !== categoryFilter) return false
      return true
    })
  }, [countdowns, search, categoryFilter, userEmailMap])

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const safePage = Math.min(page, totalPages)
  const paged = filtered.slice((safePage - 1) * pageSize, safePage * pageSize)

  function handleSearch(v: string) {
    setSearch(v)
    setPage(1)
  }
  function handleCategory(v: string) {
    setCategoryFilter(v)
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
          Countdowns
          <span className="ml-2 font-normal normal-case text-zinc-600">
            {filtered.length} of {countdowns.length}
          </span>
        </h2>
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="search"
            placeholder="Search title or user…"
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="h-8 rounded-lg border border-zinc-700 bg-zinc-800 px-3 text-xs text-zinc-200 placeholder:text-zinc-600 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 w-52"
          />
          <select
            value={categoryFilter}
            onChange={(e) => handleCategory(e.target.value)}
            className="h-8 rounded-lg border border-zinc-700 bg-zinc-800 px-2 text-xs text-zinc-300 focus:border-zinc-500 focus:outline-none"
          >
            <option value="all">All categories</option>
            {ALL_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {CATEGORY_LABELS[c] ?? c}
              </option>
            ))}
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
              <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500">
                Destination
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 hidden sm:table-cell">
                Category
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500">
                Trip Date
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 hidden md:table-cell">
                User
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500">
                Created
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/60">
            {paged.map((cd) => {
              const email = userEmailMap[cd.user_id] ?? ""
              return (
                <tr
                  key={cd.id}
                  className="bg-zinc-900 transition-colors hover:bg-zinc-800/50"
                >
                  <td className="px-4 py-3 text-xs font-medium text-zinc-200">
                    {cd.title}
                  </td>
                  <td className="hidden px-4 py-3 text-xs text-zinc-400 sm:table-cell">
                    {CATEGORY_LABELS[cd.category] ?? cd.category}
                  </td>
                  <td className="px-4 py-3 text-xs text-zinc-400">
                    {formatDate(cd.date)}
                  </td>
                  <td className="hidden px-4 py-3 font-mono text-xs text-zinc-500 md:table-cell">
                    {email ? maskEmail(email) : <span className="text-zinc-700">—</span>}
                  </td>
                  <td className="px-4 py-3 text-xs text-zinc-400">
                    {formatDate(cd.created_at)}
                  </td>
                </tr>
              )
            })}
            {paged.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-xs text-zinc-600">
                  No countdowns match the current filters
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
