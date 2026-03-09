"use client"

import type { ElementType } from "react"
import { motion } from "motion/react"
import { cn } from "@/lib/utils"

interface BlurTextProps {
  text: string
  className?: string
  delay?: number
  duration?: number
  initialDelay?: number
  as?: ElementType
}

export function BlurText({
  text,
  className,
  delay = 0.07,
  duration = 0.5,
  initialDelay = 0,
  as: Wrapper = "span",
}: BlurTextProps) {
  const words = text.split(" ")

  return (
    <Wrapper className={cn("inline", className)}>
      {words.map((word, i) => (
        <motion.span
          key={i}
          className="inline-block"
          initial={{ opacity: 0, filter: "blur(8px)", y: 10 }}
          animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
          transition={{
            duration,
            ease: [0.22, 1, 0.36, 1],
            delay: initialDelay + i * delay,
          }}
        >
          {word}
          {i < words.length - 1 ? "\u00a0" : ""}
        </motion.span>
      ))}
    </Wrapper>
  )
}
