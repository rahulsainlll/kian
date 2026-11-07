/*
 * AvatarStack: overlapping avatars for the people in a room, with a +N.
 */
import { cn } from "./utils"
import "./designs.css"

export type AvatarStackPerson = { name: string; src?: string }

export type AvatarStackProps = {
  people: readonly AvatarStackPerson[]
  /** Faces before the rest fold into a +N disc. */
  max?: number
  className?: string
}

/** The poster's people: 54px white discs overlapping by 10, ringed in the paper color. */
export function AvatarStack({ people, max = 3, className }: AvatarStackProps) {
  const shown = people.slice(0, max)
  const rest = people.length - shown.length
  return (
    <ul
      aria-label={people.map((p) => p.name).join(", ")}
      className={cn("ds-people ds-poster", className)}
    >
      {shown.map((person) => (
        <li key={person.name}>
          {person.src ? (
            // biome-ignore lint/performance/noImgElement: avatars are remote, arbitrary-size photos
            <img src={person.src} alt="" />
          ) : (
            <span aria-hidden>{person.name.trim()[0]?.toUpperCase()}</span>
          )}
        </li>
      ))}
      {rest > 0 && (
        <li className="ds-people__more" aria-label={`and ${rest} more`}>
          +{rest}
        </li>
      )}
    </ul>
  )
}
