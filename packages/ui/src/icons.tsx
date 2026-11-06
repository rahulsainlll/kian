// One family: 16px, filled where small (per craft rules), currentColor.
type P = { size?: number }

export const MicIcon = ({ size = 16 }: P) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="currentColor" aria-hidden>
    <rect x="5" y="1" width="6" height="9.5" rx="3" />
    <path d="M3 7.5a.75.75 0 0 1 1.5 0 3.5 3.5 0 0 0 7 0 .75.75 0 0 1 1.5 0 5 5 0 0 1-4.25 4.94V14h1.5a.75.75 0 0 1 0 1.5h-4.5a.75.75 0 0 1 0-1.5h1.5v-1.56A5 5 0 0 1 3 7.5Z" />
  </svg>
)

export const CloseIcon = ({ size = 16 }: P) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="currentColor" aria-hidden>
    <path d="M4.28 3.22a.75.75 0 0 0-1.06 1.06L6.94 8l-3.72 3.72a.75.75 0 1 0 1.06 1.06L8 9.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L9.06 8l3.72-3.72a.75.75 0 0 0-1.06-1.06L8 6.94 4.28 3.22Z" />
  </svg>
)

export const StopIcon = ({ size = 16 }: P) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="currentColor" aria-hidden>
    <rect x="4" y="4" width="8" height="8" rx="2" />
  </svg>
)

export const CheckIcon = ({ size = 16 }: P) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="currentColor" aria-hidden>
    <path d="M13.03 4.22a.75.75 0 0 1 0 1.06l-6.25 6.25a.75.75 0 0 1-1.06 0L2.97 8.78a.75.75 0 0 1 1.06-1.06l2.22 2.22 5.72-5.72a.75.75 0 0 1 1.06 0Z" />
  </svg>
)

export const ArrowUpRightIcon = ({ size = 16 }: P) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="currentColor" aria-hidden>
    <path d="M5 4.25A.75.75 0 0 1 5.75 3.5h6a.75.75 0 0 1 .75.75v6a.75.75 0 0 1-1.5 0V6.06l-6.22 6.22a.75.75 0 0 1-1.06-1.06L9.94 5H5.75A.75.75 0 0 1 5 4.25Z" />
  </svg>
)

export const SendIcon = ({ size = 16 }: P) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="currentColor" aria-hidden>
    <path d="M8 2.5a.75.75 0 0 1 .53.22l4 4a.75.75 0 1 1-1.06 1.06L8.75 5.06v7.69a.75.75 0 0 1-1.5 0V5.06L4.53 7.78a.75.75 0 0 1-1.06-1.06l4-4A.75.75 0 0 1 8 2.5Z" />
  </svg>
)

export const MailIcon = ({ size = 16 }: P) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="currentColor" aria-hidden>
    <path d="M2.5 3A1.5 1.5 0 0 0 1 4.5v.4l7 4.2 7-4.2v-.4A1.5 1.5 0 0 0 13.5 3h-11Z" />
    <path d="M15 6.6 8.39 10.57a.75.75 0 0 1-.78 0L1 6.6v4.9A1.5 1.5 0 0 0 2.5 13h11a1.5 1.5 0 0 0 1.5-1.5V6.6Z" />
  </svg>
)

export const CalendarIcon = ({ size = 16 }: P) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="currentColor" aria-hidden>
    <path d="M4.75 1a.75.75 0 0 1 .75.75V3h5V1.75a.75.75 0 0 1 1.5 0V3h.5A2.5 2.5 0 0 1 15 5.5V6H1v-.5A2.5 2.5 0 0 1 3.5 3H4V1.75A.75.75 0 0 1 4.75 1ZM1 7.5h14v5A2.5 2.5 0 0 1 12.5 15h-9A2.5 2.5 0 0 1 1 12.5v-5Z" />
  </svg>
)

export const TableIcon = ({ size = 16 }: P) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="currentColor" aria-hidden>
    <path d="M3.5 2A2.5 2.5 0 0 0 1 4.5V6h14V4.5A2.5 2.5 0 0 0 12.5 2h-9ZM15 7.5H6.5V14h6a2.5 2.5 0 0 0 2.5-2.5v-4ZM5 14V7.5H1v4A2.5 2.5 0 0 0 3.5 14H5Z" />
  </svg>
)

export const ChatIcon = ({ size = 16 }: P) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="currentColor" aria-hidden>
    <path d="M1 4a3 3 0 0 1 3-3h8a3 3 0 0 1 3 3v5a3 3 0 0 1-3 3H7.31l-3.3 2.48A.75.75 0 0 1 2.8 13.9V12A3 3 0 0 1 1 9.27V4Z" />
  </svg>
)

