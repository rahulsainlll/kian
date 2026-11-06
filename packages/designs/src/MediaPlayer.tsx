"use client"

import { Slider as SliderPrimitive } from "radix-ui"
import { type ReactNode, useEffect, useRef, useState } from "react"
import { cn } from "./utils"
import "./designs.css"

export type MediaPlayerProps = {
  title: string
  artist: string
  /** Cover art; defaults to the drawn sunset. */
  artwork?: ReactNode
  /** An audio URL. When set, the player drives a real <audio> element. */
  src?: string
  /** Without `src`: the track length and position in seconds, and whether it plays. */
  duration?: number
  currentTime?: number
  playing?: boolean
  onPlayingChange?: (playing: boolean) => void
  onSeek?: (seconds: number) => void
  onPrevious?: () => void
  onNext?: () => void
  className?: string
}

const clock = (seconds: number) => {
  const s = Math.max(0, Math.floor(seconds))
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`
}

/** The poster's dark player: 180px tall, square cover, 16px title, 4px rail, 38px play. */
export function MediaPlayer({
  title,
  artist,
  artwork = <SunsetArtwork />,
  src,
  duration: durationProp = 0,
  currentTime: timeProp = 0,
  playing: playingProp = false,
  onPlayingChange,
  onSeek,
  onPrevious,
  onNext,
  className,
}: MediaPlayerProps) {
  const audio = useRef<HTMLAudioElement>(null)
  const [media, setMedia] = useState({ time: 0, duration: 0, playing: false })
  const time = src ? media.time : timeProp
  const duration = src ? media.duration : durationProp
  const playing = src ? media.playing : playingProp

  useEffect(() => {
    const element = audio.current
    if (!src || !element) return
    const sync = () =>
      setMedia({
        time: element.currentTime,
        duration: Number.isFinite(element.duration) ? element.duration : 0,
        playing: !element.paused,
      })
    const events = ["timeupdate", "loadedmetadata", "play", "pause", "ended"] as const
    for (const name of events) element.addEventListener(name, sync)
    return () => {
      for (const name of events) element.removeEventListener(name, sync)
    }
  }, [src])

  const toggle = () => {
    const element = audio.current
    if (src && element) {
      if (element.paused) void element.play()
      else element.pause()
    }
    onPlayingChange?.(!playing)
  }

  const seek = (seconds: number) => {
    if (src && audio.current) audio.current.currentTime = seconds
    onSeek?.(seconds)
  }

  return (
    <section
      aria-label={`Now playing: ${title} by ${artist}`}
      className={cn("ds-player", className)}
    >
      {src && (
        // biome-ignore lint/a11y/useMediaCaption: music playback, no spoken content to caption
        <audio ref={audio} src={src} preload="metadata" />
      )}
      <span className="ds-player__cover">{artwork}</span>
      <div className="ds-player__side">
        <span className="ds-player__names">
          <strong className="ds-player__title">{title}</strong>
          <span className="ds-player__artist">{artist}</span>
        </span>
        <span className="ds-player__progress">
          <SliderPrimitive.Root
            value={[Math.min(time, duration)]}
            max={duration || 1}
            step={1}
            onValueChange={([seconds]) => seek(seconds)}
            disabled={!duration}
            aria-label="Seek"
            className="ds-player__seek"
          >
            <SliderPrimitive.Track className="ds-player__rail">
              <SliderPrimitive.Range className="ds-player__fill" />
            </SliderPrimitive.Track>
            <SliderPrimitive.Thumb
              className="ds-player__thumb"
              aria-valuetext={`${clock(time)} of ${clock(duration)}`}
            />
          </SliderPrimitive.Root>
          <span className="ds-player__times">
            <span>{clock(time)}</span>
            <span>{clock(duration)}</span>
          </span>
        </span>
        <span className="ds-player__controls">
          <button
            type="button"
            className="ds-player__button"
            onClick={onPrevious}
            disabled={!onPrevious}
            aria-label="Previous track"
          >
            <svg viewBox="0 0 16 16" width="18" height="18" aria-hidden="true">
              <path d="M3.2 3h1.6v10H3.2zM13 3.7v8.6a.7.7 0 0 1-1.07.6L5.6 8.6a.7.7 0 0 1 0-1.2l6.33-4.3A.7.7 0 0 1 13 3.7Z" />
            </svg>
          </button>
          <button
            type="button"
            className="ds-player__button ds-player__play"
            onClick={toggle}
            aria-label={playing ? "Pause" : "Play"}
          >
            <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">
              <path d={playing ? "M4.2 3h2.4v10H4.2zM9.4 3h2.4v10H9.4z" : "M5 2.8v10.4L13 8Z"} />
            </svg>
          </button>
          <button
            type="button"
            className="ds-player__button"
            onClick={onNext}
            disabled={!onNext}
            aria-label="Next track"
          >
            <svg viewBox="0 0 16 16" width="18" height="18" aria-hidden="true">
              <path d="M11.2 3h1.6v10h-1.6zM3 3.7v8.6a.7.7 0 0 0 1.07.6l6.33-4.3a.7.7 0 0 0 0-1.2L4.07 3.1A.7.7 0 0 0 3 3.7Z" />
            </svg>
          </button>
        </span>
      </div>
    </section>
  )
}

/** The poster's cover: a low sun over a striped sea. */
export function SunsetArtwork() {
  return (
    <span className="ds-sunset" role="img" aria-label="Album artwork: a sunset over the sea">
      <span className="ds-sunset__sun" />
      <span className="ds-sunset__sea" />
    </span>
  )
}
