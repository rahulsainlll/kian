/*
 * The renderer's view of the preload bridge: window.kian, typed once in
 * shared/types.ts so both sides agree.
 */
import type { KianBridge } from '../shared/types'

declare global {
  interface Window {
    kian: KianBridge
  }
}
