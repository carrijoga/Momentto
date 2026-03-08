import { getSupabaseServiceClient } from "@/lib/supabase/server"
import { MetricCard } from "./_components/MetricCard"
import { SignupsChart } from "./_components/SignupsChart"
import { CategoryChart } from "./_components/CategoryChart"
import { UsersTable, type AdminUser } from "./_components/UsersTable"
import { CountdownsTable, type AdminCountdown } from "./_components/CountdownsTable"

function buildSignupsChart(users: AdminUser[]): { date: string; count: number }[] {
  const result = []
  for (let i = 29; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const dayStr = d.toISOString().split("T")[0]
    const label = d.toLocaleDateString("en-US", { month: "short", day: "numeric" })
    const count = users.filter((u) => u.created_at.startsWith(dayStr)).length
    result.push({ date: label, count })
  }
  return result
}

function buildCategoryChart(countdowns: AdminCountdown[]): { category: string; count: number }[] {
  const map: Record<string, number> = {}
  for (const cd of countdowns) {
    map[cd.category] = (map[cd.category] || 0) + 1
  }
  return Object.entries(map)
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count)
}

export default async function AdminPage() {
  const service = getSupabaseServiceClient()

  const [
    { data: usersData },
    { count: totalCountdowns },
    { count: pushCount },
    { data: allCountdownsRaw },
  ] = await Promise.all([
    service.auth.admin.listUsers({ perPage: 1000 }),
    service.from("countdowns").select("*", { count: "exact", head: true }),
    service.from("push_subscriptions").select("*", { count: "exact", head: true }),
    service
      .from("countdowns")
      .select("id, title, date, user_id, created_at, category")
      .order("created_at", { ascending: false }),
  ])

  // Map to plain serialisable shapes (no Supabase internal types)
  const allUsers: AdminUser[] = (usersData?.users ?? []).map((u) => ({
    id: u.id,
    email: u.email ?? null,
    created_at: u.created_at,
    confirmed_at: u.confirmed_at ?? null,
    is_anonymous: u.is_anonymous ?? false,
    last_sign_in_at: u.last_sign_in_at ?? null,
  }))

  const allCountdowns: AdminCountdown[] = (allCountdownsRaw ?? []).map((cd) => ({
    id: cd.id as string,
    title: cd.title as string,
    date: cd.date as string,
    user_id: cd.user_id as string,
    created_at: cd.created_at as string,
    category: (cd.category as string) ?? "outro",
  }))

  const totalUsers = allUsers.length
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  const newUsers7d = allUsers.filter((u) => u.created_at >= sevenDaysAgo).length

  const signupsChartData = buildSignupsChart(allUsers)
  const categoryChartData = buildCategoryChart(allCountdowns)

  const userEmailMap: Record<string, string> = {}
  for (const u of allUsers) {
    userEmailMap[u.id] = u.email ?? ""
  }

  return (
    <div className="space-y-10">
      {/* Metric cards */}
      <section>
        <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-zinc-500">
          Overview
        </h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <MetricCard label="Total Users" value={totalUsers} />
          <MetricCard label="Total Countdowns" value={totalCountdowns ?? 0} />
          <MetricCard label="Push Subscriptions" value={pushCount ?? 0} />
          <MetricCard label="New Users (7d)" value={newUsers7d} description="Last 7 days" />
        </div>
      </section>

      {/* Charts */}
      <section>
        <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-zinc-500">
          Analytics
        </h2>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <SignupsChart data={signupsChartData} />
          <CategoryChart data={categoryChartData} />
        </div>
      </section>

      {/* Users table */}
      <UsersTable users={allUsers} />

      {/* Countdowns table */}
      <CountdownsTable countdowns={allCountdowns} userEmailMap={userEmailMap} />
    </div>
  )
}
