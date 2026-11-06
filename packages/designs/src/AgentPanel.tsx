"use client"

import {
  ArrowUp,
  Check,
  Copy,
  Ellipsis,
  Maximize2,
  Minimize2,
  MousePointer2,
  Package,
  Paperclip,
  SquarePen,
  ThumbsDown,
  ThumbsUp,
  X,
} from "lucide-react"
import {
  type ComponentProps,
  type CSSProperties,
  type FormEvent,
  type ReactNode,
  useEffect,
  useId,
  useRef,
  useState,
} from "react"
import { cn } from "./utils"
import "./designs.css"

export type AgentSuggestion = { icon: ReactNode; label: string }

export type AgentMessage = { role: "user" | "agent"; text: string }

export type AgentPanelProps = Omit<ComponentProps<"section">, "title" | "onSubmit"> & {
  /** The chat's name in the header. "New chat" until there's a conversation. */
  title?: string
  /** The conversation so far. Empty shows the welcome. */
  messages?: AgentMessage[]
  /** When the conversation began: the stamp above its first message. */
  startedAt?: Date
  /** The agent is working on a reply: "Thinking…" in the thread, and send becomes stop. */
  thinking?: boolean
  /** The empty state: a line in bold and one under it. */
  welcome?: { title: string; subtitle: string }
  /** Chips under the welcome; picking one sends it. */
  suggestions?: AgentSuggestion[]
  /** The composer's hint while empty. Once there's a conversation it reads "Reply…". */
  placeholder?: string
  /** A message, from the composer or a chip. */
  onSend?: (message: string) => void
  /** Stop the reply being written. */
  onStop?: () => void
  /** Start over: a fresh chat. */
  onNewChat?: () => void
  onClose?: () => void
  /** Shown or put away. It stays mounted either way, so a closed chat keeps its draft. */
  open?: boolean
  /** Larger: the panel takes more of the page. */
  expanded?: boolean
  onExpandedChange?: (expanded: boolean) => void
}

const STAMP = new Intl.DateTimeFormat(undefined, { hour: "numeric", minute: "2-digit" })

// The welcome's field of arrows, after Linear's: 23 x 11 cells of 24px, the agent's own mark
// in the bottom-centre cell. On open each arrow springs out from the mark's side, flares,
// flickers once and settles faint; the further from the mark, the later it starts
const FIELD_COLS = 23
const FIELD_ROWS = 11
const FIELD_HOME = { col: 11, row: 10 }
const FIELD_REACH = Math.hypot(FIELD_HOME.col, FIELD_HOME.row)

// Steady per-cell randomness (the same on the server and in the browser)
const noise = (i: number, salt: number) => {
  const x = Math.sin(i * 12.9898 + salt * 78.233) * 43758.5453
  return x - Math.floor(x)
}

const FIELD = Array.from({ length: FIELD_COLS * FIELD_ROWS }, (_, i) => {
  const col = i % FIELD_COLS
  const row = Math.floor(i / FIELD_COLS)
  const dx = FIELD_HOME.col - col
  const dy = FIELD_HOME.row - row
  const far = Math.hypot(dx, dy)
  if (far === 0) return null
  return {
    "--peak": (0.3 + noise(i, 1) * 0.25).toFixed(3),
    "--trough": (0.28 + noise(i, 2) * 0.07).toFixed(3),
    "--peak2": (0.28 + noise(i, 3) * 0.06).toFixed(3),
    // Starts 10px toward the mark, then moves out to its place
    "--tx": `${((dx / far) * 10).toFixed(2)}px`,
    "--ty": `${((dy / far) * 10).toFixed(2)}px`,
    animationDelay: `${(0.4 + (far / FIELD_REACH) * 1).toFixed(3)}s`,
  } as CSSProperties
})

const COPIED_MS = 1500

/**
 * Under each reply, as Linear has them: helpful, not helpful, copy. A rating stays picked
 * (picking it again clears it); copy turns into a tick for a moment
 */
