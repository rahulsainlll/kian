/*
 * The desktop app's own rows for the hub's settings modal, in the website's
 * set-row style: General (shortcut, widget position, sounds, read aloud),
 * Agents (the voice engine, including NVIDIA's Whisper), Connectors (the
 * Switch rooms), Team (your role and rooms) and Data and privacy. Plain
 * choices save at once; text fields save when you leave them.
 */
import { ActionButton, Field, Segmented, Select, Toggle, type ActionStatus } from '@kian/designs'
import { Connector, SetRow, type SettingsTab } from '@kian/hub'
import { BoltIcon, ChatIcon, PlaneIcon } from '@kian/ui'
import { useState, type ReactNode } from 'react'
import type { Settings, SettingsUpdate, VoiceProvider, WidgetPosition } from '../../shared/types'
import { VOICE_PRESETS } from '../../shared/voice'
import { HotkeyField } from './HotkeyField'

type Save = (update: SettingsUpdate) => Promise<void>

const POSITIONS: { value: WidgetPosition; label: string }[] = [
  { value: 'bottom', label: 'Bottom centre' },
  { value: 'bottom-left', label: 'Bottom left' },
  { value: 'bottom-right', label: 'Bottom right' },
  { value: 'left', label: 'Left edge' },
  { value: 'right', label: 'Right edge' },
]

export function settingsTabs(s: Settings, save: Save): Partial<Record<SettingsTab, ReactNode>> {
  return {
    general: (
      <>
        <SetRow
          title="Shortcut"
          desc="Press it anywhere to talk to Kian; press again to send. Click to change."
          action={<HotkeyField value={s.hotkey} onChange={(hotkey) => void save({ hotkey })} />}
        />
        <SetRow
          title="Widget position"
          desc="Bottom of the screen, or upright on an edge. Also in the menu bar icon."
          action={<Select aria-label="Widget position" value={s.position} options={POSITIONS} onValueChange={(position) => void save({ position })} />}
        />
        <SetRow title="Sounds" desc="A soft tone when Kian listens, sends, or has a card for you." action={<Toggle checked={s.sounds} onCheckedChange={(sounds) => void save({ sounds })} />} />
        <SetRow title="Read cards aloud" desc="Uses your system voice." action={<Toggle checked={s.speak} onCheckedChange={(speak) => void save({ speak })} />} />
      </>
    ),
    agents: <VoiceRows s={s} save={save} />,
    connectors: <SwitchRows s={s} save={save} />,
    team: (
      <>
        <SetRow
          title="I'm the sales lead"
          desc="Approval cards from the approvals room come to you, and you can approve from the hub."
          action={<Toggle checked={s.approver} onCheckedChange={(approver) => void save({ approver })} />}
        />
        <div className="set-form">
          <TextSetting label="Desk room" value={s.deskRoom} onSave={(deskRoom) => save({ deskRoom })} />
          <TextSetting label="Approvals room" value={s.approvalsRoom} onSave={(approvalsRoom) => save({ approvalsRoom })} />
          <TextSetting
            label="Agents"
            hint="Their messages can become cards"
            value={s.agents.join(', ')}
            onSave={(v) => save({ agents: v.split(',').map((a) => a.trim()).filter(Boolean) })}
          />
        </div>
      </>
    ),
    privacy: (
      <>
        <SetRow title="Where your data lives" desc="In your Switch rooms and your Google account. Kian keeps no copy." action={<span className="role">Local</span>} />
        <SetRow title="Secrets" desc="Your Mattermost sign-in and voice key are kept in the system keychain." action={<span className="role">Keychain</span>} />
        <SetRow title="Sending" desc="Agents can only create drafts. There is no send command." action={<span className="role">Off</span>} />
      </>
    ),
  }
}

