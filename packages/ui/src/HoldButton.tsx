import { Button, type ButtonProps } from '@kian/designs'
import { useEffect, useRef, useState } from 'react'

export interface HoldButtonProps extends Omit<ButtonProps, 'onClick' | 'children'> {
  children: string
  /** How long to hold, in ms. */
  duration?: number
  onConfirm: () => void
  holdingLabel?: string
  doneLabel?: string
}

/**
 * Press and hold to confirm, on the kit's Button. For the one action that must
 * not happen by accident: approving a price in #approvals. The fill is a timer,
 * so it runs linear; letting go drains it fast.
 */
export function HoldButton({
  duration = 900,
  onConfirm,
  holdingLabel = 'Keep holding',
  doneLabel = 'Done',
  children,
  variant = 'primary',
  className = '',
  style,
  ...rest
}: HoldButtonProps) {
  const [holding, setHolding] = useState(false)
  const [done, setDone] = useState(false)
  const timer = useRef<number | undefined>(undefined)

  const start = () => {
    if (done) return
    setHolding(true)
    timer.current = window.setTimeout(() => {
      setHolding(false)
      setDone(true)
      onConfirm()
    }, duration)
  }
  const cancel = () => {
    clearTimeout(timer.current)
    setHolding(false)
  }
  useEffect(() => () => clearTimeout(timer.current), [])

  return (
    <Button
      {...rest}
      variant={variant}
      className={`k-hold ${className}`}
      data-holding={holding || undefined}
      data-done={done || undefined}
      aria-label={`${children}, press and hold`}
      style={{ ...style, ['--k-hold' as string]: `${duration}ms` }}
      onPointerDown={start}
      onPointerUp={cancel}
      onPointerLeave={cancel}
      onKeyDown={(e) => (e.key === ' ' || e.key === 'Enter') && !e.repeat && start()}
      onKeyUp={(e) => (e.key === ' ' || e.key === 'Enter') && cancel()}
    >
      <span className="k-hold__fill" aria-hidden />
      <span className="k-hold__text">{done ? doneLabel : holding ? holdingLabel : children}</span>
    </Button>
  )
}
