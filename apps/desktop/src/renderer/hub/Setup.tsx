/*
 * Setup: connect Kian to the Mattermost that Switch Console runs, or stay on
 * the demo. Secrets are typed here and sent once to the main process, which
 * keeps them in the OS keychain; this form never shows them again, only
 * whether one is saved. "Test" signs in with what is saved.
 */
import { ActionButton, Button, Field, Segmented, Toggle, type ActionStatus } from '@kian/designs'
import { Panel } from '@kian/ui'
import { useState, type ReactNode } from 'react'
import type { Settings, SettingsUpdate } from '../../shared/types'

export function Setup({ settings, onSaved }: { settings: Settings; onSaved: (s: Settings) => void }) {
  const [draft, setDraft] = useState<SettingsUpdate>({})
  const [test, setTest] = useState<{ status: ActionStatus; message: string }>({ status: 'idle', message: '' })
  const value = { ...settings, ...draft }
  const set = (patch: SettingsUpdate) => setDraft((d) => ({ ...d, ...patch }))
  const switchMode = value.backend === 'mattermost'

  const save = async () => {
    onSaved(await window.kian.hub.save(draft))
    setDraft({})
  }

  const runTest = async () => {
    setTest({ status: 'pending', message: '' })
    if (Object.keys(draft).length) await save()
    const result = await window.kian.hub.test()
    setTest({ status: result.ok ? 'done' : 'idle', message: result.message })
  }

  return (
    <>
      <header className="hub__head">
        <div>
          <h1>Setup</h1>
          <p>Kian is one more client of your Switch rooms. It signs in as you and posts only what you say or tap.</p>
        </div>
      </header>

      <Panel title="Rooms">
        <Line label="Where Kian reads from">
          <Segmented
            aria-label="Backend"
            value={value.backend}
            options={[
              { value: 'mock', label: 'Demo morning' },
              { value: 'mattermost', label: 'Switch (Mattermost)' },
            ]}
            onValueChange={(backend) => set({ backend })}
          />
        </Line>
        {switchMode && (
          <div className="setup__grid">
            <Field label="Mattermost URL" hint="Switch Console, Messaging apps" value={value.url} onValueChange={(url) => set({ url })} />
            <Field label="Team" hint="Leave empty for your first team" value={value.team} onValueChange={(team) => set({ team })} />
            <Field
              label="Username"
              hint="Leave empty to use a personal access token"
              value={value.username}
              onValueChange={(username) => set({ username })}
            />
            <Field
              label={value.username ? 'Password' : 'Personal access token'}
              type="password"
              hint={settings.hasToken ? 'Saved in your keychain. Type to replace it.' : 'Kept in your keychain, never shown again.'}
              value={draft.token ?? ''}
              onValueChange={(token) => set({ token })}
            />
          </div>
        )}
      </Panel>

      <Panel title="The desk">
        <div className="setup__grid">
          <Field label="Desk room" value={value.deskRoom} onValueChange={(deskRoom) => set({ deskRoom })} />
          <Field label="Approvals room" value={value.approvalsRoom} onValueChange={(approvalsRoom) => set({ approvalsRoom })} />
          <Field
            label="Agents"
            hint="Usernames, comma separated"
            value={value.agents.join(', ')}
            onValueChange={(v) => set({ agents: v.split(',').map((a) => a.trim()).filter(Boolean) })}
          />
          <Field label="Hotkey" hint="Electron accelerator, e.g. CommandOrControl+Shift+K" value={value.hotkey} onValueChange={(hotkey) => set({ hotkey })} />
        </div>
        <Line label="I'm the sales lead" hint="Approval cards from the approvals room come to you.">
          <Toggle checked={value.approver} onCheckedChange={(approver) => set({ approver })} />
        </Line>
        <Line label="Read cards aloud" hint="Uses your system voice.">
          <Toggle checked={value.speak} onCheckedChange={(speak) => set({ speak })} />
        </Line>
      </Panel>

      <Panel title="Voice">
        <p className="hub__note">
          Without a key, the mic opens the type bar, so Wispr Flow or your system's dictation can type for you. With one,
          speech goes to this transcription endpoint.
        </p>
        <div className="setup__grid">
          <Field label="Transcription URL" value={value.sttUrl} onValueChange={(sttUrl) => set({ sttUrl })} />
          <Field label="Model" value={value.sttModel} onValueChange={(sttModel) => set({ sttModel })} />
          <Field
            label="API key"
            type="password"
            hint={settings.hasSttKey ? 'Saved in your keychain. Type to replace it.' : 'Optional.'}
            value={draft.sttKey ?? ''}
            onValueChange={(sttKey) => set({ sttKey })}
          />
        </div>
      </Panel>

      <footer className="setup__actions">
        <span className="setup__result" data-ok={test.status === 'done' || undefined}>
          {test.message}
        </span>
        <ActionButton status={test.status} doneLabel="Connected" onClick={() => void runTest()}>
          Save and test
        </ActionButton>
        <Button variant="primary" disabled={!Object.keys(draft).length} onClick={() => void save()}>
          Save
        </Button>
      </footer>
    </>
  )
}

function Line({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <div className="setup__line">
      <div>
        <div className="setup__label">{label}</div>
        {hint && <div className="setup__hint">{hint}</div>}
      </div>
      {children}
    </div>
  )
}
