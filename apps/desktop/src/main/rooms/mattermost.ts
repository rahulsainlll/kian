/*
 * The real rooms: the Mattermost that Switch Console runs, signed in as the
 * person (never as a bot). REST /api/v4 for reads and posts, and the
 * WebSocket for new messages, with reconnect and back-off. A message counts
 * as an agent's when Mattermost marks the sender as a bot or its username is
 * one of the configured agents.
 */
import type { RoomEvent, RoomSummary } from '../../shared/types'
import type { Rooms } from './types'

interface Options {
  url: string
  team: string
  /** A personal access token, or the password when username is set. */
  secret: string
  username?: string
  agents: string[]
}

interface Channel {
  id: string
  name: string
  display_name: string
}

interface Post {
  id: string
  root_id: string
  channel_id: string
  user_id: string
  message: string
  create_at: number
  props?: Record<string, unknown>
}

export class MattermostRooms implements Rooms {
  readonly kind = 'mattermost' as const
  private token = ''
  private meId = ''
  private teamId = ''
  private teamName = ''
  private channels = new Map<string, Channel>()
  private users = new Map<string, { username: string; bot: boolean }>()
  private listeners = new Set<(e: RoomEvent) => void>()
  private status = new Set<(online: boolean) => void>()
  private ws: WebSocket | null = null
  private retry = 0
  private closed = false

  constructor(private opts: Options) {}

  async connect() {
    this.closed = false
    this.token = this.opts.username ? await this.login() : this.opts.secret
    const me = await this.api<{ id: string; username: string }>('/users/me')
    this.meId = me.id
    const teams = await this.api<{ id: string; name: string }[]>('/users/me/teams')
    const team = teams.find((t) => t.name === this.opts.team) ?? teams[0]
    if (!team) throw new Error('This account is not in any Mattermost team yet.')
    this.teamId = team.id
    this.teamName = team.name
    await this.loadChannels()
    this.open()
    return { username: me.username }
  }

  onMessage(fn: (e: RoomEvent) => void) {
    this.listeners.add(fn)
    return () => this.listeners.delete(fn)
  }

  onStatus(fn: (online: boolean) => void) {
    this.status.add(fn)
    return () => this.status.delete(fn)
  }

  async post(room: string, text: string, opts: { rootId?: string } = {}) {
    let channel = this.byName(room)
    if (!channel) {
      await this.loadChannels()
      channel = this.byName(room)
    }
    if (!channel) throw new Error(`You are not in a room called ${room}.`)
    await this.api('/posts', { method: 'POST', body: { channel_id: channel.id, message: text, root_id: opts.rootId ?? '' } })
  }

  async rooms(): Promise<RoomSummary[]> {
    await this.loadChannels()
    return Promise.all(
      [...this.channels.values()].map(async (c) => {
        const [members, posts] = await Promise.all([
          this.api<{ username: string }[]>(`/users?in_channel=${c.id}&per_page=20`),
          this.api<{ order: string[]; posts: Record<string, Post> }>(`/channels/${c.id}/posts?per_page=1`),
        ])
        const lastPost = posts.order[0] ? posts.posts[posts.order[0]] : undefined
        const last = lastPost ? await this.toEvent(lastPost) : undefined
        return {
          name: c.name,
          title: c.display_name || c.name,
          members: members.map((m) => m.username),
          last: last && { author: last.author, text: last.text, at: last.at },
        }
      }),
    )
  }

  async recent(limit = 50) {
    const batches = await Promise.all(
      [...this.channels.values()].map((c) => this.api<{ order: string[]; posts: Record<string, Post> }>(`/channels/${c.id}/posts?per_page=20`)),
    )
    const posts = batches.flatMap((b) => b.order.map((id) => b.posts[id]))
    posts.sort((a, b) => a.create_at - b.create_at)
    return Promise.all(posts.slice(-limit).map((p) => this.toEvent(p)))
  }

  close() {
    this.closed = true
    this.ws?.close()
    this.listeners.clear()
  }

  // ── internals ─────────────────────────────────────────────────────────────

  private base() {
    return this.opts.url.replace(/\/+$/, '')
  }

  private async login(): Promise<string> {
    const res = await fetch(`${this.base()}/api/v4/users/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ login_id: this.opts.username, password: this.opts.secret }),
    })
    const token = res.headers.get('Token')
    if (!res.ok || !token) throw new Error(`Mattermost refused the sign-in (${res.status}).`)
    return token
  }

  private async api<T = unknown>(path: string, init: { method?: string; body?: unknown } = {}): Promise<T> {
    const res = await fetch(`${this.base()}/api/v4${path}`, {
      method: init.method ?? 'GET',
      headers: { Authorization: `Bearer ${this.token}`, 'Content-Type': 'application/json' },
      body: init.body === undefined ? undefined : JSON.stringify(init.body),
    })
    if (!res.ok) throw new Error(`Mattermost ${init.method ?? 'GET'} ${path} failed (${res.status}).`)
    return (await res.json()) as T
  }

  private async loadChannels() {
    const list = await this.api<(Channel & { type: string })[]>(`/users/me/teams/${this.teamId}/channels`)
    this.channels = new Map(list.filter((c) => c.type === 'O' || c.type === 'P').map((c) => [c.id, c]))
  }

  private byName(name: string) {
    return [...this.channels.values()].find((c) => c.name === name)
  }

  private async user(id: string) {
    let u = this.users.get(id)
    if (!u) {
      const raw = await this.api<{ username: string; is_bot?: boolean }>(`/users/${id}`)
      u = { username: raw.username, bot: !!raw.is_bot }
      this.users.set(id, u)
    }
    return u
  }

  private async toEvent(post: Post, mentions: string[] = []): Promise<RoomEvent> {
    if (!this.channels.has(post.channel_id)) await this.loadChannels()
    const channel = this.channels.get(post.channel_id)
    const user = await this.user(post.user_id)
    return {
      id: post.id,
      rootId: post.root_id || undefined,
      room: channel?.name ?? post.channel_id,
      author: user.username,
      authorIsAgent: user.bot || post.props?.from_bot === 'true' || this.opts.agents.includes(user.username),
      text: post.message,
      at: post.create_at,
      mentionsMe: mentions.includes(this.meId),
      permalink: `${this.base()}/${this.teamName}/pl/${post.id}`,
    }
  }

  private open() {
    const ws = new WebSocket(`${this.base().replace(/^http/, 'ws')}/api/v4/websocket`)
    this.ws = ws
    ws.onopen = () => {
      ws.send(JSON.stringify({ seq: 1, action: 'authentication_challenge', data: { token: this.token } }))
      this.retry = 0
      this.status.forEach((fn) => fn(true))
    }
    ws.onmessage = (msg) => void this.handle(String(msg.data))
    ws.onclose = () => {
      this.status.forEach((fn) => fn(false))
      if (this.closed) return
      const wait = Math.min(30_000, 1000 * 2 ** this.retry++)
      setTimeout(() => !this.closed && this.open(), wait)
    }
  }

  private async handle(raw: string) {
    const msg = JSON.parse(raw) as { event?: string; data?: Record<string, string> }
    if (msg.event === 'channel_created' || msg.event === 'user_added') return void this.loadChannels()
    if (msg.event !== 'posted' || !msg.data?.post) return
    const post = JSON.parse(msg.data.post) as Post
    if (post.user_id === this.meId) return
    const mentions = msg.data.mentions ? (JSON.parse(msg.data.mentions) as string[]) : []
    const event = await this.toEvent(post, mentions)
    this.listeners.forEach((fn) => fn(event))
  }
}
