/*
 * Watch: the three-minute product video on the home page, right after the
 * hero, with a link to watch it on YouTube.
 */
import { VIDEO_URL, VideoEmbed } from '../../VideoEmbed'
import { Block } from './Block'

export function Watch() {
  return (
    <Block id="watch" eyebrow="Watch" title="Kian in three minutes">
      <VideoEmbed />
      <p className="video__more">
        See the agents hand work to each other in Switch, the Wispr Flow voice input and the architecture.{' '}
        <a href={VIDEO_URL} target="_blank" rel="noopener">
          Watch on YouTube
        </a>
      </p>
    </Block>
  )
}
