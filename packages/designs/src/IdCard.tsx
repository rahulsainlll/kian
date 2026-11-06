import { Children, type ComponentProps, type CSSProperties, type ReactNode } from "react"
import { cn } from "./utils"
import "./designs.css"

export type IdCardProps = Omit<ComponentProps<"div">, "children"> & {
  /** Without the @. Empty: a placeholder bar where it will go. */
  handle?: string
  /** The line under the handle. Empty: a placeholder bar. */
  name?: string
  /** Taken or available: the silhouette takes the accent and the card's texture shows. */
  claimed?: boolean
  /** A photo (an <Image>) in place of the silhouette; it fills the square. */
  avatar?: ReactNode
}

// The guilloche behind a claimed silhouette, the kind printed on a real ID card
const TEXTURE = [
  "M419.214 114.219C305.16 75.205 253.988 67.321 228.413 48.325 201.791 29.8 200.733.19 162.334-71.667",
  "M90.614-79.307C124.668-34.83 145.033-.909 158.037 21.76c13.316 23.04 19.271 34.828 31.806 43.797 12.413 9.007 31.406 15.195 67.879 28.282 35.884 12.82 89.247 32.538 157.165 62.409",
  "M410.71 198.307c-72.842-40.289-136.52-70.821-176.467-88.567-41.275-18.516-58.819-24.245-70.242-32.62-11.607-8.292-17.07-19.176-38.335-46.205C105.361 4.805 69.223-37.454 18.613-87.283",
  "M406.652 240.55c-67.743-44.933-142.798-90.43-186.45-115.382-46.37-26.754-61.34-32.945-72.161-40.899-11.004-7.887-17.777-17.477-51.747-49.352C64.704 4.997 5.916-47.209-54.176-95.65M402.767 283.033c-50.259-36.689-140.208-102.496-188.497-137.818-53.357-39.059-65.048-47.667-76.693-56.167-11.698-8.54-23.266-16.93-76.508-55.687C12.899-1.693-76.914-67.128-127.963-104.393M329.704 275.012c-59.981-48.395-119.045-101.038-150.835-131.304-34.169-32.202-41.034-42.041-52.004-49.976-10.813-8.02-25.68-14.082-71.955-40.621C11.353 28.374-63.616-16.825-131.897-61.951",
  "M257.01 267.133c-50.816-50.106-87.228-92.82-107.703-119.272-21.463-27.391-26.957-38.533-38.557-46.893C99.336 92.51 81.905 86.826 40.7 68.471.828 50.87-62.79 20.581-135.926-19.687",
  "M184.567 259.383c-34.307-44.862-54.891-79.215-68.006-102.218-13.457-23.379-19.416-35.406-31.91-44.489-12.371-9.122-31.248-15.298-67.613-28.288-35.806-12.727-89.071-32.265-157.119-62.013",
  "M-144.442 64.4c114.05 38.774 164.858 46.483 190.32 65.723 26.48 18.75 27.589 48.994 66.346 121.639",
  "M39.815 244.203c-29.348-98.188-28.417-98.107-186.617-137.262",
]

function Silhouette() {
  return (
    <svg className="ds-idcard__silhouette" viewBox="0 0 192 192" fill="none" aria-hidden="true">
      <rect className="ds-idcard__ground" width="192" height="192" />
      <g className="ds-idcard__texture">
        {TEXTURE.map((d) => (
          <path key={d} d={d} />
        ))}
      </g>
      <circle className="ds-idcard__figure" cx="96" cy="222.222" r="88.8889" />
      <circle className="ds-idcard__figure" cx="96" cy="78.2219" r="40.8889" />
    </svg>
  )
}

/**
 * A lanyard ID card (216 wide): a tab to hang it by, a square photo, the @handle and a name
 * beneath. Whatever isn't known yet is a soft bar in its place, so the card keeps its shape
 * while it fills in; claiming it warms the silhouette to the accent.
 */
