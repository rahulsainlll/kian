"use client"

import { useLayoutEffect, useRef, useState } from "react"
import { cn } from "./utils"
import { Badge } from "./Badge"
import { Chart } from "./Chart"
import "./designs.css"

export type StatCardProps = {
  /** What the number is; shown above it when `showLabel` is on, always read aloud. */
  label: string
  value: number
  /** Intl formatting, e.g. { style: "currency", currency: "USD" }. */
  format?: Intl.NumberFormatOptions
  locale?: string
  /** Change in percent: a success badge when up, danger when down. */
  delta?: number
  /** The trend, oldest first, drawn by the kit's Chart (line, soft area, end dot). */
  data?: number[]
  chartHeight?: number
  showLabel?: boolean
  className?: string
}

/** The poster's revenue card: 22px headline, the kit's Badge, the kit's Chart in violet. */
export function StatCard({
  label,
  value,
  format,
  locale = "en-US",
  delta,
  data,
  chartHeight = 64,
  showLabel,
  className,
}: StatCardProps) {
  const box = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState(0)

  useLayoutEffect(() => {
    const element = box.current
    if (!element) return
    const measure = () => setWidth(Math.floor(element.getBoundingClientRect().width))
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  return (
    <figure className={cn("ds-stat", className)}>
      <figcaption className="ds-stat__head">
        <span className={showLabel ? "ds-stat__label" : "sr-only"}>{label}</span>
        <strong className="ds-stat__value">
          {new Intl.NumberFormat(locale, format).format(value)}
        </strong>
        {delta !== undefined && (
          <Badge tone={delta >= 0 ? "success" : "danger"}>
            <span className="sr-only">{delta >= 0 ? "up " : "down "}</span>
            {delta >= 0 ? "+" : "−"}
            {Math.abs(delta)}%
          </Badge>
        )}
      </figcaption>
      {data && data.length > 1 && (
        <div ref={box}>{width > 0 && <Chart data={data} width={width} height={chartHeight} />}</div>
      )}
    </figure>
  )
}
