/*
 * Speech to text for the pill's mic. Every engine in shared/voice.ts takes
 * the same request: POST <url>/audio/transcriptions with the recording as a
 * WAV file. NVIDIA's speech NIM also wants a language and no key. With the
 * provider set to "off" this returns null, and the widget opens the type bar
 * for Wispr Flow or the system's dictation instead.
 */
import { VOICE_PRESETS } from '../shared/voice'
import type { Settings } from '../shared/types'

export async function transcribe(audio: ArrayBuffer, mime: string, settings: Settings, key: string): Promise<string | null> {
  const provider = settings.sttProvider
  if (provider === 'off') return null
  const preset = VOICE_PRESETS[provider]
  const url = (settings.sttUrl || preset.url).replace(/\/+$/, '')
  if (!url || (preset.needsKey && !key)) return null

  const form = new FormData()
  form.append('file', new Blob([audio], { type: mime }), mime.includes('wav') ? 'speech.wav' : 'speech.webm')
  form.append('model', settings.sttModel || preset.model)
  if (provider === 'nvidia') form.append('language', 'en-US')

  const res = await fetch(`${url}/audio/transcriptions`, {
    method: 'POST',
    headers: key ? { Authorization: `Bearer ${key}` } : {},
    body: form,
  })
  if (!res.ok) throw new Error(`Transcription failed (${res.status}).`)
  const json = (await res.json()) as { text?: string }
  return json.text?.trim() || null
}