export function IdCard({ handle, name, claimed, avatar, className, ...props }: IdCardProps) {
  return (
    <div className={cn("ds-idcard", className)} data-claimed={claimed || undefined} {...props}>
      <span className="ds-idcard__tab" aria-hidden />
      <div className="ds-idcard__avatar">{avatar ?? <Silhouette />}</div>
      <div className="ds-idcard__text">
        {handle ? (
          // Keyed on whether there's a handle, so it settles in once, not on every letter
          <p key="handle" className="ds-idcard__handle ds-idcard__value">
            <span className="ds-idcard__at">@</span>
            {handle}
          </p>
        ) : (
          <p key="empty" className="ds-idcard__handle ds-idcard__placeholder" aria-hidden>
            @username
          </p>
        )}
        {name ? (
          <p className="ds-idcard__name ds-idcard__value">{name}</p>
        ) : (
          <p className="ds-idcard__name ds-idcard__placeholder" aria-hidden>
            Display Name
          </p>
        )}
      </div>
    </div>
  )
}

/** An empty card drawn in hairlines: the tab, the photo square, the figure. */
export function IdCardOutline({ className, ...props }: ComponentProps<"svg">) {
  return (
    <svg
      className={cn("ds-idcard-outline", className)}
      width="216"
      height="304"
      viewBox="0 0 216 304"
      fill="none"
      aria-hidden="true"
      {...props}
    >
      <rect x="0.5" y="0.5" width="215" height="303" rx="29.5" />
      <path d="M188 49H28C19.716 49 13 55.716 13 64v160c0 8.284 6.716 15 15 15h160c8.284 0 15-6.716 15-15V64c0-8.284-6.716-15-15-15Z" />
      <path d="M189 239c0-20.928-36.265-56-81-56s-81 35.072-81 56" />
      <circle cx="108" cy="126.222" r="39.889" />
      <path
        className="ds-idcard-outline__tab"
        fillRule="evenodd"
        d="M100.261 19.3179C101.373 15.7615 104.691 13.1816 108.613 13.1816C112.536 13.1816 115.854 15.7615 116.966 19.3179H120.886C125.718 19.3179 129.636 23.2354 129.636 28.0679C129.636 32.9004 125.718 36.8179 120.886 36.8179H95.1133C90.2808 36.8179 86.3633 32.9004 86.3633 28.0679C86.3633 23.2354 90.2808 19.3179 95.1133 19.3179H100.261ZM101.891 21.3179C102.201 17.8776 105.092 15.1816 108.613 15.1816C112.134 15.1816 115.026 17.8776 115.336 21.3179H120.886C124.614 21.3179 127.636 24.34 127.636 28.0679C127.636 31.7958 124.614 34.8179 120.886 34.8179H95.1133C91.3854 34.8179 88.3633 31.7958 88.3633 28.0679C88.3633 24.34 91.3854 21.3179 95.1133 21.3179H101.891Z"
      />
    </svg>
  )
}

export type IdCardWallProps = ComponentProps<"div"> & {
  /** Cards across; odd, so one sits in the middle. 7 by default, enough to zoom out to. */
  columns?: number
  /** Cards down; odd. 5 by default. */
  rows?: number
  /** How close the wall sits: 1 is the card at full size. Below 1 the wall pulls back and
      the outlines around it fill in as empty cards. */
  zoom?: number
}

/**
 * A wall of empty cards with the one that matters in the middle: the child goes in the
 * centre cell and outlines fill the rest. Centred on its box and clipped by it, so the outer
 * cards run off the edges. Changing `zoom` pulls the whole wall back (or in) as one scale.
 */
export function IdCardWall({
  columns = 7,
  rows = 5,
  zoom = 1,
  children,
  className,
  style,
  ...props
}: IdCardWallProps) {
  const middle = Math.floor(rows / 2) * columns + Math.floor(columns / 2)
  const card = Children.only(children)
  return (
    <div
      className={cn("ds-idcard-wall", className)}
      data-zoomed={zoom < 1 || undefined}
      style={{ "--ds-idcard-zoom": zoom, ...style } as CSSProperties}
      {...props}
    >
      <div
        className="ds-idcard-wall__grid"
        style={{ gridTemplateColumns: `repeat(${columns}, 216px)` }}
      >
        {Array.from({ length: columns * rows }, (_, i) =>
          i === middle ? (
            <div key="card" className="ds-idcard-wall__cell">
              {card}
            </div>
          ) : (
            // biome-ignore lint/suspicious/noArrayIndexKey: a cell is its position
            <div key={i} className="ds-idcard-wall__cell" aria-hidden>
              <IdCardOutline />
              <IdCard className="ds-idcard-wall__blank" />
            </div>
          ),
        )}
      </div>
    </div>
  )
}
