"use client"

import { motion } from "motion/react"
import { ArrowLeft, Tag, Sparkles, Wrench, Calendar } from "lucide-react"
import Link from "next/link"
import { useLanguage } from "@/lib/language-context"

interface ChangelogEntry {
  slug: string
  date: string
  content: string
}

interface ChangelogClientProps {
  entries: ChangelogEntry[]
}

/** Very small Markdown-to-JSX renderer -- supports #, ##, -, and paragraphs. */
function renderMarkdown(md: string) {
  const lines = md.split("\n")
  const elements: React.ReactNode[] = []
  let listItems: string[] = []
  let key = 0
  let seenSection = false

  function flushList() {
    if (listItems.length === 0) return
    elements.push(
      <ul key={key++} className="flex flex-col gap-2 pl-1">
        {listItems.map((item, i) => (
          <li key={i} className="flex items-start gap-2.5 text-sm leading-relaxed text-foreground/80">
            <span className="mt-1.5 block size-1.5 shrink-0 rounded-full bg-primary/60" />
            {item}
          </li>
        ))}
      </ul>
    )
    listItems = []
  }

  for (const line of lines) {
    const trimmed = line.trim()

    if (trimmed.startsWith("# ")) {
      flushList()
      continue
    }

    if (trimmed.startsWith("## ")) {
      seenSection = true
      flushList()
      const heading = trimmed.replace("## ", "")
      const icon = getSectionIcon(heading)
      elements.push(
        <div key={key++} className="mt-5 mb-2.5 flex items-center gap-2">
          {icon}
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            {heading}
          </h3>
        </div>
      )
      continue
    }

    if (trimmed.startsWith("- ")) {
      listItems.push(trimmed.replace("- ", ""))
      continue
    }

    if (trimmed === "") {
      flushList()
      continue
    }

    if (!seenSection) continue
    flushList()
    elements.push(
      <p key={key++} className="text-sm leading-relaxed text-muted-foreground">
        {trimmed}
      </p>
    )
  }

  flushList()
  return elements
}

function getSectionIcon(heading: string) {
  const lower = heading.toLowerCase()
  if (lower.includes("novidade") || lower.includes("new")) {
    return <Sparkles className="size-3.5 text-primary" />
  }
  if (lower.includes("melhoria") || lower.includes("improve")) {
    return <Wrench className="size-3.5 text-muted-foreground" />
  }
  return <Tag className="size-3.5 text-muted-foreground" />
}

function extractTitle(content: string): string {
  const match = content.match(/^# (.+)$/m)
  return match ? match[1] : ""
}

function extractDescription(content: string): string {
  const lines = content.split("\n")
  for (const line of lines) {
    const trimmed = line.trim()
    if (trimmed === "" || trimmed.startsWith("#")) continue
    return trimmed
  }
  return ""
}

function formatDate(dateStr: string, language: "pt" | "en"): string {
  const d = new Date(dateStr + "T00:00:00")
  return d.toLocaleDateString(language === "pt" ? "pt-BR" : "en-US", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  })
}

export function ChangelogClient({ entries }: ChangelogClientProps) {
  const { language } = useLanguage()

  return (
    <div className="flex min-h-dvh flex-col items-center p-4 pb-20 sm:p-6">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="mb-10"
        >
          <Link
            href="/"
            className="mb-6 inline-flex items-center gap-2 rounded-full bg-card border border-border px-4 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground"
          >
            <ArrowLeft className="size-3.5" />
            {language === "pt" ? "Voltar" : "Back"}
          </Link>
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Changelog
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {language === "pt"
              ? "Todas as novidades e melhorias do Momentto."
              : "All the latest updates and improvements to Momentto."}
          </p>
        </motion.div>

        {/* Timeline */}
        <div className="relative">
          <div className="absolute left-[7px] top-2 bottom-2 w-px bg-border sm:left-[9px]" />

          <div className="flex flex-col gap-10">
            {entries.map((entry, index) => {
              const title = extractTitle(entry.content)
              const description = extractDescription(entry.content)

              return (
                <motion.div
                  key={entry.slug}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 25,
                    delay: index * 0.08,
                  }}
                  className="relative pl-8 sm:pl-10"
                >
                  {/* Timeline dot */}
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{
                      type: "spring",
                      stiffness: 400,
                      damping: 20,
                      delay: index * 0.08 + 0.1,
                    }}
                    className="absolute left-0 top-1.5 flex size-4 items-center justify-center rounded-full border-2 border-primary bg-background sm:size-5"
                  >
                    <div className="size-1.5 rounded-full bg-primary sm:size-2" />
                  </motion.div>

                  {/* Date */}
                  <div className="mb-3 flex items-center gap-2">
                    <Calendar className="size-3.5 text-muted-foreground" />
                    <time className="text-xs font-medium text-muted-foreground">
                      {formatDate(entry.date, language)}
                    </time>
                  </div>

                  {/* Card */}
                  <div className="rounded-2xl border border-border bg-card p-5 shadow-sm transition-shadow hover:shadow-md sm:p-6">
                    {title && (
                      <h2 className="text-lg font-bold tracking-tight text-foreground sm:text-xl">
                        {title}
                      </h2>
                    )}
                    {description && (
                      <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                        {description}
                      </p>
                    )}
                    <div className="mt-4">
                      {renderMarkdown(entry.content)}
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>

        {/* Empty state */}
        {entries.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="mt-20 text-center"
          >
            <p className="text-muted-foreground">
              {language === "pt"
                ? "Nenhuma atualização disponível."
                : "No updates available."}
            </p>
          </motion.div>
        )}
      </div>
    </div>
  )
}
