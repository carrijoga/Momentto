import fs from "fs"
import path from "path"
import type { Metadata } from "next"
import { ChangelogClient } from "@/components/changelog-client"

export const metadata: Metadata = {
  title: "Changelog - MyTrip",
  description: "Acompanhe todas as novidades e melhorias do MyTrip",
}

interface ChangelogEntry {
  slug: string
  date: string
  content: string
}

function getChangelogEntries(): ChangelogEntry[] {
  const changelogDir = path.join(process.cwd(), "content", "changelog")

  if (!fs.existsSync(changelogDir)) {
    return []
  }

  const files = fs.readdirSync(changelogDir).filter((f) => f.endsWith(".md"))

  const entries: ChangelogEntry[] = files.map((file) => {
    const slug = file.replace(".md", "")
    const content = fs.readFileSync(path.join(changelogDir, file), "utf-8")
    return {
      slug,
      date: slug,
      content,
    }
  })

  // Sort by date descending (newest first)
  entries.sort((a, b) => b.date.localeCompare(a.date))

  return entries
}

export default function ChangelogPage() {
  const entries = getChangelogEntries()
  return <ChangelogClient entries={entries} />
}
