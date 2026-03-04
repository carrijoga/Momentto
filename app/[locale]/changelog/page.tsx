import fs from "fs"
import path from "path"
import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"
import { ChangelogClient } from "@/components/changelog-client"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "changelog" })

  return {
    title: "Changelog",
    description: t("metaDescription"),
    openGraph: {
      title: "Changelog | Momentto",
      description: t("metaDescription"),
      url: `https://momentto.carrijoga.com.br/${locale}/changelog`,
    },
    twitter: {
      card: "summary_large_image",
      title: "Changelog | Momentto",
      description: t("metaDescription"),
    },
  }
}

interface ChangelogEntry {
  slug: string
  date: string
  content: string
}

function getChangelogEntries(locale: string): ChangelogEntry[] {
  const baseDir = path.join(process.cwd(), "content", "changelog")
  const localeDir = path.join(baseDir, locale)

  if (!fs.existsSync(baseDir)) {
    return []
  }

  // Collect all unique slugs from both the base dir and the locale dir
  const baseSlugs = fs.existsSync(baseDir)
    ? fs.readdirSync(baseDir).filter((f) => f.endsWith(".md"))
    : []

  const slugs = Array.from(new Set(baseSlugs))

  const entries: ChangelogEntry[] = slugs.map((file) => {
    const slug = file.replace(".md", "")
    const localeFile = path.join(localeDir, file)
    const fallbackFile = path.join(baseDir, file)
    const filePath = fs.existsSync(localeFile) ? localeFile : fallbackFile
    const content = fs.readFileSync(filePath, "utf-8")
    return {
      slug,
      date: slug,
      content,
    }
  })

  entries.sort((a, b) => b.date.localeCompare(a.date))

  return entries
}

export default async function ChangelogPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const entries = getChangelogEntries(locale)
  return <ChangelogClient entries={entries} />
}
