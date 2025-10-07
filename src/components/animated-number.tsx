"use client"

import { useEffect, useRef, useState } from "react"

type Props = {
  value: number
  durationMs?: number
  format?: (n: number) => string
  className?: string
}

// Simple ease-out cubic
const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3)

export function AnimatedNumber({ value, durationMs = 600, format, className }: Props) {
  const frameRef = useRef<number | null>(null)
  const startRef = useRef<number>(0)
  const fromRef = useRef<number>(value)
  const [display, setDisplay] = useState<number>(value)

  useEffect(() => {
    // cancel any running animation
    if (frameRef.current) cancelAnimationFrame(frameRef.current)
    fromRef.current = display
    const startValue = fromRef.current
    const endValue = value
    if (durationMs <= 0 || !isFinite(startValue) || !isFinite(endValue)) {
      setDisplay(endValue)
      return
    }
    startRef.current = performance.now()

    const tick = (now: number) => {
      const t = Math.min(1, (now - startRef.current) / durationMs)
      const eased = easeOutCubic(t)
      const current = startValue + (endValue - startValue) * eased
      setDisplay(current)
      if (t < 1) frameRef.current = requestAnimationFrame(tick)
    }
    frameRef.current = requestAnimationFrame(tick)
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current)
    }
  }, [value, durationMs])

  const text = format ? format(display) : Math.round(display).toString()
  return <span className={className}>{text}</span>
}