function ReplyActions({ text }: { text: string }) {
  const [rating, setRating] = useState<"up" | "down" | null>(null)
  const [copied, setCopied] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined)
  useEffect(() => () => clearTimeout(timer.current), [])

  const rate = (next: "up" | "down") => setRating((r) => (r === next ? null : next))
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text)
    } catch {
      return
    }
    setCopied(true)
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setCopied(false), COPIED_MS)
  }

  return (
    <div className="ds-agent__actions">
      <button
        type="button"
        className="ds-agent__action"
        data-picked={rating === "up" || undefined}
        aria-pressed={rating === "up"}
        aria-label="Helpful"
        onClick={() => rate("up")}
      >
        <ThumbsUp />
      </button>
      <button
        type="button"
        className="ds-agent__action"
        data-picked={rating === "down" || undefined}
        aria-pressed={rating === "down"}
        aria-label="Not helpful"
        onClick={() => rate("down")}
      >
        <ThumbsDown />
      </button>
      <button
        type="button"
        className="ds-agent__action"
        aria-label={copied ? "Copied" : "Copy"}
        onClick={copy}
      >
        {copied ? <Check /> : <Copy />}
      </button>
    </div>
  )
}

function ArrowField() {
  return (
    <div className="ds-agent__field" aria-hidden>
      <div className="ds-agent__grid">
        {FIELD.map((style, i) =>
          style ? (
            // biome-ignore lint/suspicious/noArrayIndexKey: a cell is its position
            <span key={i} className="ds-agent__cell" style={style}>
              <MousePointer2 />
            </span>
          ) : (
            // biome-ignore lint/suspicious/noArrayIndexKey: a cell is its position
            <span key={i} className="ds-agent__cell ds-agent__home">
              <MousePointer2 />
            </span>
          ),
        )}
      </div>
    </div>
  )
}

/**
 * The agent's chat panel, measured from Linear's: a 48px header (the chat's name, then new
 * chat, expand and close), a body that fades grey to white around the welcome and turns
 * white for the thread, and a composer card 8px in from the edges. While a reply is coming
 * the thread says so and the send button stops it.
 */
