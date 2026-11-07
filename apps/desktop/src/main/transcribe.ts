/*
 * Speech to text for the pill's mic. Sends the recording to an OpenAI-
 * compatible /audio/transcriptions endpoint when a key is set in the hub.
 * Without one it returns null, and the widget opens the type bar instead,
 * which is where Wispr Flow (or the system's dictation) types for you.
 */
import type { Settings } from '../shared/types'

export async function transcribe(audio: ArrayBuffer, mime: string, settings: Settings, key: string): Promise<string | null> {
  if (!key || !settings.sttUrl) return null
  const form = new FormData()
  const ext = mime.includes('mp4') ? 'mp4' : mime.includes('ogg') ? 'ogg' : 'webm'
  form.append('file', new Blob([audio], { type: mime }), `speech.${ext}`)
  form.append('model', settings.sttModel)
  const res = await fetch(`${settings.sttUrl.replace(/\/+$/, '')}/audio/transcriptions`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}` },
    body: form,
  })
  if (!res.ok) throw new Error(`Transcription failed (${res.status}).`)
  const json = (await res.json()) as { text?: string }
  return json.text?.trim() || null
}
