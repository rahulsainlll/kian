"use client"

import { Slider as SliderPrimitive } from "radix-ui"
import { type ComponentProps, type CSSProperties, useState } from "react"
import { cn } from "./utils"
import "./designs.css"

export type SliderProps = Omit<ComponentProps<typeof SliderPrimitive.Root>, "asChild"> & {
  /** Show the current value inside the thumb. On by default. */
  showValue?: boolean
  /** How the value reads in the thumb, e.g. (v) => `${v}%`. */
  formatValue?: (value: number) => string
}

/**
 * A pill slider: a 40px track whose filled part carries faint step dots, and a round
 * white thumb nested in the fill that shows the value. One thumb per value.
 */
export function Slider({
  className,
  style,
  value,
  defaultValue,
  onValueChange,
  min = 0,
  max = 100,
  showValue = true,
  formatValue = String,
  "aria-label": ariaLabel,
  ...props
}: SliderProps) {
  // Mirrored here (when uncontrolled) so the fill and the label can follow the thumb
  const [inner, setInner] = useState(defaultValue ?? [min])
  const current = value ?? inner
  const fraction = (v: number) => (max === min ? 0 : (v - min) / (max - min))
  const lo = current.length > 1 ? fraction(Math.min(...current)) : 0
  const hi = fraction(Math.max(...current))

  return (
    <div
      className={cn("ds-slider", className)}
      data-disabled={props.disabled || undefined}
      style={{ "--ds-slider-lo": lo, "--ds-slider-hi": hi, ...style } as CSSProperties}
    >
      <span className="ds-slider__fill" aria-hidden />
      <SliderPrimitive.Root
        className="ds-slider__root"
        value={current}
        min={min}
        max={max}
        onValueChange={(next) => {
          if (value === undefined) setInner(next)
          onValueChange?.(next)
        }}
        {...props}
      >
        <SliderPrimitive.Track className="ds-slider__track" />
        {current.map((v, i) => (
          <SliderPrimitive.Thumb
            // biome-ignore lint/suspicious/noArrayIndexKey: thumbs are positional
            key={i}
            className="ds-slider__thumb"
            aria-label={ariaLabel}
            aria-valuetext={formatValue(v)}
          >
            {showValue && <span className="ds-slider__value">{formatValue(v)}</span>}
          </SliderPrimitive.Thumb>
        ))}
      </SliderPrimitive.Root>
    </div>
  )
}
