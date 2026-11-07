/*
 * Turns a MediaRecorder recording into 16 kHz mono 16-bit WAV, the format
 * every transcription engine accepts (NVIDIA's speech NIM takes WAV, OPUS or
 * FLAC, but not the WebM that Chromium records).
 */
const RATE = 16_000

export async function toWav(audio: ArrayBuffer): Promise<ArrayBuffer> {
  const decoded = await new AudioContext().decodeAudioData(audio.slice(0))
  const offline = new OfflineAudioContext(1, Math.ceil(decoded.duration * RATE), RATE)
  const source = offline.createBufferSource()
  source.buffer = decoded
  source.connect(offline.destination)
  source.start()
  const pcm = (await offline.startRendering()).getChannelData(0)

  const out = new DataView(new ArrayBuffer(44 + pcm.length * 2))
  const text = (at: number, s: string) => [...s].forEach((c, i) => out.setUint8(at + i, c.charCodeAt(0)))
  text(0, 'RIFF')
  out.setUint32(4, 36 + pcm.length * 2, true)
  text(8, 'WAVE')
  text(12, 'fmt ')
  out.setUint32(16, 16, true) // fmt chunk size
  out.setUint16(20, 1, true) // PCM
  out.setUint16(22, 1, true) // mono
  out.setUint32(24, RATE, true)
  out.setUint32(28, RATE * 2, true) // byte rate
  out.setUint16(32, 2, true) // block align
  out.setUint16(34, 16, true) // bits per sample
  text(36, 'data')
  out.setUint32(40, pcm.length * 2, true)
  pcm.forEach((v, i) => out.setInt16(44 + i * 2, Math.max(-1, Math.min(1, v)) * 0x7fff, true))
  return out.buffer
}
