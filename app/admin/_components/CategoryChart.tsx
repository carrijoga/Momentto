"use client"

import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import { CATEGORY_LABELS, CATEGORY_COLORS } from "./utils"

interface DataPoint {
  category: string
  count: number
}

interface CustomTooltipProps {
  active?: boolean
  payload?: { value: number }[]
  label?: string
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-xs shadow-lg">
      <p className="text-zinc-400">{CATEGORY_LABELS[label ?? ""] ?? label}</p>
      <p className="mt-0.5 font-semibold text-white">
        {payload[0].value} {payload[0].value === 1 ? "countdown" : "countdowns"}
      </p>
    </div>
  )
}

export function CategoryChart({ data }: { data: DataPoint[] }) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
      <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-zinc-500">
        Countdowns by Category
      </p>
      {data.length === 0 ? (
        <div className="flex h-[200px] items-center justify-center text-xs text-zinc-600">
          No data yet
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={200}>
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 0, right: 16, left: 8, bottom: 0 }}
          >
            <XAxis
              type="number"
              tick={{ fill: "#71717a", fontSize: 10 }}
              tickLine={false}
              axisLine={false}
              allowDecimals={false}
            />
            <YAxis
              type="category"
              dataKey="category"
              width={72}
              tick={{ fill: "#a1a1aa", fontSize: 10 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => CATEGORY_LABELS[v] ?? v}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "#27272a" }} />
            <Bar dataKey="count" radius={[0, 4, 4, 0]}>
              {data.map((_, i) => (
                <Cell key={i} fill={CATEGORY_COLORS[i % CATEGORY_COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
