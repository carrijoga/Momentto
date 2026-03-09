"use client"

import { motion } from "motion/react"
import { cn } from "@/lib/utils"

interface ScrollFloatProps {
  children: React.ReactNode
  className?: string
  delay?: number
  duration?: number
}

export function ScrollFloat({
  children,
  className,
  delay = 0,
  duration = 0.55,
}: ScrollFloatProps) {
  return (
    <motion.div
      className={cn(className)}
      initial={{ opacity: 0, y: 20, filter: "blur(6px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{
        duration,
        ease: [0.22, 1, 0.36, 1],
        delay,
      }}
    >
      {children}
    </motion.div>
  )
}
