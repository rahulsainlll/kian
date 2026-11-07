/*
 * @kian/ui: the Kian widget, its cards, the cast of characters and the
 * dashboard parts. Shared by the website and the Electron app; import
 * `@kian/ui/styles.css` once per app.
 */
export * from './types'
export * from './icons'
export { Pill, type PillProps } from './Pill'
export { Waveform } from './Waveform'
export { StatusRoll } from './StatusRoll'
export { AgentAvatar, ChipButton, MessageCard, NudgeCard, SpeakingIndicator, TypeBar } from './Card'
export type { MessageCardProps, TypeBarProps } from './Card'
export { KianWidget, type KianWidgetProps } from './KianWidget'
export { HoldButton, type HoldButtonProps } from './HoldButton'
export * from './Dashboard'
export { useMicLevel, useSpeak, usePrefersReducedMotion, type LevelSource } from './hooks'
export { CAST, Mascot, type Mood, type Shape } from './Character'
export { Logo } from './Logo'
