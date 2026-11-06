"use client"

import { Check, Copy, Share, X } from "lucide-react"
import { Dialog } from "radix-ui"
import {
  type ComponentProps,
  type ReactElement,
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from "react"
import { cn } from "./utils"
import "./designs.css"

export type InviteCardProps = Omit<ComponentProps<"div">, "children" | "title"> & {
  /** The reader's own code, shown big and copied by the button beside it. */
  code: string
  /** The link the share button sends. Shared through the phone's share sheet, or copied. */
  link: string
  title?: ReactNode
  description?: ReactNode
  /** The line at the foot, for someone who was sent a code. Hidden without it. */
  onRedeem?: () => void
  /** A close button in the corner: set by the modal. */
  onClose?: () => void
  /** Wraps the heading and the line under it, so a dialog can name itself by them. */
  wrapText?: (node: ReactElement, part: "title" | "description") => ReactNode
}

const asIs = (node: ReactElement) => node

const COPIED_MS = 1600

/** The empty seat: a cat's head drawn in dashes, a plus where the friend will be. */
function SeatCat() {
  return (
    <svg className="ds-invite__seat" viewBox="0 0 120 104" fill="none" aria-hidden="true">
      <path
        className="ds-invite__seat-head"
        d="M23 36 L18 10 Q17.5 5 22 7 L43 21 Q60 15 77 21 L98 7 Q102.5 5 102 10 L97 36 Q107 49 105 65 Q101 97 60 98 Q19 97 15 65 Q13 49 23 36 Z"
      />
      <path className="ds-invite__seat-plus" d="M60 48 V76 M46 62 H74" />
    </svg>
  )
}

/** Copied for a moment, then back: the icon swaps in place, and a screen reader hears it. */
function useCopied() {
  const [copied, setCopied] = useState<string | null>(null)
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined)
  useEffect(() => () => clearTimeout(timer.current), [])
  const copy = async (text: string, what: string) => {
    try {
      await navigator.clipboard.writeText(text)
    } catch {
      return
    }
    clearTimeout(timer.current)
    setCopied(what)
    timer.current = setTimeout(() => setCopied(null), COPIED_MS)
  }
  return { copied, copy }
}

/**
 * Invite a friend, as a ticket: a dashed cat where the friend will sit, your code to copy,
 * a link to share, and a stub torn off along a dashed line for someone who already has a code.
 */
export function InviteCard({
  code,
  link,
  title = "Invite a friend",
  description = "Share your invite code, or send a friend a link to study with you",
  onRedeem,
  onClose,
  wrapText = asIs,
  className,
  ...props
}: InviteCardProps) {
  const { copied, copy } = useCopied()

  const share = async () => {
    if (typeof navigator.share === "function") {
      try {
        await navigator.share({ title: "Join me on Student Intelligence", url: link })
        return
      } catch (error) {
        // Closing the share sheet is a choice, not a failure: nothing to copy
        if (error instanceof DOMException && error.name === "AbortError") return
      }
    }
    copy(link, "link")
  }

  return (
    <div className={cn("ds-invite", className)} {...props}>
      <div className="ds-invite__main">
        {onClose && (
          <button type="button" className="ds-invite__close" onClick={onClose} aria-label="Close">
            <X />
          </button>
        )}
        <SeatCat />
        {wrapText(<h2 className="ds-invite__title">{title}</h2>, "title")}
        {wrapText(<p className="ds-invite__description">{description}</p>, "description")}

        <div className="ds-invite__code">
          <div className="ds-invite__code-text">
            <span className="ds-invite__code-label">Your invite code</span>
            <span className="ds-invite__code-value">{code}</span>
          </div>
          <button
            type="button"
            className="ds-invite__copy"
            onClick={() => copy(code, "code")}
            data-copied={copied === "code" || undefined}
            aria-label="Copy code"
          >
            <Copy className="ds-invite__glyph" data-glyph="copy" aria-hidden="true" />
            <Check className="ds-invite__glyph" data-glyph="check" aria-hidden="true" />
          </button>
        </div>

        <button type="button" className="ds-invite__share" onClick={share}>
          <Share aria-hidden="true" />
          {copied === "link" ? "Link copied" : "Share invite link"}
        </button>
      </div>

      {onRedeem && (
        <div className="ds-invite__stub">
          <button type="button" className="ds-invite__redeem" onClick={onRedeem}>
            Already have an invite code?
          </button>
        </div>
      )}

      <span className="ds-sr-only" role="status">
        {copied === "code" ? "Code copied" : copied === "link" ? "Link copied" : ""}
      </span>
    </div>
  )
}

export type InviteModalProps = Omit<InviteCardProps, "onClose" | "wrapText"> & {
  /** The control that opens it. Rendered as-is (asChild), so pass a button. */
  trigger?: ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

/** The invite card as a modal, over a dimmed page; Escape, the scrim or the corner closes it. */
export function InviteModal({ trigger, open, onOpenChange, ...card }: InviteModalProps) {
  const [inner, setInner] = useState(false)
  const shown = open ?? inner
  const show = (next: boolean) => {
    setInner(next)
    onOpenChange?.(next)
  }
  return (
    <Dialog.Root open={shown} onOpenChange={show}>
      {trigger && <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>}
      <Dialog.Portal>
        <Dialog.Overlay className="ds-invite-scrim" />
        <Dialog.Content className="ds-invite-modal">
          <InviteCard
            {...card}
            onClose={() => show(false)}
            wrapText={(node, part) =>
              part === "title" ? (
                <Dialog.Title asChild>{node}</Dialog.Title>
              ) : (
                <Dialog.Description asChild>{node}</Dialog.Description>
              )
            }
          />
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