export const PlaneIcon = ({ size = 16 }: P) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="currentColor" aria-hidden>
    <path d="M14.72 1.28a.75.75 0 0 1 .2.77l-4 12.5a.75.75 0 0 1-1.38.12L7.23 9.77 2.33 7.46a.75.75 0 0 1 .12-1.38l12.5-4a.75.75 0 0 1 .77.2Z" />
  </svg>
)

export const BoltIcon = ({ size = 16 }: P) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="currentColor" aria-hidden>
    <path d="M9.58 1.08a.75.75 0 0 1 .4.82L9.17 6h3.08a.75.75 0 0 1 .58 1.23l-6 7.25a.75.75 0 0 1-1.31-.64L6.33 9.5H3.25a.75.75 0 0 1-.58-1.23l6-7a.75.75 0 0 1 .91-.19Z" />
  </svg>
)

export const HomeIcon = ({ size = 16 }: P) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="currentColor" aria-hidden>
    <path d="M7.53 1.22a.75.75 0 0 1 .94 0l6 4.8A.75.75 0 0 1 14.75 6.6v6.65A1.75 1.75 0 0 1 13 15h-2.25v-4.25a.75.75 0 0 0-.75-.75H6a.75.75 0 0 0-.75.75V15H3a1.75 1.75 0 0 1-1.75-1.75V6.6a.75.75 0 0 1 .28-.58l6-4.8Z" />
  </svg>
)

export const HashIcon = ({ size = 16 }: P) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="currentColor" aria-hidden>
    <path d="M6.87 1.01a.75.75 0 0 1 .62.86L7.13 4h3.48l.39-2.37a.75.75 0 1 1 1.48.25L12.13 4h1.62a.75.75 0 0 1 0 1.5h-1.87l-.58 3.5h1.95a.75.75 0 0 1 0 1.5h-2.2l-.4 2.37a.75.75 0 1 1-1.48-.25l.36-2.12H6.05l-.4 2.37a.75.75 0 1 1-1.48-.25l.36-2.12H2.75a.75.75 0 0 1 0-1.5h2.03l.58-3.5H3.75a.75.75 0 0 1 0-1.5h1.86l.4-2.37a.75.75 0 0 1 .86-.62ZM6.88 5.5 6.3 9h3.48l.58-3.5H6.88Z" />
  </svg>
)

export const ShieldIcon = ({ size = 16 }: P) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="currentColor" aria-hidden>
    <path d="M7.7 1.07a.75.75 0 0 1 .6 0l5.25 2.25a.75.75 0 0 1 .45.69V7.5c0 3.4-2.25 6.06-5.7 7.43a.75.75 0 0 1-.6 0C4.25 13.56 2 10.9 2 7.5V4.01a.75.75 0 0 1 .45-.69L7.7 1.07Z" />
  </svg>
)

export const GearIcon = ({ size = 16 }: P) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="currentColor" aria-hidden>
    <path fillRule="evenodd" d="M6.96 1.3A.75.75 0 0 1 7.7.75h.6a.75.75 0 0 1 .74.55l.33 1.24c.4.13.79.3 1.15.5l1.1-.66a.75.75 0 0 1 .92.11l.42.42c.24.24.29.62.11.92l-.66 1.1c.2.36.37.75.5 1.15l1.24.33a.75.75 0 0 1 .55.73v.6a.75.75 0 0 1-.55.74l-1.24.33c-.13.4-.3.79-.5 1.15l.66 1.1a.75.75 0 0 1-.11.92l-.42.42a.75.75 0 0 1-.92.11l-1.1-.66c-.36.2-.75.37-1.15.5l-.33 1.24a.75.75 0 0 1-.73.55h-.6a.75.75 0 0 1-.74-.55l-.33-1.24c-.4-.13-.79-.3-1.15-.5l-1.1.66a.75.75 0 0 1-.92-.11l-.42-.42a.75.75 0 0 1-.11-.92l.66-1.1c-.2-.36-.37-.75-.5-1.15L1.3 9.04A.75.75 0 0 1 .75 8.3v-.6a.75.75 0 0 1 .55-.74l1.24-.33c.13-.4.3-.79.5-1.15l-.66-1.1a.75.75 0 0 1 .11-.92l.42-.42a.75.75 0 0 1 .92-.11l1.1.66c.36-.2.75-.37 1.15-.5l.33-1.24ZM8 10.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" />
  </svg>
)
