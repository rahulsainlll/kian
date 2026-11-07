/*
 * The product video, embedded lightly: a poster with a play button until the
 * visitor clicks, then the YouTube player (privacy-enhanced domain). Keeps
 * YouTube's scripts off the page until someone wants to watch.
 */
import { useState } from 'react'

export const VIDEO_ID = 'CsMlFwkCRAs'
export const VIDEO_URL = `https://youtu.be/${VIDEO_ID}`

export function VideoEmbed({ title = 'Kian in three minutes' }: { title?: string }) {
  const [playing, setPlaying] = useState(false)
  return (
    <div className="video">
      {playing ? (
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${VIDEO_ID}?autoplay=1&rel=0`}
          title={title}
          allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
          allowFullScreen
        />
      ) : (
        <button className="video__poster" onClick={() => setPlaying(true)} aria-label={`Play: ${title}`}>
          <img src="/video-poster.png" alt="" width={1280} height={720} loading="lazy" />
          <span className="video__play" aria-hidden>
            <svg viewBox="0 0 24 24" width="30" height="30">
              <path d="M8 5.5v13l11-6.5z" fill="currentColor" />
            </svg>
          </span>
        </button>
      )}
    </div>
  )
}