function VoiceRows({ s, save }: { s: Settings; save: Save }) {
  const preset = VOICE_PRESETS[s.sttProvider]
  const choose = (sttProvider: VoiceProvider) => {
    const p = VOICE_PRESETS[sttProvider]
    void save({ sttProvider, sttUrl: p.url, sttModel: p.model })
  }
  return (
    <>
      <SetRow
        title="Voice engine"
        desc={preset.hint}
        action={
          <Select
            aria-label="Voice engine"
            value={s.sttProvider}
            options={(Object.keys(VOICE_PRESETS) as VoiceProvider[]).map((v) => ({ value: v, label: VOICE_PRESETS[v].label }))}
            onValueChange={choose}
          />
        }
      />
      {s.sttProvider === 'nvidia' && (
        <p className="set-note">
          Run NVIDIA’s speech NIM with Whisper large v3 on a machine with an NVIDIA GPU, then point Kian at it. The
          container serves <code>/v1/audio/transcriptions</code> on port 9000.
        </p>
      )}
      {s.sttProvider !== 'off' && (
        <div className="set-form">
          <TextSetting label="Endpoint" value={s.sttUrl || preset.url} onSave={(sttUrl) => save({ sttUrl })} />
          <TextSetting label="Model" value={s.sttModel || preset.model} onSave={(sttModel) => save({ sttModel })} />
          <SecretSetting label={preset.needsKey ? 'API key' : 'API key (optional)'} saved={s.hasSttKey} onSave={(sttKey) => save({ sttKey })} />
        </div>
      )}
    </>
  )
}

function SwitchRows({ s, save }: { s: Settings; save: Save }) {
  const [result, setResult] = useState<{ status: ActionStatus; message: string }>({ status: 'idle', message: '' })
  const live = s.backend === 'mattermost'
  const test = async () => {
    setResult({ status: 'pending', message: '' })
    const r = await window.kian.hub.test()
    setResult({ status: r.ok ? 'done' : 'idle', message: r.message })
  }
  return (
    <>
      <SetRow
        title="Rooms"
        desc={live ? 'Your Switch server’s Mattermost, signed in as you.' : 'A scripted morning, no server needed.'}
        action={
          <Segmented
            aria-label="Where Kian reads from"
            value={s.backend}
            options={[
              { value: 'mock', label: 'Demo' },
              { value: 'mattermost', label: 'Switch' },
            ]}
            onValueChange={(backend) => void save({ backend })}
          />
        }
      />
      {live && (
        <>
          <div className="set-form">
            <TextSetting label="Mattermost URL" hint="Switch Console, Messaging apps" value={s.url} onSave={(url) => save({ url })} />
            <TextSetting label="Team" hint="Empty for your first team" value={s.team} onSave={(team) => save({ team })} />
            <TextSetting label="Username" hint="Empty to use a personal access token" value={s.username} onSave={(username) => save({ username })} />
            <SecretSetting label={s.username ? 'Password' : 'Personal access token'} saved={s.hasToken} onSave={(token) => save({ token })} />
          </div>
          <div className="set-actions">
            <span className="set-result" data-ok={result.status === 'done' || undefined}>
              {result.message}
            </span>
            <ActionButton status={result.status} doneLabel="Connected" onClick={() => void test()}>
              Test connection
            </ActionButton>
          </div>
        </>
      )}
      <Connector
        name="Switch agents"
        desc="kian, kian-scribe and kian-studio, from kian.template.yaml"
        glyph={<BoltIcon />}
        connected={live}
        onConnect={async () => (await save({ backend: 'mattermost' }), false)}
      />
      <Connector
        name="Gmail, Calendar and Sheets"
        desc="Reached by the agents’ toolkit on the Switch machine. Drafts only."
        brand="gmail"
        connected={live}
        onConnect={() => guide('#4-a-real-google-account-optional')}
      />
      <Connector name="Telegram" desc="Invite kian to a Telegram group from Switch Console" glyph={<PlaneIcon />} onConnect={() => guide('#5-telegram-optional')} />
      <Connector name="Wispr Flow" desc="Dictate into the type bar from any app" glyph={<ChatIcon />} connected />
    </>
  )
}

/** Opens a step of the Switch setup guide in the browser; the row stays unconnected. */
async function guide(anchor: string) {
  window.open(`https://github.com/rahulsainlll/kian/blob/main/switch/README.md${anchor}`)
  return false
}

function TextSetting({ label, hint, value, onSave }: { label: string; hint?: string; value: string; onSave: (v: string) => Promise<void> }) {
  const [draft, setDraft] = useState(value)
  return <Field label={label} hint={hint} value={draft} onValueChange={setDraft} onBlur={() => draft !== value && void onSave(draft)} />
}

function SecretSetting({ label, saved, onSave }: { label: string; saved: boolean; onSave: (v: string) => Promise<void> }) {
  const [draft, setDraft] = useState('')
  return (
    <Field
      label={label}
      type="password"
      hint={saved ? 'Saved in your keychain. Type to replace it.' : 'Kept in your keychain, never shown again.'}
      value={draft}
      onValueChange={setDraft}
      onBlur={() => {
        if (!draft) return
        void onSave(draft)
        setDraft('')
      }}
    />
  )
}
