/*
 * The preload bridge: the only door between the renderer and the main
 * process. It exposes window.kian (typed by KianBridge in shared/types.ts)
 * and nothing else: intents go in, display state comes out, secrets stay in
 * the main process.
 */
import { contextBridge, ipcRenderer } from 'electron'
import type { DeskState, KianBridge, RoomEvent, Settings } from '../shared/types'

function listen<T>(channel: string, fn: (payload: T) => void) {
  const handler = (_e: unknown, payload: T) => fn(payload)
  ipcRenderer.on(channel, handler)
  return () => void ipcRenderer.removeListener(channel, handler)
}

const kian: KianBridge = {
  platform: process.platform,
  desk: {
    state: () => ipcRenderer.invoke('desk:state'),
    onState: (fn) => listen<DeskState>('desk:state', fn),
    onHotkey: (fn) => listen<void>('desk:hotkey', fn),
    say: (text) => ipcRenderer.invoke('desk:say', text),
    answer: (id, reply) => ipcRenderer.invoke('desk:answer', id, reply),
    dismiss: (id) => ipcRenderer.invoke('desk:dismiss', id),
    transcribe: (audio, mime) => ipcRenderer.invoke('desk:transcribe', audio, mime),
    setInteractive: (on) => ipcRenderer.send('desk:interactive', on),
    moveBy: (dx, dy) => ipcRenderer.send('desk:move-by', dx, dy),
    moveEnd: () => ipcRenderer.send('desk:move-end'),
    openHub: () => ipcRenderer.send('desk:open-hub'),
  },
  hub: {
    settings: () => ipcRenderer.invoke('hub:settings'),
    save: (update) => ipcRenderer.invoke('hub:save', update),
    test: () => ipcRenderer.invoke('hub:test'),
    rooms: () => ipcRenderer.invoke('hub:rooms'),
    feed: () => ipcRenderer.invoke('hub:feed'),
    onFeed: (fn) => listen<RoomEvent>('hub:feed', fn),
    onSettings: (fn) => listen<Settings>('hub:settings-changed', fn),
  },
}

contextBridge.exposeInMainWorld('kian', kian)
