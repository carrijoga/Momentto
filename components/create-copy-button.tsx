"use client"

import { Copy } from "lucide-react"
import { useTranslations } from "next-intl"
import { useRouter } from "next/navigation"

interface CreateCopyButtonProps {
  title: string
  date: string
  category: string
  locale: string
  isAuthenticated: boolean
}

function encodeCopyData(title: string, date: string, category: string): string {
  return btoa(encodeURIComponent(JSON.stringify({ title, date, category })))
}

export function CreateCopyButton({
  title,
  date,
  category,
  locale,
  isAuthenticated,
}: CreateCopyButtonProps) {
  const t = useTranslations("share")
  const router = useRouter()
  const copyParam = encodeCopyData(title, date, category)

  function handleClick() {
    if (isAuthenticated) {
      router.push(`/${locale}?copy=${copyParam}`)
    } else {
      router.push(`/${locale}/login?next=/${locale}&copy=${copyParam}`)
    }
  }

  return (
    <button
      onClick={handleClick}
      className="flex items-center gap-2 rounded-xl border border-border bg-card px-5 py-3 text-sm font-semibold text-foreground shadow-lg transition hover:bg-secondary"
    >
      <Copy className="size-4" />
      {t("createCopy")}
    </button>
  )
}
