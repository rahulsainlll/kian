/*
 * Speech-to-text engines the hub offers. All of them speak the same HTTP
 * shape (POST <url>/audio/transcriptions with a file), so one client in the
 * main process serves every option. NVIDIA's runs on your own machine: the
 * Riva speech NIM container with Whisper large v3, listening on port 9000.
 */
import type { VoiceProvider } from './types'

export interface VoicePreset {
  label: string
  url: string
  model: string
  needsKey: boolean
  hint: string
}

export const VOICE_PRESETS: Record<VoiceProvider, VoicePreset> = {
  off: {
    label: 'Type or dictate',
    url: '',
    model: '',
    needsKey: false,
    hint: 'The mic opens the type bar, so Wispr Flow or your system dictation types for you.',
  },
  openai: {
    label: 'OpenAI',
    url: 'https://api.openai.com/v1',
    model: 'gpt-4o-mini-transcribe',
    needsKey: true,
    hint: 'Fast and accurate. Needs an OpenAI API key.',
  },
  groq: {
    label: 'Groq Whisper',
    url: 'https://api.groq.com/openai/v1',
    model: 'whisper-large-v3-turbo',
    needsKey: true,
    hint: 'Whisper large v3 turbo on Groq. Needs a Groq API key.',
  },
  nvidia: {
    label: 'NVIDIA Whisper',
    url: 'http://localhost:9000/v1',
    model: 'whisper-large-v3',
    needsKey: false,
    hint: 'Whisper large v3 in NVIDIA’s speech NIM on your own GPU. Audio never leaves your network.',
  },
  custom: {
    label: 'Custom',
    url: 'http://localhost:8080/v1',
    model: 'whisper-1',
    needsKey: false,
    hint: 'Any server with an OpenAI-style /audio/transcriptions route, such as whisper.cpp.',
  },
}