export function AgentPanel({
  title = "New chat",
  messages = [],
  startedAt,
  thinking,
  welcome = { title: "Welcome", subtitle: "Ask anything or say what you need" },
  suggestions = [],
  placeholder = "Ask anything",
  onSend,
  onStop,
  onNewChat,
  onClose,
  open = true,
  expanded,
  onExpandedChange,
  className,
  ...props
}: AgentPanelProps) {
  const [draft, setDraft] = useState("")
  // Counts openings, so the arrow field plays again each time the panel comes up
  const [opened, setOpened] = useState(0)
  useEffect(() => {
    if (open) setOpened((n) => n + 1)
  }, [open])
  const body = useRef<HTMLDivElement>(null)
  const composer = useRef<HTMLTextAreaElement>(null)
  const composerId = useId()
  const message = draft.trim()
  const chatting = messages.length > 0

  // A new message or the thinking line: keep the newest in view
  // biome-ignore lint/correctness/useExhaustiveDependencies: scroll when the thread grows
  useEffect(() => {
    const el = body.current
    if (el) el.scrollTop = el.scrollHeight
  }, [messages.length, thinking])

  // Send stays pressable while the composer is empty: pressing it then just puts you in the box
  const submit = (event?: FormEvent) => {
    event?.preventDefault()
    if (thinking) return onStop?.()
    if (!message) return composer.current?.focus()
    onSend?.(message)
    setDraft("")
  }

  return (
    <section
      className={cn("ds-agent", className)}
      data-state={open ? "open" : "closed"}
      data-chatting={chatting || undefined}
      data-expanded={expanded || undefined}
      aria-label={title}
      aria-hidden={!open || undefined}
      inert={!open}
      {...props}
    >
      <header className="ds-agent__header">
        <h2 className="ds-agent__title">{title}</h2>
        {chatting && (
          <button type="button" className="ds-agent__tool" aria-label="Chat options">
            <Ellipsis />
          </button>
        )}
        <div className="ds-agent__tools">
          <button
            type="button"
            className="ds-agent__tool"
            onClick={onNewChat}
            aria-label="New chat"
          >
            <SquarePen />
          </button>
          <button
            type="button"
            className="ds-agent__tool"
            onClick={() => onExpandedChange?.(!expanded)}
            aria-label={expanded ? "Make smaller" : "Make larger"}
            aria-pressed={expanded}
          >
            {expanded ? <Minimize2 /> : <Maximize2 />}
          </button>
          <button type="button" className="ds-agent__tool" onClick={onClose} aria-label="Close">
            <X />
          </button>
        </div>
      </header>

      <div ref={body} className="ds-agent__body">
        {chatting ? (
          <ol className="ds-agent__thread" aria-live="polite">
            {startedAt && (
              <li className="ds-agent__stamp">
                <time dateTime={startedAt.toISOString()}>Today {STAMP.format(startedAt)}</time>
              </li>
            )}
            {messages.map((m, i) =>
              m.role === "user" ? (
                // biome-ignore lint/suspicious/noArrayIndexKey: messages are only ever appended
                <li key={i} className="ds-agent__bubble">
                  {m.text}
                </li>
              ) : (
                // biome-ignore lint/suspicious/noArrayIndexKey: messages are only ever appended
                <li key={i} className="ds-agent__reply">
                  <p className="ds-agent__words">{m.text}</p>
                  <ReplyActions text={m.text} />
                </li>
              ),
            )}
            {thinking && <li className="ds-agent__thinking">Thinking…</li>}
          </ol>
        ) : (
          <div className="ds-agent__welcome">
            <ArrowField key={opened} />
            <p className="ds-agent__hello">{welcome.title}</p>
            <p className="ds-agent__lede">{welcome.subtitle}</p>
            {suggestions.length > 0 && (
              <div className="ds-agent__chips">
                {suggestions.map(({ icon, label }) => (
                  <button
                    key={label}
                    type="button"
                    className="ds-agent__chip"
                    onClick={() => onSend?.(label)}
                  >
                    {icon}
                    {label}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <form className="ds-agent__composer" onSubmit={submit}>
        <label className="ds-sr-only" htmlFor={composerId}>
          Message
        </label>
        <textarea
          ref={composer}
          id={composerId}
          className="ds-agent__input"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) submit(event)
          }}
          placeholder={chatting ? "Reply…" : placeholder}
          rows={1}
        />
        <div className="ds-agent__bar">
          <button type="button" className="ds-agent__skills">
            <Package aria-hidden />
            Skills
            <svg viewBox="0 0 16 16" aria-hidden="true">
              <path
                d="m4.5 6.5 3.5 3.5 3.5-3.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <span className="ds-agent__spacer" />
          <button type="button" className="ds-agent__tool" aria-label="Attach">
            <Paperclip />
          </button>
          {thinking ? (
            <button type="submit" className="ds-agent__send" data-stop aria-label="Stop">
              <span className="ds-agent__stop" aria-hidden />
            </button>
          ) : (
            <button
              type="submit"
              className="ds-agent__send"
              data-empty={!message || undefined}
              aria-label="Send"
            >
              <ArrowUp />
            </button>
          )}
        </div>
      </form>
    </section>
  )
}

export type AgentLauncherProps = ComponentProps<"button"> & {
  /** The one that's showing: filled grey. */
  open?: boolean
  /** The glyph before the label; null for none (a chat's tab). */
  icon?: ReactNode
}

/**
 * A button in the agent's dock, the page's bottom-right corner: "Agent" with its icon, or a
 * chat's name as a tab beside it. Bare at rest, grey while it's the one showing.
 */
export function AgentLauncher({
  open,
  icon = <MousePointer2 aria-hidden />,
  className,
  children = "Agent",
  type = "button",
  ...props
}: AgentLauncherProps) {
  return (
    <button
      type={type}
      className={cn("ds-agent-launcher", className)}
      data-open={open || undefined}
      aria-expanded={open}
      {...props}
    >
      {icon}
      <span className="ds-agent-launcher__label">{children}</span>
    </button>
  )
}
