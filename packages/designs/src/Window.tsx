import type { CSSProperties, ReactNode } from "react"
import { cn } from "./utils"
import "./designs.css"

export type WindowProps = {
  /** native: macOS chrome, a 38px bar and a rule. glass: a frosted frame with the page inset as a card. */
  chrome?: "native" | "glass"
  /** An address in the bar (a browser). Glass shows it centered with a lock. */
  url?: string
  /** A centered title instead of an address (an app window). */
  title?: string
  /** color: macOS lights. grey and white: quiet lights (white for glass over strong color). */
  lights?: "color" | "grey" | "white"
  children: ReactNode
  className?: string
  bodyClassName?: string
  style?: CSSProperties
}

function Lock() {
  return (
    <svg className="ds-window__lock" viewBox="0 0 16 16" width="9" height="9" aria-hidden="true">
      <path
        d="M8 1.25A3.25 3.25 0 0 0 4.75 4.5v2H4.5A1.5 1.5 0 0 0 3 8v5.25a1.5 1.5 0 0 0 1.5 1.5h7a1.5 1.5 0 0 0 1.5-1.5V8a1.5 1.5 0 0 0-1.5-1.5h-.25v-2A3.25 3.25 0 0 0 8 1.25Zm-1.75 5.25v-2a1.75 1.75 0 0 1 3.5 0v2Z"
        fill="currentColor"
        fillRule="evenodd"
      />
    </svg>
  )
}

/** The kit's window chrome, for framing a screenshot, an embed or a product preview. */
export function Window({
  chrome = "native",
  url,
  title,
  lights,
  children,
  className,
  bodyClassName,
  style,
}: WindowProps) {
  const glass = chrome === "glass"
  const tone = lights ?? (glass ? "grey" : "color")
  return (
    <div
      className={cn("ds-window", className)}
      data-chrome={glass ? "glass" : undefined}
      data-lights={tone === "color" ? undefined : tone}
      style={style}
    >
      <div className="ds-window__bar">
        <span className="ds-window__lights" aria-hidden>
          <span className="ds-window__dot" />
          <span className="ds-window__dot" />
          <span className="ds-window__dot" />
        </span>
        {url !== undefined && (
          <span className="ds-window__url">
            {glass && <Lock />}
            <span className="ds-window__url-text">{url}</span>
          </span>
        )}
        {url === undefined && title && <span className="ds-window__title">{title}</span>}
      </div>
      <div className={cn("ds-window__body", bodyClassName)}>{children}</div>
    </div>
  )
}
