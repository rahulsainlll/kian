import type { CSSProperties } from "react"
import { type BrandAsset, type BrandName, brandMarks } from "./brands"
import { cn } from "./utils"
import "./designs.css"

export type BrandMarkProps = {
  size?: number
  width?: number
  /** On a tile the mark is inset; bare (an app header's logo) it fills `size`. */
  tile?: boolean
  /** The surface behind it, for marks with a dark variant. */
  surface?: "light" | "dark"
  className?: string
  style?: CSSProperties
} & (
  | { brand: BrandName; name?: string; src?: string }
  | { brand?: undefined; name: string; src?: string }
)

/**
 * A bundled product mark (Visa, Stripe, GitHub, Google's apps…) or a supplied
 * logo. Artwork keeps its proportions; a name with no artwork gets an initial tile.
 */
export function BrandMark({
  brand,
  name,
  src,
  size = 28,
  width,
  tile = true,
  surface = "light",
  className,
  style,
}: BrandMarkProps) {
  const asset: BrandAsset | undefined = brand ? brandMarks[brand] : undefined
  const dark = surface === "dark"
  const label = name ?? asset?.name ?? ""
  const image =
    src ?? (tile && asset?.tileArtwork ? asset.tileArtwork : dark ? asset?.dark : asset?.light)
  const sized = asset && !src
  const frameWidth = width ?? (sized ? Math.round(size * asset.proportion) : size)
  const lightTile = tile && dark && sized && asset.dark === asset.light

  return (
    <span
      role="img"
      aria-label={label}
      className={cn("ds-brand", className)}
      data-tile={tile || undefined}
      data-light-tile={lightTile || undefined}
      style={{
        width: frameWidth,
        height: size,
        borderRadius: `calc(${Math.round(size * 0.24)}px * var(--ds-corner, 1))`,
        background: tile && sized ? asset.tileBackground : undefined,
        ...style,
      }}
    >
      {image ? (
        // biome-ignore lint/performance/noImgElement: small bundled SVG marks, sized by the tile
        <img
          src={image}
          alt=""
          draggable={false}
          style={
            sized && tile
              ? { width: `${asset.scale * 100}%`, height: `${asset.scale * 100}%` }
              : undefined
          }
        />
      ) : (
        <span
          className="ds-brand__initial"
          style={{ fontSize: Math.round(size * (size < 24 ? 0.5 : 0.42)) }}
        >
          {label.trim()[0]?.toUpperCase()}
        </span>
      )}
    </span>
  )
}
