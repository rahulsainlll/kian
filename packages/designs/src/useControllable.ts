/*
 * useControllable: the controlled-or-uncontrolled state hook every input in
 * the kit uses.
 */
"use client"

import { useCallback, useState } from "react"

/**
 * State that is controlled when `value` is passed and internal otherwise, so every
 * component here works both as `value`/`onChange` and as `defaultValue` only.
 */
export function useControllable<T>(
  value: T | undefined,
  defaultValue: T,
  onChange?: (next: T) => void,
): [T, (next: T) => void] {
  const [inner, setInner] = useState(defaultValue)
  const controlled = value !== undefined
  const current = controlled ? value : inner
  const set = useCallback(
    (next: T) => {
      if (!controlled) setInner(next)
      onChange?.(next)
    },
    [controlled, onChange],
  )
  return [current, set]
}
