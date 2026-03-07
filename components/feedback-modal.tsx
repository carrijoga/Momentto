"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "motion/react"
import { X, Loader2, Send, CheckCircle } from "lucide-react"
import { useTranslations } from "next-intl"
import { submitFeedback } from "@/app/actions"

interface FeedbackModalProps {
  onClose: () => void
}

const MAX_LENGTH = 1000

export function FeedbackModal({ onClose }: FeedbackModalProps) {
  const t = useTranslations("feedback")
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit() {
    if (!message.trim() || loading) return
    setLoading(true)
    setError(null)
    const result = await submitFeedback(message)
    setLoading(false)
    if (result.success) {
      setSuccess(true)
      setTimeout(onClose, 2000)
    } else {
      setError(t("error"))
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm sm:items-center"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: "spring", stiffness: 350, damping: 30 }}
        className="w-full max-w-sm rounded-t-3xl border border-border bg-background p-6 shadow-xl sm:rounded-3xl"
      >
        {/* Header */}
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-base font-semibold text-foreground">{t("title")}</h2>
          <button
            onClick={onClose}
            className="flex size-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        </div>

        <AnimatePresence mode="wait">
          {success ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-3 py-6"
            >
              <CheckCircle className="size-10 text-primary" />
              <p className="text-center text-sm font-medium text-foreground">{t("thanks")}</p>
              <p className="text-center text-xs text-muted-foreground">{t("thanksSub")}</p>
            </motion.div>
          ) : (
            <motion.div key="form" className="flex flex-col gap-4">
              <p className="text-sm text-muted-foreground">{t("prompt")}</p>

              <div className="relative">
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value.slice(0, MAX_LENGTH))}
                  placeholder={t("placeholder")}
                  rows={4}
                  className="w-full resize-none rounded-xl border border-border bg-secondary/40 px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
                <span className="absolute bottom-2 right-3 text-[10px] text-muted-foreground/50">
                  {message.length}/{MAX_LENGTH}
                </span>
              </div>

              {error && (
                <p className="text-xs text-destructive">{error}</p>
              )}

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSubmit}
                disabled={!message.trim() || loading}
                className="flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-md shadow-primary/25 transition hover:opacity-90 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    {t("sending")}
                  </>
                ) : (
                  <>
                    <Send className="size-4" />
                    {t("send")}
                  </>
                )}
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  )
}
