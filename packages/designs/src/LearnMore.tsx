import type { ComponentProps, ReactNode } from "react"
import { cn } from "./utils"
import "./designs.css"

type LearnMoreOwnProps = {
  /** The label. "Learn more" by default. */
  children?: ReactNode
}

export type LearnMoreProps = LearnMoreOwnProps &
  (
    | ({ href: string } & Omit<ComponentProps<"a">, "children">)
    | ({ href?: undefined } & Omit<ComponentProps<"button">, "children">)
  )

function Chevron() {
  return (
    <span className="ds-learn__chevron" aria-hidden>
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <path
          className="ds-learn__arm"
          data-arm="top"
          d="M6 4L10 8"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          className="ds-learn__arm"
          data-arm="bottom"
          d="M10 8L6 12"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  )
}

/**
 * A soft pill that leads somewhere: on hover (or keyboard focus) its chevron nudges right
 * and the two arms open about the tip. A link with `href`, a button without. Pure CSS.
 */
export function LearnMore({ children = "Learn more", className, ...props }: LearnMoreProps) {
  if (props.href !== undefined) {
    return (
      <a className={cn("ds-learn", className)} {...props}>
        {children}
        <Chevron />
      </a>
    )
  }
  const { type = "button", ...rest } = props as ComponentProps<"button">
  return (
    <button type={type} className={cn("ds-learn", className)} {...rest}>
      {children}
      <Chevron />
    </button>
  )
}
